import { randomUUID } from "node:crypto";
import db from "../db.server";
import { isConfiguredOwnerShop } from "./access-control-core";
import { encryptVaultBlob } from "./aetherion-vault.server";

export function canAccessOwnerVault(shop: string): boolean {
  return isConfiguredOwnerShop(shop, process.env.OWNER_SHOP_DOMAIN);
}

export class OwnerVaultInputError extends Error {}

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

export async function listOwnerVaultSecrets(shop: string) {
  requireAccess(shop);
  await ensureVaultTable();
  const entries = await db.ownerVaultSecret.findMany({
    where: { shop },
    select: { id: true, label: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return {
    keyConfigured: /^[a-f\d]{64}$/i.test(process.env.AETHERION_VAULT_KEY ?? ""),
    entries: entries.map((entry) => ({ ...entry, createdAt: entry.createdAt.toISOString() })),
  };
}

export async function saveOwnerVaultSecret(shop: string, label: string, value: string) {
  requireAccess(shop);
  const name = label.trim();
  if (!/^[\p{L}\p{N} ._()-]{1,60}$/u.test(name)) {
    throw new OwnerVaultInputError("Bitte eine Bezeichnung mit 1–60 Buchstaben, Zahlen oder einfachen Satzzeichen eingeben; keine Geheimnisse als Bezeichnung verwenden.");
  }
  if (!value || Buffer.byteLength(value, "utf8") > 8192) {
    throw new OwnerVaultInputError("Bitte einen geheimen Wert mit höchstens 8192 Byte eingeben.");
  }
  const id = randomUUID();
  const ciphertext = encryptVaultBlob(value, key(), `${shop}:${id}`);
  await ensureVaultTable();
  await db.$transaction(async (tx) => {
    if (await tx.ownerVaultSecret.count({ where: { shop } }) >= 100) {
      throw new OwnerVaultInputError("Der Tresor enthält bereits 100 Einträge. Bitte zuerst einen Eintrag löschen.");
    }
    await tx.ownerVaultSecret.create({ data: { id, shop, label: name, ciphertext } });
  }, { isolationLevel: "Serializable" });
}

export async function deleteOwnerVaultSecret(shop: string, id: string) {
  requireAccess(shop);
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
  }
  await ensureVaultTable();
  const result = await db.ownerVaultSecret.deleteMany({ where: { shop, id } });
  if (result.count !== 1) throw new OwnerVaultInputError("Tresoreintrag nicht gefunden.");
}
