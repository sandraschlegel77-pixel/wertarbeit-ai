import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { isFreeOpenRouterModel, maskPiiForExternalModel, ZERO_PRICE_PROVIDER } from "./ai-provider-router-core";

export type AetherionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const AETHERION_FALLBACK_MODELS = [
  "openrouter/meta-llama/llama-3.3-70b-instruct:free",
  "openrouter/openrouter/free",
] as const;

export async function queryAetherionCascade(
  messages: AetherionMessage[],
  maxTokens = 220,
): Promise<{ model: string; content: string }> {
  if (process.env.AETHERION_CASCADE_ENABLED !== "true") {
    throw new Error("AETHERION_CASCADE_LOCKED");
  }
  const baseUrl = process.env.CF_AIG_BASE_URL;
  const token = process.env.CF_AIG_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("AETHERION_CASCADE_NOT_CONFIGURED");
  }

  let gateway: URL;
  try {
    gateway = new URL(baseUrl);
  } catch {
    throw new Error("AETHERION_GATEWAY_URL_INVALID");
  }
  if (
    gateway.protocol !== "https:" ||
    gateway.hostname !== "gateway.ai.cloudflare.com" ||
    gateway.username || gateway.password || gateway.port || gateway.search || gateway.hash
  ) {
    throw new Error("AETHERION_GATEWAY_URL_INVALID");
  }
  const url = `${gateway.href.replace(/\/+$/, "")}/compat/chat/completions`;
  const errors: string[] = [];

  for (const model of AETHERION_FALLBACK_MODELS) {
    if (!model.startsWith("openrouter/") || !isFreeOpenRouterModel(model.slice("openrouter/".length))) {
      throw new Error("AETHERION_MODEL_NOT_FREE");
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-aig-authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map(({ role, content }) => ({
            role,
            content: maskPiiForExternalModel(content).slice(0, role === "system" ? 4_000 : 8_000),
          })),
          temperature: 0.3,
          max_tokens: maxTokens,
          provider: ZERO_PRICE_PROVIDER,
        }),
        signal: AbortSignal.timeout(6_000),
        redirect: "error",
      });
      if (!response.ok) {
        errors.push(`${model}: HTTP ${response.status}`);
        continue;
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        errors.push(`${model}: leere Antwort`);
        continue;
      }
      return { model, content };
    } catch {
      errors.push(`${model}: Netzwerk- oder Antwortfehler`);
    }
  }
  throw new Error(`AETHERION_CASCADE_FAILED: ${errors.join("; ")}`);
}

/** Layout: 12 Byte IV | 16 Byte AuthTag | Ciphertext (Base64), AES-256-GCM. */
export function encryptVaultBlob(plaintext: string, masterKeyHex: string, context?: string): string {
  if (!/^[a-f\d]{64}$/i.test(masterKeyHex)) {
    throw new Error("VAULT_KEY_INVALID: 32 Byte (64 Hex-Zeichen) erwartet");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(masterKeyHex, "hex"), iv);
  if (context !== undefined) cipher.setAAD(Buffer.from(context, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}

export function decryptVaultBlob(
  encryptedBase64: string,
  masterKeyHex: string,
  context?: string,
): string {
  if (!/^[a-f\d]{64}$/i.test(masterKeyHex)) {
    throw new Error("VAULT_KEY_INVALID: 32 Byte (64 Hex-Zeichen) erwartet");
  }
  const key = Buffer.from(masterKeyHex, "hex");
  const blob = Buffer.from(encryptedBase64, "base64");
  if (blob.length < 28) {
    throw new Error("VAULT_BLOB_INVALID");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, blob.subarray(0, 12));
  if (context !== undefined) decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(blob.subarray(12, 28));
  return Buffer.concat([
    decipher.update(blob.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}
