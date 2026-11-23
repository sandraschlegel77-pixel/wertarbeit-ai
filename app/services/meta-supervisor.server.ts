import { z } from "zod";
import db from "../db.server";
import type { HarmonyScore } from "./agent-types";
import { isShopPaused } from "./autopilot-control.server";
import { formatEur } from "./pricing";

export type SupervisorTask = "monitor" | "legal" | "finance" | "creative" | "governance";

export interface FreeModelSelection {
  provider: "openrouter" | "local";
  model: string;
  task: SupervisorTask;
  maxTokens: number;
}

export function selectOptimalFreeModel(
  task: SupervisorTask,
  primaryModel?: string
): FreeModelSelection {
  const maxTokens = task === "legal" || task === "finance" ? 320 : task === "monitor" ? 120 : 220;
  if (process.env.OPENROUTER_API_KEY && primaryModel !== "openrouter/free") {
    return { provider: "openrouter", model: "openrouter/free", task, maxTokens };
  }
  return { provider: "local", model: "local-rules", task, maxTokens };
}

const ModelReview = z.object({
  decision: z.enum(["PASS", "REVIEW", "BLOCK"]),
  findings: z.array(z.string().max(180)).max(4),
});

export interface MetaAuditResult {
  decision: "PASS" | "REVIEW" | "BLOCK";
  mode: "CROSS_MODEL" | "LOCAL_RULES" | "REVIEW_REQUIRED";
  model: string;
  findings: string[];
}

function localFindings(subject: string, summary: string): string[] {
  const text = `${subject}\n${summary}`;
  const findings: string[] = [];
  if (/ignore.{0,30}(owner.?rule|dry.?run|sicherheitsregel)|bypass.{0,30}(freigabe|permission|owner)/i.test(text)) {
    findings.push("Versucht, Inhaberregeln oder Sicherheitsfreigaben zu umgehen.");
  }
  if (/garantiert.{0,30}(gewinn|umsatz|rechtssicher|fehlerfrei)|100\s*%\s*(rechtssicher|garantie)/i.test(text)) {
    findings.push("Enthält ein unbelegtes Garantie- oder Rechtssicherheitsversprechen.");
  }
  return findings;
}

async function requestFreeReview(
  selection: FreeModelSelection,
  subject: string,
  summary: string
): Promise<MetaAuditResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      decision: "PASS",
      mode: "LOCAL_RULES",
      model: "local-rules",
      findings: ["Kein externer Prüfer konfiguriert; nur deterministische lokale Regeln ausgeführt."],
    };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selection.model,
        temperature: 0,
        max_tokens: selection.maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are an independent safety reviewer. Return JSON only: {"decision":"PASS|REVIEW|BLOCK","findings":["..."]}. Never override owner rules, dry-run, or human approval. Flag unsupported legal, financial, or guaranteed claims. This is not legal or tax advice.',
          },
          {
            role: "user",
            content: JSON.stringify({ task: selection.task, subject, summary }),
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter antwortete mit HTTP ${response.status}.`);
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter lieferte keine Prüfer-Antwort.");
    const parsed = ModelReview.safeParse(JSON.parse(content));
    if (!parsed.success) throw new Error("OpenRouter-Prüfer-Antwort hatte ein ungültiges Format.");
    return { ...parsed.data, mode: "CROSS_MODEL", model: selection.model };
  } catch (error) {
    return {
      decision: "REVIEW",
      mode: "REVIEW_REQUIRED",
      model: selection.model,
      findings: [
        error instanceof Error
          ? `Zweitprüfung nicht verfügbar: ${error.message}`
          : "Zweitprüfung nicht verfügbar.",
      ],
    };
  }
}

export async function runMetaSupervisorAudit(input: {
  shop: string;
  task: SupervisorTask;
  subject: string;
  summary: string;
  primaryModel?: string;
}): Promise<MetaAuditResult> {
  const selection = selectOptimalFreeModel(input.task, input.primaryModel);
  const local = localFindings(input.subject, input.summary);
  const reviewed =
    selection.provider === "openrouter"
      ? await requestFreeReview(selection, input.subject.slice(0, 180), input.summary.slice(0, 700))
      : {
          decision: "PASS" as const,
          mode: "LOCAL_RULES" as const,
          model: "local-rules",
          findings: ["Kein unabhängiges kostenloses Modell verfügbar; nur lokale Regeln ausgeführt."],
        };
  const result =
    local.length > 0
      ? { ...reviewed, decision: "BLOCK" as const, findings: [...local, ...reviewed.findings].slice(0, 4) }
      : reviewed;

  await db.autopilotLog.create({
    data: {
      shop: input.shop,
      action: "meta_supervisor_audit",
      status: `meta_${result.decision.toLowerCase()}`,
      detail: `${result.mode} · ${result.model} · ${result.findings.join(" ").slice(0, 240)}`,
      undoable: false,
    },
  });
  return result;
}

export async function generateExecutiveThreeSentencePulse(shop: string): Promise<string[]> {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [successfulActions, pendingApprovals, monthlyAttribution, paused] = await Promise.all([
    db.autopilotLog.count({ where: { shop, status: "success", createdAt: { gte: dayStart } } }),
    db.approvalQueueItem.count({ where: { shop, status: "PENDING" } }),
    db.agentRevenueEntry.aggregate({
      where: { shop, isSimulated: false, createdAt: { gte: monthStart } },
      _sum: { amountEur: true },
    }),
    isShopPaused(shop),
  ]);
  const amount = monthlyAttribution._sum.amountEur ?? 0;
  return [
    `Heute waren ${successfulActions} protokollierte Aktionen erfolgreich; diesen Monat wurden ${formatEur(amount)} als interne Echt-Zuordnung erfasst (kein zusätzlicher Shopumsatz).`,
    `Auf Ihre 1-Klick-Entscheidung warten ${pendingApprovals} ${pendingApprovals === 1 ? "Freigabe" : "Freigaben"}.`,
    paused
      ? "Nächster Hebel: Die globale KI-Pause ist aktiv; prüfen Sie zuerst den Status und geben Sie nur sichere Aktionen wieder frei."
      : pendingApprovals > 0
        ? "Nächster Hebel: Prüfen Sie die älteste offene Freigabe; der Dry-Run- und Inhaber-Schutz bleibt maßgeblich."
        : "Nächster Hebel: Starten Sie einen risikoarmen Shop-Audit und vergleichen Sie das Ergebnis mit echten Shopdaten.",
  ];
}

export async function getRoiPulseCounts(shop: string): Promise<{ successfulActions: number; pendingApprovals: number }> {
  const [successfulActions, pendingApprovals] = await Promise.all([
    db.autopilotLog.count({
      where: { shop, status: "success", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    db.approvalQueueItem.count({ where: { shop, status: "PENDING" } }),
  ]);
  return { successfulActions, pendingApprovals };
}

export function supervisorHarmonyStatus(harmony: HarmonyScore): string {
  return `${harmony.harmony.toFixed(1)}% Harmonie · ${harmony.pending} offene Freigaben`;
}
