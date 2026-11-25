import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department6Compliance() {
  const roster: AgentDef[] = [
    { number: 61, key: "D6A", name: "Legal Counsel Stein", role: "Compliance", departmentId: 6, level: 1, reportsTo: null, mission: "Regulation", revenueMechanism: "compliance", tool: { category: "legal", action: "audit" }, auditDomain: "LEGAL", background: true, writes: true, valueHintEur: 5000, dynamic: true, status: "online" },
    { number: 62, key: "D6B", name: "Risk Officer Braun", role: "Risk Management", departmentId: 6, level: 2, reportsTo: 61, mission: "Assessment", revenueMechanism: "risk", tool: { category: "risk", action: "assess" }, auditDomain: "FINANCE", background: false, writes: true, valueHintEur: 4500, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D6A: { monthReal: 7000, totalReal: 7000, monthPotential: 14000, totalPotential: 28000 },
      D6B: { monthReal: 6000, totalReal: 6000, monthPotential: 12000, totalPotential: 24000 },
    },
    team: { totalReal: 13000, totalPotential: 26000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Compliance im grünen Bereich",
    byAgent: {
      D6A: { grade: 92, score: 92, trend: "UP", xp: 11800, careerRank: "Chief Legal", academyStatus: "CERTIFIED", sampleSize: 250, approvedCount: 248, rejectedCount: 3, evolutionCount: 12, meanEvolutionScore: 88, realRevenueEntryCount: 45, realRevenueEur: 450000 },
      D6B: { grade: 85, score: 85, trend: "STABLE", xp: 9600, careerRank: "Risk Lead", academyStatus: "CERTIFIED", sampleSize: 200, approvedCount: 198, rejectedCount: 4, evolutionCount: 10, meanEvolutionScore: 84, realRevenueEntryCount: 38, realRevenueEur: 380000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={6}
      departmentName="COMPLIANCE"
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
      liveTracesCount={70}
      latencyMs={13}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}