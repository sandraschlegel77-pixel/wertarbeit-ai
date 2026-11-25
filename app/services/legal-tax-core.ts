export interface LegalRuleProfile {
  ruleKey: string;
  jurisdiction: string;
  sourceUrl: string;
  sourceTitle: string;
  scopeNote: string;
}

export const LEGAL_RULE_PROFILES: readonly LegalRuleProfile[] = [
  {
    ruleKey: "DE_PANGV_11_30_DAY_PRICE",
    jurisdiction: "DE",
    sourceUrl: "https://www.gesetze-im-internet.de/pangv_2022/__11.html",
    sourceTitle: "Preisangabenverordnung § 11",
    scopeNote: "30-Tage-Niedrigstpreis bei Bekanntgabe einer Preisermäßigung; Ausnahmen und Produktverlauf gesondert prüfen.",
  },
  {
    ruleKey: "DE_PANGV_4_UNIT_PRICE",
    jurisdiction: "DE",
    sourceUrl: "https://www.gesetze-im-internet.de/pangv_2022/__4.html",
    sourceTitle: "Preisangabenverordnung § 4",
    scopeNote: "Grundpreisangaben hängen von Art und Einheit des angebotenen Produkts und gesetzlichen Ausnahmen ab.",
  },
  {
    ruleKey: "DE_BGB_312G_WITHDRAWAL_EXCEPTION",
    jurisdiction: "DE",
    sourceUrl: "https://www.gesetze-im-internet.de/bgb/__312g.html",
    sourceTitle: "Bürgerliches Gesetzbuch § 312g",
    scopeNote: "Ausnahmen vom Widerrufsrecht sind einzelfallabhängig; Personalisierung allein ersetzt keine Prüfung der gesetzlichen Voraussetzungen.",
  },
  {
    ruleKey: "DE_BGB_356A_ELECTRONIC_WITHDRAWAL",
    jurisdiction: "DE",
    sourceUrl: "https://www.gesetze-im-internet.de/bgb/__356a.html",
    sourceTitle: "Bürgerliches Gesetzbuch § 356a",
    scopeNote: "Elektronische Widerrufsfunktion; konkrete UI- und Anwendungsanforderungen fachlich prüfen.",
  },
  {
    ruleKey: "EU_AI_ACT_ART50",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    sourceTitle: "Verordnung (EU) 2024/1689, Artikel 50",
    scopeNote: "Transparenzpflichten im Einzelfall prüfen. C2PA/IPTC sind nicht pauschal als alleinige gesetzliche Erfüllung hinterlegt.",
  },
  {
    ruleKey: "EU_PRODUCT_LIABILITY_2024_2853",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2024/2853/oj",
    sourceTitle: "Richtlinie (EU) 2024/2853",
    scopeNote: "Anwendungsbeginn, Umsetzung und digitale Produktdateien anhand des amtlichen Textes und des Einzelfalls prüfen.",
  },
  {
    ruleKey: "EU_EMPCO_2024_825",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2024/825/oj",
    sourceTitle: "Richtlinie (EU) 2024/825 – Verbraucherinformation und Green Claims",
    scopeNote: "Nationale Umsetzung, Fristen und konkrete Umweltaussage prüfen; keine automatische Rechtsfreigabe.",
  },
  {
    ruleKey: "EU_CONSUMER_CREDIT_2023_2225",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2023/2225/oj",
    sourceTitle: "Richtlinie (EU) 2023/2225 über Verbraucherkreditverträge",
    scopeNote: "BNPL- und Werbeanforderungen hängen von Produkt, Anbieterrolle und nationaler Umsetzung ab.",
  },
  {
    ruleKey: "EU_PPWR_2025_40",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2025/40/oj",
    sourceTitle: "Verordnung (EU) 2025/40 über Verpackungen und Verpackungsabfälle",
    scopeNote: "Leerraum- und Anwendungsanforderungen gelten nur im jeweiligen sachlichen und zeitlichen Anwendungsbereich.",
  },
  {
    ruleKey: "EU_EUDR_2023_1115",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1115/oj",
    sourceTitle: "Verordnung (EU) 2023/1115 über entwaldungsfreie Lieferketten",
    scopeNote: "Produktumfang, Unternehmensgröße, Übergangsfristen und Änderungen prüfen; nicht jedes Holzprodukt ist gleich zu behandeln.",
  },
  {
    ruleKey: "EU_VOP_2024_886",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/886/oj",
    sourceTitle: "Verordnung (EU) 2024/886 – Instant Payments und Verification of Payee",
    scopeNote: "Eine VoP-Antwort muss vom zuständigen Zahlungsdienstleister kommen; IBAN-Prüfsummen ersetzen sie nicht.",
  },
  {
    ruleKey: "EU_GDPR_2016_679",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    sourceTitle: "Verordnung (EU) 2016/679 – Datenschutz-Grundverordnung",
    scopeNote: "Lösch- und Auskunftspflichten mit gesetzlichen Aufbewahrungspflichten und Datenkategorien abgleichen.",
  },
  {
    ruleKey: "EU_SME_SCHEME_2020_285",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2020/285/oj",
    sourceTitle: "Richtlinie (EU) 2020/285 – Kleinunternehmerregelung",
    scopeNote: "Umsatzgrenzen, Mitgliedstaat und Registrierungsstatus sind anhand der aktuellen Umsetzung zu prüfen.",
  },
  {
    ruleKey: "EU_WASTE_ELECTRICAL_2012_19",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2012/19/oj",
    sourceTitle: "Richtlinie 2012/19/EU über Elektro- und Elektronik-Altgeräte",
    scopeNote: "Produkt- und Herstellerpflichten einschließlich deutscher Umsetzung prüfen.",
  },
  {
    ruleKey: "EU_BATTERIES_2023_1542",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj",
    sourceTitle: "Verordnung (EU) 2023/1542 über Batterien und Altbatterien",
    scopeNote: "Anforderungen nach Batterieart, Rolle und jeweiligem Anwendungsdatum prüfen.",
  },
  {
    ruleKey: "EU_CYBER_RESILIENCE_2024_2847",
    jurisdiction: "EU",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/2847/oj",
    sourceTitle: "Verordnung (EU) 2024/2847 – Cyber Resilience Act",
    scopeNote: "Anwendungsbereich und Übergangsfristen hängen unter anderem von Produktart und Rolle ab.",
  },
  {
    ruleKey: "DE_BFSG",
    jurisdiction: "DE",
    sourceUrl: "https://www.gesetze-im-internet.de/bfsg/",
    sourceTitle: "Barrierefreiheitsstärkungsgesetz",
    scopeNote: "Anwendungsbereich, Ausnahmen und Übergangsbestimmungen für das konkrete Angebot prüfen.",
  },
  {
    ruleKey: "DE_GWG_2017",
    jurisdiction: "DE",
    sourceUrl: "https://www.gesetze-im-internet.de/gwg_2017/",
    sourceTitle: "Geldwäschegesetz",
    scopeNote: "Pflichten hängen von Verpflichtetenstatus, Tätigkeit und einschlägigen Schwellen ab.",
  },
] as const;

