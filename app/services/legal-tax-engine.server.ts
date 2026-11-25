import { createHash } from "node:crypto";
import QRCode from "qrcode";
import db from "../db.server";
import { normalizeIban } from "./shop-settings.server";
import {
  LEGAL_RULE_PROFILES,
  UNVERIFIED_REQUESTED_CLAIMS,
  assessEuSmeTurnover,
  assessEuDistanceSales,
  assessPackagingVoidRatio,
  buildEpcGiroCodePayload,
  calculateUnitPrice,
  checkThirtyDayLowestPrice,
  normalizeHsCode,
  prepareCustomsDeclarationReview,
} from "./legal-tax-core";

const MAX_SOURCE_BYTES = 192 * 1024;
const MAX_ARCHIVE_DOCUMENT_BYTES = 10 * 1024 * 1024;

export {
  LEGAL_RULE_PROFILES,
  UNVERIFIED_REQUESTED_CLAIMS,
  assessEuSmeTurnover,
  assessEuDistanceSales,
  assessPackagingVoidRatio,
  buildEpcGiroCodePayload,
  calculateUnitPrice,
  checkThirtyDayLowestPrice,
  normalizeHsCode,
  prepareCustomsDeclarationReview,
};

function ruleSourceHostAllowed(url: URL) {
  return url.protocol === "https:" &&
    (url.hostname === "gesetze-im-internet.de" ||
      url.hostname.endsWith(".gesetze-im-internet.de") ||
      url.hostname === "eur-lex.europa.eu");
}

