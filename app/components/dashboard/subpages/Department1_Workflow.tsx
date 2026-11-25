import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import type { InvestmentLevel } from "../../ui/SingularityPrimitives";

export function Department1Workflow() {
  const roster: AgentDef[] = [
    { number: 11, key: "D1A", name: "Ops-Orchestrator Prime", role: "Pipeline Management", departmentId: 1, level: 1, reportsTo: null, mission: "Orchestration", revenueMechanism: "efficiency", tool: { category: "workflow", action: "orchestrate" }, auditDomain: "LEGAL", background: true, writes: true, valueHintEur: 4000, dynamic: true, status: "online" },
    { number: 12, key: "D1B", name: "Task-Decomposer", role: "Task Decomposition", departmentId: 1, level: 2, reportsTo: 11, mission: "Breakdown", revenueMechanism: "throughput", tool: { category: "workflow", action: "decompose" }, auditDomain: "CRAFT", background: false, writes: true, valueHintEur: 3500, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D1A: { monthReal: 9000, totalReal: 9000, monthPotential: 18000, totalPotential: 36000 },
      D1B: { monthReal: 7500, totalReal: 7500, monthPotential: 15000, totalPotential: 30000 },
    },
    team: { totalReal: 16500, totalPotential: 39000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Pipeline stabil",
    byAgent: {
      D1A: { grade: 90, score: 90, trend: "STABLE", xp: 10200, careerRank: "Ops Director", academyStatus: "CERTIFIED", sampleSize: 210, approvedCount: 207, rejectedCount: 3, evolutionCount: 10, meanEvolutionScore: 85, realRevenueEntryCount: 40, realRevenueEur: 400000 },
      D1B: { grade: 84, score: 84, trend: "UP", xp: 8800, careerRank: "Task Analyst", academyStatus: "CERTIFIED", sampleSize: 180, approvedCount: 176, rejectedCount: 4, evolutionCount: 8, meanEvolutionScore: 80, realRevenueEntryCount: 31, realRevenueEur: 310000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={1}
      departmentName="WORKFLOW"
      roster={roster}
      earnings={earnings}
      performance={performance}
      onBack={() => {}}
      investmentLevel={"STARTER_299" as const}
      onInvestmentChange={() => {}}
      killSwitchActive={false}
      onKillSwitchToggle={() => {}}
      commandPaletteOpen={false}
      onCommandPaletteToggle={() => {}}
      onCommand={() => {}}
      liveTracesCount={88}
      latencyMs={11}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}