export const UNVERIFIED_REQUESTED_CLAIMS = [
  { claim: "ZUGFeRD 2.4 / Factur-X 1.08 mit BMF-Schreiben vom 15.10.2026 als pauschaler Pflichtstandard", reason: "Kein verifizierter amtlicher Beleg für die behauptete Kombination hinterlegt." },
  { claim: "8.500 EUR als gesetzliche EU-OSS-Schwelle", reason: "8.500 EUR ist hier nicht als gesetzliche Schwelle belegt; 10.000 EUR darf nicht ohne vollständige Umsatzdaten angewendet werden." },
  { claim: "ICS2/Zoll pauschal 3 EUR plus 2 EUR Bearbeitungsgebühr", reason: "Gebühren hängen von Dienstleister, Sendung und aktueller Rechtslage ab; kein allgemeingültiger Tarif nachgewiesen." },
  { claim: "Creators COM(2026) 1100", reason: "Fundstelle und Rechtswirkung sind nicht verifiziert." },
  { claim: "3,6-%-Steuerrücklage und 10.000-EUR-Bar-Sperre aus einem Jahressteuergesetz 2026", reason: "Keine verifizierte amtliche Fundstelle oder allgemeine Pflicht nachgewiesen." },
  { claim: "500-EUR-Valoren-Schutz als allgemeine Rechtsgrenze", reason: "Versicherungsschutz ist tarif-/vertragsspezifisch und keine allgemeine gesetzliche Grenze." },
] as const;

