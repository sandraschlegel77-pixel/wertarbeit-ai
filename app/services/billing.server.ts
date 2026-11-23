import db from "../db.server";
import { BUILDING_MODULES, TRIAL_DAYS, calcQuote } from "./pricing";
import { isOwnerShop } from "./ai-agents.server";

import type { ShopifyAdmin } from "./admin-types";

type Admin = ShopifyAdmin;

const MODULE_FIELDS: Record<string, "moduleInvoices" | "moduleCertificates" | "moduleMultichannel" | "moduleGrowth"> = {
  m2: "moduleInvoices",
  m5: "moduleCertificates",
  m4: "moduleMultichannel",
  m3: "moduleGrowth",
};

/**
 * 1-Klick-Aktivierung über die echte Shopify GraphQL Billing API (appSubscriptionCreate).
 * Inhaber-Shop: dauerhaft OWNER UNLIMITED (0,00 €) ohne Abo.
 * `test: true` solange nicht NODE_ENV=production und BILLING_LIVE=true (Reviewer-/Test-Abos).
 */
export async function activatePlan(opts: {
  admin: Admin;
  shop: string;
  appUrl: string;
  moduleIds: string[];
  yearly: boolean;
}): Promise<{ ok: boolean; confirmationUrl?: string; message: string }> {
  const { admin, shop, appUrl, moduleIds, yearly } = opts;
  const valid = moduleIds.filter((id) => BUILDING_MODULES.some((m) => m.id === id));

  const flags: Record<string, boolean> = {};
  for (const id of valid) if (MODULE_FIELDS[id]) flags[MODULE_FIELDS[id]] = true;

  if (isOwnerShop(shop)) {
    await db.shopSubscription.upsert({
      where: { shop },
      update: { ownerUnlimited: true, active: true, plan: "owner_unlimited", moduleInvoices: true, moduleCertificates: true, moduleMultichannel: true, moduleGrowth: true },
      create: { shop, ownerUnlimited: true, active: true, plan: "owner_unlimited", moduleInvoices: true, moduleCertificates: true, moduleMultichannel: true, moduleGrowth: true },
    });
    return { ok: true, message: "OWNER UNLIMITED (0,00 €) – alle Module dauerhaft aktiv." };
  }

  const quote = calcQuote(valid, yearly, false);
  if (quote.count === 0) return { ok: false, message: "Bitte mindestens ein Modul wählen." };

  const test = !(process.env.NODE_ENV === "production" && process.env.BILLING_LIVE === "true");
  const name = quote.allInOne ? "AtelierPilot AI All-in-One" : `AtelierPilot AI (${quote.count} Module)`;
  const res = await admin.graphql(
    `#graphql
    mutation CreateSub($name: String!, $returnUrl: URL!, $test: Boolean, $trialDays: Int, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, test: $test, trialDays: $trialDays, lineItems: $lineItems) {
        confirmationUrl
        userErrors { field message }
      }
    }`,
    {
      variables: {
        name,
        returnUrl: `${appUrl}/app`,
        test,
        trialDays: TRIAL_DAYS,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: yearly ? quote.yearlyTotal : quote.monthly, currencyCode: "EUR" },
                interval: yearly ? "ANNUAL" : "EVERY_30_DAYS",
              },
            },
          },
        ],
      },
    }
  );
  const json = (await res.json()) as any;
  const out = json?.data?.appSubscriptionCreate;
  const err = out?.userErrors?.[0]?.message ?? json?.errors?.[0]?.message;
  if (err || !out?.confirmationUrl) return { ok: false, message: err ?? "Abo konnte nicht erstellt werden." };

  await db.shopSubscription.upsert({
    where: { shop },
    update: { plan: quote.allInOne ? "all_in_one" : "custom", trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 86400000), ...flags },
    create: { shop, plan: quote.allInOne ? "all_in_one" : "custom", trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 86400000), ...flags },
  });
  return { ok: true, confirmationUrl: out.confirmationUrl, message: "Weiter zur Shopify-Bestätigung (14 Tage gratis)." };
}
