import db from "../db.server";
import { activatePlan } from "./billing.server";
import { isOwnerShop, runAgent } from "./ai-agents.server";
import { resolveApproval } from "./triple-audit-gate.server";
import { setShopPaused, undoAutopilotAction } from "./autopilot-control.server";
import {
  createWorkshopJob,
  WorkshopJobInputError,
  PreparationPackageInputError,
  prepareKleinanzeigenRenewalPackage,
  recordWhatsAppOptIn,
  revokeWhatsAppOptIn,
  syncDailyGoogleSheets,
  isEuCountryCode,
} from "./platform-connectors.server";
import { createGiftMessage } from "./gift.server";
import { rollbackAgent, scanNichesAndSpawn, setDynamicAgentStatus, spawnAgent, weeklyEvolutionRun } from "./ai-evolution.server";
import {
  assimilateCustomOpportunity,
  RewardInputError,
  runSilentRevenueSweep,
  transitionCapturedReward,
} from "./silent-revenue.server";
import { JudicialLedgerInputError, appendJudicialDecision } from "./judicial-system.server";
import { saveShopBrandSettings, ShopSettingsInputError } from "./shop-settings.server";
import { ShopAccessDeniedError } from "./access-control.server";
import { submitOwnerDirective } from "./owner-directive.server";
import { runModuleWorkflow } from "./module-workflows.server";
import {
  MarketplaceWishInputError,
  setWorkspaceChannelVisibility,
  submitSubscriberFeatureWish,
} from "./marketplace-flywheel.server";

import type { ShopifyAdmin } from "./admin-types";

type Admin = ShopifyAdmin;

const str = (f: FormData, k: string): string => String(f.get(k) ?? "");
const errorMessage = (value: unknown): string => {
  if (typeof value === "object" && value !== null && "message" in value && typeof value.message === "string") {
    return value.message;
  }
  return String(value);
};

async function upsertRule(shop: string, key: string, value: string) {
  await db.companyRule.upsert({
    where: { shop_key: { shop, key } },
    update: { value, priority: 100, active: true },
    create: { shop, key, value, priority: 100 },
  });
}

