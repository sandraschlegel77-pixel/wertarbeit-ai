import db from "../db.server";
import { getRoster, isDryRun, isOwnerShop } from "./ai-agents.server";
import { computeHarmony, getPreparationDeskSnapshot } from "./orchestration-harmony.server";
import { getAgentEarningsSummary, getCapturedRewardSnapshot } from "./silent-revenue.server";
import { isShopPaused, supportsLocalUndo } from "./autopilot-control.server";
import { generateExecutiveThreeSentencePulse } from "./meta-supervisor.server";
import { DEMO_INVENTORY, getAudits, getEvolution, getInventoryValue, getVaultCounts } from "./dashboard-data.server";
import { getMarketplaceFeedUrls, isGoogleSheetsConfigured } from "./platform-connectors.server";
import { getAgentPerformanceSnapshot } from "./agent-performance.server";
import { getJudicialLedgerSnapshot } from "./judicial-system.server";
import { getShopBrandSettings } from "./shop-settings.server";
import { getVaultDocumentSnapshot } from "./vault-downloads.server";
import { getRecentOwnerDirectives } from "./owner-directive.server";
import { getSubscriberWishSnapshot, getWorkspaceChannelConfigs } from "./marketplace-flywheel.server";
import { getAccessibleDepartmentIds, moduleIdsFromSubscription, OWNER_MODULE_IDS } from "./module-access";
import { getRecentLiveConnectionTraces } from "./live-connection.server";
import { isApprovalException } from "./approval-exceptions";
import { isConfiguredOwnerShop } from "./access-control-core";
import { canAccessOwnerVault } from "./owner-vault.server";

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
    rawRoster,
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
      db.companyRule.findMany({
        where: {
          shop,
          ...(owner ? {} : { key: { in: ["tax_mode", "oss_origin_country", "onboarding_complete"] } }),
        },
        take: owner ? 50 : 3,
      }).catch(() => []),
      owner
        ? db.autopilotLog.findMany({ where: { shop }, take: 20, orderBy: { createdAt: "desc" } }).catch(() => [])
        : Promise.resolve([]),
      owner ? db.vipCustomer.findMany({ where: { shop }, take: 5 }).catch(() => []) : Promise.resolve([]),
      getRoster(shop),
      isDryRun(shop),
      owner
        ? computeHarmony(shop)
        : Promise.resolve({ harmony: 100, speed: 100, pending: 0, conflicts: 0 }),
      getPreparationDeskSnapshot(shop),
      getAudits(shop),
      owner ? getEvolution(shop) : Promise.resolve([]),
      getVaultCounts(shop),
      isShopPaused(shop),
      owner ? generateExecutiveThreeSentencePulse(shop) : Promise.resolve([]),
      owner
        ? getCapturedRewardSnapshot(shop)
        : Promise.resolve({ items: [], summary: { readyEur: 0, requestedEur: 0, receivedEur: 0, receivedProducts: 0 } }),
    ]);

  const modules = owner
      ? [...OWNER_MODULE_IDS]
      : moduleIdsFromSubscription(subscription);
  const allowedDepartmentIds = new Set(getAccessibleDepartmentIds(modules, owner));
  const roster = owner
      ? rawRoster
      : rawRoster.filter((agent) => !agent.dynamic && allowedDepartmentIds.has(agent.departmentId));
  const visibleAgentKeys = new Set(roster.map((agent) => agent.key));

  const earnings = await getAgentEarningsSummary(shop, roster).catch((): EarningsSummary => ({
    perAgent: {},
    team: {},
    army: EMPTY_ROW,
  }));
  const [performance, judicialLedger, brandSettings, vaultDocuments, ownerDirectives, workspaceChannels, featureWishes, legalTaxRules, capabilities, interfaceBindings, liveTraces] = await Promise.all([
    getAgentPerformanceSnapshot(shop, roster),
    owner
      ? getJudicialLedgerSnapshot(shop)
      : Promise.resolve({ status: "unavailable" as const, verified: null, message: null, entries: [] }),
    getShopBrandSettings(shop),
    getVaultDocumentSnapshot(shop),
    owner ? getRecentOwnerDirectives(shop) : Promise.resolve([]),
    getWorkspaceChannelConfigs(shop),
    getSubscriberWishSnapshot(shop, owner),
    owner || modules.includes("m2")
      ? db.legalTaxRuleLedger.findMany({
        where: { shop },
        orderBy: { verifiedAt: "desc" },
        take: 200,
        select: {
          id: true,
          ruleKey: true,
          jurisdiction: true,
          sourceUrl: true,
          sourceTitle: true,
          sourceHash: true,
          verifiedAt: true,
          reviewStatus: true,
        },
      }).then((rows) => rows.map((row) => ({ ...row, verifiedAt: row.verifiedAt.toISOString() })))
      : Promise.resolve([]),
    owner || modules.includes("m4")
      ? db.domainCapability.findMany({
        where: { shop },
        orderBy: { updatedAt: "desc" },
        take: 200,
        select: {
          id: true,
          domainKey: true,
          displayName: true,
          feasibility: true,
          sourceUrl: true,
          sourceTitle: true,
          evidenceSummary: true,
          verifiedAt: true,
          expiresAt: true,
          estimatedCostEur: true,
          riskLevel: true,
          isVerified: true,
        },
      }).then((rows) => rows.map((row) => ({
        ...row,
        verifiedAt: row.verifiedAt?.toISOString() ?? null,
        expiresAt: row.expiresAt?.toISOString() ?? null,
      })))
      : Promise.resolve([]),
    (owner || modules.includes("m4")) && (owner || visibleAgentKeys.size > 0)
      ? db.agentInterfaceBinding.findMany({
        where: { shop, ...(owner ? {} : { agentKey: { in: [...visibleAgentKeys] } }) },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          agentKey: true,
          interfaceKey: true,
          status: true,
          lastVerifiedAt: true,
          createdAt: true,
        },
      }).then((rows) => rows.map((row) => ({
        ...row,
        lastVerifiedAt: row.lastVerifiedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        isNewlySpawnedInterface: row.createdAt.getTime() >= Date.now() - 48 * 60 * 60 * 1000,
      })))
      : Promise.resolve([]),
    getRecentLiveConnectionTraces(shop, owner ? undefined : [...visibleAgentKeys]),
  ]);
  const moduleApprovals = owner
    ? preparationDesk.items
    : preparationDesk.items.filter((item) => visibleAgentKeys.has(item.sourceAgentKey));
  const approvals = moduleApprovals.filter(isApprovalException);
  const visiblePreparationDesk = {
    ...preparationDesk,
    items: approvals,
    pendingCount: approvals.length,
    contributingAgents: new Set(approvals.map((item) => item.sourceAgentKey)).size,
  };
  const visibleAudits = owner
    ? audits
    : audits.filter((audit) => visibleAgentKeys.has(audit.sourceAgentKey));
  const visibleEvolution = owner
    ? evolution
    : evolution.filter((entry) => visibleAgentKeys.has(entry.agentKey));

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
  for (const a of [...visibleAudits].reverse()) auditByAgent[a.sourceAgentKey] = a.finalStatus;

  const taxRule = rules.find((r) => r.key === "tax_mode");
  const onboardingRule = rules.find((r) => r.key === "onboarding_complete");

  return {
    shop,
    owner,
    canRunModuleWorkflows: isConfiguredOwnerShop(shop, process.env.OWNER_SHOP_DOMAIN),
    canAccessSecretVault: canAccessOwnerVault(shop),
    paused,
    executivePulse: owner ? executivePulse : [],
    preparationDesk: visiblePreparationDesk,
    onboardingComplete: onboardingRule?.value === true || onboardingRule?.value === "true",
    monitorPath: createLoginPath(shop),
    dryRun,
    apiKeysMissing,
    demoInventory,
    snapshotAt,
    serverUptimeSeconds: owner ? Math.floor(process.uptime()) : null,
    databaseHealth,
    subscription,
    vipCount: owner ? vips.length : 0,
    rules: owner ? rules.map((r) => ({ key: r.key, value: r.value as unknown })) : [],
    taxMode: taxRule ? String(taxRule.value).replace(/"/g, "") : "mwst",
    recentLogs: owner ? recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      status: l.status,
      detail: l.detail,
      canUndo: l.undoable && !l.undoneAt && supportsLocalUndo(l.action),
    })) : [],
    roster,
    extraAgents: owner ? roster.filter((a) => a.dynamic).length : 0,
    allowedDepartmentIds: [...allowedDepartmentIds],
    earnings,
    performance,
    judicialLedger,
    harmony,
    approvals,
    audits: visibleAudits,
    auditByAgent,
    evolution: visibleEvolution,
    vault,
    brandSettings,
    vaultDocuments,
    rewardVault,
    ownerDirectives,
    legalTaxRules: owner || modules.includes("m2") ? legalTaxRules : [],
    capabilities,
    interfaceBindings,
    liveTraces,
    inventory,
    activeModules: modules,
    platformConnectors: {
      feedUrls: getMarketplaceFeedUrls(shop),
      channelConfigs: workspaceChannels,
      featureWishes,
      subscriberActive: owner || Boolean(subscription?.active),
      googleSheetsConfigured: isGoogleSheetsConfigured(),
      whatsAppConfigured: !!process.env.WHATSAPP_CLOUD_TOKEN && !!process.env.WHATSAPP_PHONE_ID,
      whatsAppOptIns,
      pendingWorkshopJobs,
      paymentLedgerEntries,
      ossOriginCountry: typeof ossOriginRule?.value === "string" ? ossOriginRule.value : "",
    },
  };
}
