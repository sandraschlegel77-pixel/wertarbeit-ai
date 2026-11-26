import { z } from "zod";

const recordSchema = z.object({
  version: z.literal(1),
  label: z.string().min(1).max(60),
  provider: z.enum(["openrouter", "cloudflare", "groq", "huggingface", "custom"]),
  category: z.enum(["KI & APIs", "Beta & Experimentell", "Logins & Accounts", "Shop & Webhooks", "Sichere Notizen"]),
  stage: z.enum(["production", "beta", "experimental", "test"]),
  username: z.string().max(512),
  url: z.string().max(2048),
  secret: z.string().min(1),
  modelHint: z.string().max(512),
  notes: z.string().max(4096),
  expiresAt: z.string().max(32),
  favorite: z.boolean(),
  enabledForFallback: z.boolean().default(false),
  pinnedForFallback: z.boolean().default(false),
}).strict();

export type OwnerVaultRecord = z.infer<typeof recordSchema>;
export type OwnerVaultDetails = Omit<OwnerVaultRecord, "version" | "label" | "secret">;
export type OwnerVaultDetailsInput = Omit<Partial<OwnerVaultDetails>, "provider" | "category" | "stage"> & {
  provider?: string;
  category?: string;
  stage?: string;
};

export class OwnerVaultRecordValidationError extends Error {}

export function createOwnerVaultRecord(label: string, secret: string, details?: OwnerVaultDetailsInput): OwnerVaultRecord {
  const parsed = recordSchema.parse({
    version: 1,
    label,
    provider: details?.provider ?? "custom",
    category: details?.category ?? "Sichere Notizen",
    stage: details?.stage ?? "production",
    username: details?.username ?? "",
    url: details?.url ?? "",
    secret,
    modelHint: details?.modelHint ?? "",
    notes: details?.notes ?? "",
    expiresAt: details?.expiresAt ?? "",
    favorite: details?.favorite ?? false,
    enabledForFallback: details?.enabledForFallback ?? false,
    pinnedForFallback: details?.pinnedForFallback ?? false,
  });
  if (parsed.pinnedForFallback && !parsed.enabledForFallback) throw new OwnerVaultRecordValidationError("VAULT_FALLBACK_INVALID");
  if (parsed.provider !== "custom") parsed.secret = parsed.secret.trim();
  if (!parsed.secret || Buffer.byteLength(parsed.secret, "utf8") > 8192) {
    throw new OwnerVaultRecordValidationError("VAULT_SECRET_INVALID");
  }
  if (parsed.expiresAt) {
    const date = new Date(`${parsed.expiresAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.expiresAt) ||
      Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== parsed.expiresAt) {
      throw new OwnerVaultRecordValidationError("VAULT_EXPIRY_INVALID");
    }
  }
  return parsed;
}

export function serializeOwnerVaultRecord(record: OwnerVaultRecord): string {
  return JSON.stringify(record);
}

export function parseOwnerVaultRecord(plaintext: string, legacyLabel: string, structured: boolean): OwnerVaultRecord {
  if (!structured) return createOwnerVaultRecord(legacyLabel, plaintext);
  return recordSchema.parse(JSON.parse(plaintext));
}
