import db from "../db.server";

const RETENTION_DAYS = 30;
const WARNING_USAGE_RATIO = 0.2;

function configuredCapacityBytes() {
  const raw = process.env.DATABASE_STORAGE_LIMIT_BYTES?.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

async function databaseBytes() {
  const rows = await db.$queryRaw<{ bytes: bigint | string | number }[]>`
    SELECT pg_database_size(current_database())::text AS bytes
  `;
  const value = Number(rows[0]?.bytes);
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("PostgreSQL lieferte keinen gültigen Datenbank-Speicherwert.");
  return value;
}

export async function getStorageUsageSnapshot() {
  const [usedBytes, limitBytes] = await Promise.all([databaseBytes(), Promise.resolve(configuredCapacityBytes())]);
  const ratio = limitBytes ? usedBytes / limitBytes : null;
  return {
    usedBytes,
    limitBytes,
    usagePercent: ratio === null ? null : Math.round(ratio * 10_000) / 100,
    status: ratio === null
      ? "CAPACITY_UNKNOWN" as const
      : ratio >= WARNING_USAGE_RATIO
        ? "ABOVE_20_PERCENT" as const
        : "BELOW_20_PERCENT" as const,
    sampledAt: new Date().toISOString(),
  };
}

export async function runStorageJanitor(now = new Date()) {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const before = await getStorageUsageSnapshot();
  const [expiredCache, oldNonUndoableLogs, oldTraces] = await db.$transaction([
    db.precomputedCache.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.autopilotLog.deleteMany({
      where: { createdAt: { lt: cutoff }, undoable: false, undoneAt: null },
    }),
    db.liveConnectionTrace.deleteMany({ where: { occurredAt: { lt: cutoff } } }),
  ]);
  const after = await getStorageUsageSnapshot();
  return {
    ok: true as const,
    retentionDays: RETENTION_DAYS,
    deleted: {
      expiredCache: expiredCache.count,
      nonUndoableLogs: oldNonUndoableLogs.count,
      oldConnectionTraces: oldTraces.count,
    },
    before,
    after,
    protectedData: ["GoBDDocumentArchive", "Invoice", "LegalTaxRuleLedger", "BackupLog", "undoable AutopilotLog"],
    message: before.status === "CAPACITY_UNKNOWN"
      ? "Ephemere Datensätze bereinigt; Kapazitätsgrenze unbekannt, da DATABASE_STORAGE_LIMIT_BYTES nicht konfiguriert ist."
      : after.status === "ABOVE_20_PERCENT"
        ? "Ephemere Datensätze bereinigt; Speicherbelegung liegt weiterhin bei mindestens 20 % des konfigurierten Limits."
        : "Ephemere Datensätze bereinigt; gemessene Belegung liegt unter 20 % des konfigurierten Limits.",
  };
}
