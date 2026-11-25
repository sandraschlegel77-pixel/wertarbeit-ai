import { ZipArchive } from "archiver";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { isDryRun } from "./ai-agents.server";
import { isShopPaused } from "./autopilot-control.server";
import { buildXtoolLayeredSvg, ManufakturInputError } from "./manufaktur-apex-core";
import type { ShopifyAdmin } from "./admin-types";
import {
  escapeXml,
  parseGermanBankCsv,
  validateWorkshopSvg,
  WorkshopSvgInputError,
} from "./platform-connectors-core";

type Admin = ShopifyAdmin;

const FEED_CHANNELS = ["otto", "hood", "avocadostore"] as const;
type FeedChannel = (typeof FEED_CHANNELS)[number];

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO",
  "SE", "SI", "SK",
]);

export function isEuCountryCode(country: string): boolean {
  return EU_COUNTRIES.has(country.toUpperCase());
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message?: string }[];
}

async function graphql<T>(admin: Admin, query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await admin.graphql(query, variables ? { variables } : undefined);
  const body = (await response.json()) as GraphqlResponse<T>;
  if (!response.ok || body.errors?.length || !body.data) {
    throw new Error("Shopify Admin API query failed.");
  }
  return body.data;
}

export class PreparationPackageInputError extends Error {}

export async function prepareKleinanzeigenRenewalPackage(
  admin: Admin,
  shop: string,
  productId: string
): Promise<{ id: string; title: string }> {
  if (!/^gid:\/\/shopify\/Product\/\d+$/.test(productId)) {
    throw new PreparationPackageInputError("Bitte eine gültige Shopify-Produkt-ID (GID) angeben.");
  }
  type ProductData = {
    shop: { currencyCode: string };
    product: {
      id: string;
      title: string;
      descriptionHtml: string;
      status: string;
      featuredImage: { url: string; width: number; height: number } | null;
      variants: {
        pageInfo: { hasNextPage: boolean };
        nodes: { inventoryQuantity: number; price: string }[];
      };
    } | null;
  };
  const { product, shop: shopInfo } = await graphql<ProductData>(
    admin,
    `#graphql
    query KleinanzeigenPreparation($id: ID!) {
      shop { currencyCode }
      product(id: $id) {
        id title descriptionHtml status
        featuredImage { url width height }
        variants(first: 100) {
          pageInfo { hasNextPage }
          nodes { inventoryQuantity price }
        }
      }
    }`,
    { id: productId }
  );
  if (!product) throw new PreparationPackageInputError("Shopify-Produkt wurde nicht gefunden.");
  if (product.status !== "ACTIVE") throw new PreparationPackageInputError("Nur aktive Shopify-Produkte können für ein Erneuerungspaket vorbereitet werden.");
  if (shopInfo.currencyCode !== "EUR") {
    throw new PreparationPackageInputError("Das Produktpaket erfordert Shopwährung EUR; der aktuelle Preis wurde nicht exportiert.");
  }
  if (product.variants.pageInfo.hasNextPage) {
    throw new PreparationPackageInputError("Produkt hat mehr als 100 Varianten; eine vollständige Bestandsprüfung ist nicht möglich.");
  }
  const inventory = product.variants.nodes.reduce(
    (sum, variant) => sum + Math.max(0, Number(variant.inventoryQuantity) || 0),
    0
  );
  if (inventory <= 0) {
    throw new PreparationPackageInputError("Kein Paket erstellt: Shopify-Bestand ist 0. Ausverkaufte Unikate werden nicht erneuert.");
  }
  const prices = [...new Set(product.variants.nodes.map((variant) => variant.price))];
  if (prices.length !== 1 || !Number.isFinite(Number(prices[0]))) {
    throw new PreparationPackageInputError("Varianten haben unterschiedliche Preise; bitte die konkrete Anzeigevariante zuerst festlegen.");
  }
  const image = product.featuredImage;
  if (!image || image.width !== 2048 || image.height !== 2048) {
    throw new PreparationPackageInputError("Kein verifiziertes 2048×2048-Produktfoto vorhanden; es wurde kein fertiges Paket angelegt.");
  }

  const cleanDescription = product.descriptionHtml
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|li|div|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 5000);
  const title = `Wertarbeit Manufaktur | ${product.title}`.slice(0, 100);
  const inventoryCheckedAt = new Date().toISOString();
  const packageData = {
    schemaVersion: "1.0",
    productId: product.id,
    inventory,
    title,
    description: cleanDescription,
    priceEur: Number(prices[0]),
    priceRuleCheck: "NOT_VERIFIED",
    priceRuleNote: "§ 11 PAngV nicht verifiziert: ein vollständiger 30-Tage-Preishistorienverlauf liegt hier nicht vor.",
    imageUrl: image.url,
    imageWidth: image.width,
    imageHeight: image.height,
    inventoryCheckedAt,
    publishMode: "MANUAL_COPY_ONLY",
  };
  const existing = await db.approvalQueueItem.findFirst({
    where: { shop, sourceAgentKey: "A206", title: `Kleinanzeigen-Paket: ${product.title}`, status: "PENDING" },
    select: { id: true, title: true },
  });
  if (existing) return existing;

  const summary = [
    `Anzeigentitel (Vorschlag): ${title}`,
    `Preis: ${Number(prices[0]).toFixed(2)} EUR`,
    `Bestand aus Shopify geprüft am ${inventoryCheckedAt}: ${inventory}`,
    "Vor einer tatsächlichen Verlängerung den aktuellen Bestand erneut prüfen.",
    `§ 11 PAngV: NICHT VERIFIZIERT – ${packageData.priceRuleNote}`,
    `2048×2048-Foto-URL (Maße per Shopify geprüft): ${image.url}`,
    "",
    "Anzeigentext:",
    cleanDescription || "Kein Beschreibungstext im Shopify-Produkt hinterlegt.",
  ].join("\n");
  const row = await db.approvalQueueItem.create({
    data: {
      shop,
      sourceAgentKey: "A206",
      category: "preparation",
      title: `Kleinanzeigen-Paket: ${product.title}`,
      summary,
      riskLevel: "LOW",
      payloadJson: JSON.stringify(packageData),
    },
    select: { id: true, title: true },
  });
  return row;
}

