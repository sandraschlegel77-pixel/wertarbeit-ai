import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department5Support() {
  const roster: AgentDef[] = [
    { number: 51, key: "D5A", name: "Support Lead Klein", role: "Customer Success", departmentId: 5, level: 1, reportsTo: null, mission: "Satisfaction", revenueMechanism: "retention", tool: { category: "support", action: "resolve" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 3000, dynamic: true, status: "online" },
    { number: 52, key: "D5B", name: "Tech Support Wagner", role: "Technical Issues", departmentId: 5, level: 2, reportsTo: 51, mission: "Resolution", revenueMechanism: "deflection", tool: { category: "support", action: "debug" }, auditDomain: "CRAFT", background: true, writes: true, valueHintEur: 2500, dynamic: true, status: "online" },
    { number: 53, key: "D5C", name: "Community Manager Rolf", role: "Community", departmentId: 5, level: 3, reportsTo: 51, mission: "Engagement", revenueMechanism: "advocacy", tool: { category: "community", action: "moderate" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 1800, dynamic: true, status: "offline" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D5A: { monthReal: 6000, totalReal: 6000, monthPotential: 12000, totalPotential: 24000 },
      D5B: { monthReal: 5200, totalReal: 5200, monthPotential: 10400, totalPotential: 20800 },
      D5C: { monthReal: 4800, totalReal: 4800, monthPotential: 9600, totalPotential: 19200 },
    },
    team: { totalReal: 16000, totalPotential: 64000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "CSAT 97%",
    byAgent: {
      D5A: { grade: 88, score: 88, trend: "STABLE", xp: 9400, careerRank: "Support Director", academyStatus: "CERTIFIED", sampleSize: 230, approvedCount: 228, rejectedCount: 2, evolutionCount: 8, meanEvolutionScore: 83, realRevenueEntryCount: 38, realRevenueEur: 380000 },
      D5B: { grade: 85, score: 85, trend: "UP", xp: 7800, careerRank: "Tech Lead", academyStatus: "CERTIFIED", sampleSize: 190, approvedCount: 188, rejectedCount: 2, evolutionCount: 6, meanEvolutionScore: 80, realRevenueEntryCount: 30, realRevenueEur: 300000 },
      D5C: { grade: 78, score: 78, trend: "DOWN", xp: 5600, careerRank: "Community Manager", academyStatus: "RETRAINING", sampleSize: 140, approvedCount: 135, rejectedCount: 5, evolutionCount: 3, meanEvolutionScore: 74, realRevenueEntryCount: 18, realRevenueEur: 180000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={5}
      departmentName="SUPPORT"
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
      liveTracesCount={32}
      latencyMs={8}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}