async function fetchLegalSource(sourceUrl: string) {
  const url = new URL(sourceUrl);
  if (!ruleSourceHostAllowed(url)) throw new Error("Rechtsquelle ist nicht in der amtlichen HTTPS-Allowlist.");
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.1" },
    signal: AbortSignal.timeout(8_000),
  });
  const finalUrl = new URL(response.url || sourceUrl);
  if (!response.ok || !ruleSourceHostAllowed(finalUrl) || !response.body) {
    await response.body?.cancel();
    return null;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (size < MAX_SOURCE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value.subarray(0, MAX_SOURCE_BYTES - size);
      chunks.push(chunk);
      size += chunk.byteLength;
      if (chunk.byteLength !== value.byteLength) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (size < 100) return null;
  const bytes = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
  const text = bytes.toString("utf8");
  if (/no more content available|access denied|<title>\s*error/i.test(text)) return null;
  return { hash: createHash("sha256").update(bytes).digest("hex"), bytesRead: size };
}

export async function syncLegalTaxRuleLedger(shop: string, ruleKeys?: readonly string[]) {
  if (!shop) throw new Error("Shop-Domain fehlt.");
  const selected = ruleKeys
    ? LEGAL_RULE_PROFILES.filter((profile) => ruleKeys.includes(profile.ruleKey))
    : [...LEGAL_RULE_PROFILES];
  if (ruleKeys && selected.length !== new Set(ruleKeys).size) {
    throw new Error("Mindestens ein angeforderter Rechtsregel-Schlüssel ist unbekannt.");
  }
  const results: { ruleKey: string; status: "SOURCE_FETCHED" | "SOURCE_UNAVAILABLE"; verifiedAt: string | null }[] = [];

  for (let offset = 0; offset < selected.length; offset += 3) {
    const batch = selected.slice(offset, offset + 3);
    const checked = await Promise.all(batch.map(async (profile) => {
      let source: Awaited<ReturnType<typeof fetchLegalSource>> = null;
      try {
        source = await fetchLegalSource(profile.sourceUrl);
      } catch {
        source = null;
      }
      if (!source) return { ruleKey: profile.ruleKey, status: "SOURCE_UNAVAILABLE" as const, verifiedAt: null };
      const verifiedAt = new Date();
      await db.legalTaxRuleLedger.upsert({
        where: {
          shop_ruleKey_sourceHash: {
            shop,
            ruleKey: profile.ruleKey,
            sourceHash: source.hash,
          },
        },
        update: {
          sourceUrl: profile.sourceUrl,
          sourceTitle: profile.sourceTitle,
          verifiedAt,
          reviewStatus: "SOURCE_FETCHED_REQUIRES_HUMAN_REVIEW",
          reviewerNote: `Amtliche Quelle am ${verifiedAt.toISOString()} abgerufen (${source.bytesRead} Bytes gehasht). Die Fundstelle ist nicht automatisch rechtlich ausgelegt oder freigegeben. ${profile.scopeNote}`,
        },
        create: {
          shop,
          ruleKey: profile.ruleKey,
          jurisdiction: profile.jurisdiction,
          sourceUrl: profile.sourceUrl,
          sourceTitle: profile.sourceTitle,
          sourceHash: source.hash,
          verifiedAt,
          reviewStatus: "SOURCE_FETCHED_REQUIRES_HUMAN_REVIEW",
          reviewerNote: `Amtliche Quelle am ${verifiedAt.toISOString()} abgerufen (${source.bytesRead} Bytes gehasht). Die Fundstelle ist nicht automatisch rechtlich ausgelegt oder freigegeben. ${profile.scopeNote}`,
        },
      });
      return { ruleKey: profile.ruleKey, status: "SOURCE_FETCHED" as const, verifiedAt: verifiedAt.toISOString() };
    }));
    results.push(...checked);
  }

  return {
    results,
    fetched: results.filter((result) => result.status === "SOURCE_FETCHED").length,
    unavailable: results.filter((result) => result.status === "SOURCE_UNAVAILABLE").length,
    unverifiedClaims: UNVERIFIED_REQUESTED_CLAIMS,
  };
}

export async function getLegalTaxRuleLedgerSnapshot(shop: string) {
  return db.legalTaxRuleLedger.findMany({
    where: { shop },
    orderBy: [{ verifiedAt: "desc" }, { ruleKey: "asc" }],
    take: 100,
    select: {
      ruleKey: true,
      jurisdiction: true,
      sourceUrl: true,
      sourceTitle: true,
      sourceHash: true,
      verifiedAt: true,
      reviewStatus: true,
      reviewerNote: true,
    },
  });
}

export async function createEpcGiroCode(input: {
  beneficiary: string;
  iban: string;
  bic?: string;
  amountEur: number;
  remittance?: string;
}) {
  const iban = normalizeIban(input.iban);
  const payload = buildEpcGiroCodePayload({ ...input, iban });
  const png = await QRCode.toBuffer(payload, { type: "png", errorCorrectionLevel: "M", margin: 2, width: 512 });
  return { payload, png };
}

export function verifyPayeeNameUnavailable() {
  return {
    status: "NOT_CONNECTED" as const,
    message: "Eine Verification-of-Payee-Antwort kann nur ein angebundener Zahlungsdienstleister liefern. Dieses Ergebnis bestätigt weder Kontoinhaber noch Empfängername.",
  };
}

export interface GoBDArchiveInput {
  shop: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  content: Uint8Array;
  sourceRecordId?: string;
}

function sha256(value: Uint8Array | string) {
  return createHash("sha256").update(value).digest("hex");
}

function archiveEntryHash(input: {
  shop: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  contentSha256: string;
  previousHash: string | null;
  sourceRecordId: string | null;
  archivedAt: Date;
}) {
  return sha256(JSON.stringify({
    shop: input.shop,
    documentType: input.documentType,
    fileName: input.fileName,
    mimeType: input.mimeType,
    contentSha256: input.contentSha256,
    previousHash: input.previousHash,
    sourceRecordId: input.sourceRecordId,
    archivedAt: input.archivedAt.toISOString(),
  }));
}

export async function archiveGoBDDocument(input: GoBDArchiveInput) {
  const documentType = input.documentType.trim();
  const fileName = input.fileName.trim().replace(/[\\/\r\n]/g, "_").slice(0, 180);
  const mimeType = input.mimeType.trim().toLowerCase();
  if (!input.shop || documentType.length < 2 || documentType.length > 80 ||
      fileName.length < 1 || mimeType.length < 3 || mimeType.length > 120) {
    throw new Error("Archiv-Metadaten fehlen oder sind ungültig.");
  }
  if (input.content.byteLength < 1 || input.content.byteLength > MAX_ARCHIVE_DOCUMENT_BYTES) {
    throw new Error("Archivdokument muss zwischen 1 Byte und 10 MiB groß sein.");
  }
  const contentSha256 = sha256(input.content);
  const sourceRecordId = input.sourceRecordId?.trim().slice(0, 120) || null;

  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${input.shop}))`;
    const previous = await tx.goBDDocumentArchive.findFirst({
      where: { shop: input.shop },
      orderBy: { archivedAt: "desc" },
      select: { entryHash: true, archivedAt: true },
    });
    const archivedAt = new Date(Math.max(Date.now(), (previous?.archivedAt.getTime() ?? 0) + 1));
    const previousHash = previous?.entryHash ?? null;
    const entryHash = archiveEntryHash({
      shop: input.shop,
      documentType,
      fileName,
      mimeType,
      contentSha256,
      previousHash,
      sourceRecordId,
      archivedAt,
    });
    return tx.goBDDocumentArchive.create({
      data: {
        shop: input.shop,
        documentType,
        fileName,
        mimeType,
        contentBytes: Buffer.from(input.content),
        contentSha256,
        previousHash,
        entryHash,
        sourceRecordId,
        archivedAt,
      },
      select: { id: true, contentSha256: true, previousHash: true, entryHash: true, archivedAt: true },
    });
  });
}

export async function verifyGoBDArchiveChain(shop: string) {
  const rows = await db.goBDDocumentArchive.findMany({
    where: { shop },
    orderBy: { archivedAt: "asc" },
    take: 5001,
  });
  const truncated = rows.length > 5000;
  const checkedRows = rows.slice(0, 5000);
  let previousHash: string | null = null;
  let verified = 0;
  for (const row of checkedRows) {
    const contentHash = sha256(row.contentBytes);
    const expectedHash = archiveEntryHash({
      shop: row.shop,
      documentType: row.documentType,
      fileName: row.fileName,
      mimeType: row.mimeType,
      contentSha256: row.contentSha256,
      previousHash: row.previousHash,
      sourceRecordId: row.sourceRecordId,
      archivedAt: row.archivedAt,
    });
    if (row.previousHash !== previousHash || contentHash !== row.contentSha256 || row.entryHash !== expectedHash) {
      return { ok: false, verified, checked: verified + 1, truncated, brokenEntryId: row.id };
    }
    previousHash = row.entryHash;
    verified++;
  }
  return { ok: !truncated, verified, checked: checkedRows.length, truncated, brokenEntryId: null };
}