function hmacHex(key: string, value: string): string {
  return createHmac("sha256", key).update(value).digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getMarketplaceFeedUrls(shop: string): Record<FeedChannel, string | null> {
  const base = process.env.SHOPIFY_APP_URL;
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!base || !secret) return { otto: null, hood: null, avocadostore: null };
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return { otto: null, hood: null, avocadostore: null };
  }
  if (url.protocol !== "https:" || url.hostname === "example.com") {
    return { otto: null, hood: null, avocadostore: null };
  }

  return Object.fromEntries(
    FEED_CHANNELS.map((channel) => {
      const signature = hmacHex(secret, `marketplace-feed|${shop}|${channel}`);
      const feed = new URL(`/feeds/${channel}.xml`, url);
      feed.searchParams.set("shop", shop);
      feed.searchParams.set("signature", signature);
      return [channel, feed.toString()];
    })
  ) as Record<FeedChannel, string>;
}

export function isGoogleSheetsConfigured(): boolean {
  const rawUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!rawUrl || !secret || secret.length < 16) return false;
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && url.hostname === "script.google.com";
  } catch {
    return false;
  }
}

function isFeedChannel(value: string): value is FeedChannel {
  return FEED_CHANNELS.some((channel) => channel === value);
}

export async function buildMarketplaceFeed(
  channel: string,
  shop: string,
  signature: string
): Promise<string> {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) throw new Error("Feed signing is not configured.");
  if (!isFeedChannel(channel)) throw new Error("Feed channel is unavailable.");
  const expected = hmacHex(secret, `marketplace-feed|${shop}|${channel}`);
  if (!constantTimeEqual(signature, expected)) throw new Error("Invalid feed signature.");
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) throw new Error("Invalid shop domain.");

  const storefrontBase = process.env.STOREFRONT_URL || `https://${shop}`;
  const storefrontUrl = new URL(storefrontBase);
  if (storefrontUrl.protocol !== "https:") throw new Error("Storefront URL must use HTTPS.");

  const { admin } = await unauthenticated.admin(shop);
  type Variant = {
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    price: string;
    inventoryQuantity: number;
  };
  type Product = {
    id: string;
    title: string;
    descriptionHtml: string;
    handle: string;
    tags: string[];
    status: string;
    featuredImage: { url: string } | null;
    material: { value: string } | null;
    variants: { pageInfo: { hasNextPage: boolean }; nodes: Variant[] };
  };
  let after: string | null = null;
  const products: Product[] = [];
  let currencyCode = "";

  for (let page = 0; page < 200; page++) {
    type MarketplaceFeedData = {
      shop: { currencyCode: string };
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: Product[];
      };
    };
    const data: MarketplaceFeedData = await graphql<MarketplaceFeedData>(
      admin,
      `#graphql
      query MarketplaceFeed($after: String) {
        shop { currencyCode }
        products(first: 10, after: $after, query: "published_status:online_store_channel") {
          pageInfo { hasNextPage endCursor }
          nodes {
            id title descriptionHtml handle tags status
            featuredImage { url }
            material: metafield(key: "material") { value }
            variants(first: 100) {
              pageInfo { hasNextPage }
              nodes { id title sku barcode price inventoryQuantity }
            }
          }
        }
      }`,
      { after }
    );
    currencyCode = data.shop.currencyCode;
    products.push(...data.products.nodes);
    if (data.products.nodes.some((product) => product.variants.pageInfo.hasNextPage)) {
      throw new Error("A product has more than 100 variants; feed generation stopped rather than exporting partial stock.");
    }
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
    if (!after) throw new Error("Shopify returned an invalid product cursor.");
    if (page === 199) throw new Error("Feed exceeds the supported product page limit.");
  }

  if (currencyCode !== "EUR") {
    throw new Error(`Marketplace priceEur requires a EUR shop currency; current currency is ${currencyCode || "unknown"}.`);
  }

  const entries = products
    .filter((product) => product.status === "ACTIVE")
    .flatMap((product) =>
      product.variants.nodes.map((variant) => {
        const stock = Number.isFinite(variant.inventoryQuantity) ? Math.max(0, variant.inventoryQuantity) : 0;
        const sustainabilityTags = product.tags
          .filter((tag) => tag.toLowerCase().startsWith("sustainability:"))
          .map((tag) => tag.slice("sustainability:".length).trim())
          .filter(Boolean);
        const productUrl = new URL(`/products/${encodeURIComponent(product.handle)}`, storefrontUrl).toString();
        return {
          id: variant.id,
          title: variant.title && variant.title !== "Default Title"
            ? `${product.title} - ${variant.title}`
            : product.title,
          description: product.descriptionHtml,
          priceEur: variant.price,
          stock,
          status: stock === 0 ? "inactive" : "active",
          ean: variant.barcode ?? "",
          material: product.material?.value ?? "",
          sustainabilityTags,
          imageUrl: product.featuredImage?.url ?? "",
          productUrl,
        };
      })
    );

  const xmlProducts = entries.map((product) => `  <product currency="EUR">
    <id>${escapeXml(product.id)}</id>
    <title>${escapeXml(product.title)}</title>
    <description>${escapeXml(product.description)}</description>
    <priceEur>${escapeXml(product.priceEur)}</priceEur>
    <currency>EUR</currency>
    <stock>${product.stock}</stock>
    <status>${product.status}</status>
    <ean>${escapeXml(product.ean)}</ean>
    <brand>Wertarbeit Manufaktur</brand>
    <material>${escapeXml(product.material)}</material>
    <sustainabilityTags>${product.sustainabilityTags.map(escapeXml).join(", ")}</sustainabilityTags>
    <imageUrl>${escapeXml(product.imageUrl)}</imageUrl>
    <productUrl>${escapeXml(product.productUrl)}</productUrl>
  </product>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<products channel="${channel}">\n${xmlProducts}\n</products>\n`;
}

