import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department3Marketing() {
  const roster: AgentDef[] = [
    { number: 31, key: "D3A", name: "CMO Adler", role: "Brand Strategy", departmentId: 3, level: 1, reportsTo: null, mission: "Growth", revenueMechanism: "acquisition", tool: { category: "marketing", action: "campaign" }, auditDomain: "CRAFT", background: false, writes: false, valueHintEur: 4500, dynamic: true, status: "online" },
    { number: 32, key: "D3B", name: "Content Manager Baum", role: "Content Creation", departmentId: 3, level: 2, reportsTo: 31, mission: "Engagement", revenueMechanism: "retention", tool: { category: "content", action: "create" }, auditDomain: "LEGAL", background: false, writes: true, valueHintEur: 2500, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D3A: { monthReal: 14000, totalReal: 14000, monthPotential: 28000, totalPotential: 56000 },
      D3B: { monthReal: 7000, totalReal: 7000, monthPotential: 14000, totalPotential: 28000 },
    },
    team: { totalReal: 21000, totalPotential: 54000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Kampagnen performant",
    byAgent: {
      D3A: { grade: 89, score: 89, trend: "UP", xp: 11800, careerRank: "CMO", academyStatus: "CERTIFIED", sampleSize: 200, approvedCount: 196, rejectedCount: 4, evolutionCount: 12, meanEvolutionScore: 84, realRevenueEntryCount: 38, realRevenueEur: 380000 },
      D3B: { grade: 82, score: 82, trend: "STABLE", xp: 7200, careerRank: "Content Lead", academyStatus: "IN_TRAINING", sampleSize: 150, approvedCount: 146, rejectedCount: 4, evolutionCount: 6, meanEvolutionScore: 78, realRevenueEntryCount: 24, realRevenueEur: 240000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={3}
      departmentName="MARKETING"
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
      liveTracesCount={45}
      latencyMs={14}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}