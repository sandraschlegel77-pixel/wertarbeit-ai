export type CapabilityFeasibility =
  | "API_DIRECT"
  | "FEED_OR_PARTNER"
  | "MANUAL_ASSISTANT"
  | "NOT_POSSIBLE_OFFICIALLY";

export interface CapabilityProfile {
  domainKey: string;
  displayName: string;
  aliases: readonly string[];
  feasibility: CapabilityFeasibility;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  sourceUrl: string;
  sourceTitle: string;
  allowedHosts: readonly string[];
  evidenceSummary: string;
}

export const CAPABILITY_PROFILES: readonly CapabilityProfile[] = [
  {
    domainKey: "shopify-admin-graphql-2026-10",
    displayName: "Shopify Admin GraphQL API 2026-10",
    aliases: ["shopify", "shopify graphql", "admin graphql", "shopify admin api"],
    feasibility: "API_DIRECT",
    riskLevel: "MEDIUM",
    sourceUrl: "https://shopify.dev/docs/api/admin-graphql/2026-10",
    sourceTitle: "Shopify GraphQL Admin API reference, version 2026-10",
    allowedHosts: ["shopify.dev"],
    evidenceSummary: "Versionierte Shopify-API-Dokumentation. Ein erreichbarer Dokumentationslink bestätigt keine Shop-Berechtigungen oder Marktplatz-Verbindung.",
  },
  {
    domainKey: "google-shopping-xml",
    displayName: "Google Shopping XML",
    aliases: ["google shopping", "google merchant center", "google xml", "merchant feed"],
    feasibility: "FEED_OR_PARTNER",
    riskLevel: "MEDIUM",
    sourceUrl: "https://support.google.com/merchants/answer/7052112?hl=en",
    sourceTitle: "Google Merchant Center product data specification",
    allowedHosts: ["support.google.com", "developers.google.com"],
    evidenceSummary: "Offizielle Produktdaten-/Feed-Spezifikation. Feed-Format und Richtlinien sind dokumentiert; ein valider Merchant-Center-Feed oder Konto-Zugriff wird nicht geprüft.",
  },
  {
    domainKey: "pinterest-catalog",
    displayName: "Pinterest Catalog",
    aliases: ["pinterest", "pinterest catalog", "pinterest katalog"],
    feasibility: "FEED_OR_PARTNER",
    riskLevel: "MEDIUM",
    sourceUrl: "https://developers.pinterest.com/docs/",
    sourceTitle: "Pinterest Developer Platform",
    allowedHosts: ["developers.pinterest.com"],
    evidenceSummary: "Offizieller Entwickler-Einstieg. Produktfeed-Anforderungen und Zugriffsfreigaben müssen vor einer Integration separat geprüft werden.",
  },
  {
    domainKey: "etsy-open-api-v3",
    displayName: "Etsy Open API v3",
    aliases: ["etsy", "etsy api", "etsy open api"],
    feasibility: "API_DIRECT",
    riskLevel: "HIGH",
    sourceUrl: "https://developers.etsy.com/documentation/",
    sourceTitle: "Etsy Open API v3 documentation",
    allowedHosts: ["developers.etsy.com"],
    evidenceSummary: "Etsy dokumentiert Open API v3 für Inventar, Bestellungen und Shop-Verwaltung. App-Registrierung, OAuth, scopes und Etsy-Zulassung bleiben erforderlich.",
  },
  {
    domainKey: "ebay-inventory-api",
    displayName: "eBay Inventory API",
    aliases: ["ebay", "ebay inventory", "ebay api"],
    feasibility: "API_DIRECT",
    riskLevel: "HIGH",
    sourceUrl: "https://developer.ebay.com/api-docs/sell/inventory/overview.html",
    sourceTitle: "eBay Sell Inventory API overview",
    allowedHosts: ["developer.ebay.com"],
    evidenceSummary: "Die offizielle Inventory API verwaltet Inventar-Items und Offers. Verkäuferrichtlinien, Standort, Kategorie und Geschäftskonditionen sind Voraussetzung für Veröffentlichung.",
  },
  {
    domainKey: "kaufland-seller-api",
    displayName: "Kaufland Marketplace Seller API",
    aliases: ["kaufland", "kaufland seller api", "kaufland marketplace"],
    feasibility: "API_DIRECT",
    riskLevel: "HIGH",
    sourceUrl: "https://sellerapi.kaufland.com/",
    sourceTitle: "Kaufland Marketplace Seller API 2.0",
    allowedHosts: ["sellerapi.kaufland.com"],
    evidenceSummary: "Offizielle Seller-API-Dokumentation für Bestände und Verkäufe. Partnerregistrierung, Account-Zugang und API-Schlüssel werden nicht geprüft.",
  },
  {
    domainKey: "faire-developer-api",
    displayName: "Faire for Developers",
    aliases: ["faire", "faire api", "faire wholesale"],
    feasibility: "API_DIRECT",
    riskLevel: "HIGH",
    sourceUrl: "https://developers.faire.com/",
    sourceTitle: "Faire for Developers",
    allowedHosts: ["developers.faire.com"],
    evidenceSummary: "Offizieller Entwicklerbereich ist als Quelle hinterlegt. Verfügbarkeit konkreter Endpunkte und Berechtigung für diesen Shop müssen separat bestätigt werden.",
  },
  {
    domainKey: "catawiki-seller-assistant",
    displayName: "Catawiki Verkäufer-Assistent",
    aliases: ["catawiki", "catawiki api"],
    feasibility: "MANUAL_ASSISTANT",
    riskLevel: "HIGH",
    sourceUrl: "https://www.catawiki.com/en/sell",
    sourceTitle: "Catawiki selling information",
    allowedHosts: ["catawiki.com"],
    evidenceSummary: "Nur ein manueller Vorbereitungs-Assistent ist vorgesehen. Eine öffentliche Seller-API wurde in dieser Prüfung nicht nachgewiesen; keine automatische Veröffentlichung.",
  },
  {
    domainKey: "kleinanzeigen-freshness-assistant",
    displayName: "Kleinanzeigen 60-Tage-Frische-Assistent",
    aliases: ["kleinanzeigen", "kleinanzeigen.de", "kleinanzeigen refresh", "kleinanzeigen erneuerung"],
    feasibility: "MANUAL_ASSISTANT",
    riskLevel: "MEDIUM",
    sourceUrl: "https://themen.kleinanzeigen.de/",
    sourceTitle: "Kleinanzeigen information portal",
    allowedHosts: ["kleinanzeigen.de"],
    evidenceSummary: "Der vorhandene Assistent erstellt eine manuelle Anzeigenvorlage und prüft Shopify-Bestand. Ein offizieller Anzeigen-Schreibzugriff oder 60-Tage-Verlängerungs-API ist nicht belegt.",
  },
  {
    domainKey: "nebenan-local-post-assistant",
    displayName: "nebenan.de lokaler Beitrags-Assistent",
    aliases: ["nebenan", "nebenan.de", "nebenan lokales netzwerk"],
    feasibility: "MANUAL_ASSISTANT",
    riskLevel: "LOW",
    sourceUrl: "https://nebenan.de/unternehmen",
    sourceTitle: "nebenan.de – lokales Nachbarschaftsnetzwerk",
    allowedHosts: ["nebenan.de"],
    evidenceSummary: "Der Dienst beschreibt ein lokales Nachbarschaftsnetzwerk. Dieser Eintrag unterstützt nur einen manuell zu prüfenden Beitrag; eine offizielle Publishing-API ist nicht belegt.",
  },
  {
    domainKey: "ucp-protocol",
    displayName: "Universal Commerce Protocol",
    aliases: ["ucp", "universal commerce protocol", "api ucp mcp"],
    feasibility: "FEED_OR_PARTNER",
    riskLevel: "MEDIUM",
    sourceUrl: "https://ucp.dev/",
    sourceTitle: "Universal Commerce Protocol",
    allowedHosts: ["ucp.dev"],
    evidenceSummary: "Protokollquelle. Dieses Projekt veröffentlicht ein UCP-Profil und lesende REST-Capabilities; ein eigener Checkout oder ein /api/ucp/mcp-Endpunkt wird damit nicht behauptet.",
  },
  {
    domainKey: "storefront-webmcp",
    displayName: "Storefront WebMCP App Embed",
    aliases: ["webmcp", "storefront webmcp", "webmcp app embed"],
    feasibility: "MANUAL_ASSISTANT",
    riskLevel: "HIGH",
    sourceUrl: "https://github.com/WICG/webmcp",
    sourceTitle: "WebMCP proposal repository",
    allowedHosts: ["github.com"],
    evidenceSummary: "Experimentelle Web-Schnittstelle; dieses Projekt hat derzeit kein WebMCP-Theme-App-Embed registriert. Keine Storefront-Skripte oder Tool-Registrierung werden durch diesen Quellenhinweis erzeugt.",
  },
] as const;

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolveCapabilityProfile(input: string): CapabilityProfile | null {
  const text = ` ${normalized(input)} `;
  return [...CAPABILITY_PROFILES]
    .sort((a, b) => Math.max(...b.aliases.map((alias) => normalized(alias).length)) -
      Math.max(...a.aliases.map((alias) => normalized(alias).length)))
    .find((profile) => profile.aliases.some((alias) => {
      const candidate = normalized(alias);
      return candidate.length > 0 && text.includes(` ${candidate} `);
    })) ?? null;
}

export function capabilityEvidenceIsFresh(input: {
  isVerified: boolean;
  verifiedAt: Date | null;
  expiresAt: Date | null;
}, now = Date.now(), maxAgeMs = 30 * 24 * 60 * 60 * 1000): boolean {
  const verifiedAt = input.verifiedAt?.getTime();
  return input.isVerified &&
    typeof verifiedAt === "number" &&
    verifiedAt <= now &&
    now - verifiedAt <= maxAgeMs &&
    (!input.expiresAt || input.expiresAt.getTime() > now);
}
