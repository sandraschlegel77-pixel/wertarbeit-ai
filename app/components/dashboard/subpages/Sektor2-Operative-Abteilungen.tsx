import { SectorSubpage } from "./SectorSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import type { InvestmentLevel } from "../../ui/SingularityPrimitives";

/**
 * Sektor 2: Operative Abteilungen
 */
export function OperativeAbteilungenSector() {
  const roster: AgentDef[] = [
    { number: 1, key: "B1", name: "Logistik-Leiter Weber", role: "Versorgungsmanagement", departmentId: 2, level: 3, reportsTo: null, mission: "Ressourcenfluss", revenueMechanism: "efficiency gains", tool: { category: "logistics", action: "optimize" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 3500, dynamic: false, status: "online" },
    { number: 2, key: "B2", name: "Fertigungsleiter Schmidt", role: "Produktionssteuerung", departmentId: 2, level: 2, reportsTo: 1, mission: "Output-Optimierung", revenueMechanism: "throughput", tool: { category: "manufacturing", action: "schedule" }, auditDomain: "CRAFT", background: false, writes: true, valueHintEur: 4200, dynamic: true, status: "online" },
    { number: 3, key: "B3", name: "Qualitätsmanagerin Fischer", role: "QS & Compliance", departmentId: 2, level: 2, reportsTo: 1, mission: "Qualitätssicherung", revenueMechanism: "defect reduction", tool: { category: "compliance", action: "audit" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 2800, dynamic: false, status: "online" },
    { number: 4, key: "B4", name: "Lieferanten-Managerin Meier", role: "Beschaffung", departmentId: 2, level: 4, reportsTo: 1, mission: "Lieferanten-Optimierung", revenueMechanism: "cost reduction", tool: { category: "procurement", action: "bid" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 3100, dynamic: true, status: "online" },
  ];

  const earnings: EarningsSummary = {
    perAgent: {
      B1: { monthReal: 14200, totalReal: 14200, monthPotential: 32000, totalPotential: 72000 },
      B2: { monthReal: 11800, totalReal: 11800, monthPotential: 24000, totalPotential: 54000 },
      B3: { monthReal: 9500, totalReal: 9500, monthPotential: 18000, totalPotential: 42000 },
      B4: { monthReal: 7600, totalReal: 7600, monthPotential: 15000, totalPotential: 35000 },
    },
    team: { totalReal: 43100, totalPotential: 203000 },
    army: { monthReal: 8200, totalReal: 8200, monthPotential: 19000, totalPotential: 45000 },
  };

  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Abteilung betreibt über Zielwerte",
    byAgent: {
      B1: { grade: 95, score: 95, trend: "UP", xp: 15600, careerRank: "Supply Chain Director", academyStatus: "CERTIFIED", sampleSize: 310, approvedCount: 302, rejectedCount: 8, evolutionCount: 22, meanEvolutionScore: 91, realRevenueEntryCount: 67, realRevenueEur: 670000 },
      B2: { grade: 90, score: 90, trend: "UP", xp: 12800, careerRank: "Production Manager", academyStatus: "CERTIFIED", sampleSize: 260, approvedCount: 250, rejectedCount: 10, evolutionCount: 18, meanEvolutionScore: 87, realRevenueEntryCount: 54, realRevenueEur: 540000 },
      B3: { grade: 84, score: 84, trend: "STABLE", xp: 8900, careerRank: "Quality Lead", academyStatus: "CERTIFIED", sampleSize: 190, approvedCount: 185, rejectedCount: 5, evolutionCount: 9, meanEvolutionScore: 81, realRevenueEntryCount: 38, realRevenueEur: 380000 },
      B4: { grade: 89, score: 89, trend: "UP", xp: 11200, careerRank: "Procurement Lead", academyStatus: "CERTIFIED", sampleSize: 220, approvedCount: 214, rejectedCount: 6, evolutionCount: 15, meanEvolutionScore: 85, realRevenueEntryCount: 42, realRevenueEur: 420000 },
    },
  };

  const onPickDept = (id: number) => {
    console.log("Department selected:", id);
  };

  return (
    <SectorSubpage
      sectorId={2}
      sectorName="OPERATIVE ABTEILUNGEN"
      roster={roster}
      earnings={earnings}
      performance={performance}
      allowedDepartmentIds={[2]}
      onBack={() => console.log("back")}
      onPickDept={onPickDept}
      investmentLevel={"APEX_OMEGA_PRIME" as const}
      onInvestmentChange={() => console.log("change")}
      killSwitchActive={false}
      onKillSwitchToggle={() => console.log("toggle")}
      commandPaletteOpen={false}
      onCommandPaletteToggle={() => console.log("toggle")}
      onCommand={() => console.log("cmd")}
      liveTracesCount={57}
      latencyMs={12}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => console.log("inspect")}
    />
  );
}