import { SectorSubpage } from "./SectorSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import type { InvestmentLevel } from "../../ui/SingularityPrimitives";

/**
 * Sektor 3: Akademie & Sicherheit
 */
export function AkademieSicherheitSector() {
  const roster: AgentDef[] = [
    { number: 1, key: "A1", name: "Rechtsberaterin Dr. Adler", role: "Juristische Prüfung", departmentId: 3, level: 2, reportsTo: null, mission: "Compliance", revenueMechanism: "audit", tool: { category: "legal", action: "review" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 2900, dynamic: true, status: "online" },
    { number: 2, key: "A2", name: "Sicherheitsoffizier Krueger", role: "Red-Team / Threats", departmentId: 3, level: 3, reportsTo: 1, mission: "Threat Intel", revenueMechanism: "protection", tool: { category: "security", action: "simulate" }, auditDomain: "LEGAL", background: true, writes: true, valueHintEur: 3300, dynamic: false, status: "online" },
    { number: 3, key: "A3", name: "Ausbilder Voss", role: "Onboarding & Training", departmentId: 3, level: 2, reportsTo: 1, mission: "Skill-Training", revenueMechanism: "capability", tool: { category: "academy", action: "train" }, auditDomain: "CRAFT", background: false, writes: false, valueHintEur: 2100, dynamic: true, status: "offline" },
    { number: 4, key: "A4", name: "Forensikerin Lang", role: "Incident Response", departmentId: 3, level: 3, reportsTo: 1, mission: "Forensik", revenueMechanism: "remediation", tool: { category: "forensic", action: "investigate" }, auditDomain: "LEGAL", background: false, writes: true, valueHintEur: 2700, dynamic: true, status: "online" },
  ];

  const earnings: EarningsSummary = {
    perAgent: {
      A1: { monthReal: 6800, totalReal: 6800, monthPotential: 14000, totalPotential: 30000 },
      A2: { monthReal: 7200, totalReal: 7200, monthPotential: 15000, totalPotential: 33000 },
      A3: { monthReal: 5400, totalReal: 5400, monthPotential: 11000, totalPotential: 25000 },
      A4: { monthReal: 6100, totalReal: 6100, monthPotential: 12000, totalPotential: 27000 },
    },
    team: { totalReal: 25500, totalPotential: 83000 },
    army: { monthReal: 3000, totalReal: 3000, monthPotential: 8000, totalPotential: 18000 },
  };

  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Ausbildung läuft im Trockenlauf",
    byAgent: {
      A1: { grade: 83, score: 83, trend: "STABLE", xp: 6100, careerRank: "Judge", academyStatus: "CERTIFIED", sampleSize: 140, approvedCount: 138, rejectedCount: 2, evolutionCount: 6, meanEvolutionScore: 78, realRevenueEntryCount: 22, realRevenueEur: 220000 },
      A2: { grade: 91, score: 91, trend: "UP", xp: 11800, careerRank: "Security Director", academyStatus: "CERTIFIED", sampleSize: 260, approvedCount: 254, rejectedCount: 6, evolutionCount: 16, meanEvolutionScore: 86, realRevenueEntryCount: 41, realRevenueEur: 410000 },
      A3: { grade: 78, score: 78, trend: "UP", xp: 7400, careerRank: "Training Officer", academyStatus: "IN_TRAINING", sampleSize: 90, approvedCount: 87, rejectedCount: 3, evolutionCount: 8, meanEvolutionScore: 75, realRevenueEntryCount: 15, realRevenueEur: 150000 },
      A4: { grade: 86, score: 86, trend: "STABLE", xp: 9800, careerRank: "Forensic Chief", academyStatus: "CERTIFIED", sampleSize: 150, approvedCount: 146, rejectedCount: 4, evolutionCount: 11, meanEvolutionScore: 82, realRevenueEntryCount: 29, realRevenueEur: 290000 },
    },
  };

  const onPickDept = (id: number) => console.log("Department selected:", id);

  return (
    <SectorSubpage
      sectorId={3}
      sectorName="AKADEMIE & SICHERHEIT"
      roster={roster}
      earnings={earnings}
      performance={performance}
      allowedDepartmentIds={[3]}
      onBack={() => console.log("back")}
      onPickDept={onPickDept}
      investmentLevel={"APEX_OMEGA_PRIME" as const}
      onInvestmentChange={() => console.log("change")}
      killSwitchActive={false}
      onKillSwitchToggle={() => console.log("toggle")}
      commandPaletteOpen={false}
      onCommandPaletteToggle={() => console.log("toggle")}
      onCommand={() => console.log("cmd")}
      liveTracesCount={23}
      latencyMs={28}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => console.log("inspect")}
    />
  );
}