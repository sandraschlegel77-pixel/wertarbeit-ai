import type { AuditDomain } from "./agent-types";
import type { ToolCode } from "./roster-tools";

export interface ApexSpecialistCluster {
  id: string;
  from: number;
  departmentId: number;
  role: string;
  tool: ToolCode;
  auditDomain?: AuditDomain;
  mission: string;
  names: string[];
}

export const APEX_SPECIALIST_CLUSTERS: ApexSpecialistCluster[] = [
  {
    id: "goldsmith-watch-laser",
    from: 301,
    departmentId: 5,
    role: "Goldschmied-, Uhren- & Laser-Fachspezialist",
    tool: "BSP",
    mission: "Prüft Werkstattdaten, Gravurvorgaben und dokumentierte Produktmerkmale; erstellt nur fachliche Entwürfe.",
    names: [
      "Goldschmiede-Auftragsprüfer", "Uhren-Service-Koordinator", "Laser-Materialprofil-Prüfer",
      "Gravurdatei-Qualitätsprüfer", "Edelstein-Fassungs-Dokumentar", "Schmuckgrößen-Datenassistent",
      "Werkstatt-Kalkulationsassistent", "Schiefer- und Holzlaser-Berater", "Seriengravur-Auftragsplaner",
      "Werkstatt-Fertigungsprotokollant",
    ],
  },
  {
    id: "geo-aeo-search",
    from: 311,
    departmentId: 6,
    role: "KI-Suche-, GEO- & AEO-Spezialist",
    tool: "UCP",
    mission: "Bereitet strukturierte, belegte Produkt- und Shopinformationen für Such- und Antwortsysteme auf.",
    names: [
      "GEO-Produktdaten-Analyst", "AEO-Fragenstruktur-Redakteur", "Schema-Markup-Prüfer",
      "UCP-Datenqualitätsassistent", "Shop-MD-Pflegeassistent", "LLM-Sichtbarkeits-Beobachter",
      "Entitätskonsistenz-Prüfer", "Suchintention-Klassifizierer", "Alt-Text-Qualitätsassistent",
      "Quellenbeleg-Redakteur",
    ],
  },
  {
    id: "conversion-shop-ux",
    from: 321,
    departmentId: 4,
    role: "Conversion- & Shop-UX-Spezialist",
    tool: "ABT",
    mission: "Analysiert vorhandene Shopdaten und erstellt messbare, freigabepflichtige UX-Verbesserungsvorschläge.",
    names: [
      "Produktseiten-UX-Analyst", "Mobile-Shop-Prüfer", "Warenkorb-Hinweis-Analyst",
      "Checkout-Reibungs-Analyst", "Produktbild-Reihenfolge-Optimierer", "Trust-Signal-Prüfer",
      "Navigationsstruktur-Analyst", "Barrierefreiheits-Hinweisgeber", "Landingpage-Testplaner",
      "Conversion-Messplan-Prüfer",
    ],
  },
  {
    id: "loyalty-vip-empathy",
    from: 331,
    departmentId: 17,
    role: "Kundenbindung-, VIP- & Empathie-Spezialist",
    tool: "CON",
    mission: "Erstellt kundenfreundliche, einwilligungs- und markenkonforme Service- und Wiederkaufentwürfe.",
    names: [
      "Wiederkauf-Segmentierungsassistent", "VIP-Service-Entwurfsredakteur", "Geschenk-Anlass-Berater",
      "Pflegehinweis-Redakteur", "Kundenfeedback-Klassifizierer", "Empathie-Ton-Prüfer",
      "Treueprogramm-Regelassistent", "Warenkorb-Concierge-Analyst", "Kundenbindungs-Messplaner",
      "Kontaktfrequenz-Schutzprüfer",
    ],
  },
  {
    id: "deep-law-tax",
    from: 341,
    departmentId: 21,
    role: "Rechts- & Steuerquellen-Fachassistent",
    tool: "BRF",
    auditDomain: "LEGAL",
    mission: "Ordnet dokumentierte Rechts- und Steuerquellen für eine menschliche Fachprüfung; erteilt keine Rechtsberatung.",
    names: [
      "Preisangaben-Regelassistent", "Widerrufsprozess-Checklistenassistent", "Verpackungsrecht-Quellenassistent",
      "Umsatzsteuer-Länderdatenassistent", "E-Commerce-Kennzeichnungsprüfer", "Edelmetall-Pflichtangabenassistent",
      "Produktsicherheits-Dokumentar", "Datenschutz-Fristenassistent", "Wettbewerbsrecht-Quellenindexierer",
      "Versandzoll-Regelassistent", "GoBD-Belegketten-Prüfer", "LUCID-Datenassistent",
      "EU-OSS-Schwellenwert-Monitor", "Batterie- und Elektrogeräte-Pflichtenassistent", "Rechtsquellen-Aktualitätsprüfer",
    ],
  },
  {
    id: "finance-controlling",
    from: 356,
    departmentId: 22,
    role: "Finanz- & Controlling-Fachassistent",
    tool: "PRF",
    auditDomain: "FINANCE",
    mission: "Analysiert vorhandene Buchungs- und Margendaten; kennzeichnet Schätzungen und ersetzt keine Steuerberatung.",
    names: [
      "Deckungsbeitrags-Analyst", "Wareneinsatz-Abgleicher", "Liquiditätsvorschau-Assistent",
      "DATEV-Konten-Mapping-Prüfer", "Gebührenabweichungs-Analyst", "Retourenkosten-Controller",
      "Einkaufspreis-Trendprüfer", "Rabattgrenzen-Analyst", "Monatsabschluss-Checklistenassistent",
      "Finanzdaten-Plausibilitätsprüfer",
    ],
  },
  {
    id: "multichannel-expansion",
    from: 366,
    departmentId: 25,
    role: "Multi-Channel- & Expansion-Fachassistent",
    tool: "MST",
    mission: "Prüft dokumentierte Kanalvoraussetzungen und bereitet kanalbezogene Daten ohne erfundene Verbindung vor.",
    names: [
      "Marketplace-Fit-Analyst", "Feed-Feld-Mapping-Assistent", "Kanalrichtlinien-Quellenindexierer",
      "Listing-Attribut-Prüfer", "Bestands-Sync-Planer", "Auftragsfluss-Analyst",
      "Partnerprogramm-Dokumentar", "Kanalgebühren-Vergleicher", "OAuth-Berechtigungs-Prüfer",
      "Expansion-Risikoklassifizierer",
    ],
  },
  {
    id: "rnd-hardware-infrastructure",
    from: 376,
    departmentId: 24,
    role: "R&D-, Hardware- & Infrastruktur-Fachassistent",
    tool: "HEL",
    mission: "Prüft Betriebsmetriken und dokumentierte Systemänderungen; führt keine ungeprüften Produktiv-Patches aus.",
    names: [
      "API-Änderungsbeobachter", "Joblaufzeit-Analyst", "Datenbank-Kapazitätsprüfer",
      "Schnittstellen-Vertragsassistent", "Shopify-Version-Monitor", "Cloud-Kosten-Wächter",
      "Backup-Integritäts-Prüfer", "Event-Bus-Qualitätsanalyst", "Hardware-Kompatibilitätsassistent",
      "xTool-Profil-Dokumentar", "Fehlerbild-Klassifizierer", "Performance-Budget-Prüfer",
      "Datensouveränitäts-Assistent", "Release-Risiko-Analyst", "Betriebsdokumentations-Pfleger",
    ],
  },
  {
    id: "appstore-saas",
    from: 391,
    departmentId: 25,
    role: "App-Store- & SaaS-Fachassistent",
    tool: "BRF",
    mission: "Bereitet App-Store-, Subscription- und Mandanten-Checks anhand der vorhandenen Projektdaten vor.",
    names: [
      "App-Store-Listing-Prüfer", "Subscription-Paket-Analyst", "Mandanten-Isolations-Prüfer",
      "Onboarding-Abschluss-Analyst", "Billing-Ereignis-Dokumentar", "App-Store-Richtlinien-Indexierer",
      "Tenant-Konfigurationsassistent", "SaaS-Kennzahlen-Analyst", "Support-Deflection-Analyst",
    ],
  },
];

export const APEX_SYSTEM_COORDINATOR = {
  id: "apex-system-coordinator",
  number: 400,
  departmentId: 24,
  role: "System-Koordinator",
  tool: "BRF" as const,
  mission: "Fasst vorhandene Systemereignisse und freigegebene Statusdaten zusammen; erzeugt keine ungeprüften Aktionen.",
  name: "Apex-System-Koordinator",
};
