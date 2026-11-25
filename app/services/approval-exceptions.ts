import type { ApprovalDto } from "./agent-types";

const ESCALATION_AGENTS = new Set(["A221", "A224", "A225"]);

export function isApprovalException(item: Pick<
  ApprovalDto,
  "financialImpactEur" | "riskLevel" | "sourceAgentKey" | "title" | "summary"
>): boolean {
  return item.financialImpactEur > 0 ||
    item.riskLevel === "HIGH" ||
    item.riskLevel === "CRITICAL" ||
    ESCALATION_AGENTS.has(item.sourceAgentKey) ||
    /einspruch|schwellenwert|threshold.{0,24}(?:überschritten|exceeded)|vorher.{0,32}nachher|auswirkung/i.test(
      `${item.title} ${item.summary}`
    );
}
