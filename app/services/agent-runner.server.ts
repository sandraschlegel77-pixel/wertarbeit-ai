import db from "../db.server";
import { runSidekickTool } from "../lib/sidekick.server";
import { STAMM_AGENTS } from "./agent-roster";
import { getRoster, isDryRun, ownerVeto } from "./ai-agents.server";
import { isShopPaused } from "./autopilot-control.server";
import { acquireLock, recordTiming, releaseLock } from "./orchestration-harmony.server";
import { enqueueApproval, runTripleAudit } from "./triple-audit-gate.server";
import { recordPotentialOncePerDay, recordRevenue } from "./silent-revenue.server";
import { runMetaSupervisorAudit } from "./meta-supervisor.server";
import { recordAgentConnectionTrace } from "./live-connection.server";
import { canAccessAgentForShop } from "./access-control.server";

export interface RunAgentResult {
  ok: boolean;
  agent: string;
  mode: "DRY_RUN" | "LIVE" | "BLOCKED" | "QUEUED";
  message: string;
  auditStatus?: string;
  metaAuditStatus?: string;
  durationMs: number;
}

/**
 * Führt einen KI-Mitarbeiter aus: OwnerRule-Veto -> Entity-Lock -> 3×-Prüfung
 * (falls Domäne) -> DRY_RUN/Freigabe-Warteschlange oder Live-Sidekick-Aufruf.
 */
