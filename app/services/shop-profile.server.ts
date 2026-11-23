import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { ownerShopDomain } from "./ai-agents.server";

/**
 * Echte Manufaktur-/Produktdaten für UCP (/.well-known/ucp), Shop.md und die KI-Suchen.
 * Quelle: Shopify Admin API des Inhaber-Shops (nur aktive, veröffentlichte Produkte).
 * Fällt bei fehlender Installation auf die festen Manufaktur-Angaben zurück – ohne erfundene Produkte.
 */

export interface ProfileProduct {
  title: string;
  handle: string;
  description: string;
  price: string;
  currency: string;
  available: boolean;
  productType: string;
  image: string | null;
  unique: boolean;
}

export interface ShopProfile {
  shop: string;
  baseUrl: string;
  name: string;
  tagline: string;
  products: ProfileProduct[];
  fromShopify: boolean;
}

const CACHE_KEY = "shop_profile_v1";
const CACHE_MS = 15 * 60 * 1000;

const baseUrl = (): string =>
  (process.env.STOREFRONT_URL || `https://${ownerShopDomain()}`).replace(/\/$/, "");

export const MANUFAKTUR = {
  name: "Wertarbeit Manufaktur",
  tagline: "Mit Hand und Liebe gefertigter, lasergravierter Schmuck aus einem deutschen Familienbetrieb.",
};

async function fetchProducts(shop: string): Promise<ProfileProduct[]> {
  const { admin } = await unauthenticated.admin(shop);
  const res = await admin.graphql(`#graphql
    query ProfileProducts {
      shop { currencyCode }
      products(first: 50, query: "status:active", sortKey: UPDATED_AT, reverse: true) {
        nodes {
          title handle description productType totalInventory
          featuredImage { url }
          priceRangeV2 { minVariantPrice { amount currencyCode } }
          tags
        }
      }
    }`);
  const json = (await res.json()) as {
    data?: {
      products?: {
        nodes?: {
          title: string;
          handle: string;
          description: string;
          productType: string;
          totalInventory: number | null;
          featuredImage: { url: string } | null;
          priceRangeV2: { minVariantPrice: { amount: string; currencyCode: string } };
          tags: string[];
        }[];
      };
    };
  };
  return (json.data?.products?.nodes ?? []).map((p) => ({
    title: p.title,
    handle: p.handle,
    description: p.description.slice(0, 400),
    price: p.priceRangeV2.minVariantPrice.amount,
    currency: p.priceRangeV2.minVariantPrice.currencyCode,
    available: (p.totalInventory ?? 0) > 0,
    productType: p.productType,
    image: p.featuredImage?.url ?? null,
    unique: (p.totalInventory ?? 0) === 1 || p.tags.some((t) => /unikat|einzelst/i.test(t)),
  }));
}

export async function loadShopProfile(): Promise<ShopProfile> {
  const shop = ownerShopDomain();
  const base = { shop, baseUrl: baseUrl(), ...MANUFAKTUR };

  try {
    const cached = await db.precomputedCache.findUnique({ where: { shop_key: { shop, key: CACHE_KEY } } });
    if (cached && cached.expiresAt > new Date()) return cached.value as unknown as ShopProfile;
  } catch {
    /* Cache optional */
  }

  let products: ProfileProduct[] = [];
  let fromShopify = false;
  try {
    products = await fetchProducts(shop);
    fromShopify = true;
  } catch {
    /* App im Shop nicht installiert -> leere Liste, keine erfundenen Daten */
  }

  const profile: ShopProfile = { ...base, products, fromShopify };
  if (fromShopify) {
    try {
      const expiresAt = new Date(Date.now() + CACHE_MS);
      await db.precomputedCache.upsert({
        where: { shop_key: { shop, key: CACHE_KEY } },
        update: { value: profile as never, expiresAt },
        create: { shop, key: CACHE_KEY, value: profile as never, expiresAt },
      });
    } catch {
      /* ignorieren */
    }
  }
  return profile;
}
