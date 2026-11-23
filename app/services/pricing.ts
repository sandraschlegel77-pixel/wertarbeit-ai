/** Baukasten-Preise (client- und server-sicher). Single Source of Truth. */

export interface BuildingModule {
  id: string;
  label: string;
  short: string;
  priceEur: number;
  description: string;
  savingsPerMonth: string;
  estimatedHoursPerMonth: number;
}

export const CORE_LABEL = "AtelierPilot AI Core";
export const ALL_IN_ONE_PRICE = 79.9;
export const TRIAL_DAYS = 14;

export const BUILDING_MODULES: BuildingModule[] = [
  {
    id: "m1",
    label: "Modul 1 – Starter Auto-Listing, Premium-Design & Studio-Medien",
    short: "Listing & Studio",
    priceEur: 14.9,
    description:
      "Handyfoto/Video zu fertigem Listing, Freistellen auf Weiß (2048×2048), zweisprachige Texte, Premium-Startseiten-Architekt.",
    savingsPerMonth: "ca. 12 Std. Arbeit · ca. 180 € Fotograf/Texter",
    estimatedHoursPerMonth: 12,
  },
  {
    id: "m2",
    label: "Modul 2 – E-Rechnungen ZUGFeRD, DATEV, LUCID & Rechts-Auto-Updater",
    short: "Recht & Steuer",
    priceEur: 19.9,
    description:
      "ZUGFeRD/XRechnung, DATEV-Export, EU-OSS-Wächter, CN22/23, LUCID, Steuerberater-ZIP, autonomer Rechtstext-Updater mit Rollback.",
    savingsPerMonth: "ca. 8 Std. Buchhaltung · ca. 120 € Steuerberater",
    estimatedHoursPerMonth: 8,
  },
  {
    id: "m3",
    label: "Modul 3 – KI-E-Mail-Autopilot, § 7 UWG B2B & Social-Reels",
    short: "E-Mail & B2B",
    priceEur: 19.9,
    description:
      "Gmail/IMAP-Autopilot mit 4–11 Min. Verzögerung, § 7 Abs. 3 UWG-Kampagnen, DIN-A4-Postbriefe, Reels (GEMA-frei).",
    savingsPerMonth: "ca. 10 Std. Kundenkommunikation",
    estimatedHoursPerMonth: 10,
  },
  {
    id: "m4",
    label: "Modul 4 – Multichannel-Sync & Zero-Stock-Dropshipping",
    short: "Multichannel",
    priceEur: 24.9,
    description:
      "Shopify, eBay, Etsy (Handmade-Filter), Kaufland, Google, Pinterest, DE/EU-Streckenlieferanten, Sendungs-Stau-Retter, § 11 PAngV.",
    savingsPerMonth: "ca. 15 Std. Pflege · ca. 90 € Sync-Apps",
    estimatedHoursPerMonth: 15,
  },
  {
    id: "m5",
    label: "Modul 5 – GRA-Zertifikate, Digitaler Produktpass & xTool-Laser-Studio",
    short: "GRA & xTool",
    priceEur: 24.9,
    description:
      "GRA-Echtheitszertifikate, DPP mit QR, Wert-Dossier (PDF), xTool-SVG für Einzel- und B2B-Seriengravur.",
    savingsPerMonth: "ca. 6 Std. Dokumente · ca. 60 € Zertifikatsdienste",
    estimatedHoursPerMonth: 6,
  },
  {
    id: "m6",
    label: "Modul 6 – Markt-, Trend-, Konkurrenz- & Lieferanten-Verhandler",
    short: "Markt-Radar",
    priceEur: 29.9,
    description:
      "Trend-/Konkurrenz-/Null-Treffer-Radar, Bestpreis-Beschaffung, KI-Lieferanten-Verhandler, Legal-Rewards- & Fördermittel-Scout.",
    savingsPerMonth: "ca. 9 Std. Recherche · Einsparungen durch Staffelpreise",
    estimatedHoursPerMonth: 9,
  },
];

export interface Quote {
  selected: string[];
  count: number;
  listSum: number;
  discountPercent: number;
  monthly: number;
  yearlyTotal: number;
  billed: number;
  interval: "MONTHLY" | "YEARLY";
  allInOne: boolean;
  hint: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calcQuote(
  selectedIds: string[],
  yearly: boolean,
  isOwner: boolean
): Quote {
  const selected = BUILDING_MODULES.filter((m) => selectedIds.includes(m.id));
  const listSum = round2(selected.reduce((s, m) => s + m.priceEur, 0));
  const count = selected.length;
  const allInOne = count === BUILDING_MODULES.length;
  const discountPercent = allInOne ? 0 : count >= 3 ? 20 : count === 2 ? 10 : 0;
  let monthly = allInOne
    ? ALL_IN_ONE_PRICE
    : round2(listSum * (1 - discountPercent / 100));
  let hint: string | null = null;
  if (count >= 4 && !allInOne) {
    hint = `Ab 4 Modulen: Der All-in-One Komplett-Prozessor (alle 6 Module) kostet nur ${ALL_IN_ONE_PRICE.toFixed(2).replace(".", ",")} € / Monat (statt 134,40 €, 40 % Ersparnis).`;
  }
  if (isOwner) {
    monthly = 0;
    hint = "OWNER UNLIMITED (0,00 €) – wertarbeitmanufaktur.myshopify.com";
  }
  const yearlyTotal = round2(monthly * 10); // 2 Monate gratis
  return {
    selected: selected.map((m) => m.id),
    count,
    listSum,
    discountPercent,
    monthly,
    yearlyTotal,
    billed: yearly ? yearlyTotal : monthly,
    interval: yearly ? "YEARLY" : "MONTHLY",
    allInOne,
    hint,
  };
}

export const formatEur = (n: number): string =>
  `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;
