import db from "../db.server";
import { STAMM_AGENTS } from "./agent-roster";
import { getAccessibleDepartmentIds, moduleIdsFromSubscription } from "./module-access";
import { isCanonicalOwnerShop, isConfiguredOwnerShop } from "./access-control-core";

export type ShopAccessRole = "OWNER" | "SUBSCRIBER";

export class ShopAccessDeniedError extends Error {}

export function isOwnerShop(shop: string): boolean {
  return isCanonicalOwnerShop(shop) || isConfiguredOwnerShop(shop, process.env.OWNER_SHOP_DOMAIN);
}

export function getShopAccessRole(shop: string): ShopAccessRole {
  return isOwnerShop(shop) ? "OWNER" : "SUBSCRIBER";
}

export async function requireOwnerShop(shop: string): Promise<void> {
  if (!isOwnerShop(shop)) throw new ShopAccessDeniedError("Diese Funktion ist dem exakt konfigurierten Inhaber-Shop vorbehalten.");
}

export async function requireSubscriberShop(shop: string): Promise<void> {
  if (isOwnerShop(shop)) throw new ShopAccessDeniedError("Diese Funktion steht nur Subscriber-Shops zur Verfügung.");
  const subscription = await db.shopSubscription.findUnique({
    where: { shop },
    select: { active: true },
  });
  if (!subscription?.active) {
    throw new ShopAccessDeniedError("Für diese Funktion ist eine aktive Subscriber-Subscription erforderlich.");
  }
}

export async function canAccessAgentForShop(shop: string, agentKey: string): Promise<boolean> {
  if (isOwnerShop(shop)) return true;
  const numberMatch = /^A([1-9]\d*)$/.exec(agentKey);
  if (!numberMatch) return false;
  const number = Number(numberMatch[1]);
  const dynamicAgent = await db.dynamicAiAgent.findFirst({
    where: { shop, agentNumber: number },
    select: { id: true },
  });
  if (dynamicAgent) return false;
  const agent = STAMM_AGENTS.find((candidate) => candidate.number === number);
  if (!agent || agent.dynamic) return false;
  const subscription = await db.shopSubscription.findUnique({
    where: { shop },
    select: {
      active: true,
      moduleInvoices: true,
      moduleCertificates: true,
      moduleMultichannel: true,
      moduleGrowth: true,
    },
  });
  if (!subscription?.active) return false;
  const departments = new Set(getAccessibleDepartmentIds(moduleIdsFromSubscription(subscription), false));
  return departments.has(agent.departmentId);
}
