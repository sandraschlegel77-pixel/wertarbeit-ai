import { createCipheriv, createDecipheriv, randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { z } from "zod";
import { createOwnerVaultRecord, parseOwnerVaultRecord, type OwnerVaultRecord } from "./owner-vault-record";

const MAX_BACKUP_BYTES = 4 * 1024 * 1024;
const MAX_PLAINTEXT_BYTES = 3 * 1024 * 1024;
const envelopeSchema = z.object({
  format: z.literal("atelierpilot-owner-vault"),
  version: z.literal(1),
  salt: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  iv: z.string().regex(/^[A-Za-z0-9_-]{16}$/),
  tag: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  ciphertext: z.string().min(1).regex(/^[A-Za-z0-9_-]+$/),
}).strict();
const payloadSchema = z.object({ shop: z.string().min(1).max(255), entries: z.array(z.unknown()).max(100) }).strict();
const aad = Buffer.from("atelierpilot-owner-vault-backup-v1", "utf8");
let activeDerivations = 0;

export class OwnerVaultBackupError extends Error {}

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  if (password.length < 16 || password.length > 1024) throw new OwnerVaultBackupError("Das Backup-Passwort muss 16 bis 1024 Zeichen lang sein.");
  if (activeDerivations >= 2) throw new OwnerVaultBackupError("Backup ist ausgelastet. Bitte erneut versuchen.");
  activeDerivations++;
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      nodeScrypt(password, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      });
    });
  } finally {
    activeDerivations--;
  }
}

export async function encryptOwnerVaultBackup(shop: string, entries: OwnerVaultRecord[], password: string): Promise<string> {
  const plaintext = Buffer.from(JSON.stringify({ shop, entries }), "utf8");
  if (plaintext.length > MAX_PLAINTEXT_BYTES) throw new OwnerVaultBackupError("Tresor ist zu groß für den Backup-Export.");
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(password, salt);
  try {
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(aad);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return JSON.stringify({
      format: "atelierpilot-owner-vault",
      version: 1,
      salt: salt.toString("base64url"),
      iv: iv.toString("base64url"),
      tag: cipher.getAuthTag().toString("base64url"),
      ciphertext: ciphertext.toString("base64url"),
    });
  } finally {
    key.fill(0);
    plaintext.fill(0);
  }
}

export async function decryptOwnerVaultBackup(input: string, shop: string, password: string): Promise<OwnerVaultRecord[]> {
  if (Buffer.byteLength(input, "utf8") > MAX_BACKUP_BYTES) throw new OwnerVaultBackupError("Backup-Datei ist größer als 4 MiB.");
  let envelope: z.infer<typeof envelopeSchema>;
  try {
    envelope = envelopeSchema.parse(JSON.parse(input));
  } catch {
    throw new OwnerVaultBackupError("Backup-Format ist ungültig.");
  }
  const key = await deriveKey(password, Buffer.from(envelope.salt, "base64url"));
  let plaintext: Buffer;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(envelope.iv, "base64url"));
    decipher.setAAD(aad);
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64url"));
    plaintext = Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, "base64url")), decipher.final()]);
  } catch {
    throw new OwnerVaultBackupError("Backup kann nicht entschlüsselt werden. Passwort oder Datei prüfen.");
  } finally {
    key.fill(0);
  }
  try {
    const payload = payloadSchema.parse(JSON.parse(plaintext.toString("utf8")));
    if (payload.shop !== shop) throw new OwnerVaultBackupError("Backup gehört zu einem anderen Shop.");
    const labels = new Set<string>();
    return payload.entries.map((entry) => {
      const record = parseOwnerVaultRecord(JSON.stringify(entry), "", true);
      if (!/^[\p{L}\p{N} ._()-]{1,60}$/u.test(record.label)) throw new OwnerVaultBackupError("Backup enthält eine ungültige Bezeichnung.");
      const normalized = record.label.toLowerCase();
      if (labels.has(normalized)) throw new OwnerVaultBackupError("Backup enthält doppelte Bezeichnungen.");
      labels.add(normalized);
      return createOwnerVaultRecord(record.label, record.secret, record);
    });
  } catch (error) {
    if (error instanceof OwnerVaultBackupError) throw error;
    throw new OwnerVaultBackupError("Backup-Inhalt ist ungültig.");
  } finally {
    plaintext.fill(0);
  }
}
