import { SectorSubpage } from "./SectorSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import type { InvestmentLevel } from "../../ui/SingularityPrimitives";

/**
 * Sektor 5: Frontier & Omega-Lab
 */
export function FrontierOmegaLabSector() {
  const roster: AgentDef[] = [
    { number: 1, key: "C1", name: "Omega-Lab Direktor", role: "Experimentelle KI-Forschung", departmentId: 5, level: 1, reportsTo: null, mission: "Breakthrough AI", revenueMechanism: "royalties", tool: { category: "research", action: "experiment" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 10000, dynamic: true, status: "online" },
    { number: 2, key: "C2", name: "Quantum-Spezialist Voss", role: "Quantenoptimierung", departmentId: 5, level: 4, reportsTo: 1, mission: "Speed-up", revenueMechanism: "efficiency", tool: { category: "quantum", action: "optimize" }, auditDomain: "CRAFT", background: false, writes: true, valueHintEur: 8500, dynamic: true, status: "online" },
    { number: 3, key: "C3", name: "Bio-Hybrid Architect", role: "Bio-Integrationen", departmentId: 5, level: 2, reportsTo: 1, mission: "Living Systems", revenueMechanism: "innovation", tool: { category: "biotech", action: "synthesize" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 7200, dynamic: true, status: "online" },
    { number: 4, key: "C4", name: "Frontier Operations", role: "Außenposten Management", departmentId: 5, level: 3, reportsTo: 1, mission: "Exploration", revenueMechanism: "exploration", tool: { category: "frontier", action: "deploy" }, auditDomain: "CRAFT", background: true, writes: true, valueHintEur: 6800, dynamic: true, status: "online" },
  ];

  const earnings: EarningsSummary = {
    perAgent: {
      C1: { monthReal: 18000, totalReal: 18000, monthPotential: 35000, totalPotential: 85000 },
      C2: { monthReal: 15500, totalReal: 15500, monthPotential: 30000, totalPotential: 72000 },
      C3: { monthReal: 12800, totalReal: 12800, monthPotential: 25000, totalPotential: 60000 },
      C4: { monthReal: 11200, totalReal: 11200, monthPotential: 22000, totalPotential: 50000 },
    },
    team: { totalReal: 61500, totalPotential: 269000 },
    army: { monthReal: 6000, totalReal: 6000, monthPotential: 15000, totalPotential: 36000 },
  };

  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Frontier-KPIs: Explorationsrate hoch",
    byAgent: {
      C1: { grade: 97, score: 97, trend: "UP", xp: 22300, careerRank: "Omega Director", academyStatus: "CERTIFIED", sampleSize: 340, approvedCount: 335, rejectedCount: 5, evolutionCount: 28, meanEvolutionScore: 94, realRevenueEntryCount: 88, realRevenueEur: 880000 },
      C2: { grade: 93, score: 93, trend: "UP", xp: 19800, careerRank: "Quantum Lead", academyStatus: "CERTIFIED", sampleSize: 310, approvedCount: 305, rejectedCount: 6, evolutionCount: 22, meanEvolutionScore: 90, realRevenueEntryCount: 72, realRevenueEur: 720000 },
      C3: { grade: 89, score: 89, trend: "STABLE", xp: 16400, careerRank: "Bio-Hybrid Architect", academyStatus: "IN_TRAINING", sampleSize: 240, approvedCount: 236, rejectedCount: 4, evolutionCount: 16, meanEvolutionScore: 86, realRevenueEntryCount: 55, realRevenueEur: 550000 },
      C4: { grade: 91, score: 91, trend: "UP", xp: 17900, careerRank: "Frontier Commander", academyStatus: "CERTIFIED", sampleSize: 280, approvedCount: 276, rejectedCount: 4, evolutionCount: 20, meanEvolutionScore: 88, realRevenueEntryCount: 63, realRevenueEur: 630000 },
    },
  };

  const onPickDept = (id: number) => console.log("Department selected:", id);

  return (
    <SectorSubpage
      sectorId={5}
      sectorName="FRONTIER & OMEGA-LAB"
      roster={roster}
      earnings={earnings}
      performance={performance}
      allowedDepartmentIds={[5]}
      onBack={() => console.log("back")}
      onPickDept={onPickDept}
      investmentLevel={"APEX_OMEGA_PRIME" as const}
      onInvestmentChange={() => console.log("change")}
      killSwitchActive={false}
      onKillSwitchToggle={() => console.log("toggle")}
      commandPaletteOpen={false}
      onCommandPaletteToggle={() => console.log("toggle")}
      onCommand={() => console.log("cmd")}
      liveTracesCount={12}
      latencyMs={45}
      modelName="Meta-KI Omega"
      autoRollbackArmed={true}
      inspectorOpen={false}
      onInspectorToggle={() => console.log("inspect")}
    />
  );
}