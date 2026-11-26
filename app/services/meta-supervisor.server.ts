import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import db from "../db.server";
import type { HarmonyScore } from "./agent-types";
import { isShopPaused } from "./autopilot-control.server";
import { executeMetaSupervisorWithAudit } from "./module-ai-execution.server";
import { formatEur } from "./pricing";

export type SupervisorTask = "monitor" | "legal" | "finance" | "creative" | "governance";

export interface FreeModelSelection {
  provider: "cloud" | "local";
  model: string;
  task: SupervisorTask;
  maxTokens: number;
}

export function selectOptimalFreeModel(
  task: SupervisorTask,
  primaryModel?: string
): FreeModelSelection {
  const maxTokens = task === "legal" || task === "finance" ? 320 : task === "monitor" ? 120 : 220;
  if (process.env.AI_CLOUD_ENABLED === "true" && primaryModel !== "local-rules") {
    return { provider: "cloud", model: "configured-provider-pool", task, maxTokens };
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
  shop: string,
  selection: FreeModelSelection,
  subject: string,
  summary: string
): Promise<MetaAuditResult> {
  const routed = await executeMetaSupervisorWithAudit({
    shop,
    maxTokens: selection.maxTokens,
    systemPrompt:
      'You are an independent safety reviewer. Return JSON only: {"decision":"PASS|REVIEW|BLOCK","findings":["..."]}. Never override owner rules, dry-run, or human approval. Flag unsupported legal, financial, or guaranteed claims. This is not legal or tax advice.',
    userPrompt: JSON.stringify({ task: selection.task, subject, summary }),
  });
  if (!routed.ok || !routed.text) {
    return {
      decision: "REVIEW",
      mode: "REVIEW_REQUIRED",
      model: "deterministic-local-rules",
      findings: ["Externe Zweitprüfung nicht verfügbar; lokale Regeln bleiben maßgeblich.", ...routed.failures].slice(0, 4),
    };
  }
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(routed.text);
  } catch {
    return {
      decision: "REVIEW",
      mode: "REVIEW_REQUIRED",
      model: routed.model,
      findings: ["Externe Zweitprüfung lieferte kein gültiges JSON; manuelle Prüfung erforderlich."],
    };
  }
  const parsed = ModelReview.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      decision: "REVIEW",
      mode: "REVIEW_REQUIRED",
      model: routed.model,
      findings: ["Externe Zweitprüfung lieferte ein unbekanntes Antwortformat; manuelle Prüfung erforderlich."],
    };
  }
  return { ...parsed.data, mode: "CROSS_MODEL", model: routed.model };
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
    local.length > 0
      ? {
          decision: "BLOCK" as const,
          mode: "LOCAL_RULES" as const,
          model: "local-rules",
          findings: local,
        }
      : selection.provider === "cloud"
      ? await requestFreeReview(input.shop, selection, input.subject.slice(0, 180), input.summary.slice(0, 700))
      : {
          decision: "PASS" as const,
          mode: "LOCAL_RULES" as const,
          model: "deterministic-local-rules",
          findings: ["Cloud-Anfragen sind standardmäßig deaktiviert; nur deterministische lokale Regeln ausgeführt."],
        };
  const result =
    local.length > 0
      ? { ...reviewed, decision: "BLOCK" as const, findings: local.slice(0, 4) }
      : reviewed;

  const metadata = {
    executionId: randomUUID(),
    scope: "meta-supervisor",
    task: input.task,
    startedInputChars: input.subject.length + input.summary.length,
    finishedAt: new Date().toISOString(),
    status: result.decision,
    provider: result.mode,
    model: result.model,
    findingCount: result.findings.length,
  };
  const sha256 = createHash("sha256").update(JSON.stringify(metadata), "utf8").digest("hex");
  await db.autopilotLog.create({
    data: {
      shop: input.shop,
      action: "meta_supervisor_audit",
      status: `meta_${result.decision.toLowerCase()}`,
      detail: JSON.stringify({ metadata, sha256 }),
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
