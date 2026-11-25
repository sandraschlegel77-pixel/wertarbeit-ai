import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department10Procurement() {
  const roster: AgentDef[] = [
    { number: 101, key: "D10A", name: "Procurement Director Vogt", role: "Supplier Management", departmentId: 10, level: 1, reportsTo: null, mission: "Supply", revenueMechanism: "cost", tool: { category: "procurement", action: "source" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 3200, dynamic: true, status: "online" },
    { number: 102, key: "D10B", name: "Contract Analyst Krause", role: "Contracts", departmentId: 10, level: 2, reportsTo: 101, mission: "Negotiation", revenueMechanism: "contract", tool: { category: "legal", action: "negotiate" }, auditDomain: "LEGAL", background: false, writes: true, valueHintEur: 2800, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D10A: { monthReal: 8000, totalReal: 8000, monthPotential: 16000, totalPotential: 32000 },
      D10B: { monthReal: 5200, totalReal: 5200, monthPotential: 10400, totalPotential: 20800 },
    },
    team: { totalReal: 13200, totalPotential: 52800 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Lieferanten-Review",
    byAgent: {
      D10A: { grade: 88, score: 88, trend: "UP", xp: 10200, careerRank: "Procurement Director", academyStatus: "CERTIFIED", sampleSize: 190, approvedCount: 188, rejectedCount: 3, evolutionCount: 10, meanEvolutionScore: 84, realRevenueEntryCount: 25, realRevenueEur: 250000 },
      D10B: { grade: 84, score: 84, trend: "STABLE", xp: 7800, careerRank: "Contract Lead", academyStatus: "CERTIFIED", sampleSize: 160, approvedCount: 158, rejectedCount: 4, evolutionCount: 8, meanEvolutionScore: 80, realRevenueEntryCount: 22, realRevenueEur: 220000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={10}
      departmentName="PROCUREMENT"
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
      liveTracesCount={50}
      latencyMs={12}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}