interface JournalRow {
  date: string;
  orderRef: string;
  channel: string;
  netAmountEur: number | null;
  taxEur: number | null;
  ossCountry: string | null;
  lucidWeightGrams: number | null;
  topAgentKey: string | null;
  agentEarnedEur: number;
}

interface DailyJournalPayload {
  schemaVersion: "1.0";
  secret: string;
  date: string;
  rows: JournalRow[];
  summary: {
    dailyRevenueEur: number | null;
    ossCumulativeEur: number | null;
    lucidTotalGrams: number | null;
  };
}

function dateBounds(date: string): { start: Date; end: Date } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Datum muss YYYY-MM-DD sein.");
  const start = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== date) {
    throw new Error("Ungültiges Datum.");
  }
  return { start, end: new Date(start.getTime() + 86_400_000) };
}

function numericMoney(value: string | null | undefined, currency: string): number | null {
  if (currency !== "EUR" || value == null) return null;
  const result = Number(value);
  return Number.isFinite(result) ? Math.round(result * 100) / 100 : null;
}

export async function createDailyGoogleSheetsPayload(
  admin: Admin,
  shop: string,
  date: string
): Promise<DailyJournalPayload> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!webhookUrl || !secret || secret.length < 16) {
    throw new Error("Google-Sheets-Webhook oder mindestens 16 Zeichen langer Webhook-Secret fehlt.");
  }
  const target = new URL(webhookUrl);
  if (
    target.protocol !== "https:" ||
    target.hostname !== "script.google.com"
  ) {
    throw new Error("Google-Sheets-Webhook muss eine HTTPS-URL von script.google.com sein.");
  }
  const { start, end } = dateBounds(date);

  const query = `created_at:>='${start.toISOString()}' created_at:<'${end.toISOString()}' financial_status:paid`;
  type JournalOrder = {
    name: string;
    sourceName: string | null;
    currentSubtotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
    currentTotalTaxSet: { shopMoney: { amount: string; currencyCode: string } };
    currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
    shippingAddress: { countryCodeV2: string | null } | null;
    lineItems: {
      pageInfo: { hasNextPage: boolean };
      nodes: {
        quantity: number;
        variant: {
          product: { lucidPackagingWeight: { value: string } | null } | null;
        } | null;
      }[];
    };
  };
  let after: string | null = null;
  let currency = "";
  const orders: JournalOrder[] = [];

  for (let page = 0; page < 20; page++) {
    type DailyFinancePage = {
      shop: { currencyCode: string };
      orders: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: JournalOrder[] };
    };
    const data: DailyFinancePage = await graphql<DailyFinancePage>(
      admin,
      `#graphql
      query DailyFinanceJournal($after: String, $search: String!) {
        shop { currencyCode }
        orders(first: 50, after: $after, query: $search, sortKey: CREATED_AT) {
          pageInfo { hasNextPage endCursor }
          nodes {
            name sourceName
            currentSubtotalPriceSet { shopMoney { amount currencyCode } }
            currentTotalTaxSet { shopMoney { amount currencyCode } }
            currentTotalPriceSet { shopMoney { amount currencyCode } }
            shippingAddress { countryCodeV2 }
            lineItems(first: 100) {
              pageInfo { hasNextPage }
              nodes {
                quantity
                variant {
                  product {
                    lucidPackagingWeight: metafield(key: "lucid_packaging_weight_g") { value }
                  }
                }
              }
            }
          }
        }
      }`,
      { after, search: query }
    );
    currency = data.shop.currencyCode;
    orders.push(...data.orders.nodes);
    if (!data.orders.pageInfo.hasNextPage) break;
    after = data.orders.pageInfo.endCursor;
    if (!after) throw new Error("Shopify returned an invalid order cursor.");
    if (page === 19) throw new Error("Daily order result exceeds the supported page limit.");
  }

  const revenueEntries = await db.agentRevenueEntry.findMany({
    where: { shop, isSimulated: false, createdAt: { gte: start, lt: end } },
    select: { agentKey: true, amountEur: true, referenceId: true },
  });
  const originRule = await db.companyRule.findUnique({
    where: { shop_key: { shop, key: "oss_origin_country" } },
    select: { value: true },
  });
  const configuredOrigin = typeof originRule?.value === "string"
    ? originRule.value.toUpperCase()
    : null;
  const originCountry = configuredOrigin && isEuCountryCode(configuredOrigin)
    ? configuredOrigin
    : null;
  const rows: JournalRow[] = orders.map((order) => {
    if (order.lineItems?.pageInfo?.hasNextPage) {
      throw new Error(`Bestellung ${order.name} hat mehr als 100 Positionen; Journal-Export abgebrochen.`);
    }
    const subtotalMoney = order.currentSubtotalPriceSet?.shopMoney;
    const taxMoney = order.currentTotalTaxSet?.shopMoney;
    const subtotal = numericMoney(subtotalMoney?.amount, subtotalMoney?.currencyCode);
    const tax = numericMoney(taxMoney?.amount, taxMoney?.currencyCode);
    const orderEntries = revenueEntries.filter((entry) => entry.referenceId === `order:${order.name}`);
    const topAgent = orderEntries.reduce<(typeof orderEntries)[number] | null>(
      (best, entry) => !best || entry.amountEur > best.amountEur ? entry : best,
      null
    );
    const destination = order.shippingAddress?.countryCodeV2 ?? null;
    const weights = (order.lineItems?.nodes ?? []).map((item) => {
      const perItem = Number(item.variant?.product?.lucidPackagingWeight?.value);
      return Number.isFinite(perItem) && perItem >= 0 ? perItem * item.quantity : null;
    });
    const lucidWeightGrams = weights.length && weights.every((weight) => weight !== null)
      ? Math.round((weights as number[]).reduce((sum, weight) => sum + weight, 0) * 100) / 100
      : null;
    return {
      date,
      orderRef: order.name,
      channel: order.sourceName || "unknown",
      netAmountEur: subtotal,
      taxEur: tax,
      ossCountry: originCountry && destination && destination !== originCountry && EU_COUNTRIES.has(destination)
        ? destination
        : null,
      lucidWeightGrams,
      topAgentKey: topAgent?.agentKey ?? null,
      agentEarnedEur: Math.round(orderEntries.reduce((sum, entry) => sum + entry.amountEur, 0) * 100) / 100,
    };
  });
  const totalAmounts = orders.map((order) =>
    numericMoney(
      order.currentTotalPriceSet?.shopMoney?.amount,
      order.currentTotalPriceSet?.shopMoney?.currencyCode
    )
  );
  const dailyRevenueEur = currency === "EUR" && totalAmounts.every((amount) => amount !== null)
    ? Math.round((totalAmounts as number[]).reduce((sum, amount) => sum + amount, 0) * 100) / 100
    : null;
  const knownWeights = rows.map((row) => row.lucidWeightGrams);
  const lucidTotalGrams = knownWeights.length === 0
    ? 0
    : knownWeights.every((weight) => weight !== null)
      ? Math.round((knownWeights as number[]).reduce((sum, weight) => sum + weight, 0) * 100) / 100
      : null;

  return {
    schemaVersion: "1.0",
    secret,
    date,
    rows,
    summary: {
      dailyRevenueEur,
      ossCumulativeEur: null,
      lucidTotalGrams,
    },
  };
}

