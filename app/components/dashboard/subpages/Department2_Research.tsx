import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department2Research() {
  const roster: AgentDef[] = [
    { number: 21, key: "D2A", name: "Research Lead Voss", role: "Research Strategy", departmentId: 2, level: 1, reportsTo: null, mission: "R&D Lead", revenueMechanism: "innovation", tool: { category: "research", action: "investigate" }, auditDomain: "CRAFT", background: true, writes: true, valueHintEur: 5000, dynamic: true, status: "online" },
    { number: 22, key: "D2B", name: "Data Analyst Lang", role: "Data Analysis", departmentId: 2, level: 2, reportsTo: 21, mission: "Insights", revenueMechanism: "analytics", tool: { category: "analytics", action: "query" }, auditDomain: "FINANCE", background: false, writes: false, valueHintEur: 3000, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D2A: { monthReal: 11000, totalReal: 11000, monthPotential: 22000, totalPotential: 44000 },
      D2B: { monthReal: 8000, totalReal: 8000, monthPotential: 16000, totalPotential: 32000 },
    },
    team: { totalReal: 19000, totalPotential: 46000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Forschung im Zeitplan",
    byAgent: {
      D2A: { grade: 93, score: 93, trend: "UP", xp: 13500, careerRank: "Research Director", academyStatus: "CERTIFIED", sampleSize: 240, approvedCount: 234, rejectedCount: 6, evolutionCount: 14, meanEvolutionScore: 88, realRevenueEntryCount: 45, realRevenueEur: 450000 },
      D2B: { grade: 87, score: 87, trend: "STABLE", xp: 9500, careerRank: "Data Lead", academyStatus: "CERTIFIED", sampleSize: 190, approvedCount: 186, rejectedCount: 4, evolutionCount: 9, meanEvolutionScore: 83, realRevenueEntryCount: 35, realRevenueEur: 350000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={2}
      departmentName="RESEARCH"
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
      liveTracesCount={62}
      latencyMs={9}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}