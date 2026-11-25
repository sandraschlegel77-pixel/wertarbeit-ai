import { ZipArchive } from "archiver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont } from "pdf-lib";
import db from "../db.server";
import { validateWorkshopSvg } from "./platform-connectors-core";
import { readWorkshopSvg } from "./platform-connectors.server";
import { getShopBrandDocumentSettings } from "./shop-settings.server";
import { UNVERIFIED_REQUESTED_CLAIMS } from "./legal-tax-core";

export interface VaultDocumentSnapshot {
  available: boolean;
  message: string | null;
  invoices: { id: string; invoiceNo: string; orderId: string; amount: string; currency: string; createdAt: string }[];
  certificates: { id: string; certificateNo: string; stoneType: string | null; carat: string | null }[];
  svgs: { id: string; orderId: string | null; sku: string | null; gravurText: string; material: string | null; createdAt: string }[];
}

export class VaultDownloadNotFoundError extends Error {}

export class VaultDownloadUnavailableError extends Error {}

export interface VaultDownload {
  body: Buffer;
  contentType: string;
  filename: string;
}

export async function getVaultDocumentSnapshot(shop: string): Promise<VaultDocumentSnapshot> {
  try {
    const [invoices, certificates, svgs] = await Promise.all([
      db.invoice.findMany({
        where: { shop },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, invoiceNo: true, orderId: true, amount: true, currency: true, createdAt: true },
      }),
      db.graCertificate.findMany({
        where: { shop },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, certificateNo: true, stoneType: true, carat: true },
      }),
      db.xtoolSvg.findMany({
        where: { shop },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, orderId: true, sku: true, gravurText: true, material: true, createdAt: true },
      }),
    ]);
    return {
      available: true,
      message: null,
      invoices: invoices.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      certificates,
      svgs: svgs.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    };
  } catch {
    console.error("[vault-downloads] Tresor-Datensätze konnten nicht geladen werden.");
    return {
      available: false,
      message: "Tresor-Datensätze sind nicht verfügbar. Datenbankverbindung und Schema prüfen.",
      invoices: [],
      certificates: [],
      svgs: [],
    };
  }
}

function safeFilename(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "dokument";
}

function pdfText(value: unknown) {
  const normalized = String(value ?? "").split("").map((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? " " : character;
  }).join("");
  const singleLine = normalized
    .replace(/€/g, " EUR")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...");
  return Array.from(singleLine, (character) => {
    const code = character.codePointAt(0) ?? 0;
    return code >= 32 && code <= 255 ? character : "?";
  }).join("");
}

function colorFromHex(value: string) {
  const normalized = /^#[\da-f]{6}$/i.test(value) ? value.slice(1) : "172033";
  return rgb(
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255
  );
}

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = pdfText(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

async function renderPdf(
  settings: Awaited<ReturnType<typeof getShopBrandDocumentSettings>>,
  title: string,
  lines: string[],
  pageSize: [number, number] = [595.28, 841.89]
) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const page = document.addPage(pageSize);
  const [width, height] = pageSize;
  const margin = 42;
  const primary = colorFromHex(settings.primaryColor);
  const accent = colorFromHex(settings.accentColor);
  page.drawRectangle({ x: 0, y: height - 62, width, height: 62, color: primary });
  page.drawText(pdfText(settings.businessName), { x: margin, y: height - 38, size: 15, font: bold, color: rgb(1, 1, 1) });
  page.drawText(pdfText(title), { x: margin, y: height - 90, size: settings.fontStyle === "CLASSIC" ? 16 : 18, font: bold, color: primary });
  page.drawRectangle({ x: margin, y: height - 101, width: width - margin * 2, height: 2, color: accent });

  if (settings.invoiceLogoBase64) {
    const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(settings.invoiceLogoBase64);
    if (match) {
      const bytes = Buffer.from(match[2], "base64");
      const image = match[1] === "png" ? await document.embedPng(bytes) : await document.embedJpg(bytes);
      const dimensions = image.scale(Math.min(1, 110 / image.width, 42 / image.height));
      page.drawImage(image, { x: width - margin - dimensions.width, y: height - 54, ...dimensions });
    }
  }

  let currentPage = page;
  let y = height - 130;
  for (const rawLine of lines) {
    const isHeading = rawLine.startsWith("## ");
    const content = isHeading ? rawLine.slice(3) : rawLine;
    const size = isHeading ? 12 : 10;
    const activeFont = isHeading ? bold : font;
    for (const line of wrapLine(content, activeFont, size, width - margin * 2)) {
      if (y < 48) {
        currentPage = document.addPage(pageSize);
        y = height - 48;
      }
      currentPage.drawText(line, { x: margin, y, size, font: activeFont, color: isHeading ? accent : rgb(0.12, 0.14, 0.18) });
      y -= isHeading ? 20 : 15;
    }
    if (!content) y -= 6;
  }
  return Buffer.from(await document.save());
}

