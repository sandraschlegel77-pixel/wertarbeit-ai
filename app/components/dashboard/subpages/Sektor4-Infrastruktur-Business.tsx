import { SectorSubpage } from "./SectorSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import type { InvestmentLevel } from "../../ui/SingularityPrimitives";

/**
 * Sektor 4: Infrastruktur & Business
 */
export function InfrastrukturBusinessSector() {
  const roster: AgentDef[] = [
    { number: 1, key: "B5", name: "IT-Direktorin Schmidt", role: "Technische Infrastruktur", departmentId: 4, level: 2, reportsTo: null, mission: "Cloud & Security", revenueMechanism: "service", tool: { category: "cloud", action: "scale" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 4000, dynamic: false, status: "online" },
    { number: 2, key: "B6", name: "Finanzleiter Bauer", role: "Business Finance", departmentId: 4, level: 3, reportsTo: 1, mission: "Revenue-Optimierung", revenueMechanism: "profitability", tool: { category: "finance", action: "forecast" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 3500, dynamic: true, status: "online" },
    { number: 3, key: "B7", name: "Marketing-Vertreter Lenz", role: "Business Growth", departmentId: 4, level: 2, reportsTo: 1, mission: "Market Expansion", revenueMechanism: "acquisition", tool: { category: "marketing", action: "launch" }, auditDomain: "CRAFT", background: false, writes: false, valueHintEur: 3000, dynamic: true, status: "offline" },
    { number: 4, key: "B8", name: "Logistik-Managerin Koch", role: "Supply Chain", departmentId: 4, level: 3, reportsTo: 1, mission: "Distribution", revenueMechanism: "logistics", tool: { category: "transport", action: "route" }, auditDomain: "FINANCE", background: true, writes: true, valueHintEur: 3200, dynamic: true, status: "online" },
  ];

  const earnings: EarningsSummary = {
    perAgent: {
      B5: { monthReal: 11000, totalReal: 11000, monthPotential: 28000, totalPotential: 70000 },
      B6: { monthReal: 13000, totalReal: 13000, monthPotential: 26000, totalPotential: 65000 },
      B7: { monthReal: 9000, totalReal: 9000, monthPotential: 22000, totalPotential: 55000 },
      B8: { monthReal: 12000, totalReal: 12000, monthPotential: 24000, totalPotential: 60000 },
    },
    team: { totalReal: 48000, totalPotential: 95000 },
    army: { monthReal: 5000, totalReal: 5000, monthPotential: 14000, totalPotential: 28000 },
  };

  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Business-KPIs im grünen Bereich",
    byAgent: {
      B5: { grade: 88, score: 88, trend: "UP", xp: 13200, careerRank: "VP Tech", academyStatus: "CERTIFIED", sampleSize: 270, approvedCount: 268, rejectedCount: 4, evolutionCount: 14, meanEvolutionScore: 84, realRevenueEntryCount: 55, realRevenueEur: 550000 },
      B6: { grade: 92, score: 92, trend: "STABLE", xp: 14400, careerRank: "CFO", academyStatus: "CERTIFIED", sampleSize: 290, approvedCount: 288, rejectedCount: 3, evolutionCount: 16, meanEvolutionScore: 87, realRevenueEntryCount: 62, realRevenueEur: 620000 },
      B7: { grade: 76, score: 76, trend: "DOWN", xp: 7200, careerRank: "Marketing Director", academyStatus: "RETRAINING", sampleSize: 150, approvedCount: 145, rejectedCount: 12, evolutionCount: 5, meanEvolutionScore: 70, realRevenueEntryCount: 28, realRevenueEur: 280000 },
      B8: { grade: 90, score: 90, trend: "UP", xp: 13800, careerRank: "COO", academyStatus: "CERTIFIED", sampleSize: 250, approvedCount: 248, rejectedCount: 2, evolutionCount: 18, meanEvolutionScore: 83, realRevenueEntryCount: 58, realRevenueEur: 580000 },
    },
  };

  const onPickDept = (id: number) => console.log("Department selected:", id);

  return (
    <SectorSubpage
      sectorId={4}
      sectorName="INFRASTRUKTUR & BUSINESS"
      roster={roster}
      earnings={earnings}
      performance={performance}
      allowedDepartmentIds={[4]}
      onBack={() => console.log("back")}
      onPickDept={onPickDept}
      investmentLevel={"APEX_OMEGA_PRIME" as const}
      onInvestmentChange={() => console.log("change")}
      killSwitchActive={false}
      onKillSwitchToggle={() => console.log("toggle")}
      commandPaletteOpen={false}
      onCommandPaletteToggle={() => console.log("toggle")}
      onCommand={() => console.log("cmd")}
      liveTracesCount={31}
      latencyMs={15}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => console.log("inspect")}
    />
  );
}