export async function syncDailyGoogleSheets(
  admin: Admin,
  shop: string,
  date = new Date().toISOString().slice(0, 10)
): Promise<{ ok: boolean; status: string; rowCount: number }> {
  if (await isShopPaused(shop)) {
    return { ok: false, status: "shop_paused", rowCount: 0 };
  }
  if (await isDryRun(shop)) {
    return { ok: false, status: "dry_run_enabled", rowCount: 0 };
  }
  const payload = await createDailyGoogleSheetsPayload(admin, shop, date);
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("GOOGLE_SHEETS_WEBHOOK_URL fehlt.");
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  });
  let finalResponse = response;
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) throw new Error("Google-Sheets-Webhook leitete ohne Zieladresse weiter.");
    const redirected = new URL(location, webhookUrl);
    if (
      redirected.protocol !== "https:" ||
      !redirected.hostname.endsWith(".googleusercontent.com")
    ) {
      throw new Error("Google-Sheets-Webhook leitete auf einen nicht erlaubten Host weiter.");
    }
    finalResponse = await fetch(redirected, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  }
  if (!finalResponse.ok) throw new Error(`Google-Sheets-Webhook antwortete mit HTTP ${finalResponse.status}.`);
  return { ok: true, status: "sent", rowCount: payload.rows.length };
}

