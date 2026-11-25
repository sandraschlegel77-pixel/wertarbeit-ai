import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department7Finance() {
  const roster: AgentDef[] = [
    { number: 71, key: "D7A", name: "CFO Richter", role: "Finance Strategy", departmentId: 7, level: 1, reportsTo: null, mission: "Capital", revenueMechanism: "capital", tool: { category: "finance", action: "allocate" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 8000, dynamic: true, status: "online" },
    { number: 72, key: "D7B", name: "Controller Fuchs", role: "Controlling", departmentId: 7, level: 2, reportsTo: 71, mission: "Control", revenueMechanism: "control", tool: { category: "finance", action: "forecast" }, auditDomain: "LEGAL", background: false, writes: true, valueHintEur: 5000, dynamic: true, status: "online" },
    { number: 73, key: "D7C", name: "Treasurer Hahn", role: "Treasury", departmentId: 7, level: 3, reportsTo: 71, mission: "Liquidity", revenueMechanism: "liquidity", tool: { category: "finance", action: "hedge" }, auditDomain: "FINANCE", background: true, writes: false, valueHintEur: 4500, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D7A: { monthReal: 16000, totalReal: 16000, monthPotential: 32000, totalPotential: 64000 },
      D7B: { monthReal: 10000, totalReal: 10000, monthPotential: 20000, totalPotential: 40000 },
      D7C: { monthReal: 9000, totalReal: 9000, monthPotential: 18000, totalPotential: 36000 },
    },
    team: { totalReal: 35000, totalPotential: 140000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Forecasts präzise",
    byAgent: {
      D7A: { grade: 94, score: 94, trend: "UP", xp: 17200, careerRank: "CFO", academyStatus: "CERTIFIED", sampleSize: 280, approvedCount: 278, rejectedCount: 2, evolutionCount: 18, meanEvolutionScore: 90, realRevenueEntryCount: 68, realRevenueEur: 680000 },
      D7B: { grade: 89, score: 89, trend: "STABLE", xp: 12800, careerRank: "Controller", academyStatus: "CERTIFIED", sampleSize: 240, approvedCount: 238, rejectedCount: 4, evolutionCount: 12, meanEvolutionScore: 85, realRevenueEntryCount: 48, realRevenueEur: 480000 },
      D7C: { grade: 87, score: 87, trend: "UP", xp: 11200, careerRank: "Treasurer", academyStatus: "CERTIFIED", sampleSize: 210, approvedCount: 208, rejectedCount: 3, evolutionCount: 9, meanEvolutionScore: 83, realRevenueEntryCount: 42, realRevenueEur: 420000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={7}
      departmentName="FINANCE"
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
      liveTracesCount={65}
      latencyMs={10}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}