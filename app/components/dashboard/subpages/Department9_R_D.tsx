import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department9RD() {
  const roster: AgentDef[] = [
    { number: 91, key: "D9A", name: "R&D Lead Neumann", role: "Research Lead", departmentId: 9, level: 1, reportsTo: null, mission: "Innovation", revenueMechanism: "patent", tool: { category: "research", action: "discover" }, auditDomain: "CRAFT", background: true, writes: true, valueHintEur: 9000, dynamic: true, status: "online" },
    { number: 92, key: "D9B", name: "Lab Engineer Haas", role: "Prototyping", departmentId: 9, level: 2, reportsTo: 91, mission: "Prototypes", revenueMechanism: "prototype", tool: { category: "engineering", action: "build" }, auditDomain: "CRAFT", background: true, writes: true, valueHintEur: 7000, dynamic: true, status: "online" },
    { number: 93, key: "D9C", name: "Quantum Analyst Stark", role: "Quantum", departmentId: 9, level: 3, reportsTo: 91, mission: "Quantum", revenueMechanism: "breakthrough", tool: { category: "quantum", action: "simulate" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 8000, dynamic: true, status: "online" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D9A: { monthReal: 13000, totalReal: 13000, monthPotential: 26000, totalPotential: 52000 },
      D9B: { monthReal: 10000, totalReal: 10000, monthPotential: 20000, totalPotential: 40000 },
      D9C: { monthReal: 9500, totalReal: 9500, monthPotential: 19000, totalPotential: 38000 },
    },
    team: { totalReal: 32500, totalPotential: 65000 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Breakthrough-Kandidaten im Pipeline",
    byAgent: {
      D9A: { grade: 95, score: 95, trend: "UP", xp: 18900, careerRank: "R&D Director", academyStatus: "CERTIFIED", sampleSize: 260, approvedCount: 258, rejectedCount: 3, evolutionCount: 22, meanEvolutionScore: 92, realRevenueEntryCount: 52, realRevenueEur: 520000 },
      D9B: { grade: 88, score: 88, trend: "UP", xp: 13400, careerRank: "Lab Lead", academyStatus: "IN_TRAINING", sampleSize: 210, approvedCount: 208, rejectedCount: 4, evolutionCount: 14, meanEvolutionScore: 85, realRevenueEntryCount: 40, realRevenueEur: 400000 },
      D9C: { grade: 91, score: 91, trend: "STABLE", xp: 15800, careerRank: "Quantum Lead", academyStatus: "CERTIFIED", sampleSize: 230, approvedCount: 228, rejectedCount: 2, evolutionCount: 18, meanEvolutionScore: 89, realRevenueEntryCount: 46, realRevenueEur: 460000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={9}
      departmentName="R&D"
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
      liveTracesCount={41}
      latencyMs={33}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}