export async function runDailyGoogleSheetsSync(): Promise<{
  ok: boolean;
  date: string;
  processed: number;
  remaining: number;
  failures: string[];
}> {
  const date = new Date().toISOString().slice(0, 10);
  const sessions = await db.session.findMany({
    where: { isOnline: false },
    select: { shop: true },
    distinct: ["shop"],
    take: 200,
  });
  const shops = sessions.map((session) => session.shop)
    .filter((shop) => /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop));
  const pending: string[] = [];
  for (const shop of shops) {
    const completed = await db.autopilotLog.findFirst({
      where: { shop, action: "google_sheets_daily", status: "success", detail: date },
      select: { id: true },
    });
    if (!completed) pending.push(shop);
  }

  const batch = pending.slice(0, 3);
  const failures: string[] = [];
  let processed = 0;
  for (const shop of batch) {
    try {
      const { admin } = await unauthenticated.admin(shop);
      const result = await syncDailyGoogleSheets(admin, shop, date);
      if (!result.ok) {
        failures.push(`${shop}: ${result.status}`);
        continue;
      }
      await db.autopilotLog.create({
        data: { shop, action: "google_sheets_daily", status: "success", detail: date, undoable: false },
      });
      processed++;
    } catch {
      failures.push(`${shop}: sync_failed`);
      const previousAttempt = await db.autopilotLog.findFirst({
        where: { shop, action: "google_sheets_daily", detail: date },
        select: { id: true },
      });
      if (previousAttempt) {
        await db.autopilotLog.update({
          where: { id: previousAttempt.id },
          data: { status: "error", undoable: false },
        });
      } else {
        await db.autopilotLog.create({
          data: { shop, action: "google_sheets_daily", status: "error", detail: date, undoable: false },
        });
      }
    }
  }
  return { ok: failures.length === 0, date, processed, remaining: Math.max(0, pending.length - processed), failures };
}

export interface WorkshopItem {
  orderNumber: string;
  sku: string;
  material: string;
  widthMm: number;
  heightMm: number;
  fontFamily: string;
  engravingText: string;
  ringSize: string;
  svgFilename: string;
  svgContent: string;
}

export interface WorkshopBatch {
  schemaVersion: "1.0";
  batchDate: string;
  totalJobs: number;
  items: WorkshopItem[];
  skippedJobs: { jobId: string; missingFields: string[] }[];
}

export class WorkshopJobInputError extends Error {}

function safeFilename(value: string): string {
  const normalized = value.replace(/\\/g, "/").replace(/[^a-zA-Z0-9._-]+/g, "_");
  return normalized.replace(/^\.+/, "").slice(0, 100) || "gravur";
}

export async function createWorkshopJob(input: {
  shop: string;
  orderNumber: string;
  sku: string;
  material: string;
  widthMm: number;
  heightMm: number;
  fontFamily: string;
  engravingText: string;
  ringSize: string;
  svgContent: string;
}): Promise<{ id: string }> {
  const required = [
    input.orderNumber.trim(),
    input.sku.trim(),
    input.material.trim(),
    input.fontFamily.trim(),
    input.engravingText.trim(),
    input.ringSize.trim(),
  ];
  if (required.some((value) => !value)) throw new WorkshopJobInputError("Alle Werkstattfelder müssen ausgefüllt sein.");
  const maxLengths = [
    [input.orderNumber, 120],
    [input.sku, 120],
    [input.material, 100],
    [input.fontFamily, 100],
    [input.ringSize, 50],
  ] as const;
  if (maxLengths.some(([value, max]) => value.trim().length > max)) {
    throw new WorkshopJobInputError("Bestellnummer, SKU, Material, Schrift oder Ringgröße ist zu lang.");
  }
  if (
    !Number.isFinite(input.widthMm) ||
    !Number.isFinite(input.heightMm) ||
    input.widthMm <= 0 ||
    input.heightMm <= 0 ||
    input.widthMm > 1000 ||
    input.heightMm > 1000
  ) {
    throw new WorkshopJobInputError("SVG-Maße müssen zwischen 0 und 1000 mm liegen.");
  }
  if (input.engravingText.length > 500) throw new WorkshopJobInputError("Gravurtext darf höchstens 500 Zeichen enthalten.");
  let svgContent = input.svgContent.trim();
  let workshopNote: string | null = null;
  if (!svgContent) {
    try {
      const generated = buildXtoolLayeredSvg({
        engravingText: input.engravingText,
        material: input.material,
        widthMm: input.widthMm,
        heightMm: input.heightMm,
        font: /serif|georgia|times/i.test(input.fontFamily) ? "SERIF" : "SANS",
      });
      svgContent = generated.svg;
      workshopNote = generated.note;
    } catch (error) {
      if (error instanceof ManufakturInputError) throw new WorkshopJobInputError(error.message);
      throw error;
    }
  }
  try {
    validateWorkshopSvg(svgContent);
  } catch (error) {
    if (error instanceof WorkshopSvgInputError) throw new WorkshopJobInputError(error.message);
    throw error;
  }
  const row = await db.xtoolSvg.create({
    data: {
      shop: input.shop,
      orderId: input.orderNumber.trim(),
      sku: input.sku.trim(),
      material: input.material.trim(),
      widthMm: input.widthMm,
      heightMm: input.heightMm,
      fontFamily: input.fontFamily.trim(),
      ringSize: input.ringSize.trim(),
      gravurText: input.engravingText.trim(),
      svgContent,
      workshopNote,
      status: "OPEN",
    },
    select: { id: true },
  });
  return row;
}