export function checkThirtyDayLowestPrice(input: {
  history: { priceEur: number; effectiveAt: string }[];
  declaredReferencePriceEur: number | null;
  checkedAt: Date;
}) {
  const start = input.checkedAt.getTime() - 30 * 24 * 60 * 60 * 1000;
  if (!input.history.length || input.history.length > 10_000 ||
      input.history.some((entry) => !Number.isFinite(entry.priceEur) || entry.priceEur < 0 || !Number.isFinite(Date.parse(entry.effectiveAt)))) {
    return { status: "INCOMPLETE_HISTORY" as const, lowestPriceEur: null };
  }
  const history = [...input.history]
    .map((entry) => ({ priceEur: entry.priceEur, effectiveAt: Date.parse(entry.effectiveAt) }))
    .filter((entry) => entry.effectiveAt <= input.checkedAt.getTime())
    .sort((a, b) => a.effectiveAt - b.effectiveAt);
  const baseline = history.filter((entry) => entry.effectiveAt <= start).at(-1);
  if (!baseline) return { status: "INCOMPLETE_HISTORY" as const, lowestPriceEur: null };
  const relevant = [baseline, ...history.filter((entry) => entry.effectiveAt > start)];
  const lowestPriceEur = Math.min(...relevant.map((entry) => entry.priceEur));
  if (input.declaredReferencePriceEur === null || !Number.isFinite(input.declaredReferencePriceEur)) {
    return { status: "REFERENCE_PRICE_REQUIRED" as const, lowestPriceEur };
  }
  const declared = Math.round(input.declaredReferencePriceEur * 100) / 100;
  return {
    status: Math.abs(declared - lowestPriceEur) <= 0.01 ? "REFERENCE_MATCHES_HISTORY" as const : "REFERENCE_PRICE_MISMATCH" as const,
    lowestPriceEur,
  };
}

export function normalizeHsCode(value: string): string | null {
  const digits = value.replace(/[.\s-]/g, "");
  return /^\d{6}$/.test(digits) ? digits : null;
}

export function assessEuDistanceSales(input: {
  crossBorderB2cEur: number;
  periodComplete: boolean;
}) {
  const amount = input.crossBorderB2cEur;
  if (!input.periodComplete || !Number.isFinite(amount) || amount < 0) {
    return { status: "INCOMPLETE_DATA" as const, amountEur: null, thresholdEur: 10_000, warningEur: 8_500 };
  }
  return {
    status: amount >= 10_000 ? "THRESHOLD_REACHED" as const : amount >= 8_500 ? "APPROACHING_THRESHOLD" as const : "BELOW_WARNING" as const,
    amountEur: Math.round(amount * 100) / 100,
    thresholdEur: 10_000,
    warningEur: 8_500,
    note: "10.000 EUR ist die Prüfschwelle; 8.500 EUR ist nur ein interner Frühwarnwert. Vollständige EU-Umsätze und steuerliche Einordnung sind erforderlich.",
  };
}

export function assessEuSmeTurnover(input: { unionAnnualTurnoverEur: number; recordsComplete: boolean }) {
  if (!input.recordsComplete || !Number.isFinite(input.unionAnnualTurnoverEur) || input.unionAnnualTurnoverEur < 0) {
    return { status: "INCOMPLETE_DATA" as const, thresholdEur: 100_000, turnoverEur: null };
  }
  return {
    status: input.unionAnnualTurnoverEur <= 100_000 ? "SCREENING_WITHIN_LIMIT" as const : "SCREENING_OVER_LIMIT" as const,
    thresholdEur: 100_000,
    turnoverEur: Math.round(input.unionAnnualTurnoverEur * 100) / 100,
    note: "Nur Vorprüfung der unionsweiten Umsatzgrenze; nationale Registrierung, Ausnahmen und sonstige Voraussetzungen bleiben zu prüfen.",
  };
}

export function calculateUnitPrice(input: { priceEur: number; quantity: number; unit: "g" | "kg" | "ml" | "l" | "cm" | "m" | "cm2" | "m2" }) {
  if (!Number.isFinite(input.priceEur) || input.priceEur < 0 ||
      !Number.isFinite(input.quantity) || input.quantity <= 0) {
    return { status: "INVALID_MEASUREMENT" as const, unitPriceEur: null, displayUnit: null };
  }
  const groups = {
    g: { factor: 1000, displayUnit: "kg" },
    kg: { factor: 1, displayUnit: "kg" },
    ml: { factor: 1000, displayUnit: "l" },
    l: { factor: 1, displayUnit: "l" },
    cm: { factor: 100, displayUnit: "m" },
    m: { factor: 1, displayUnit: "m" },
    cm2: { factor: 10_000, displayUnit: "m²" },
    m2: { factor: 1, displayUnit: "m²" },
  } as const;
  const conversion = groups[input.unit];
  return {
    status: "CALCULATED_REQUIRES_APPLICABILITY_REVIEW" as const,
    unitPriceEur: Math.round(input.priceEur / (input.quantity / conversion.factor) * 100) / 100,
    displayUnit: conversion.displayUnit,
  };
}

