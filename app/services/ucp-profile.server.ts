/**
 * UCP-Profil (Version 2026-08-25) für /.well-known/ucp – spezifikationskonform:
 *  - ucp.version, ucp.services und ucp.payment_handlers sind Pflicht (hier leer, wo nichts angeboten wird).
 *  - Eigene Capabilities nutzen die umgedrehte Host-Domain der App (Authority Binding): Der Host der
 *    `schema`-URL muss zum Namespace passen. Ohne SHOPIFY_APP_URL werden daher KEINE Capabilities veröffentlicht.
 *  - Es gibt keinen eigenen Checkout und keine Zahlung: Der Kauf läuft ausschließlich über die Shopify-Storefront.
 */

export const UCP_VERSION = "2026-08-25";

export interface CapabilityDef {
  key: string; // z. B. "catalog"
  title: string;
  description: string;
  path: string; // relativ zum App-Host
}

export const CAPABILITIES: CapabilityDef[] = [
  { key: "catalog", title: "Produktsuche", description: "Lesende Suche im Sortiment (Titel, Preis, Verfügbarkeit, Unikat-Hinweis).", path: "/api/ucp/products" },
  { key: "advice", title: "Manufaktur-Beratung", description: "Antworten zu Gravur, Pflege, Zertifikat und Größen (DE/EN).", path: "/api/ucp/advice" },
  { key: "gra_verification", title: "GRA-Echtheitsprüfung", description: "Prüft, ob eine GRA-Zertifikatsnummer existiert (nur gültig ja/nein + Steindaten).", path: "/api/ucp/gra" },
  { key: "ring_size", title: "Ringgrößen-Hilfe", description: "Rechnet Innenumfang, Durchmesser und US-Größe in DE/US/UK um (ISO 8653).", path: "/api/ucp/ring-size" },
];

/** Aus https://app.beispiel.de -> "de.beispiel.app". Gibt null zurück, wenn kein gültiger HTTPS-Host vorliegt. */
export function appAuthority(appUrl: string | undefined): { origin: string; ns: string } | null {
  if (!appUrl) return null;
  try {
    const u = new URL(appUrl);
    if (u.protocol !== "https:" || !u.hostname.includes(".") || /^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(u.hostname)) return null;
    const ns = u.hostname.toLowerCase().split(".").reverse().join(".");
    if (!/^[a-z](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9_-]*[a-z0-9_])?)+$/.test(ns)) return null;
    return { origin: u.origin, ns };
  } catch {
    return null;
  }
}

export interface UcpBusiness {
  name: string;
  tagline: string;
  baseUrl: string;
  currency: string;
  productCount: number;
}

export function buildProfile(b: UcpBusiness, appUrl: string | undefined) {
  const auth = appAuthority(appUrl);
  const capabilities: Record<string, unknown[]> = {};
  const services: Record<string, unknown[]> = {};

  if (auth) {
    const serviceKey = `${auth.ns}.manufaktur`;
    services[serviceKey] = [
      {
        version: UCP_VERSION,
        transport: "rest",
        endpoint: `${auth.origin}/api/ucp`,
        spec: `${auth.origin}/ucp/schemas/service`,
        schema: `${auth.origin}/ucp/schemas/service`,
      },
    ];
    for (const c of CAPABILITIES) {
      capabilities[`${auth.ns}.manufaktur.${c.key}`] = [
        {
          version: UCP_VERSION,
          spec: `${auth.origin}/ucp/schemas/${c.key}`,
          schema: `${auth.origin}/ucp/schemas/${c.key}`,
        },
      ];
    }
  }

  return {
    ucp: { version: UCP_VERSION, services, capabilities, payment_handlers: {} },
    // Zusatzangaben (kein UCP-Standardfeld, wird von Konsumenten ignoriert)
    business: {
      name: b.name,
      description: b.tagline,
      continue_url: b.baseUrl,
      checkout: "Shopify-Storefront (kein eigener Checkout, keine eigene Zahlung)",
      llms: `${b.baseUrl}/shop.md`,
      privacy_policy: `${b.baseUrl}/policies/privacy-policy`,
      terms_of_service: `${b.baseUrl}/policies/terms-of-service`,
      refund_policy: `${b.baseUrl}/policies/refund-policy`,
      locales: ["de-DE", "en"],
      currency: b.currency,
      product_count: b.productCount,
    },
  };
}

/** Minimales JSON-Schema je Capability, ausgeliefert unter /ucp/schemas/<key>. */
export function schemaFor(key: string, appUrl: string | undefined): Record<string, unknown> | null {
  const auth = appAuthority(appUrl);
  if (!auth) return null;
  if (key === "service") {
    return {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: `${auth.origin}/ucp/schemas/service`,
      title: "Manufaktur-Service (nur lesend, REST)",
      description: "Lesende Schnittstelle: /products, /advice, /gra, /ring-size. Kein Checkout, keine Zahlung.",
      type: "object",
    };
  }
  const c = CAPABILITIES.find((x) => x.key === key);
  if (!c) return null;
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${auth.origin}/ucp/schemas/${c.key}`,
    title: c.title,
    description: `${c.description} Endpunkt: GET ${auth.origin}${c.path}`,
    type: "object",
  };
}
