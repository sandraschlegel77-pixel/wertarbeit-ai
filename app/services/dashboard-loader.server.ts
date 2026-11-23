import db from "../db.server";
import { getRoster, isDryRun, isOwnerShop } from "./ai-agents.server";
import { computeHarmony, getPreparationDeskSnapshot } from "./orchestration-harmony.server";
import { getAgentEarningsSummary, getCapturedRewardSnapshot } from "./silent-revenue.server";
import { isShopPaused, supportsLocalUndo } from "./autopilot-control.server";
import { generateExecutiveThreeSentencePulse } from "./meta-supervisor.server";
import { DEMO_INVENTORY, getAudits, getEvolution, getInventoryValue, getVaultCounts } from "./dashboard-data.server";
import { getMarketplaceFeedUrls, isGoogleSheetsConfigured } from "./platform-connectors.server";

import type { ShopifyAdmin } from "./admin-types";
import type { EarningsSummary } from "./agent-types";
import { createLoginPath } from "./monitor-auth.server";

type Admin = ShopifyAdmin;

const EMPTY_ROW = { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 };

async function measureDatabaseHealth() {
  const startedAt = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: "online" as const, latencyMs: Date.now() - startedAt };
  } catch {
    return { status: "unavailable" as const, latencyMs: null };
  }
}

/** Lädt alle Dashboard-Daten mit sauberen Fallbacks (leere DB, fehlende API-Keys, Demo-Modus). */
export async function loadDashboard(shop: string, admin: Admin) {
  const owner = isOwnerShop(shop);
  const databaseHealthPromise = measureDatabaseHealth();
  const apiKeysMissing =
    !process.env.GEMINI_API_KEYS && !process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY;

  const [
    subscription,
    rules,
    recentLogs,
    vips,
    roster,
    dryRun,
    harmony,
    preparationDesk,
    audits,
    evolution,
    vault,
    paused,
    executivePulse,
    rewardVault,
  ] = await Promise.all([
      db.shopSubscription.findUnique({ where: { shop } }).catch(() => null),
      db.companyRule.findMany({ where: { shop }, take: 50 }).catch(() => []),
      db.autopilotLog.findMany({ where: { shop }, take: 20, orderBy: { createdAt: "desc" } }).catch(() => []),
      db.vipCustomer.findMany({ where: { shop }, take: 5 }).catch(() => []),
      getRoster(shop),
      isDryRun(shop),
      computeHarmony(shop),
      getPreparationDeskSnapshot(shop),
      getAudits(shop),
      getEvolution(shop),
      getVaultCounts(shop),
      isShopPaused(shop),
      generateExecutiveThreeSentencePulse(shop),
      getCapturedRewardSnapshot(shop),
    ]);

  const earnings = await getAgentEarningsSummary(shop, roster).catch((): EarningsSummary => ({
    perAgent: {},
    team: {},
    army: EMPTY_ROW,
  }));
  const approvals = preparationDesk.items;

  const live = await getInventoryValue(admin);
  const inventory = live.items > 0 ? live : DEMO_INVENTORY;
  const demoInventory = live.items === 0;
  const databaseHealth = await databaseHealthPromise;
  const snapshotAt = new Date().toISOString();
  const [whatsAppOptIns, pendingWorkshopJobs, paymentLedgerEntries] = await Promise.all([
    db.whatsAppConsent.count({ where: { shop, revokedAt: null } }),
    db.xtoolSvg.count({ where: { shop, status: "OPEN" } }),
    db.paymentLedgerEntry.count({ where: { shop } }),
  ]);
  const ossOriginRule = rules.find((r) => r.key === "oss_origin_country");

  // Letzter Prüfstatus je Quell-Mitarbeiter (für das 3×-Prüfsiegel)
  const auditByAgent: Record<string, string> = {};
  for (const a of [...audits].reverse()) auditByAgent[a.sourceAgentKey] = a.finalStatus;

  const modules = [
    subscription?.moduleInvoices ? "m2" : null,
    subscription?.moduleCertificates ? "m5" : null,
    subscription?.moduleMultichannel ? "m4" : null,
    subscription?.moduleGrowth ? "m3" : null,
  ].filter((x): x is string => !!x);

  const taxRule = rules.find((r) => r.key === "tax_mode");
  const onboardingRule = rules.find((r) => r.key === "onboarding_complete");

  return {
    shop,
    owner,
    paused,
    executivePulse,
    preparationDesk,
    onboardingComplete: onboardingRule?.value === true || onboardingRule?.value === "true",
    monitorPath: createLoginPath(shop),
    dryRun,
    apiKeysMissing,
    demoInventory,
    snapshotAt,
    serverUptimeSeconds: Math.floor(process.uptime()),
    databaseHealth,
    subscription,
    vipCount: vips.length,
    rules: rules.map((r) => ({ key: r.key, value: r.value as unknown })),
    taxMode: taxRule ? String(taxRule.value).replace(/"/g, "") : "mwst",
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      status: l.status,
      detail: l.detail,
      canUndo: l.undoable && !l.undoneAt && supportsLocalUndo(l.action),
    })),
    roster,
    extraAgents: roster.filter((a) => a.dynamic).length,
    earnings,
    harmony,
    approvals,
    audits,
    auditByAgent,
    evolution,
    vault,
    rewardVault,
    inventory,
    activeModules: modules,
    platformConnectors: {
      feedUrls: getMarketplaceFeedUrls(shop),
      googleSheetsConfigured: isGoogleSheetsConfigured(),
      whatsAppConfigured: !!process.env.WHATSAPP_CLOUD_TOKEN && !!process.env.WHATSAPP_PHONE_ID,
      whatsAppOptIns,
      pendingWorkshopJobs,
      paymentLedgerEntries,
      ossOriginCountry: typeof ossOriginRule?.value === "string" ? ossOriginRule.value : "",
    },
  };
}
