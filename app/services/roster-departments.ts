import type { AuditDomain, DepartmentDef } from "./agent-types";
import type { ToolCode } from "./roster-tools";

type DeptRow = [
  id: number,
  name: string,
  mechanism: string,
  kind: DepartmentDef["kind"],
  audit: AuditDomain | null,
  valueHintEur: number,
];

/** 26 Abteilungen. */
export const DEPT_ROWS: DeptRow[] = [
  [1, "Brand-DNA & Inhaber-Regeln", "Schützt Markenwert & Entscheidungen des Inhabers", "core", null, 40],
  [2, "Auto-Listing & Katalog", "Spart Listing-Zeit, mehr Produkte online", "core", null, 120],
  [3, "Studio-Medien & Video", "Studio-Fotos/Reels steigern Conversion", "core", null, 150],
  [4, "Premium-Startseite & Design", "Edle Struktur erhöht Warenkorbwert", "core", null, 130],
  [5, "Unikate & Ringgrößen", "Weniger Retouren, höhere Unikat-Preise", "core", "CRAFT", 140],
  [6, "Texte, SEO & UCP", "Mehr organische & KI-Suchtreffer", "core", "LEGAL", 160],
  [7, "Multichannel-Sync", "Zusatzumsatz über weitere Kanäle", "core", null, 220],
  [8, "Zero-Stock-Dropshipping", "Umsatz ohne Lagerbindung", "core", null, 200],
  [9, "Preise, Repricer & Margen", "Maximalgewinn je Artikel (§ 11 PAngV)", "core", "FINANCE", 260],
  [10, "Einkauf & Lieferanten", "Bessere Einkaufspreise & Staffeln", "core", null, 180],
  [11, "Nischen- & Trend-Jäger", "Neue Nischen = neue Umsatzquellen", "core", null, 170],
  [12, "Rechnungen & Buchhaltung", "Zeit- & Steuerberater-Ersparnis", "core", "FINANCE", 110],
  [13, "Versand, Zoll & Verpackung", "Weniger Zoll-/Versandfehler", "core", "FINANCE", 90],
  [14, "Kundenservice & Retouren", "Weniger Retouren & Chargebacks", "core", "LEGAL", 100],
  [15, "E-Mail-Autopilot & Concierge", "Mehr Wiederkäufe durch Betreuung", "core", "LEGAL", 150],
  [16, "Armada: Wachstum & B2B", "Neue B2B-Kunden (§ 7 UWG)", "armada", "LEGAL", 300],
  [17, "Armada: Treue & Upsell", "Wiederkauf & Bündel-Umsatz", "armada", "LEGAL", 240],
  [18, "Armada: Warenkorb & Bewertungen", "Rückgewonnene Warenkörbe", "armada", "LEGAL", 280],
  [19, "Armada: Legal-Rewards & Förderung", "Gebühren-Rückerstattung, Fördermittel", "armada", "FINANCE", 320],
  [20, "Armada: Markt-Radar & Preise", "Preis-Chancen & Wettbewerbsvorteil", "armada", null, 260],
  [21, "KI-Justiziariat", "3×-Rechtsprüfung (LEGAL_VERIFIED_3X)", "panel", "LEGAL", 0],
  [22, "KI-Steuer- & Prüfungs-Kammer", "3×-Finanzprüfung (FINANCE_VERIFIED_3X)", "panel", "FINANCE", 0],
  [23, "KI-Meisterwerkstatt-Abnahme", "3×-Qualitätsprüfung (CRAFT_VERIFIED_3X)", "panel", "CRAFT", 0],
  [24, "KI-Orchestrierung & Harmonie", "Keine Konflikte, maximale Geschwindigkeit", "harmony", null, 0],
  [25, "Plattform- & API-Armada", "Geprüfte Kanal-, Bestands- und Feed-Vorbereitung", "armada", null, 180],
  [26, "1-Klick-Vorbereitung & Lokal-/Handwerks-Armada", "Verifizierte Entwürfe zentral und freigabepflichtig bereitstellen", "armada", null, 180],
];

/** Direktoren #153–#157, je 4 Abteilungen (1–20). */
export const DIRECTORS = [
  { n: 153, name: "Direktor Marke, Design & Studio", reportsTo: 158, depts: [1, 2, 3, 4] },
  { n: 154, name: "Direktor Katalog, Texte & Kanäle", reportsTo: 158, depts: [5, 6, 7, 8] },
  { n: 155, name: "Direktor Preise, Einkauf & Markt", reportsTo: 159, depts: [9, 10, 11, 12] },
  { n: 156, name: "Direktor Betrieb, Versand & Service", reportsTo: 160, depts: [13, 14, 15, 16] },
  { n: 157, name: "Direktor Hintergrund-Geld-Armada", reportsTo: 159, depts: [17, 18, 19, 20] },
];

/** KI-Vorstand #158–#161 (Ebene 1). */
export const BOARD: { n: number; name: string; role: string; reportsTo: number | null; tool: ToolCode }[] = [
  { n: 158, name: "KI-CEO", role: "Gesamtsteuerung nach OwnerRule", reportsTo: null, tool: "BRF" },
  { n: 159, name: "KI-CFO & Chief Revenue Officer", role: "Finanzen & Verdienst-Maximierung", reportsTo: 158, tool: "PRF" },
  { n: 160, name: "KI-COO & Chief Compliance Officer", role: "Betrieb & Compliance", reportsTo: 158, tool: "BRF" },
  { n: 161, name: "Chief AI Evolution Officer", role: "Selbst-Weiterentwicklung & KI-Fabrik #221→∞", reportsTo: 158, tool: "BRF" },
];

/** Teamleiter-Nummernbereiche je Abteilung (1–20), 66 Teamleiter gesamt. */
export const TEAM_RANGE: Record<number, [number, number]> = {
  1: [1, 3], 2: [4, 6], 3: [7, 9], 4: [10, 12], 5: [13, 15], 6: [16, 18], 7: [19, 21],
  8: [22, 24], 9: [25, 27], 10: [28, 30], 11: [31, 33], 12: [34, 36], 13: [37, 39],
  14: [40, 42], 15: [43, 45], 16: [46, 49], 17: [50, 53], 18: [54, 57], 19: [58, 61],
  20: [62, 66],
};