export async function runAgent(
  shop: string,
  number: number,
  opts: { origin?: "manual" | "cascade" | "cron"; body?: Record<string, unknown> } = {}
): Promise<RunAgentResult> {
  const t0 = Date.now();
  const done = (r: Omit<RunAgentResult, "durationMs">): RunAgentResult => {
    const durationMs = Date.now() - t0;
    recordTiming(durationMs);
    return { ...r, durationMs };
  };

  const roster = await getRoster(shop);
  const agent = roster.find((a) => a.number === number);
  if (!agent) {
    return done({ ok: false, agent: `A${number}`, mode: "BLOCKED", message: "Unbekannter Mitarbeiter." });
  }

  if (!await canAccessAgentForShop(shop, agent.key)) {
    return done({
      ok: false,
      agent: agent.key,
      mode: "BLOCKED",
      message: "Dieser Mitarbeiter gehört nicht zu einem aktiven, gebuchten Fachbereich dieses Shops.",
    });
  }

  if (await isShopPaused(shop)) {
    return done({ ok: false, agent: agent.key, mode: "BLOCKED", message: "Globale KI-Pause ist aktiv." });
  }
  if (agent.dynamic && agent.status !== "ACTIVE") {
    return done({ ok: false, agent: agent.key, mode: "BLOCKED", message: "Dynamischer Agent ist nicht aktiviert." });
  }
  if (agent.advisoryOnly) {
    return done({
      ok: false,
      agent: agent.key,
      mode: "BLOCKED",
      message: "Dieses Rollenprofil hat noch keine eigene Fachlogik. Es wurde nichts ausgeführt.",
    });
  }

  const veto = await ownerVeto(shop, agent);
  if (veto) {
    return done({ ok: false, agent: agent.key, mode: "BLOCKED", message: `${veto} – Inhaber-Regel hat Vorrang.` });
  }

  const lockKey = `${shop}:${agent.tool.category}:${agent.tool.action}`;
  if (!acquireLock(lockKey, agent.key)) {
    return done({ ok: false, agent: agent.key, mode: "QUEUED", message: "Anderer Agent arbeitet gerade daran (Entity-Lock)." });
  }

  try {
    let auditStatus: string | undefined;
    let metaAuditStatus: string | undefined;
    if ((number >= 158 && number <= 161) || agent.dynamic) {
      const metaAudit = await runMetaSupervisorAudit({
        shop,
        task: "governance",
        subject: `${agent.key} · ${agent.name}`,
        summary: `Mission: ${agent.mission}. Sidekick-Aufgabe: ${agent.tool.category}/${agent.tool.action}.`,
        primaryModel: "local-rules",
      });
      metaAuditStatus = `${metaAudit.mode}:${metaAudit.decision}`;
      if (metaAudit.decision === "BLOCK") {
        return done({
          ok: false,
          agent: agent.key,
          mode: "BLOCKED",
          message: metaAudit.findings.join(" ") || "Meta-Supervisor hat blockiert.",
          metaAuditStatus,
        });
      }
      if (metaAudit.decision === "REVIEW") {
        await enqueueApproval({
          shop,
          sourceAgentKey: agent.key,
          category: agent.tool.category,
          title: `Meta-Supervisor-Prüfung: ${agent.name}`,
          summary: metaAudit.findings.join(" ") || "Unabhängige Zweitprüfung benötigt Inhaberentscheidung.",
          riskLevel: "HIGH",
          payload: { category: agent.tool.category, action: agent.tool.action, body: opts.body ?? {} },
        });
        return done({
          ok: true,
          agent: agent.key,
          mode: "QUEUED",
          message: "Zur unabhängigen Inhaberprüfung vorgemerkt.",
          metaAuditStatus,
        });
      }
    }

    if (agent.auditDomain) {
      const audit = await runTripleAudit({
        shop,
        domain: agent.auditDomain,
        sourceAgentNumber: agent.number,
        payload: { text: typeof opts.body?.text === "string" ? opts.body.text : undefined },
      });
      auditStatus = audit.finalStatus;
      if (audit.finalStatus === "BLOCKED") {
        return done({
          ok: false,
          agent: agent.key,
          mode: "BLOCKED",
          message: audit.notes.join(" | ") || "Prüfung blockiert.",
          auditStatus,
          metaAuditStatus,
        });
      }
    }

    const dry = await isDryRun(shop);
    if (number === 220) {
      const prepared = await db.approvalQueueItem.findMany({
        where: { shop, status: "PENDING" },
        select: { sourceAgentKey: true },
      });
      const contributingAgents = new Set(prepared.map((item) => item.sourceAgentKey)).size;
      return done({
        ok: true,
        agent: agent.key,
        mode: dry ? "DRY_RUN" : "LIVE",
        message: `Fertig-Tisch aktualisiert: ${prepared.length} offene Freigabe(n) aus ${contributingAgents} Mitarbeiter(n).`,
        auditStatus,
        metaAuditStatus,
      });
    }
    const needsApproval =
      agent.writes && (dry || auditStatus === "NEEDS_OWNER_APPROVAL" || agent.auditDomain === "LEGAL");
    const potential = {
      shop,
      agentKey: agent.key,
      departmentId: agent.departmentId,
      amountEur: Math.round(agent.valueHintEur * 100) / 100,
      category: agent.revenueMechanism,
    };

    if (needsApproval) {
      await enqueueApproval({
        shop,
        sourceAgentKey: agent.key,
        category: agent.tool.category,
        title: `${agent.name}: ${agent.tool.category}/${agent.tool.action}`,
        summary: `${agent.mission}. Vorschau im Dry-Run – erst nach Freigabe live.`,
        financialImpactEur: Math.round(agent.valueHintEur),
        riskLevel: agent.auditDomain === "LEGAL" ? "HIGH" : "MEDIUM",
        payload: { category: agent.tool.category, action: agent.tool.action, body: opts.body ?? {} },
      });
      if (agent.valueHintEur > 0) {
        await recordPotentialOncePerDay({ ...potential, description: "Potenzial (Freigabe ausstehend)" });
      }
      return done({
        ok: true,
        agent: agent.key,
        mode: "QUEUED",
        message: "Zur 1-Klick-Freigabe vorgemerkt.",
        auditStatus,
        metaAuditStatus,
      });
    }

    const res = await runSidekickTool(agent.tool.category, agent.tool.action, {
      shop,
      session: { shop },
      body: opts.body ?? {},
    });
    let traceWarning = "";
    try {
      await recordAgentConnectionTrace({
        shop,
        agentKey: agent.key,
        channelKey: `${agent.tool.category}/${agent.tool.action}`,
        outcome: res.ok ? "SUCCESS" : "FAILED",
        trigger: opts.origin ?? "manual",
        durationMs: Date.now() - t0,
      });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.error(`[live-trace] Agentenaufruf wurde ausgeführt, aber der Trace konnte nicht gespeichert werden (${errorName}).`);
      traceWarning = " Die Verbindung konnte nicht im Event-Bus protokolliert werden.";
    }
    if (agent.dynamic && res.ok && !dry) {
      await db.autopilotLog.create({
        data: {
          shop,
          action: `agent_run:${agent.key}`,
          status: "success",
          detail: "Dynamischer Agent erfolgreich ausgeführt.",
          undoable: false,
        },
      });
    }
    if (res.ok && agent.valueHintEur > 0 && !agent.writes) {
      await recordPotentialOncePerDay({ ...potential, description: "Potenzial (Analyse)" });
    }
    return done({
      ok: res.ok,
      agent: agent.key,
      mode: dry ? "DRY_RUN" : "LIVE",
      message: `${res.ok ? "Ausgeführt." : res.warning ?? "Fehler."}${traceWarning}`,
      auditStatus,
      metaAuditStatus,
    });
  } finally {
    releaseLock(lockKey, agent.key);
  }
}

/** Echter Verdienst (z. B. aus orders/paid-Webhook) – nie simuliert. */
export async function bookRealRevenue(
  shop: string,
  agentNumber: number,
  amountEur: number,
  category: string,
  referenceId?: string
) {
  const a = STAMM_AGENTS.find((x) => x.number === agentNumber);
  return recordRevenue({
    shop,
    agentKey: `A${agentNumber}`,
    departmentId: a?.departmentId ?? 24,
    amountEur,
    category,
    isSimulated: false,
    referenceId,
  });
}