async function loadSettings(shop: string) {
  const settings = await getShopBrandDocumentSettings(shop);
  if (!settings.available) throw new VaultDownloadUnavailableError(settings.message ?? "Brand-Einstellungen nicht verfügbar.");
  return settings;
}

async function invoicePdf(shop: string, id: string): Promise<VaultDownload> {
  const invoice = await db.invoice.findFirst({ where: { shop, id } });
  if (!invoice) throw new VaultDownloadNotFoundError("Rechnung wurde für diesen Shop nicht gefunden.");
  const settings = await loadSettings(shop);
  const lines = [
    "ENTWURF - KEINE ZUGFeRD-/XRECHNUNG UND KEIN PDF/A-3-DOKUMENT",
    "Dieses Datenblatt ersetzt keine vollständige Rechnung. Rechnungsanschrift, Steuerangaben und Positionen liegen im aktuellen Quelldatensatz nicht vollständig vor.",
    "",
    "## Gespeicherte Datensatzfelder",
    `Rechnungsnummer: ${invoice.invoiceNo}`,
    `Bestellreferenz: ${invoice.orderId}`,
    `Betrag: ${invoice.amount} ${invoice.currency}`,
    `Steuermodus (gespeicherte Kennzeichnung): ${invoice.taxMode}`,
    `Erstellt: ${invoice.createdAt.toISOString()}`,
    `ZUGFeRD-XML im Datensatz vorhanden: ${invoice.zugferdXml ? "Ja; XML wird nicht auf Normkonformität geprüft." : "Nein"}`,
    "",
    "Vor steuerlicher Verwendung bitte durch Buchhaltung/Steuerberatung vervollständigen und prüfen lassen.",
  ];
  return {
    body: await renderPdf(settings, "Rechnungsdatenblatt - Entwurf", lines),
    contentType: "application/pdf",
    filename: `rechnungsdatenblatt-${safeFilename(invoice.invoiceNo)}.pdf`,
  };
}

async function graDossier(shop: string, id: string): Promise<VaultDownload> {
  const certificate = await db.graCertificate.findFirst({ where: { shop, id } });
  if (!certificate) throw new VaultDownloadNotFoundError("Zertifikatsdatensatz wurde für diesen Shop nicht gefunden.");
  const settings = await loadSettings(shop);
  const lines = [
    "DATENPASS-DOSSIER AUS INTERN GESPEICHERTEN ANGABEN",
    "Kein offizielles GRA-Zertifikat und kein Nachweis einer externen Zertifikatsprüfung.",
    "",
    "## Gespeicherte Angaben",
    `Referenz: ${certificate.certificateNo}`,
    `Steinart: ${certificate.stoneType ?? "Nicht angegeben"}`,
    `Karat: ${certificate.carat ?? "Nicht angegeben"}`,
    `Bestellreferenz: ${certificate.orderId ?? "Nicht angegeben"}`,
    `Produktreferenz: ${certificate.productId ?? "Nicht angegeben"}`,
    `DPP-Link: ${certificate.qrDppUrl ?? "Nicht hinterlegt"}`,
    `Datensatz erstellt: ${certificate.createdAt.toISOString()}`,
    "",
    "Prüfen Sie Steinangaben und Originalbelege vor einer Weitergabe.",
  ];
  return {
    body: await renderPdf(settings, "DPP-Dossier - Datensatzkopie", lines),
    contentType: "application/pdf",
    filename: `dpp-dossier-${safeFilename(certificate.certificateNo)}.pdf`,
  };
}

async function a6Card(shop: string): Promise<VaultDownload> {
  const settings = await loadSettings(shop);
  return {
    body: await renderPdf(settings, "Paket-Grußkarte", [
      "",
      "## Vielen Dank",
      settings.greeting,
      "",
      "Wir freuen uns, dass Sie ein Stück unserer Manufaktur gewählt haben.",
      "",
      "Herzliche Grüße",
      settings.businessName,
    ], [297.64, 419.53]),
    contentType: "application/pdf",
    filename: "atelierpilot-paket-grusskarte-a6.pdf",
  };
}

