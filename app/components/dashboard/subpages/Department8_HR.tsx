import { DepartmentSubpage } from "./DepartmentSubpage";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";

export function Department8HR() {
  const roster: AgentDef[] = [
    { number: 81, key: "D8A", name: "HR Director Maier", role: "Human Resources", departmentId: 8, level: 1, reportsTo: null, mission: "Talent", revenueMechanism: "retention", tool: { category: "hr", action: "onboard" }, auditDomain: "CRAFT", background: false, writes: false, valueHintEur: 2800, dynamic: true, status: "online" },
    { number: 82, key: "D8B", name: "Recruiter Fischer", role: "Recruiting", departmentId: 8, level: 2, reportsTo: 81, mission: "Hiring", revenueMechanism: "growth", tool: { category: "hr", action: "hire" }, auditDomain: "LEGAL", background: false, writes: false, valueHintEur: 2200, dynamic: true, status: "online" },
    { number: 83, key: "D8C", name: "Learning Coach Weber", role: "Learning & Development", departmentId: 8, level: 3, reportsTo: 81, mission: "Skills", revenueMechanism: "capability", tool: { category: "hr", action: "train" }, auditDomain: "LEGAL", background: false, writes: true, valueHintEur: 1800, dynamic: true, status: "offline" },
  ];
  const earnings: EarningsSummary = {
    perAgent: {
      D8A: { monthReal: 5200, totalReal: 5200, monthPotential: 10400, totalPotential: 20800 },
      D8B: { monthReal: 4800, totalReal: 4800, monthPotential: 9600, totalPotential: 19200 },
      D8C: { monthReal: 4200, totalReal: 4200, monthPotential: 8400, totalPotential: 16800 },
    },
    team: { totalReal: 14200, totalPotential: 56800 },
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  };
  const performance: AgentPerformanceSnapshot = {
    status: "available",
    message: "Onboarding aktiv",
    byAgent: {
      D8A: { grade: 86, score: 86, trend: "STABLE", xp: 8500, careerRank: "HR Director", academyStatus: "CERTIFIED", sampleSize: 210, approvedCount: 208, rejectedCount: 2, evolutionCount: 7, meanEvolutionScore: 81, realRevenueEntryCount: 30, realRevenueEur: 300000 },
      D8B: { grade: 80, score: 80, trend: "UP", xp: 7200, careerRank: "Recruiter", academyStatus: "CERTIFIED", sampleSize: 180, approvedCount: 176, rejectedCount: 4, evolutionCount: 6, meanEvolutionScore: 76, realRevenueEntryCount: 24, realRevenueEur: 240000 },
      D8C: { grade: 74, score: 74, trend: "DOWN", xp: 5800, careerRank: "Learning Lead", academyStatus: "RETRAINING", sampleSize: 130, approvedCount: 126, rejectedCount: 4, evolutionCount: 3, meanEvolutionScore: 70, realRevenueEntryCount: 18, realRevenueEur: 180000 },
    },
  };

  return (
    <DepartmentSubpage
      departmentId={8}
      departmentName="HR"
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
      liveTracesCount={28}
      latencyMs={7}
      modelName="Meta-KI 2.0"
      autoRollbackArmed={false}
      inspectorOpen={false}
      onInspectorToggle={() => {}}
    />
  );
}