/** Alle Formular-Aktionen der Kommandozentrale (bestehende Aktionen bleiben unverändert erhalten). */
export async function handleDashboardAction(opts: { shop: string; admin: Admin; form: FormData }) {
  const { shop, admin, form } = opts;
  const type = str(form, "type");
  const ownerOnlyActions = new Set([
    "judicial_record",
    "add_rule",
    "set_dry_run",
    "set_global_pause",
    "evolve_week",
    "scan_niches",
    "spawn_custom_agent",
    "rollback_agent",
    "activate_agent",
  ]);
  if (!isOwnerShop(shop) && ownerOnlyActions.has(type)) {
    return { ok: false, message: "Diese interne Steuerungsaktion ist dem Inhaber-Shop vorbehalten." };
  }

  if (type === "owner_directive") {
    try {
      return await submitOwnerDirective(shop, str(form, "directive"));
    } catch (error) {
      if (error instanceof ShopAccessDeniedError) return { ok: false, message: error.message };
      throw error;
    }
  }
  if (type === "suggest_marketplace") {
    try {
      return await submitSubscriberFeatureWish(shop, {
        title: str(form, "title"),
        description: str(form, "description"),
      });
    } catch (error) {
      if (error instanceof MarketplaceWishInputError || error instanceof ShopAccessDeniedError) {
        return { ok: false, message: error.message };
      }
      throw error;
    }
  }
  if (type === "set_workspace_channel_visibility") {
    try {
      const visible = str(form, "isVisible");
      if (visible !== "true" && visible !== "false") {
        return { ok: false, message: "Ungültiger Sichtbarkeitswert." };
      }
      await setWorkspaceChannelVisibility(shop, {
        channelKey: str(form, "channelKey"),
        displayName: str(form, "displayName"),
        isVisible: visible === "true",
      });
      return { ok: true, message: "Cockpit-Sichtbarkeit gespeichert. Der Kanal wurde dadurch nicht verbunden." };
    } catch (error) {
      if (error instanceof MarketplaceWishInputError || error instanceof ShopAccessDeniedError) {
        return { ok: false, message: error.message };
      }
      throw error;
    }
  }

  if (type === "reward_scan") {
    const result = await runSilentRevenueSweep(shop);
    return result;
  }
  if (type === "reward_create") {
    try {
      return await assimilateCustomOpportunity(shop, {
        description: str(form, "description"),
        sourceUrl: str(form, "sourceUrl"),
        sourceLabel: str(form, "sourceLabel"),
        amountEur: str(form, "amountEur"),
        productCount: str(form, "productCount"),
        code: str(form, "code"),
      });
    } catch (error) {
      if (error instanceof RewardInputError) return { ok: false, message: error.message };
      throw error;
    }
  }
  if (type === "save_shop_settings") {
    try {
      const upload = form.get("logoFile");
      let logoDataUrl: string | undefined;
      if (upload instanceof File && upload.size > 0) {
        if (upload.size > 350_000 || !["image/png", "image/jpeg"].includes(upload.type)) {
          return { ok: false, message: "Bitte ein PNG/JPEG-Logo mit höchstens 350 KB hochladen." };
        }
        const bytes = Buffer.from(await upload.arrayBuffer());
        const validPng = upload.type === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const validJpeg = upload.type === "image/jpeg" && bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
        if (!validPng && !validJpeg) return { ok: false, message: "Die Dateiinhalte passen nicht zu PNG oder JPEG." };
        logoDataUrl = `data:${upload.type};base64,${bytes.toString("base64")}`;
      }
      return await saveShopBrandSettings(shop, {
        businessName: str(form, "businessName"),
        primaryColor: str(form, "primaryColor"),
        accentColor: str(form, "accentColor"),
        fontStyle: str(form, "fontStyle"),
        tone: str(form, "tone"),
        greeting: str(form, "greeting"),
        logoDataUrl,
        clearLogo: str(form, "clearLogo") === "1",
        bankName: str(form, "bankName"),
        iban: str(form, "iban"),
        bic: str(form, "bic"),
        clearBankDetails: str(form, "clearBankDetails") === "1",
      });
    } catch (error) {
      if (error instanceof ShopSettingsInputError) return { ok: false, message: error.message };
      throw error;
    }
  }
  if (type === "judicial_record") {
    try {
      const stage = Number(str(form, "stage"));
      const result = await appendJudicialDecision({
        shop,
        caseId: str(form, "caseId"),
        stage,
        caseTitle: str(form, "caseTitle"),
        decision: str(form, "decision"),
        rationale: str(form, "rationale"),
        evidenceReference: str(form, "evidenceReference"),
      });
      return {
        ok: true,
        message: `Interner Ledger-Eintrag #${result.sequence} gespeichert. Fall-ID: ${result.caseId}`,
        caseId: result.caseId,
        stage: result.stage,
        decision: result.decision,
      };
    } catch (error) {
      if (error instanceof JudicialLedgerInputError) return { ok: false, message: error.message };
      throw error;
    }
  }
  if (type === "reward_status") {
    const rawStatus = str(form, "status");
    const nextStatus = rawStatus === "READY" || rawStatus === "REQUESTED" || rawStatus === "RECEIVED"
      ? rawStatus
      : null;
    if (!nextStatus) {
      return { ok: false, message: "Ungültiger Vorteils-Status." };
    }
    try {
      return await transitionCapturedReward(shop, str(form, "rewardId"), nextStatus, {
        actualValueEur: str(form, "actualValueEur"),
        receivedQuantity: str(form, "receivedQuantity"),
      });
    } catch (error) {
      if (error instanceof RewardInputError) return { ok: false, message: error.message };
      throw error;
    }
  }

  // --- Bestehende Aktionen (unverändert) ---
  if (type === "add_rule") {
    const key = form.get("key");
    const value = form.get("value");
    if (typeof key === "string" && typeof value === "string") await upsertRule(shop, key, value);
    return { ok: true, message: "OwnerRule gespeichert." };
  }
  if (type === "toggle_tax") {
    await upsertRule(shop, "tax_mode", str(form, "taxMode"));
    return { ok: true, message: "Steuer-Modus gespeichert." };
  }
  if (type === "set_oss_origin_country") {
    const country = str(form, "country").trim().toUpperCase();
    if (!isEuCountryCode(country)) {
      return { ok: false, message: "Bitte einen gültigen EU-Ländercode (ISO-3166-1-Alpha-2) angeben." };
    }
    await upsertRule(shop, "oss_origin_country", country);
    return { ok: true, message: `OSS-Ursprungsland ${country} gespeichert.` };
  }
  if (type === "sync_google_sheets") {
    const date = new Date().toISOString().slice(0, 10);
    const completed = await db.autopilotLog.findFirst({
      where: { shop, action: "google_sheets_daily", status: "success", detail: date },
      select: { id: true },
    });
    if (completed) return { ok: false, message: `Google Sheets wurde für ${date} bereits synchronisiert.` };
    const result = await syncDailyGoogleSheets(admin, shop, date);
    if (result.ok) {
      await db.autopilotLog.create({
        data: { shop, action: "google_sheets_daily", status: "success", detail: date, undoable: false },
      });
    }
    return {
      ok: result.ok,
      message: result.ok
        ? `${result.rowCount} Finanzzeile(n) für ${date} synchronisiert.`
        : `Nicht synchronisiert: ${result.status}.`,
    };
  }
  if (type === "record_whatsapp_optin") {
    await recordWhatsAppOptIn({
      shop,
      phone: str(form, "phone"),
      source: str(form, "source"),
      verified: str(form, "verified") === "1",
    });
    return { ok: true, message: "Verifiziertes WhatsApp-Opt-in gespeichert; die Telefonnummer wurde nicht im Klartext abgelegt." };
  }
  if (type === "revoke_whatsapp_optin") {
    await revokeWhatsAppOptIn(shop, str(form, "phone"));
    return { ok: true, message: "WhatsApp-Opt-in widerrufen." };
  }
  if (type === "create_workshop_job") {
    try {
      const widthMm = Number(str(form, "widthMm"));
      const heightMm = Number(str(form, "heightMm"));
      const job = await createWorkshopJob({
        shop,
        orderNumber: str(form, "orderNumber"),
        sku: str(form, "sku"),
        material: str(form, "material"),
        widthMm,
        heightMm,
        fontFamily: str(form, "fontFamily"),
        engravingText: str(form, "engravingText"),
        ringSize: str(form, "ringSize"),
        svgContent: str(form, "svgContent"),
      });
      return { ok: true, message: `Werkstattjob ${job.id.slice(0, 8)} angelegt.` };
    } catch (error) {
      if (error instanceof WorkshopJobInputError) return { ok: false, message: error.message };
      throw error;
    }
  }
  if (type === "prepare_kleinanzeigen_refresh") {
    try {
      const prepared = await prepareKleinanzeigenRenewalPackage(admin, shop, str(form, "productId").trim());
      return { ok: true, message: `${prepared.title} wurde auf dem Fertig-Tisch abgelegt.` };
    } catch (error) {
      if (error instanceof PreparationPackageInputError) {
        return { ok: false, message: errorMessage(error) };
      }
      throw error;
    }
  }

  // --- DRY_RUN_MODE (nur der Inhaber-Shop darf selbst live schalten; jeder Shop für sich) ---
  if (type === "set_dry_run") {
    await upsertRule(shop, "DRY_RUN_MODE", str(form, "value") === "false" ? "false" : "true");
    return { ok: true, message: str(form, "value") === "false" ? "LIVE-Modus aktiv." : "DRY_RUN_MODE aktiv (geschützt)." };
  }

  if (type === "set_global_pause") {
    const paused = str(form, "value") === "true";
    await setShopPaused(shop, paused);
    return {
      ok: true,
      paused,
      message: paused ? "Alle KI-Aktionen dieses Shops pausiert." : "KI-Aktionen dieses Shops fortgesetzt.",
    };
  }

  if (type === "undo_action") {
    return undoAutopilotAction(shop, str(form, "id"));
  }

  if (type === "complete_onboarding") {
    const industry = str(form, "industry");
    const tone = str(form, "tone");
    const plan = str(form, "plan");
    const starterTeam = str(form, "starterTeam");
    if (!["jewelry", "craft", "other"].includes(industry)) {
      return { ok: false, message: "Bitte eine gültige Branche auswählen." };
    }
    if (!["warm", "minimal", "professional"].includes(tone)) {
      return { ok: false, message: "Bitte einen gültigen Marken-Ton auswählen." };
    }
    if (!["free_audit", "m1", "m2", "all_in_one"].includes(plan)) {
      return { ok: false, message: "Bitte ein gültiges Preismodell auswählen." };
    }
    if (!["catalog_finance_ops", "catalog_growth_support"].includes(starterTeam)) {
      return { ok: false, message: "Bitte ein gültiges Starter-Team auswählen." };
    }

    await upsertRule(
      shop,
      "onboarding_preferences",
      JSON.stringify({ industry, tone, plan, starterTeam, savedAt: new Date().toISOString() })
    );
    await upsertRule(shop, "onboarding_complete", "true");
    if (!isOwnerShop(shop)) await upsertRule(shop, "DRY_RUN_MODE", "true");
    await db.autopilotLog.create({
      data: {
        shop,
        action: "onboarding_safe_test",
        status: "success",
        detail: "Read-only Schnellstart abgeschlossen; keine Shopify-Änderung und keine Buchung ausgelöst.",
        undoable: false,
      },
    });
    return { ok: true, message: "Sicherer Schnellstart abgeschlossen. Es wurde nichts live geändert oder gebucht." };
  }

  // --- Mitarbeiter ausführen ---
  if (type === "run_module_workflow") {
    try {
      const result = await runModuleWorkflow(shop, str(form, "moduleId"));
      return {
        ok: result.ok,
        message: result.text
          ? `Ungeprüfter Entwurf; keine externe Aktion ausgeführt: ${result.text}`
          : "Modul-Entwurf nicht verfügbar.",
        moduleId: result.moduleId,
        provider: result.provider,
        failures: result.failures,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "AI_MODULE_INVALID") {
        return { ok: false, message: "Ungültiges Modul." };
      }
      if (error instanceof Error && error.message === "AI_MODULE_SUBSCRIPTION_UNVERIFIED") {
        return { ok: false, message: "Modul-Workflows sind nur für explizit konfigurierte Inhaber-Shops verfügbar; Subscriber-Abos sind noch nicht verifizierbar." };
      }
      if (error instanceof Error && error.message === "GLOBAL_AI_PAUSE") {
        return { ok: false, message: "Die KI-Notfallpause ist aktiv; der Modul-Workflow wurde nicht ausgeführt." };
      }
      throw error;
    }
  }

  if (type === "run_agent") {
    const n = Number(str(form, "agent"));
    if (!Number.isInteger(n) || n < 1) return { ok: false, message: "Ungültige Mitarbeiter-Nummer." };
    const r = await runAgent(shop, n, { origin: "manual" });
    return { ok: r.ok, mode: r.mode, message: `${r.agent}: ${r.message} (${r.durationMs} ms)` };
  }

  // --- 1-Klick-Freigabe ---
  if (type === "approve" || type === "reject") {
    const r = await resolveApproval(shop, str(form, "id"), type === "approve" ? "APPROVED" : "REJECTED");
    return { ok: r.ok, message: r.message };
  }

  // --- Evolution & Agenten-Fabrik ---
  if (type === "evolve_week") {
    const r = await weeklyEvolutionRun(shop);
    return {
      ok: true,
      message: `${r.evolved} Skills geprüft/weiterentwickelt, ${r.spawned} Agenten angelegt, ${r.paused} unproduktive dynamische Agenten pausiert.`,
    };
  }
  if (type === "scan_niches") {
    const n = await scanNichesAndSpawn(shop);
    return { ok: true, message: n ? `${n} neue Nischen-Mitarbeiter erschaffen.` : "Keine neuen Nischen gefunden." };
  }
  if (type === "spawn_custom_agent") {
    const name = str(form, "name").trim();
    const mission = str(form, "mission").trim();
    const departmentId = Number(str(form, "departmentId"));
    if (name.length < 3 || name.length > 80) {
      return { ok: false, message: "Der Name muss zwischen 3 und 80 Zeichen lang sein." };
    }
    if (mission.length < 10 || mission.length > 500) {
      return { ok: false, message: "Der Auftrag muss zwischen 10 und 500 Zeichen lang sein." };
    }
    if (!Number.isInteger(departmentId) || departmentId < 1 || departmentId > 26) {
      return { ok: false, message: "Bitte eine gültige Abteilung auswählen." };
    }
    const agent = await spawnAgent({
      shop,
      name,
      departmentId,
      mission,
      revenueMechanism: "Manuell spezifiziert; keine Einnahmen garantiert.",
      expectedMonthlyValueEur: 0,
      suggestedAddonPriceEur: 0,
      reason: "Inhaber-initiierter Fachgebiets-Entwurf",
      forceCandidate: true,
    });
    return agent
      ? { ok: true, message: `Kandidat #${agent.agentNumber} angelegt; vor Aktivierung prüfen und freigeben.` }
      : { ok: false, message: "Kein Kandidat angelegt: pausiert, bereits vorhanden oder durch die Governance-Prüfung zurückgestellt." };
  }
  if (type === "rollback_agent") {
    const ok = await rollbackAgent(shop, str(form, "agentKey"));
    return { ok, message: ok ? "Auf vorherige Version zurückgesetzt." : "Kein Rollback möglich (v1)." };
  }
  if (type === "activate_agent") {
    const num = Number(str(form, "agentNumber"));
    const row = await db.dynamicAiAgent.findFirst({ where: { shop, agentNumber: num } });
    if (!row) return { ok: false, message: "Nicht gefunden." };
    if (!isOwnerShop(shop) && row.suggestedAddonPriceEur > 0) {
      return { ok: true, message: `Add-on ${row.suggestedAddonPriceEur.toFixed(2).replace(".", ",")} € / Monat – bitte im Baukasten buchen.` };
    }
    await setDynamicAgentStatus(shop, row.id, "ACTIVE");
    return { ok: true, message: "Mitarbeiter aktiviert." };
  }

  // --- Digitale Geschenk-Botschaft (/gift/<token>) ---
  if (type === "create_gift") {
    const recipient = str(form, "recipientName").trim();
    const message = str(form, "message").trim();
    if (!recipient || message.length < 3) {
      return { ok: false, message: "Bitte Empfängername und eine Grußbotschaft eintragen." };
    }
    const gift = await createGiftMessage({
      shop,
      senderName: str(form, "senderName").trim() || "Wertarbeit Manufaktur",
      recipientName: recipient,
      message,
      productTitle: str(form, "productTitle").trim() || "Ihr Schmuckstück",
      certificateNo: str(form, "certificateNo").trim() || undefined,
      isUnique: str(form, "isUnique") === "1",
      locale: str(form, "locale") === "en" ? "en" : "de",
    });
    const base = (process.env.SHOPIFY_APP_URL || "").replace(/\/$/, "");
    return { ok: true, message: "Geschenk-Botschaft erstellt.", giftPath: gift.path, giftUrl: `${base}${gift.path}` };
  }

  // --- Billing (appSubscriptionCreate) ---
  if (type === "activate_plan") {
    const modules = str(form, "modules").split(",").filter(Boolean);
    const r = await activatePlan({
      admin,
      shop,
      appUrl: process.env.SHOPIFY_APP_URL || "",
      moduleIds: modules,
      yearly: str(form, "yearly") === "1",
    });
    return r;
  }

  return { ok: false, message: "Unbekannte Aktion." };
}
