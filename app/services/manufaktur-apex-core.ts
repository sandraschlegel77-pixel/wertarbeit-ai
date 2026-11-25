import { validateWorkshopSvg } from "./platform-connectors-core";

export class ManufakturInputError extends Error {}

export interface XtoolSvgInput {
  engravingText: string;
  material: string;
  widthMm: number;
  heightMm: number;
  font?: "SERIF" | "SANS";
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildXtoolLayeredSvg(input: XtoolSvgInput) {
  const text = input.engravingText.trim();
  const material = input.material.trim();
  const { widthMm, heightMm } = input;
  if (text.length < 1 || text.length > 100 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) {
    throw new ManufakturInputError("Gravurtext muss 1 bis 100 druckbare Zeichen enthalten.");
  }
  if (material.length < 2 || material.length > 80) throw new ManufakturInputError("Materialangabe muss 2 bis 80 Zeichen enthalten.");
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) ||
      widthMm < 10 || widthMm > 600 || heightMm < 10 || heightMm > 600) {
    throw new ManufakturInputError("SVG-Maße müssen zwischen 10 und 600 mm liegen.");
  }
  const width = Number(widthMm.toFixed(2));
  const height = Number(heightMm.toFixed(2));
  const fontFamily = input.font === "SERIF" ? "serif" : "sans-serif";
  const fontSize = Math.max(3, Math.min(12, Math.min(width, height) * 0.18));
  const margin = Math.min(2, width / 10, height / 10);
  const escapedText = xmlEscape(text);
  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">`,
    `<title>${xmlEscape(material)} – Gravurdatei</title>`,
    `<g id="engrave" inkscape:groupmode="layer" inkscape:label="Gravur #000000" fill="none" stroke="#000000">`,
    `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" fill="#000000" stroke="none" font-family="${fontFamily}" font-size="${fontSize}">${escapedText}</text>`,
    `</g>`,
    `<g id="cut" inkscape:groupmode="layer" inkscape:label="Schnitt #FF0000" fill="none" stroke="#FF0000" stroke-width="0.1">`,
    `<rect x="${margin}" y="${margin}" width="${width - margin * 2}" height="${height - margin * 2}" />`,
    `</g>`,
    `<g id="alignment-frame" inkscape:groupmode="layer" inkscape:label="Ausrichtungsrahmen #0000FF" fill="none" stroke="#0000FF" stroke-width="0.1" stroke-dasharray="1,1">`,
    `<rect x="0.5" y="0.5" width="${Math.max(1, width - 1)}" height="${Math.max(1, height - 1)}" />`,
    `</g>`,
    `</svg>`,
  ].join("");
  try {
    validateWorkshopSvg(svg);
  } catch {
    throw new ManufakturInputError("SVG konnte die Sicherheitsprüfung nicht bestehen.");
  }
  return {
    svg,
    widthMm: width,
    heightMm: height,
    format: "SVG" as const,
    nativeXcsPresetCreated: false as const,
    note: "Layer-SVG erstellt. Ein nativer xTool-XCS-Projektpreset wird nicht vorgetäuscht; Laserleistung und Geschwindigkeit müssen im xTool-Programm materialabhängig festgelegt werden.",
  };
}

export function assertSellableUniqueInventory(inventory: number) {
  if (!Number.isInteger(inventory) || inventory < 0) {
    throw new ManufakturInputError("Lagerbestand muss eine nichtnegative ganze Zahl sein.");
  }
  if (inventory === 0) throw new ManufakturInputError("Unikat gesperrt: Shopify-Bestand ist 0; keine Anzeige oder Verlängerung erstellt.");
}

export function buildGs1DigitalLink(gtin: string) {
  const normalized = gtin.replace(/\s+/g, "");
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(normalized)) {
    throw new ManufakturInputError("Ein GS1 Digital Link benötigt einen 8-, 12-, 13- oder 14-stelligen GTIN.");
  }
  const digits = normalized.slice(0, -1).split("").reverse().map(Number);
  const sum = digits.reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  if (checkDigit !== Number(normalized.at(-1))) throw new ManufakturInputError("GTIN-Prüfziffer ist ungültig.");
  return `https://id.gs1.org/01/${normalized}`;
}

export type DppDisclosureRole = "PUBLIC" | "CONSUMER" | "BUSINESS_PARTNER" | "REGULATOR";

export interface DppFacts {
  gtin?: string;
  productName: string;
  material?: string;
  countryOfOrigin?: string;
  careInstructions?: string;
  batchOrSerial?: string;
  hsCode?: string;
  packagingMaterial?: string;
  supplierEvidence?: string;
  complianceDocuments?: string[];
}

export function projectDppFacts(facts: DppFacts, role: DppDisclosureRole) {
  const base = {
    productName: facts.productName,
    ...(facts.material ? { material: facts.material } : {}),
  };
  if (role === "PUBLIC") return base;
  if (role === "CONSUMER") {
    return {
      ...base,
      ...(facts.countryOfOrigin ? { countryOfOrigin: facts.countryOfOrigin } : {}),
      ...(facts.careInstructions ? { careInstructions: facts.careInstructions } : {}),
      ...(facts.gtin ? { digitalLink: buildGs1DigitalLink(facts.gtin) } : {}),
    };
  }
  if (role === "BUSINESS_PARTNER") {
    return {
      ...base,
      ...(facts.gtin ? { digitalLink: buildGs1DigitalLink(facts.gtin) } : {}),
      ...(facts.hsCode ? { hsCode: facts.hsCode } : {}),
      ...(facts.packagingMaterial ? { packagingMaterial: facts.packagingMaterial } : {}),
      ...(facts.supplierEvidence ? { supplierEvidence: facts.supplierEvidence } : {}),
    };
  }
  return {
    ...base,
    ...(facts.gtin ? { digitalLink: buildGs1DigitalLink(facts.gtin) } : {}),
    ...(facts.countryOfOrigin ? { countryOfOrigin: facts.countryOfOrigin } : {}),
    ...(facts.careInstructions ? { careInstructions: facts.careInstructions } : {}),
    ...(facts.batchOrSerial ? { batchOrSerial: facts.batchOrSerial } : {}),
    ...(facts.hsCode ? { hsCode: facts.hsCode } : {}),
    ...(facts.packagingMaterial ? { packagingMaterial: facts.packagingMaterial } : {}),
    ...(facts.supplierEvidence ? { supplierEvidence: facts.supplierEvidence } : {}),
    ...(facts.complianceDocuments ? { complianceDocuments: [...facts.complianceDocuments] } : {}),
  };
}
