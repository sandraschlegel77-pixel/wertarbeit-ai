import { SectorSubpage } from "./SectorSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import type { InvestmentLevel } from "../../ui/SingularityPrimitives";

/**
 * Sektor 1: Kommando & Governance
 */
export function KommandoGovernanceSector() {
  const roster: AgentDef[] = [
    { number: 1, key: "A1", name: "Oberst Valerius", role: "Strategische Führung", departmentId: 1, level: 1, reportsTo: null, mission: "Kernstrategie", revenueMechanism: "direkter Einfluss", tool: { category: "command", action: "deploy" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 5000, dynamic: true, status: "online" },
    { number: 2, key: "A2", name: "Admiral Korinth", role: "Maritimer Operations", departmentId: 1, level: 3, reportsTo: 1, mission: "Maritime Security", revenueMechanism: "interdiction", tool: { category: "nav", action: "route" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 3000, dynamic: false, status: "online" },
    { number: 3, key: "A3", name: "Ministerin Pyria", role: "Innere Angelegenheiten", departmentId: 1, level: 2, reportsTo: 1, mission: "Governance", revenueMechanism: "bureaucracy", tool: { category: "admin", action: "approve" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 4000, dynamic: true, status: "offline" },
  ];

  const earnings: EarningsSummary = {
    perAgent: {
      A1: { monthReal: 12500, totalReal: 12500, monthPotential: 25000, totalPotential: 50000 },
      A2: { monthReal: 8900, totalReal: 8900, monthPotential: 18000, totalPotential: 36000 },
      A3: { monthReal: 0, totalReal: 0, monthPotential: 15000, totalPotential: 30000 },
    },
    team: { totalReal: 21400, totalPotential: 86000 },
    army: { monthReal: 5000, totalReal: 5000, monthPotential: 12000, totalPotential: 25000 },
  };

  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Agenten performen im grünen Bereich",
    byAgent: {
      A1: { grade: 92, score: 92, trend: "UP", xp: 12450, careerRank: "Grand Admiral", academyStatus: "CERTIFIED", sampleSize: 240, approvedCount: 234, rejectedCount: 6, evolutionCount: 18, meanEvolutionScore: 89, realRevenueEntryCount: 45, realRevenueEur: 450000 },
      A2: { grade: 88, score: 88, trend: "STABLE", xp: 9800, careerRank: "Fleet Admiral", academyStatus: "CERTIFIED", sampleSize: 180, approvedCount: 172, rejectedCount: 8, evolutionCount: 12, meanEvolutionScore: 82, realRevenueEntryCount: 32, realRevenueEur: 320000 },
      A3: { grade: 76, score: 76, trend: "DOWN", xp: 5200, careerRank: "Colonel", academyStatus: "RETRAINING", sampleSize: 95, approvedCount: 88, rejectedCount: 7, evolutionCount: 4, meanEvolutionScore: 71, realRevenueEntryCount: 18, realRevenueEur: 180000 },
    },
  };

  const onPickDept = (id: number) => {
    console.log("Department selected:", id);
  };

  return (
    <SectorSubpage
      sectorId={1}
      sectorName="KOMMANDO & GOVERNANCE"
      roster={roster}
      earnings={earnings}
      performance={performance}
      allowedDepartmentIds={[1]}
      onBack={() => console.log("back")}
      onPickDept={onPickDept}
      investmentLevel={"APEX_OMEGA_PRIME" as const}
      onInvestmentChange={() => console.log("change")}
      killSwitchActive={false}
      onKillSwitchToggle={() => console.log("toggle")}
      commandPaletteOpen={false}
      onCommandPaletteToggle={() => console.log("toggle")}
      onCommand={() => console.log("cmd")}
      liveTracesCount={42}
      latencyMs={null}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => console.log("inspect")}
    />
  );
}