export async function readWorkshopSvg(row: {
  svgContent: string | null;
  svgPath: string | null;
}): Promise<string | null> {
  if (row.svgContent) return row.svgContent;
  if (!row.svgPath) return null;
  const root = path.resolve(process.cwd(), "exports", "xtool-svg");
  const storedPath = row.svgPath.replace(/\\/g, "/");
  const virtualPrefix = "/exports/xtool-svg/";
  const candidate = storedPath.startsWith(virtualPrefix)
    ? path.resolve(root, storedPath.slice(virtualPrefix.length))
    : storedPath.startsWith("exports/xtool-svg/")
      ? path.resolve(process.cwd(), storedPath)
      : path.isAbsolute(storedPath)
        ? path.resolve(storedPath)
        : path.resolve(root, storedPath);
  const relative = path.relative(root, candidate).replace(/\\/g, "/");
  if (relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new Error("SVG-Pfad liegt außerhalb des xTool-Exportverzeichnisses.");
  }
  const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
  const realRelative = path.relative(realRoot, realCandidate).replace(/\\/g, "/");
  if (realRelative === ".." || realRelative.startsWith("../") || path.isAbsolute(realRelative)) {
    throw new Error("SVG-Datei verlässt das xTool-Exportverzeichnis.");
  }
  return readFile(realCandidate, "utf8");
}

export async function exportDailyWorkshopGravurBatch(
  shop: string,
  batchDate = new Date().toISOString().slice(0, 10)
): Promise<{ manifest: WorkshopBatch; zip: Buffer }> {
  const { start, end } = dateBounds(batchDate);
  const rows = await db.xtoolSvg.findMany({
    where: { shop, status: "OPEN", createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
  });
  const items: WorkshopItem[] = [];
  const skippedJobs: WorkshopBatch["skippedJobs"] = [];
  let totalSvgBytes = 0;

  for (const row of rows) {
    const missingFields = [
      !row.orderId ? "orderNumber" : "",
      !row.sku ? "sku" : "",
      !row.material ? "material" : "",
      !row.widthMm || row.widthMm <= 0 ? "widthMm" : "",
      !row.heightMm || row.heightMm <= 0 ? "heightMm" : "",
      !row.fontFamily ? "fontFamily" : "",
      !row.ringSize ? "ringSize" : "",
      !row.gravurText ? "engravingText" : "",
    ].filter(Boolean);

    let svgContent: string | null = null;
    try {
      svgContent = await readWorkshopSvg(row);
      if (!svgContent) missingFields.push("svgContent");
      else validateWorkshopSvg(svgContent);
    } catch {
      missingFields.push("svgContent");
    }

    if (missingFields.length) {
      skippedJobs.push({ jobId: row.id, missingFields: [...new Set(missingFields)] });
      continue;
    }

    totalSvgBytes += Buffer.byteLength(svgContent!, "utf8");
    if (totalSvgBytes > 20_000_000) throw new Error("Tagespaket überschreitet das 20-MB-Limit.");
    items.push({
      orderNumber: row.orderId!,
      sku: row.sku!,
      material: row.material!,
      widthMm: row.widthMm!,
      heightMm: row.heightMm!,
      fontFamily: row.fontFamily!,
      engravingText: row.gravurText,
      ringSize: row.ringSize!,
      svgFilename: `${safeFilename(row.orderId!)}_${safeFilename(row.sku!)}_${safeFilename(row.id.slice(0, 8))}.svg`,
      svgContent: svgContent!,
    });
  }

  const manifest: WorkshopBatch = { schemaVersion: "1.0", batchDate, totalJobs: items.length, items, skippedJobs };
  const archive = new ZipArchive({ zlib: { level: 6 } });
  const chunks: Buffer[] = [];
  const completed = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
  });
  archive.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });
  for (const item of items) archive.append(item.svgContent, { name: `svgs/${item.svgFilename}` });
  await archive.finalize();
  await completed;
  return { manifest, zip: Buffer.concat(chunks) };
}