async function b2bLetter(shop: string): Promise<VaultDownload> {
  const settings = await loadSettings(shop);
  const lines = [
    "ENTWURF - Empfaenger-, Angebots- und Vertragsdaten vor Versand ergaenzen.",
    "",
    "## Betreff",
    "[Angebot / Zusammenarbeit]",
    "",
    "Sehr geehrte Damen und Herren,",
    "",
    "[Individuelles Anschreiben und Angebotsdetails einfuegen.]",
    "",
    settings.greeting,
    "",
    "Mit freundlichen Gruessen",
    settings.businessName,
  ];
  if (settings.bankName || settings.iban) {
    lines.push("", "## Bankverbindung (verschluesselt gespeicherte Shop-Angaben)", settings.bankName, `IBAN: ${settings.iban}`, `BIC: ${settings.bic}`);
  }
  return {
    body: await renderPdf(settings, "B2B-Begleitschreiben - Entwurf", lines),
    contentType: "application/pdf",
    filename: "atelierpilot-b2b-begleitschreiben-entwurf.pdf",
  };
}

async function chargebackTemplate(shop: string): Promise<VaultDownload> {
  const settings = await loadSettings(shop);
  return {
    body: await renderPdf(settings, "Chargeback-Nachweis - Checkliste", [
      "LEERE VORLAGE - ENTHAELT KEINE BESTELL- ODER VERSANDNACHWEISE.",
      "",
      "Bestellreferenz: __________________________________________",
      "Zahlungsreferenz: _________________________________________",
      "",
      "## Vor Einreichung manuell belegen",
      "[ ] Bestell- und Zahlungsdetails aus dem Zahlungsanbieter",
      "[ ] Versand- und Zustellnachweis des Paketdienstes",
      "[ ] Kundenkommunikation und Zeitstempel",
      "[ ] Rueckgabe-/Erstattungsstatus",
      "[ ] Anwendbare Frist und Vorgaben des Zahlungsanbieters",
      "",
      "Nur verifizierte, datensparsame Belege beifuegen. Kein Rechtsrat.",
    ]),
    contentType: "application/pdf",
    filename: "chargeback-nachweis-checkliste.pdf",
  };
}

async function xtoolSvg(shop: string, id: string): Promise<VaultDownload> {
  const row = await db.xtoolSvg.findFirst({ where: { shop, id } });
  if (!row) throw new VaultDownloadNotFoundError("xTool-Datei wurde für diesen Shop nicht gefunden.");
  const svg = await readWorkshopSvg(row);
  if (!svg) throw new VaultDownloadNotFoundError("Für diesen Werkstattdatensatz ist kein gespeicherter SVG-Inhalt verfügbar.");
  validateWorkshopSvg(svg);
  return {
    body: Buffer.from(svg, "utf8"),
    contentType: "image/svg+xml; charset=utf-8",
    filename: `${safeFilename(row.orderId ?? "werkstatt")}_${safeFilename(row.sku ?? row.id)}.svg`,
  };
}

