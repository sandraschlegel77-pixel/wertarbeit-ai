import db from "../db.server";
import type { AgentDef, AgentPerformanceSnapshot } from "./agent-types";
import { calculateAgentPerformance, type PerformanceEvidence } from "./agent-performance";

type RevenueGroup = {
  agentKey: string;
  _count: { _all: number };
  _sum: { amountEur: number | null };
};
type EvolutionGroup = {
  agentKey: string;
  _count: { _all: number };
  _avg: { successScore: number | null };
};
type ApprovalGroup = {
  sourceAgentKey: string;
  status: string;
  _count: { _all: number };
};

interface PeriodGroups {
  revenues: RevenueGroup[];
  evolutions: EvolutionGroup[];
  approvals: ApprovalGroup[];
}

async function aggregatePeriod(shop: string, start?: Date, end?: Date): Promise<PeriodGroups> {
  const createdAt = start || end
    ? { ...(start ? { gte: start } : {}), ...(end ? { lt: end } : {}) }
    : undefined;
  const revenueWhere = { shop, isSimulated: false, ...(createdAt ? { createdAt } : {}) };
  const evolutionWhere = { shop, ...(createdAt ? { createdAt } : {}) };
  const approvalWhere = {
    shop,
    status: { in: ["APPROVED", "REJECTED"] },
    ...(createdAt ? { createdAt } : {}),
  };
  const [revenues, evolutions, approvals] = await Promise.all([
    db.agentRevenueEntry.groupBy({
      by: ["agentKey"],
      where: revenueWhere,
      _count: { _all: true },
      _sum: { amountEur: true },
    }),
    db.agentSkillEvolution.groupBy({
      by: ["agentKey"],
      where: evolutionWhere,
      _count: { _all: true },
      _avg: { successScore: true },
    }),
    db.approvalQueueItem.groupBy({
      by: ["sourceAgentKey", "status"],
      where: approvalWhere,
      _count: { _all: true },
    }),
  ]);
  return { revenues, evolutions, approvals };
}

function evidenceFor(agentKey: string, period: PeriodGroups): PerformanceEvidence {
  const revenue = period.revenues.find((row) => row.agentKey === agentKey);
  const evolution = period.evolutions.find((row) => row.agentKey === agentKey);
  const approvals = period.approvals.filter((row) => row.sourceAgentKey === agentKey);
  const approvalCount = (status: string) =>
    approvals.find((row) => row.status === status)?._count._all ?? 0;
  const evolutionCount = evolution?._count._all ?? 0;
  const averageEvolutionScore = evolution?._avg.successScore ?? 0;
  return {
    approvedCount: approvalCount("APPROVED"),
    rejectedCount: approvalCount("REJECTED"),
    evolutionCount,
    evolutionScoreTotal: averageEvolutionScore * evolutionCount,
    realRevenueEntryCount: revenue?._count._all ?? 0,
    realRevenueEur: revenue?._sum.amountEur ?? 0,
  };
}

export async function getAgentPerformanceSnapshot(
  shop: string,
  roster: AgentDef[]
): Promise<AgentPerformanceSnapshot> {
  try {
    const now = new Date();
    const currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const [lifetime, recent, previous] = await Promise.all([
      aggregatePeriod(shop),
      aggregatePeriod(shop, currentStart),
      aggregatePeriod(shop, previousStart, currentStart),
    ]);
    const byAgent: AgentPerformanceSnapshot["byAgent"] = {};
    for (const agent of roster) {
      byAgent[agent.key] = calculateAgentPerformance(
        evidenceFor(agent.key, lifetime),
        evidenceFor(agent.key, recent),
        evidenceFor(agent.key, previous)
      );
    }
    return { status: "available", message: null, byAgent };
  } catch {
    console.error("[agent-performance] Datenbankabfrage für Agentenmetriken fehlgeschlagen.");
    return {
      status: "unavailable",
      message: "Agentenmetriken sind derzeit nicht verfügbar; es werden keine Noten oder XP erfunden.",
      byAgent: {},
    };
  }
}
