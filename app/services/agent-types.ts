/** Geteilte Typen (client-sicher, keine Server-Importe). */

export type AuditDomain = "LEGAL" | "FINANCE" | "CRAFT";

export interface AgentDef {
  number: number;
  key: string; // z. B. "A12"
  name: string;
  role: string;
  departmentId: number;
  /** 0 Inhaber, 1 Vorstand, 2 Direktor, 3 Abteilungsleiter, 4 Teamleiter/Fachagent, 5 Co-Agent/Dynamisch */
  level: number;
  reportsTo: number | null;
  mission: string;
  revenueMechanism: string;
  tool: { category: string; action: string };
  auditDomain: AuditDomain | null;
  background: boolean;
  writes: boolean;
  valueHintEur: number;
  dynamic?: boolean;
  status?: string;
  advisoryOnly?: boolean;
  specialistCluster?: string;
}

export interface DepartmentDef {
  id: number;
  name: string;
  mechanism: string;
  directorNumber: number | null;
  headNumber: number | null;
  kind: "core" | "armada" | "panel" | "harmony";
  auditDomain: AuditDomain | null;
}

export interface EarningsRow {
  monthReal: number;
  totalReal: number;
  monthPotential: number;
  totalPotential: number;
}

export interface EarningsSummary {
  perAgent: Record<string, EarningsRow>;
  team: Record<string, EarningsRow>;
  army: EarningsRow;
}

export interface AgentPerformanceSummary {
  grade: number | null;
  score: number | null;
  trend: "UP" | "STABLE" | "DOWN" | "UNAVAILABLE";
  xp: number;
  careerRank: string;
  academyStatus: "CERTIFIED" | "RETRAINING" | "IN_TRAINING";
  sampleSize: number;
  approvedCount: number;
  rejectedCount: number;
  evolutionCount: number;
  meanEvolutionScore: number | null;
  realRevenueEntryCount: number;
  realRevenueEur: number;
}

export interface AgentPerformanceSnapshot {
  status: "available" | "unavailable";
  message: string | null;
  byAgent: Record<string, AgentPerformanceSummary>;
}

export interface ApprovalDto {
  id: string;
  sourceAgentKey: string;
  category: string;
  title: string;
  summary: string;
  financialImpactEur: number;
  riskLevel: string;
  status: string;
  createdAt: string;
}

export interface AuditDto {
  id: string;
  auditDomain: string;
  sourceAgentKey: string;
  pass1AuditorKey: string;
  pass1Status: string;
  pass2AuditorKey: string;
  pass2Status: string;
  chiefAuditorKey: string;
  finalStatus: string;
  findingsSummary: string | null;
  createdAt: string;
}

export interface EvolutionDto {
  agentKey: string;
  skillVersion: number;
  successScore: number;
  learnedInsights: string;
  evolvedPromptHint: string;
  createdAt: string;
}

export interface InventoryValue {
  grossSalesValue: number;
  netSalesValue: number;
  purchaseValue: number;
  expectedNetProfit: number;
  avgMarginPercent: number;
  items: number;
}

export interface HarmonyScore {
  harmony: number;
  speed: number;
  pending: number;
  conflicts: number;
}
