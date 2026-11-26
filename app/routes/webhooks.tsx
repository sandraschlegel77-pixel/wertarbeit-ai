import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { bookOrderRevenue, noteCheckoutUpdate } from "../services/revenue-booking.server";
import { hashWhatsAppPhone } from "../services/platform-connectors.server";

/**
 * Zentraler Webhook-Endpunkt (uri = "/webhooks" in shopify.app.toml).
 * `authenticate.webhook` prüft die HMAC-SHA256-Signatur (X-Shopify-Hmac-Sha256);
 * bei ungültiger Signatur antwortet das SDK automatisch mit 401.
 *
 * DSGVO-Pflicht-Webhooks: customers/data_request, customers/redact, shop/redact.
 * shop/redact sendet Shopify 48 Stunden nach der Deinstallation -> dann Löschung aller Shop-Daten.
 */

async function deleteAllShopData(shop: string) {
  await db.$transaction([
    db.agentRevenueEntry.deleteMany({ where: { shop } }),
    db.tripleAuditLog.deleteMany({ where: { shop } }),
    db.dynamicAiAgent.deleteMany({ where: { shop } }),
    db.agentSkillEvolution.deleteMany({ where: { shop } }),
    db.approvalQueueItem.deleteMany({ where: { shop } }),
    db.capturedReward.deleteMany({ where: { shop } }),
    db.judicialDecisionLedger.deleteMany({ where: { shop } }),
    db.shopSettings.deleteMany({ where: { shop } }),
    db.ownerVaultSecret.deleteMany({ where: { shop } }),
    db.aiKnowledgeMemory.deleteMany({ where: { shop } }),
    db.precomputedCache.deleteMany({ where: { shop } }),
    db.shopSubscription.deleteMany({ where: { shop } }),
    db.companyRule.deleteMany({ where: { shop } }),
    db.graCertificate.deleteMany({ where: { shop } }),
    db.invoice.deleteMany({ where: { shop } }),
    db.xtoolSvg.deleteMany({ where: { shop } }),
    db.whatsAppConsent.deleteMany({ where: { shop } }),
    db.whatsAppMessageLog.deleteMany({ where: { shop } }),
    db.paymentLedgerEntry.deleteMany({ where: { shop } }),
    db.backupLog.deleteMany({ where: { shop } }),
    db.autopilotLog.deleteMany({ where: { shop } }),
    db.shopContent.deleteMany({ where: { shop } }),
    db.vipCustomer.deleteMany({ where: { shop } }),
    db.supportCase.deleteMany({ where: { shop } }),
    db.session.deleteMany({ where: { shop } }),
  ]);
}

async function deleteCustomerData(shop: string, email: string | undefined, phone: string | undefined) {
  const operations = [];
  if (email) {
    operations.push(
      db.vipCustomer.deleteMany({ where: { shop, email } }),
      db.supportCase.deleteMany({ where: { shop, customerEmail: email } })
    );
  }
  if (phone) {
    const phoneHash = hashWhatsAppPhone(shop, phone);
    operations.push(
      db.whatsAppConsent.deleteMany({ where: { shop, phoneHash } }),
      db.whatsAppMessageLog.deleteMany({ where: { shop, phoneHash } })
    );
  }
  if (operations.length) await db.$transaction(operations);
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, session } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      // Sessions sofort entfernen; Shop-Daten folgen 48 h später per SHOP_REDACT.
      if (session) await db.session.deleteMany({ where: { shop } });
      break;

    case "CUSTOMERS_DATA_REQUEST":
      // Wir speichern nur E-Mail/Support-Entwürfe/VIP-Stufe; Export erfolgt durch den Inhaber auf Anfrage.
      console.log(`[gdpr] customers/data_request für ${shop}`);
      break;

    case "CUSTOMERS_REDACT":
      await deleteCustomerData(
        shop,
        (payload as { customer?: { email?: string } })?.customer?.email,
        (payload as { customer?: { phone?: string } })?.customer?.phone
      );
      break;

    case "SHOP_REDACT":
      await deleteAllShopData(shop);
      break;

    case "ORDERS_PAID":
      // Speist die „Passt alles?“-Prüfmail-Queue (15 Min. nach Bestellung, siehe /api/cron). Keine Kundendaten im Log.
      await db.autopilotLog.create({
        data: {
          shop,
          action: "order_paid",
          status: "success",
          detail: String((payload as { name?: string })?.name ?? ""),
          undoable: false,
        },
      });
      // Echte Verdienst-Buchung (isSimulated: false), doppelt-sicher über referenceId.
      try {
        await bookOrderRevenue(shop, payload as Parameters<typeof bookOrderRevenue>[1]);
      } catch (err) {
        console.error("[revenue] Buchung fehlgeschlagen:", err instanceof Error ? err.message : err);
      }
      break;

    case "CHECKOUTS_UPDATE":
      await noteCheckoutUpdate(shop, payload as Parameters<typeof noteCheckoutUpdate>[1]).catch(() => undefined);
      break;

    default:
      // products/*, orders/*, refunds/*, inventory_levels/* – bestätigt, keine Aktion nötig.
      break;
  }

  return new Response(null, { status: 200 });
};
