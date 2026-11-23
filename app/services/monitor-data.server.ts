import db from "../db.server";
import { STAMM_COUNT } from "./agent-roster";
import { isDryRun, isOwnerShop } from "./ai-agents.server";
import { isShopPaused, supportsLocalUndo } from "./autopilot-control.server";
import { generateExecutiveThreeSentencePulse } from "./meta-supervisor.server";
import { computeHarmony, getPreparationDeskSnapshot } from "./orchestration-harmony.server";
import type { ApprovalDto, HarmonyScore } from "./agent-types";

export interface Money {
  day: number;
  month: number;
  total: number;
}

export interface MonitorData {
  shop: string;
  owner: boolean;
  dryRun: boolean;
  paused: boolean;
  real: Money;
  potential: Money;
  staffExtra: number;
  stammCount: number;
  harmony: HarmonyScore;
  approvals: ApprovalDto[];
  preparationDesk: {
    pendingCount: number;
    contributingAgents: number;
    items: ApprovalDto[];
  };
  executivePulse: string[];
  actionHistory: {
    id: string;
    action: string;
    status: string;
    detail: string | null;
    canUndo: boolean;
  }[];
  sales24h: number;
  at: string;
}

const zero = (): Money => ({ day: 0, month: 0, total: 0 });

/** Verdienst-Summen für den Handy-Monitor. „Echt“ und „Potenzial (Dry-Run)“ bleiben strikt getrennt. */
export async function loadMonitorData(shop: string): Promise<MonitorData> {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const real = zero();
  const potential = zero();
  let sales24h = 0;
  try {
    const rows = await db.agentRevenueEntry.findMany({
      where: { shop },
      select: { amountEur: true, isSimulated: true, createdAt: true },
    });
    const dayAgo = now.getTime() - 24 * 3600 * 1000;
    for (const r of rows) {
      const m = r.isSimulated ? potential : real;
      m.total += r.amountEur;
      if (r.createdAt >= monthStart) m.month += r.amountEur;
      if (r.createdAt >= dayStart) m.day += r.amountEur;
      if (!r.isSimulated && r.createdAt.getTime() >= dayAgo) sales24h++;
    }
  } catch {
    /* leere DB */
  }

  const [harmony, preparationDesk, dryRun, staffExtra, paused, executivePulse, logs] = await Promise.all([
    computeHarmony(shop),
    getPreparationDeskSnapshot(shop),
    isDryRun(shop),
    db.dynamicAiAgent.count({ where: { shop } }).catch(() => 0),
    isShopPaused(shop),
    generateExecutiveThreeSentencePulse(shop),
    db.autopilotLog.findMany({ where: { shop }, take: 20, orderBy: { createdAt: "desc" } }),
  ]);

  return {
    shop,
    owner: isOwnerShop(shop),
    dryRun,
    paused,
    real,
    potential,
    staffExtra,
    stammCount: STAMM_COUNT,
    harmony,
    approvals: preparationDesk.items,
    preparationDesk,
    executivePulse,
    actionHistory: logs.map((log) => ({
      id: log.id,
      action: log.action,
      status: log.status,
      detail: log.detail,
      canUndo: log.undoable && !log.undoneAt && supportsLocalUndo(log.action),
    })),
    sales24h,
    at: now.toISOString(),
  };
}

/** Sprach-/Schnellbefehl -> zuständiges Vorstandsmitglied (#158 CEO, #159 CFO, #160 COO, #161 Evolution). */
export function routeCommand(text: string): { agent: number; label: string } {
  const t = text.toLowerCase();
  if (/(umsatz|verdienst|gewinn|marge|preis|finanz|rechnung|steuer)/.test(t)) return { agent: 159, label: "KI-CFO" };
  if (/(recht|abmahn|datenschutz|dsgvo|compliance|retoure|rückgabe|zoll|versand|paket)/.test(t))
    return { agent: 160, label: "KI-COO" };
  if (/(neu|nische|trend|lern|evolution|weiterentwick|idee)/.test(t)) return { agent: 161, label: "AI Evolution" };
  return { agent: 158, label: "KI-CEO" };
}
