import type { AgentPerformanceSummary } from "./agent-types";

export interface PerformanceEvidence {
  approvedCount: number;
  rejectedCount: number;
  evolutionCount: number;
  evolutionScoreTotal: number;
  realRevenueEntryCount: number;
  realRevenueEur: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function scoreOf(evidence: PerformanceEvidence): number | null {
  const dimensions: number[] = [];
  const decisions = evidence.approvedCount + evidence.rejectedCount;
  if (decisions > 0) dimensions.push(evidence.approvedCount / decisions);
  if (evidence.evolutionCount > 0) {
    dimensions.push(clamp01(evidence.evolutionScoreTotal / evidence.evolutionCount));
  }
  if (evidence.realRevenueEntryCount > 0) {
    dimensions.push(evidence.realRevenueEur > 0 ? 1 : 0);
  }
  return dimensions.length
    ? dimensions.reduce((total, value) => total + value, 0) / dimensions.length
    : null;
}

function careerRank(xp: number) {
  if (xp >= 2000) return "Mentor";
  if (xp >= 1000) return "Principal";
  if (xp >= 500) return "Meister";
  if (xp >= 250) return "Spezialist";
  if (xp >= 100) return "Junior";
  return "Azubi";
}

export function calculateAgentPerformance(
  lifetime: PerformanceEvidence,
  recent: PerformanceEvidence,
  previous: PerformanceEvidence
): AgentPerformanceSummary {
  const score = scoreOf(lifetime);
  const grade = score === null ? null : Math.round((6 - 5 * score) * 10) / 10;
  const recentScore = scoreOf(recent);
  const previousScore = scoreOf(previous);
  const trend = recentScore === null || previousScore === null
    ? "UNAVAILABLE"
    : recentScore - previousScore >= 0.05
      ? "UP"
      : previousScore - recentScore >= 0.05
        ? "DOWN"
        : "STABLE";
  const meanEvolutionScore = lifetime.evolutionCount
    ? Math.round(clamp01(lifetime.evolutionScoreTotal / lifetime.evolutionCount) * 1000) / 1000
    : null;
  const sampleSize =
    lifetime.approvedCount +
    lifetime.rejectedCount +
    lifetime.evolutionCount +
    lifetime.realRevenueEntryCount;
  const xp =
    lifetime.approvedCount * 25 +
    lifetime.rejectedCount * 5 +
    lifetime.evolutionCount * 10 +
    lifetime.realRevenueEntryCount * 10;
  const academyStatus: AgentPerformanceSummary["academyStatus"] =
    sampleSize >= 10 && grade !== null && grade <= 2
      ? "CERTIFIED"
      : sampleSize >= 5 && grade !== null && grade >= 3.5
        ? "RETRAINING"
        : "IN_TRAINING";

  return {
    grade,
    score,
    trend,
    xp,
    careerRank: careerRank(xp),
    academyStatus,
    sampleSize,
    approvedCount: lifetime.approvedCount,
    rejectedCount: lifetime.rejectedCount,
    evolutionCount: lifetime.evolutionCount,
    meanEvolutionScore,
    realRevenueEntryCount: lifetime.realRevenueEntryCount,
    realRevenueEur: Math.round(lifetime.realRevenueEur * 100) / 100,
  };
}
