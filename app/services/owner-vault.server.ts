import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import db from "../db.server";
import { isConfiguredOwnerShop } from "./access-control-core";
import { decryptVaultBlob, encryptVaultBlob } from "./aetherion-vault.server";
import { createOwnerVaultRecord, OwnerVaultRecordValidationError, parseOwnerVaultRecord, serializeOwnerVaultRecord, type OwnerVaultDetailsInput } from "./owner-vault-record";
import { auditVaultAction, vaultAuditData } from "./owner-vault-auth.server";
import { parseVaultEnv, VaultImportError } from "./owner-vault-import";
import { decryptOwnerVaultBackup, encryptOwnerVaultBackup } from "./owner-vault-backup.server";
import { isFreeOpenRouterModel } from "./ai-provider-router-core";

export function canAccessOwnerVault(shop: string): boolean {
  return isConfiguredOwnerShop(shop, process.env.OWNER_SHOP_DOMAIN);
}

export class OwnerVaultInputError extends Error {}

const RECORD_PREFIX = "v1:";
let vaultTableReady: Promise<void> | undefined;

export function ensureVaultTable(): Promise<void> {
  if (!vaultTableReady) {
    vaultTableReady = db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(1096043604, 1447842892)::text`;
      await tx.$executeRaw`
        CREATE TABLE IF NOT EXISTS "OwnerVaultSecret" (
          "id" TEXT NOT NULL,
          "shop" TEXT NOT NULL,
          "label" TEXT NOT NULL,
          "ciphertext" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "OwnerVaultSecret_pkey" PRIMARY KEY ("id")
        )
      `;
      await tx.$executeRaw`
        CREATE INDEX IF NOT EXISTS "OwnerVaultSecret_shop_createdAt_idx"
        ON "OwnerVaultSecret"("shop", "createdAt")
      `;
    }).catch((error: unknown) => {
      vaultTableReady = undefined;
      throw error;
    });
  }
  return vaultTableReady;
}

function requireAccess(shop: string) {
  if (!canAccessOwnerVault(shop)) throw new OwnerVaultInputError("Tresorzugriff nicht erlaubt.");
}

function key() {
  const value = process.env.AETHERION_VAULT_KEY ?? "";
  if (!/^[a-f\d]{64}$/i.test(value)) {
    throw new OwnerVaultInputError("AETHERION_VAULT_KEY muss als dauerhaft gesicherter 32-Byte-Hex-Schlüssel konfiguriert sein.");
  }
  return value;
}

function decryptRecord(shop: string, entry: { id: string; label: string; ciphertext: string }) {
  const structured = entry.ciphertext.startsWith(RECORD_PREFIX);
  return parseOwnerVaultRecord(
    decryptVaultBlob(
      structured ? entry.ciphertext.slice(RECORD_PREFIX.length) : entry.ciphertext,
      key(),
      `${shop}:${entry.id}${structured ? ":v1" : ""}`,
    ),
    entry.label,
    structured,
  );
}

export async function listOwnerVaultSecrets(shop: string) {
  requireAccess(shop);
  await ensureVaultTable();
  const entries = await db.ownerVaultSecret.findMany({
    where: { shop },
    select: { id: true, label: true, ciphertext: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const keyConfigured = /^[a-f\d]{64}$/i.test(process.env.AETHERION_VAULT_KEY ?? "");
  return {
    keyConfigured,
    entries: entries.map((entry) => {
      const { id, label, createdAt } = entry;
      const metadata = { id, label, createdAt };
      if (!keyConfigured) return { ...metadata, createdAt: entry.createdAt.toISOString() };
      const record = decryptRecord(shop, entry);
      return {
        ...metadata,
        provider: record.provider,
        category: record.category,
        stage: record.stage,
        username: record.username,
        url: record.url,
        modelHint: record.modelHint,
        notes: record.notes,
        expiresAt: record.expiresAt,
        favorite: record.favorite,
        enabledForFallback: record.enabledForFallback,
        pinnedForFallback: record.pinnedForFallback,
        createdAt: entry.createdAt.toISOString(),
      };
    }),
  };
}

export async function getOwnerVaultRecord(shop: string, id: string) {
  requireAccess(shop);
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
  }
  await ensureVaultTable();
  const entry = await db.ownerVaultSecret.findFirst({
    where: { shop, id },
    select: { id: true, label: true, ciphertext: true },
  });
  if (!entry) throw new OwnerVaultInputError("Tresoreintrag nicht gefunden.");
  return decryptRecord(shop, entry);
}

export async function revealOwnerVaultSecret(shop: string, id: string) {
  return (await getOwnerVaultRecord(shop, id)).secret;
}

export async function getOwnerVaultFreeCandidates(shop: string): Promise<Array<{ apiKey: string; model: string }>> {
  requireAccess(shop);
  await ensureVaultTable();
  const entries = await db.ownerVaultSecret.findMany({
    where: { shop },
    select: { id: true, label: true, ciphertext: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const stages = ["beta", "experimental", "test"];
  const records = entries.map((entry) => decryptRecord(shop, entry)).filter((record) =>
    record.provider === "openrouter" && record.enabledForFallback && stages.includes(record.stage) &&
    (!record.expiresAt || record.expiresAt >= new Date().toISOString().slice(0, 10)),
  );
  const candidates: Array<{ apiKey: string; model: string }> = [];
  const add = (apiKey: string, model: string) => {
    if (isFreeOpenRouterModel(model) && !candidates.some((entry) => entry.apiKey === apiKey && entry.model === model)) {
      candidates.push({ apiKey, model });
    }
  };
  for (const record of records.filter((entry) => entry.pinnedForFallback && isFreeOpenRouterModel(entry.modelHint)).slice(0, 2)) add(record.secret, record.modelHint);
  const requestedModel = process.env.OPENROUTER_MODEL?.trim() || "";
  const configuredModel = isFreeOpenRouterModel(requestedModel) ? requestedModel : "openrouter/free";
  if (records[0]) add(records[0].secret, configuredModel);
  for (const stage of stages) {
    const record = records.find((entry) => entry.stage === stage && isFreeOpenRouterModel(entry.modelHint));
    if (record) add(record.secret, record.modelHint);
  }
  return candidates.slice(0, 6);
}

export async function saveOwnerVaultSecret(shop: string, label: string, value: string, details?: OwnerVaultDetailsInput, uniqueLabel = false) {
  requireAccess(shop);
  const name = label.trim();
  if (!/^[\p{L}\p{N} ._()-]{1,60}$/u.test(name)) {
    throw new OwnerVaultInputError("Bitte eine Bezeichnung mit 1–60 Buchstaben, Zahlen oder einfachen Satzzeichen eingeben; keine Geheimnisse als Bezeichnung verwenden.");
  }
  if (!value || Buffer.byteLength(value, "utf8") > 8192) {
    throw new OwnerVaultInputError("Bitte einen geheimen Wert mit höchstens 8192 Byte eingeben.");
  }
  let serialized: string;
  try {
    serialized = serializeOwnerVaultRecord(createOwnerVaultRecord(name, value, details));
  } catch (error) {
    if (error instanceof ZodError || error instanceof OwnerVaultRecordValidationError) {
      throw new OwnerVaultInputError("Ungültige Tresordaten. Bitte Angaben und Länge prüfen.");
    }
    throw error;
  }
  const id = randomUUID();
  const ciphertext = RECORD_PREFIX + encryptVaultBlob(serialized, key(), `${shop}:${id}:v1`);
  await ensureVaultTable();
  await db.$transaction(async (tx) => {
    if (uniqueLabel && await tx.ownerVaultSecret.findFirst({ where: { shop, label: { equals: name, mode: "insensitive" } } })) {
      throw new OwnerVaultInputError("Diese Bezeichnung existiert bereits.");
    }
    if (await tx.ownerVaultSecret.count({ where: { shop } }) >= 100) {
      throw new OwnerVaultInputError("Der Tresor enthält bereits 100 Einträge. Bitte zuerst einen Eintrag löschen.");
    }
    await tx.ownerVaultSecret.create({ data: { id, shop, label: name, ciphertext } });
    await tx.autopilotLog.create({ data: vaultAuditData(shop, "create", "completed") });
  }, { isolationLevel: "Serializable" });
}

export async function importOwnerVaultSecrets(shop: string, input: string, mode: string, details: OwnerVaultDetailsInput) {
  requireAccess(shop);
  let records: Array<{ label: string; serialized: string }>;
  try {
    records = parseVaultEnv(input).map(({ label, secret }) => ({
      label,
      serialized: serializeOwnerVaultRecord(createOwnerVaultRecord(label, secret, details)),
    }));
  } catch (error) {
    if (error instanceof VaultImportError || error instanceof ZodError || error instanceof OwnerVaultRecordValidationError) {
      throw new OwnerVaultInputError(error instanceof VaultImportError ? error.message : "Ungültige Importdaten. Bitte Angaben und Länge prüfen.");
    }
    throw error;
  }
  return importVaultRecords(shop, records, mode, "bulk_import");
}

export async function exportOwnerVaultBackup(shop: string, password: string) {
  requireAccess(shop);
  await ensureVaultTable();
  const entries = await db.ownerVaultSecret.findMany({
    where: { shop },
    select: { id: true, label: true, ciphertext: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const backup = await encryptOwnerVaultBackup(shop, entries.map((entry) => decryptRecord(shop, entry)), password);
  await auditVaultAction(shop, "export", "completed");
  return backup;
}

export async function importOwnerVaultBackup(shop: string, input: string, password: string, mode: string) {
  requireAccess(shop);
  const entries = await decryptOwnerVaultBackup(input, shop, password);
  const records = entries.map((record) => ({ label: record.label, serialized: serializeOwnerVaultRecord(record) }));
  return importVaultRecords(shop, records, mode, "backup_import");
}

async function importVaultRecords(shop: string, records: Array<{ label: string; serialized: string }>, mode: string, action: "bulk_import" | "backup_import") {
  if (mode !== "skip" && mode !== "update") throw new OwnerVaultInputError("Ungültige Duplikatbehandlung.");
  const encryptionKey = key();
  await ensureVaultTable();
  return db.$transaction(async (tx) => {
    const existing = await tx.ownerVaultSecret.findMany({ where: { shop }, select: { id: true, label: true } });
    const byLabel = new Map<string, Array<{ id: string; label: string }>>();
    for (const entry of existing) {
      const normalized = entry.label.toLowerCase();
      byLabel.set(normalized, [...(byLabel.get(normalized) ?? []), entry]);
    }
    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const record of records) {
      const matches = byLabel.get(record.label.toLowerCase()) ?? [];
      if (matches.length && mode === "skip") { skipped++; continue; }
      if (matches.length > 1) throw new OwnerVaultInputError("Mehrdeutige vorhandene Bezeichnung. Bitte Duplikate zuerst manuell bereinigen.");
      const id = matches[0]?.id ?? randomUUID();
      const ciphertext = RECORD_PREFIX + encryptVaultBlob(record.serialized, encryptionKey, `${shop}:${id}:v1`);
      if (matches.length) {
        const result = await tx.ownerVaultSecret.updateMany({ where: { shop, id }, data: { ciphertext, label: record.label } });
        if (result.count !== 1) throw new OwnerVaultInputError("Tresoreintrag wurde zwischenzeitlich geändert. Bitte Import erneut prüfen.");
        updated++;
      } else {
        if (existing.length + created >= 100) throw new OwnerVaultInputError("Der Tresor darf höchstens 100 Einträge enthalten.");
        await tx.ownerVaultSecret.create({ data: { id, shop, label: record.label, ciphertext } });
        created++;
      }
    }
    await tx.autopilotLog.create({ data: vaultAuditData(shop, action, "completed") });
    return { created, updated, skipped };
  }, { isolationLevel: "Serializable" });
}

export async function deleteOwnerVaultSecret(shop: string, id: string) {
  requireAccess(shop);
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
  }
  await ensureVaultTable();
  await db.$transaction(async (tx) => {
    const result = await tx.ownerVaultSecret.deleteMany({ where: { shop, id } });
    if (result.count !== 1) throw new OwnerVaultInputError("Tresoreintrag nicht gefunden.");
    await tx.autopilotLog.create({ data: vaultAuditData(shop, "delete", "completed") });
  }, { isolationLevel: "Serializable" });
}
