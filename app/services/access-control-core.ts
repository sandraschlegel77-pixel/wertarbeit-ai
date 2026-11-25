const CANONICAL_OWNER_SHOP_DOMAINS = new Set([
  "wertarbeitmanufaktur.myshopify.com",
  "wertarbeit-testshop.myshopify.com",
]);

function normalizeShopDomain(shop: string): string {
  return shop.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function getOwnerShopDomains(configured: string | undefined): string[] {
  return (configured ?? "")
    .split(",")
    .map(normalizeShopDomain)
    .filter(Boolean);
}

export function isConfiguredOwnerShop(shop: string, configured: string | undefined): boolean {
  const normalizedShop = normalizeShopDomain(shop);
  return normalizedShop.length > 0 && getOwnerShopDomains(configured).includes(normalizedShop);
}

export function isCanonicalOwnerShop(shop: string): boolean {
  return CANONICAL_OWNER_SHOP_DOMAINS.has(normalizeShopDomain(shop));
}

export function getPrimaryOwnerShopDomain(configured: string | undefined, fallback: string): string {
  return getOwnerShopDomains(configured)[0] ?? fallback;
}
