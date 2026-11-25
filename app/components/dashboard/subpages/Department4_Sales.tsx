import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department4Sales() {
  const roster: AgentDef[] = [
    { number: 41, key: "D4A", name: "Senior Sales Director Wolff", role: "Global Sales", departmentId: 4, level: 1, reportsTo: null, mission: "Revenue Growth", revenueMechanism: "direct sales", tool: { category: "sales", action: "close" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 7000, dynamic: true, status: "online" },
    { number: 42, key: "D4B", name: "Account Manager Meyer", role: "Key Accounts", departmentId: 4, level: 3, reportsTo: 41, mission: "Retention", revenueMechanism: "upsell", tool: { category: "sales", action: "negotiate" }, auditDomain: "FINANCE", background: false, writes: true, valueHintEur: 4800, dynamic: true, status: "online" },
    { number: 43, key: "D4C", name: "Business Development Soto", role: "New Markets", departmentId: 4, level: 2, reportsTo: 41, mission: "Expansion", revenueMechanism: "new business", tool: { category: "sales", action: "prospect" }, auditDomain: "CRAFT", background: false, writes: false, valueHintEur: 3800, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D4A: { monthReal: 19000, totalReal: 19000, monthPotential: 38000, totalPotential: 76000 },
      D4B: { monthReal: 15500, totalReal: 15500, monthPotential: 31000, totalPotential: 62000 },
      D4C: { monthReal: 12000, totalReal: 12000, monthPotential: 24000, totalPotential: 48000 },
    },
    team: { totalReal: 46500, totalPotential: 186000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Umsätze über Ziel",
    byAgent: {
      D4A: { grade: 96, score: 96, trend: "UP", xp: 18200, careerRank: "Sales VP", academyStatus: "CERTIFIED", sampleSize: 320, approvedCount: 317, rejectedCount: 3, evolutionCount: 20, meanEvolutionScore: 92, realRevenueEntryCount: 88, realRevenueEur: 880000 },
      D4B: { grade: 91, score: 91, trend: "STABLE", xp: 15400, careerRank: "Key Account Manager", academyStatus: "CERTIFIED", sampleSize: 270, approvedCount: 268, rejectedCount: 2, evolutionCount: 15, meanEvolutionScore: 88, realRevenueEntryCount: 55, realRevenueEur: 550000 },
      D4C: { grade: 86, score: 86, trend: "UP", xp: 11200, careerRank: "Business Dev Manager", academyStatus: "CERTIFIED", sampleSize: 220, approvedCount: 218, rejectedCount: 2, evolutionCount: 11, meanEvolutionScore: 82, realRevenueEntryCount: 44, realRevenueEur: 440000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={4}
      departmentName="SALES"
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
      liveTracesCount={78}
      latencyMs={16}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}