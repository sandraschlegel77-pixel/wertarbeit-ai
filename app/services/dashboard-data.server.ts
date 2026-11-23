import db from "../db.server";
import type { ApprovalDto, AuditDto, EvolutionDto, InventoryValue } from "./agent-types";
import type { ShopifyAdmin } from "./admin-types";

const EMPTY_INVENTORY: InventoryValue = {
  grossSalesValue: 0,
  netSalesValue: 0,
  purchaseValue: 0,
  expectedNetProfit: 0,
  avgMarginPercent: 0,
  items: 0,
};

/** Beispieldaten für den Zero-Friction-Demo-Modus (Shopify-Reviewer). */
export const DEMO_INVENTORY: InventoryValue = {
  grossSalesValue: 18450,
  netSalesValue: 15504.2,
  purchaseValue: 6120,
  expectedNetProfit: 9384.2,
  avgMarginPercent: 60.5,
  items: 74,
};

/** Live-Warenwert aus der Shopify Admin API (Verkaufswert brutto/netto, Einkaufswert, Gewinn, Ø Marge). */
export async function getInventoryValue(admin: ShopifyAdmin): Promise<InventoryValue> {
  try {
    const res = await admin.graphql(`#graphql
      query InventoryValue {
        products(first: 100) {
          nodes {
            variants(first: 50) {
              nodes {
                price
                inventoryQuantity
                inventoryItem { unitCost { amount } }
              }
            }
          }
        }
      }`);
    const json = (await res.json()) as any;
    let gross = 0;
    let purchase = 0;
    let items = 0;
    const margins: number[] = [];
    for (const p of json?.data?.products?.nodes ?? []) {
      for (const v of p.variants?.nodes ?? []) {
        const qty = Math.max(0, Number(v.inventoryQuantity ?? 0));
        const price = Number(v.price ?? 0);
        const cost = Number(v.inventoryItem?.unitCost?.amount ?? 0);
        if (qty === 0) continue;
        items += qty;
        gross += price * qty;
        purchase += cost * qty;
        if (price > 0 && cost > 0) margins.push(((price / 1.19 - cost) / (price / 1.19)) * 100);
      }
    }
    const net = gross / 1.19;
    const avg = margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
    return {
      grossSalesValue: Math.round(gross * 100) / 100,
      netSalesValue: Math.round(net * 100) / 100,
      purchaseValue: Math.round(purchase * 100) / 100,
      expectedNetProfit: Math.round((net - purchase) * 100) / 100,
      avgMarginPercent: Math.round(avg * 10) / 10,
      items,
    };
  } catch {
    return EMPTY_INVENTORY;
  }
}

const iso = (d: Date) => d.toISOString();

export async function getApprovals(shop: string): Promise<ApprovalDto[]> {
  try {
    const rows = await db.approvalQueueItem.findMany({
      where: { shop, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      sourceAgentKey: r.sourceAgentKey,
      category: r.category,
      title: r.title,
      summary: r.summary,
      financialImpactEur: r.financialImpactEur,
      riskLevel: r.riskLevel,
      status: r.status,
      createdAt: iso(r.createdAt),
    }));
  } catch {
    return [];
  }
}

export async function getAudits(shop: string): Promise<AuditDto[]> {
  try {
    const rows = await db.tripleAuditLog.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) }));
  } catch {
    return [];
  }
}

export async function getEvolution(shop: string): Promise<EvolutionDto[]> {
  try {
    const rows = await db.agentSkillEvolution.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return rows.map((r) => ({
      agentKey: r.agentKey,
      skillVersion: r.skillVersion,
      successScore: r.successScore,
      learnedInsights: r.learnedInsights,
      evolvedPromptHint: r.evolvedPromptHint,
      createdAt: iso(r.createdAt),
    }));
  } catch {
    return [];
  }
}

export async function getVaultCounts(shop: string) {
  try {
    const [certs, invoices, svgs] = await Promise.all([
      db.graCertificate.count({ where: { shop } }),
      db.invoice.count({ where: { shop } }),
      db.xtoolSvg.count({ where: { shop } }),
    ]);
    return { certs, invoices, svgs };
  } catch {
    return { certs: 0, invoices: 0, svgs: 0 };
  }
}
