import { createDecipheriv } from "node:crypto";

export type AetherionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const AETHERION_FALLBACK_MODELS = [
  "groq/llama-3.3-70b-versatile",
  "google-ai-studio/gemini-2.0-flash",
  "openrouter/meta-llama/llama-3.3-70b-instruct:free",
  "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
] as const;

export async function queryAetherionCascade(
  messages: AetherionMessage[],
): Promise<{ model: string; content: string }> {
  if (process.env.AETHERION_CASCADE_ENABLED !== "true") {
    throw new Error("AETHERION_CASCADE_LOCKED");
  }
  const baseUrl = process.env.CF_AIG_BASE_URL;
  const token = process.env.CF_AIG_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("AETHERION_CASCADE_NOT_CONFIGURED");
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/compat/chat/completions`;
  const errors: string[] = [];

  for (const model of AETHERION_FALLBACK_MODELS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cf-aig-authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.3 }),
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
    } catch (error) {
      errors.push(
        `${model}: ${error instanceof Error ? error.message : "Netzwerkfehler"}`,
      );
    }
  }
  throw new Error(`AETHERION_CASCADE_FAILED: ${errors.join("; ")}`);
}

/** Layout: 12 Byte IV | 16 Byte AuthTag | Ciphertext (Base64), AES-256-GCM. */
export function decryptVaultBlob(
  encryptedBase64: string,
  masterKeyHex: string,
): string {
  const key = Buffer.from(masterKeyHex, "hex");
  if (key.length !== 32) {
    throw new Error("VAULT_KEY_INVALID: 32 Byte (64 Hex-Zeichen) erwartet");
  }
  const blob = Buffer.from(encryptedBase64, "base64");
  if (blob.length < 28) {
    throw new Error("VAULT_BLOB_INVALID");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, blob.subarray(0, 12));
  decipher.setAuthTag(blob.subarray(12, 28));
  return Buffer.concat([
    decipher.update(blob.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}