function normalizedPhone(phone: string): string {
  const value = phone.trim().replace(/[\s().-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(value)) throw new Error("Telefonnummer muss im E.164-Format angegeben werden.");
  return value;
}

export function hashWhatsAppPhone(shop: string, phone: string): string {
  const key = process.env.SHOPIFY_API_SECRET;
  if (!key || key.length < 16) throw new Error("SHOPIFY_API_SECRET ist nicht ausreichend konfiguriert.");
  return hmacHex(key, `${shop}|${normalizedPhone(phone)}`);
}

function maskPhone(phone: string): string {
  const digits = normalizedPhone(phone).replace(/\D/g, "");
  return `+…${digits.slice(-4)}`;
}

const WHATSAPP_OPT_IN_SOURCES = new Set([
  "checkout_checkbox",
  "customer_email",
  "written_consent",
  "in_person",
  "other_verified",
]);

export async function recordWhatsAppOptIn(input: {
  shop: string;
  phone: string;
  source: string;
  verified: boolean;
}): Promise<void> {
  const source = input.source.trim();
  if (!input.verified) throw new Error("Opt-in muss vor dem Speichern ausdrücklich verifiziert werden.");
  if (!WHATSAPP_OPT_IN_SOURCES.has(source)) throw new Error("Bitte eine gültige Opt-in-Nachweisquelle auswählen.");
  const hash = hashWhatsAppPhone(input.shop, input.phone);
  await db.whatsAppConsent.upsert({
    where: { shop_phoneHash: { shop: input.shop, phoneHash: hash } },
    update: { source, consentedAt: new Date(), revokedAt: null, lastAttemptAt: null },
    create: { shop: input.shop, phoneHash: hash, source },
  });
}

export async function revokeWhatsAppOptIn(shop: string, phone: string): Promise<void> {
  const hash = hashWhatsAppPhone(shop, phone);
  await db.whatsAppConsent.updateMany({
    where: { shop, phoneHash: hash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

const APPROVED_WHATSAPP_TEMPLATES = new Set([
  "gravur_freigabe_check",
  "ringgroesse_rueckfrage",
]);

export async function sendWhatsAppServiceTemplate(input: {
  shop: string;
  phone: string;
  templateName: string;
  parameters?: string[];
}): Promise<{ ok: boolean; status: "sent" | "dry_run" | "paused" | "rate_limited"; messageId?: string }> {
  const phone = normalizedPhone(input.phone);
  if (!APPROVED_WHATSAPP_TEMPLATES.has(input.templateName)) {
    throw new Error("Nur die freigegebenen WhatsApp-Service-Templates sind erlaubt.");
  }
  const parameters = input.parameters ?? [];
  if (parameters.length > 5 || parameters.some((item) => item.length > 500)) {
    throw new Error("WhatsApp-Templateparameter überschreiten die erlaubten Grenzen.");
  }
  const hash = hashWhatsAppPhone(input.shop, phone);
  const consent = await db.whatsAppConsent.findUnique({
    where: { shop_phoneHash: { shop: input.shop, phoneHash: hash } },
  });
  if (!consent || consent.revokedAt) throw new Error("Kein aktives, verifiziertes WhatsApp-Opt-in vorhanden.");

  if (await isShopPaused(input.shop)) return { ok: false, status: "paused" };
  if (await isDryRun(input.shop)) {
    await db.whatsAppMessageLog.create({
      data: {
        shop: input.shop,
        phoneHash: hash,
        phoneMasked: maskPhone(phone),
        templateName: input.templateName,
        status: "dry_run",
      },
    });
    return { ok: true, status: "dry_run" };
  }

  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) throw new Error("WhatsApp Cloud API ist nicht konfiguriert.");
  const now = new Date();
  const lock = await db.whatsAppConsent.updateMany({
    where: {
      id: consent.id,
      revokedAt: null,
      OR: [{ lastAttemptAt: null }, { lastAttemptAt: { lt: new Date(now.getTime() - 7 * 86_400_000) } }],
    },
    data: { lastAttemptAt: now },
  });
  if (lock.count !== 1) return { ok: false, status: "rate_limited" };

  const payload = {
    messaging_product: "whatsapp",
    to: phone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: input.templateName,
      language: { code: "de" },
      ...(parameters.length
        ? { components: [{ type: "body", parameters: parameters.map((text) => ({ type: "text", text })) }] }
        : {}),
    },
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(phoneId)}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json().catch(() => ({}))) as {
      messages?: { id?: string }[];
      error?: { code?: number };
    };
    if (!response.ok || !result.messages?.[0]?.id) {
      const code = result.error?.code ? String(result.error.code) : null;
      await db.whatsAppMessageLog.create({
        data: {
          shop: input.shop,
          phoneHash: hash,
          phoneMasked: maskPhone(phone),
          templateName: input.templateName,
          status: "failed",
          errorCode: code,
        },
      });
      throw new Error(`WhatsApp API lehnte die Nachricht ab${code ? ` (Code ${code})` : ""}.`);
    }
    await db.whatsAppMessageLog.create({
      data: {
        shop: input.shop,
        phoneHash: hash,
        phoneMasked: maskPhone(phone),
        templateName: input.templateName,
        status: "sent",
        providerMessageId: result.messages[0].id,
      },
    });
    return { ok: true, status: "sent", messageId: result.messages[0].id };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("WhatsApp API lehnte")) throw error;
    await db.whatsAppMessageLog.create({
      data: {
        shop: input.shop,
        phoneHash: hash,
        phoneMasked: maskPhone(phone),
        templateName: input.templateName,
        status: "failed",
        errorCode: "network_error",
      },
    });
    throw new Error("WhatsApp Cloud API ist nicht erreichbar; Anti-Spam-Lock bleibt bis zu sieben Tage aktiv.");
  }
}

