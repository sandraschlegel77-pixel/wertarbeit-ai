import type { ToolCode } from "./roster-tools";

/** Fachgremien Abt. 21–24: [Nummer, Name, Mission, Tool, Abteilung, Berichtet an]. */
export const PANEL_ROWS: [number, string, string, ToolCode, number, number][] = [
  [162, "Fachanwalt Widerrufs- & Fernabsatzrecht", "§ 312g BGB, Individualanfertigungen", "RUL", 21, 171],
  [163, "Fachanwalt Wettbewerbsrecht & UWG", "§ 7 UWG, Irreführung, Abmahnschutz", "RUL", 21, 171],
  [164, "Fachanwalt Datenschutz (DSGVO)", "DSGVO, Webhooks, Löschfristen", "RUL", 21, 171],
  [165, "Fachanwalt Produktsicherheit (GPSR)", "EU-GPSR, Kennzeichnung", "RUL", 21, 171],
  [166, "Fachanwalt Barrierefreiheit (BFSG)", "BFSG, Alt-Texte, Bedienbarkeit", "RUL", 21, 171],
  [167, "Fachanwalt Preisangaben (PAngV)", "§ 11 PAngV, Streichpreise", "RUL", 21, 171],
  [168, "Fachanwalt Plattform-Policies", "Shopify, eBay, Etsy, Kaufland, Meta", "RUL", 21, 171],
  [169, "Fachanwalt Marken- & Urheberrecht", "Bilder, GEMA-freie Audio, Marken", "RUL", 21, 171],
  [170, "Fachanwalt Verbraucher- & Gewährleistungsrecht", "Gewährleistung, Garantie, Retouren", "RUL", 21, 171],
  [171, "Chief General Counsel", "Letztentscheid LEGAL_VERIFIED_3X", "RUL", 21, 160],
  [172, "Prüfer Umsatzsteuer & EU-OSS", "USt, OSS-Schwelle 8.500/10.000 €", "FIN", 22, 176],
  [173, "Prüfer Zoll & HS-Code", "CN22/CN23, Proforma CH/UK/USA", "FIN", 22, 176],
  [174, "Prüfer ZUGFeRD, DATEV & LUCID", "E-Rechnung, DATEV, Verpackungsgesetz", "FIN", 22, 176],
  [175, "Margen-Revisor", "Edelmetall- & Margen-Kontrolle", "PRF", 22, 176],
  [176, "Chief Tax & Audit Officer", "Letztentscheid FINANCE_VERIFIED_3X", "PRF", 22, 159],
  [177, "Meister Goldschmiede, GRA & Unikat", "Echtheit, Unikat-Logik, GRA-Nummern", "GRA", 23, 180],
  [178, "Meister xTool-Lasergravur", "SVG-Gravur, Schriftarten, Material", "BSP", 23, 180],
  [179, "Meister Geschenk & Digitaler Produktpass", "Grußkarte, DPP, Geschenk-Botschaft", "VLT", 23, 180],
  [180, "Chief Master Craftsman", "Letztentscheid CRAFT_VERIFIED_3X", "VLT", 23, 160],
  [181, "Workflow-Dirigent", "Reihenfolge & Abhängigkeiten", "BRF", 24, 185],
  [182, "Echtzeit-Daten-Synchronisierer", "Einheitlicher Datenstand", "MST", 24, 185],
  [183, "UI-Speed-Optimierer", "Antwortzeit unter 150 ms", "BRF", 24, 185],
  [184, "Anti-Kollisions- & Last-Ausgleicher", "Entity-Locks, Lastverteilung", "HEL", 24, 185],
  [185, "System-Harmonie-Auditor", "Harmonie- & Speed-Score", "HEL", 24, 160],
];
