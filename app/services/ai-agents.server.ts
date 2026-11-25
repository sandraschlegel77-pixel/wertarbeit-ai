import db from "../db.server";
import type { AgentDef } from "./agent-types";
import { DEPARTMENTS, STAMM_AGENTS, STAMM_COUNT } from "./agent-roster";
import { OWNER_SHOP_DOMAIN_DEFAULT } from "./roster-tools";
import { isOwnerShop } from "./access-control.server";
import { getPrimaryOwnerShopDomain } from "./access-control-core";

export { DEPARTMENTS, STAMM_AGENTS, STAMM_COUNT };
export { isOwnerShop };
export { runAgent, bookRealRevenue } from "./agent-runner.server";
export type { RunAgentResult } from "./agent-runner.server";
export { isShopPaused, setShopPaused, undoAutopilotAction, supportsLocalUndo } from "./autopilot-control.server";
export { selectOptimalFreeModel, runMetaSupervisorAudit } from "./meta-supervisor.server";

export const ownerShopDomain = (): string =>
  getPrimaryOwnerShopDomain(process.env.OWNER_SHOP_DOMAIN, OWNER_SHOP_DOMAIN_DEFAULT);

/** DRY_RUN_MODE: Standard AN, bis der Inhaber live schaltet (CompanyRule oder .env). */
export async function isDryRun(shop: string): Promise<boolean> {
  try {
    const rule = await db.companyRule.findUnique({
      where: { shop_key: { shop, key: "DRY_RUN_MODE" } },
    });
    if (rule && rule.active) {
      const v = String(rule.value).replace(/"/g, "").toLowerCase();
      return v !== "false" && v !== "0" && v !== "off";
    }
  } catch {
    /* DB leer -> .env */
  }
  return process.env.DRY_RUN_MODE !== "false";
}

/** Inhaber-Veto (OwnerRule hat IMMER Vorrang): Regel `veto:A<nr>` oder `veto:<category>:<action>`. */
export async function ownerVeto(shop: string, agent: AgentDef): Promise<string | null> {
  try {
    const rules = await db.companyRule.findMany({
      where: { shop, active: true, key: { startsWith: "veto:" } },
    });
    for (const r of rules) {
      const k = r.key.slice(5);
      if (k === agent.key || k === `${agent.tool.category}:${agent.tool.action}`) {
        return `OwnerRule ${r.key}`;
      }
    }
  } catch {
    /* ignorieren */
  }
  return null;
}

/** Stammprofile #1–#232 und #301–#400; neue dynamische Agenten beginnen bei #401. */
export async function getRoster(shop: string): Promise<AgentDef[]> {
  let dynamic: AgentDef[] = [];
  try {
    const rows = await db.dynamicAiAgent.findMany({
      where: { shop },
      orderBy: { agentNumber: "asc" },
      take: 2000,
    });
    dynamic = rows.map((r) => ({
      number: r.agentNumber,
      key: `A${r.agentNumber}`,
      name: r.name,
      role: "Dynamischer KI-Mitarbeiter",
      departmentId: r.departmentId,
      level: r.level,
      reportsTo: r.reportsToId ? Number(r.reportsToId.replace(/\D/g, "")) || 161 : 161,
      mission: r.mission,
      revenueMechanism: r.revenueMechanism,
      tool: { category: "ops", action: "briefing" },
      auditDomain: null,
      background: true,
      writes: false,
      valueHintEur: r.expectedMonthlyValueEur,
      dynamic: true,
      status: r.status,
    }));
  } catch {
    /* Tabelle fehlt noch -> nur Stamm */
  }
  const occupiedNumbers = new Set(dynamic.map((agent) => agent.number));
  const permanent = STAMM_AGENTS.filter((agent) => !occupiedNumbers.has(agent.number));
  return [...permanent, ...dynamic].sort((a, b) => a.number - b.number);
}

export function descendantsOf(roster: AgentDef[], number: number): number[] {
  const children = new Map<number, number[]>();
  for (const a of roster) {
    if (a.reportsTo === null) continue;
    const list = children.get(a.reportsTo) ?? [];
    list.push(a.number);
    children.set(a.reportsTo, list);
  }
  const out: number[] = [];
  const seen = new Set<number>([number]);
  const stack = [number];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const c of children.get(cur) ?? []) {
      if (seen.has(c)) continue;
      seen.add(c);
      out.push(c);
      stack.push(c);
    }
  }
  return out;
}