function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/^([=+\-@])/, "'$1");
  return `"${text.replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;
}

async function accountantZip(shop: string): Promise<VaultDownload> {
  const [invoices, rewards, legalRules, archiveEntries] = await Promise.all([
    db.invoice.findMany({ where: { shop }, orderBy: { createdAt: "desc" }, take: 500 }),
    db.capturedReward.findMany({
      where: { shop, status: { in: ["RECEIVED", "REQUESTED"] } },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { type: true, title: true, status: true, actualValueEur: true, estimatedValueEur: true, receivedAt: true, requestedAt: true },
    }),
    db.legalTaxRuleLedger.findMany({
      where: { shop },
      orderBy: { verifiedAt: "desc" },
      take: 100,
      select: { ruleKey: true, jurisdiction: true, sourceUrl: true, sourceTitle: true, sourceHash: true, verifiedAt: true, reviewStatus: true },
    }),
    db.goBDDocumentArchive.findMany({
      where: { shop },
      orderBy: { archivedAt: "asc" },
      take: 1000,
      select: { documentType: true, fileName: true, mimeType: true, contentSha256: true, previousHash: true, entryHash: true, sourceRecordId: true, archivedAt: true },
    }),
  ]);
  const archive = new ZipArchive({ zlib: { level: 6 } });
  const chunks: Buffer[] = [];
  const completed = new Promise<void>((resolve, reject) => {
    archive.on("end", resolve);
    archive.on("error", reject);
    archive.on("warning", reject);
  });
  archive.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
  let attachedXmlBytes = 0;
  let skippedSourceFiles = 0;
  archive.append(
    [
      "invoiceNo,orderId,amount,currency,taxMode,createdAt,datevRowPresent,zugferdXmlPresent",
      ...invoices.map((row) => [
        row.invoiceNo, row.orderId, row.amount, row.currency, row.taxMode, row.createdAt.toISOString(),
        Boolean(row.datevRow), Boolean(row.zugferdXml),
      ].map(csvCell).join(",")),
    ].join("\r\n"),
    { name: "rechnungs-metadaten.csv" }
  );
  archive.append(
    [
      "type,title,status,actualValueEur,estimatedValueEur,receivedAt,requestedAt",
      ...rewards.map((row) => [
        row.type, row.title, row.status, row.actualValueEur, row.estimatedValueEur,
        row.receivedAt?.toISOString(), row.requestedAt?.toISOString(),
      ].map(csvCell).join(",")),
    ].join("\r\n"),
    { name: "vorteils-pruefliste.csv" }
  );
  archive.append(
    [
      "ruleKey,jurisdiction,sourceTitle,sourceUrl,sourceHash,verifiedAt,reviewStatus",
      ...legalRules.map((row) => [
        row.ruleKey, row.jurisdiction, row.sourceTitle, row.sourceUrl, row.sourceHash,
        row.verifiedAt.toISOString(), row.reviewStatus,
      ].map(csvCell).join(",")),
    ].join("\r\n"),
    { name: "rechtsquellen-register.csv" }
  );
  archive.append(
    [
      "documentType,fileName,mimeType,contentSha256,previousHash,entryHash,sourceRecordId,archivedAt",
      ...archiveEntries.map((row) => [
        row.documentType, row.fileName, row.mimeType, row.contentSha256, row.previousHash,
        row.entryHash, row.sourceRecordId, row.archivedAt.toISOString(),
      ].map(csvCell).join(",")),
    ].join("\r\n"),
    { name: "gobd-hashketten-register.csv" }
  );
  for (const invoice of invoices) {
    const invoiceFilename = `${safeFilename(invoice.invoiceNo)}-${invoice.id.slice(0, 8)}`;
    const xmlBytes = invoice.zugferdXml ? Buffer.byteLength(invoice.zugferdXml, "utf8") : 0;
    if (invoice.zugferdXml && xmlBytes <= 1_000_000 && attachedXmlBytes + xmlBytes <= 10_000_000) {
      archive.append(invoice.zugferdXml, { name: `gespeicherte-xml/${invoiceFilename}.xml` });
      attachedXmlBytes += xmlBytes;
    } else if (invoice.zugferdXml) {
      skippedSourceFiles++;
    }
    if (invoice.datevRow && Buffer.byteLength(invoice.datevRow, "utf8") <= 100_000) {
      archive.append(invoice.datevRow, { name: `datev-zeilen/${invoiceFilename}.txt` });
    } else if (invoice.datevRow) {
      skippedSourceFiles++;
    }
  }
  archive.append(
    [
      "AtelierPilot - Steuerberater-Pruefpaket",
      "",
      "Dieses Paket enthaelt nur die aufgefuehrten gespeicherten Datensaetze und unverifizierte XML-/DATEV-Felder.",
      "Es ist kein DATEV-Buchungsstapel nach SKR03/04, keine validierte ZUGFeRD-/Factur-X-PDF/A-3-Rechnung und keine steuerliche Einordnung.",
      `Es umfasst maximal 500 neueste Datensaetze je Liste; aus Sicherheitsgruenden uebersprungene Quelldateien: ${skippedSourceFiles}.`,
      `Es umfasst maximal ${legalRules.length} Quellenregister-Eintraege und ${archiveEntries.length} GoBD-Hashketten-Metadaten; die gehashten Archivdateien selbst sind nicht Teil dieses ZIP.`,
      "EU-OSS/EU-SME, Zoll-/Carrier-Gebuehren und die folgenden Quellenbehauptungen sind nicht automatisch berechnet oder bestaetigt:",
      ...UNVERIFIED_REQUESTED_CLAIMS.map((claim) => `- ${claim.claim}: ${claim.reason}`),
      "Bitte vor Import, Buchung oder rechtlicher Verwendung durch Steuerberatung/Rechtsberatung pruefen.",
    ].join("\r\n"),
    { name: "HINWEISE.txt" }
  );
  await archive.finalize();
  await completed;
  return {
    body: Buffer.concat(chunks),
    contentType: "application/zip",
    filename: "atelierpilot-steuerberater-pruefpaket.zip",
  };
}

export async function buildVaultDownload(
  shop: string,
  kind: string,
  id: string
): Promise<VaultDownload> {
  if (kind === "invoice") return invoicePdf(shop, id);
  if (kind === "gra-dpp") return graDossier(shop, id);
  if (kind === "xtool-svg") return xtoolSvg(shop, id);
  if (kind === "tax-zip" && id === "all") return accountantZip(shop);
  if (kind === "a6-card" && id === "new") return a6Card(shop);
  if (kind === "b2b-letter" && id === "new") return b2bLetter(shop);
  if (kind === "chargeback-template" && id === "new") return chargebackTemplate(shop);
  throw new VaultDownloadNotFoundError("Unbekannter Tresor-Download.");
}