export async function reconcilePaymentLedger(
  shop: string,
  csv: Uint8Array | string
): Promise<{
  ok: boolean;
  imported: number;
  matched: number;
  feeDeviations: number;
  unmatched: number;
  openPrepayments: number;
  details: { status: string; amount: number; currency: string; invoiceNo?: string }[];
}> {
  const records = parseGermanBankCsv(csv);
  if (!records.length) throw new Error("Die CSV enthält keine Buchungszeilen.");
  const raw = typeof csv === "string" ? Buffer.from(csv, "utf8") : Buffer.from(csv);
  const sourceFileHash = createHash("sha256").update(raw).digest("hex");
  const invoices = await db.invoice.findMany({
    where: { shop, zugferdXml: { not: null }, sentAt: { not: null } },
  });
  const knownPaid = await db.paymentLedgerEntry.findMany({
    where: { shop, status: { in: ["MATCHED", "FEE_DEVIATION"] }, invoiceId: { not: null } },
    select: { invoiceId: true },
  });
  const matchedInvoices = new Set(knownPaid.map((entry) => entry.invoiceId).filter((id): id is string => !!id));
  const details: { status: string; amount: number; currency: string; invoiceNo?: string }[] = [];
  let matched = 0;
  let feeDeviations = 0;
  let unmatched = 0;
  let imported = 0;

  for (const [recordIndex, record] of records.entries()) {
    const candidates = invoices.filter((invoice) => {
      const reference = record.purpose.toLocaleLowerCase();
      const references = [invoice.invoiceNo, invoice.orderId].filter(Boolean);
      return references.some((candidate) => {
        const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[^a-z0-9])${escaped.toLocaleLowerCase()}([^a-z0-9]|$)`, "i").test(reference);
      });
    });
    const invoice = candidates.length === 1 ? candidates[0] : null;
    let status: string;
    let feeDelta: number | null = null;
    if (invoice && invoice.currency === record.currency && record.currency === "EUR") {
      const invoiceAmount = Number(invoice.amount);
      if (!Number.isFinite(invoiceAmount)) throw new Error(`Rechnung ${invoice.invoiceNo} enthält keinen gültigen Betrag.`);
      feeDelta = Math.round((record.amount - invoiceAmount) * 100) / 100;
      matchedInvoices.add(invoice.id);
      status = Math.abs(feeDelta) <= 0.02 ? "MATCHED" : "FEE_DEVIATION";
      if (status === "MATCHED") {
        matched++;
      } else {
        feeDeviations++;
      }
    } else {
      status = candidates.length > 1
        ? "AMBIGUOUS"
        : invoice && invoice.currency !== record.currency
          ? "CURRENCY_MISMATCH"
          : "UNMATCHED";
      unmatched++;
    }

    const rowHash = createHash("sha256")
      .update(`${shop}|${sourceFileHash}|${recordIndex}`)
      .digest("hex");
    await db.paymentLedgerEntry.upsert({
      where: { shop_rowHash: { shop, rowHash } },
      update: {
        sourceFileHash,
        invoiceId: invoice?.id ?? null,
        amount: record.amount,
        currency: record.currency,
        status,
        feeDelta,
        transactionAt: new Date(record.bookingDate),
      },
      create: {
        shop,
        rowHash,
        sourceFileHash,
        invoiceId: invoice?.id ?? null,
        amount: record.amount,
        currency: record.currency,
        status,
        feeDelta,
        transactionAt: new Date(record.bookingDate),
      },
    });
    imported++;
    details.push({
      status,
      amount: record.amount,
      currency: record.currency,
      ...(invoice ? { invoiceNo: invoice.invoiceNo } : {}),
    });
  }

  let openPrepayments = 0;
  for (const invoice of invoices) {
    if (matchedInvoices.has(invoice.id)) continue;
    const amount = Number(invoice.amount);
    if (!Number.isFinite(amount)) continue;
    const rowHash = createHash("sha256").update(`${shop}|open-prepayment|${invoice.id}`).digest("hex");
    await db.paymentLedgerEntry.upsert({
      where: { shop_rowHash: { shop, rowHash } },
      update: { sourceFileHash, amount, currency: invoice.currency, status: "OPEN_PREPAYMENT", feeDelta: null },
      create: {
        shop,
        rowHash,
        sourceFileHash,
        invoiceId: invoice.id,
        amount,
        currency: invoice.currency,
        status: "OPEN_PREPAYMENT",
      },
    });
    openPrepayments++;
    details.push({ status: "OPEN_PREPAYMENT", amount, currency: invoice.currency, invoiceNo: invoice.invoiceNo });
  }

  return { ok: true, imported, matched, feeDeviations, unmatched, openPrepayments, details };
}