export function assessPackagingVoidRatio(input: { packageVolumeCm3: number; productVolumeCm3: number }) {
  const { packageVolumeCm3, productVolumeCm3 } = input;
  if (!Number.isFinite(packageVolumeCm3) || !Number.isFinite(productVolumeCm3) ||
      packageVolumeCm3 <= 0 || productVolumeCm3 < 0 || productVolumeCm3 > packageVolumeCm3) {
    return { status: "INVALID_MEASUREMENTS" as const, voidRatio: null, screeningLimit: 0.5 };
  }
  const voidRatio = (packageVolumeCm3 - productVolumeCm3) / packageVolumeCm3;
  return {
    status: voidRatio <= 0.5 ? "SCREENING_WITHIN_LIMIT" as const : "SCREENING_OVER_LIMIT" as const,
    voidRatio,
    screeningLimit: 0.5,
    note: "Geometrische Vorprüfung; Anwendungsbereich und gesetzliche Berechnung der PPWR im Einzelfall prüfen.",
  };
}

export function prepareCustomsDeclarationReview(input: {
  goodsDescription: string;
  hsCode: string;
  declaredValueEur: number;
  destinationCountry: string;
}) {
  const goodsDescription = input.goodsDescription.trim();
  const hsCode = normalizeHsCode(input.hsCode);
  const destinationCountry = input.destinationCountry.trim().toUpperCase();
  if (goodsDescription.length < 3 || goodsDescription.length > 200 ||
      !hsCode || !/^[A-Z]{2}$/.test(destinationCountry) ||
      !Number.isFinite(input.declaredValueEur) || input.declaredValueEur <= 0) {
    return { status: "INCOMPLETE_DECLARATION" as const, hsCode, dutyEstimateEur: null, handlingEstimateEur: null };
  }
  return {
    status: "READY_FOR_MANUAL_CUSTOMS_REVIEW" as const,
    goodsDescription,
    hsCode,
    declaredValueEur: Math.round(input.declaredValueEur * 100) / 100,
    destinationCountry,
    dutyEstimateEur: null,
    handlingEstimateEur: null,
    note: "Zoll, Einfuhrumsatzsteuer und Carrier-Gebühren sind mangels TARIC-, Ursprungs-, Versand- und Carrier-Daten nicht berechnet.",
  };
}

function validIbanChecksum(iban: string) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = char >= "A" && char <= "Z" ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export function buildEpcGiroCodePayload(input: {
  beneficiary: string;
  iban: string;
  bic?: string;
  amountEur: number;
  remittance?: string;
}) {
  const beneficiary = input.beneficiary.trim();
  const bic = (input.bic ?? "").trim().toUpperCase();
  const iban = input.iban.replace(/\s+/g, "").toUpperCase();
  const remittance = (input.remittance ?? "").replace(/[\r\n]/g, " ").trim();
  if (beneficiary.length < 2 || beneficiary.length > 70 || /[\r\n]/.test(input.beneficiary)) {
    throw new Error("Begünstigtenname muss 2 bis 70 Zeichen umfassen und einzeilig sein.");
  }
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) || !validIbanChecksum(iban)) {
    throw new Error("IBAN-Format oder Prüfsumme ist ungültig.");
  }
  if (bic && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(bic)) throw new Error("BIC-Format ist ungültig.");
  if (!Number.isFinite(input.amountEur) || input.amountEur <= 0 || input.amountEur > 999_999_999.99) {
    throw new Error("Zahlbetrag muss größer 0 EUR und höchstens 999.999.999,99 EUR sein.");
  }
  if (remittance.length > 140) throw new Error("Verwendungszweck darf höchstens 140 Zeichen umfassen.");
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    beneficiary,
    iban,
    `EUR${input.amountEur.toFixed(2)}`,
    "",
    remittance,
    "",
  ].join("\n");
}
