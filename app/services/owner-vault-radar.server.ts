import { z } from "zod";
import { isFreeOpenRouterModel, ZERO_PRICE_PROVIDER } from "./ai-provider-router-core";

const TIMEOUT_MS = 7_500;
const MAX_RESPONSE_BYTES = 3 * 1024 * 1024;
const modelSchema = z.object({
  id: z.string().max(200),
  pricing: z.object({ prompt: z.string(), completion: z.string() }).passthrough(),
}).passthrough();
const modelsSchema = z.object({ data: z.array(modelSchema).max(10_000) }).passthrough();
const completionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }).passthrough() }).passthrough()).min(1),
  usage: z.object({ cost: z.number().optional() }).passthrough().optional(),
}).passthrough();

export class VaultRadarError extends Error {}

async function fetchJson(url: string, init: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, redirect: "error" });
    if (!response.ok) throw new VaultRadarError(`Anbieter antwortet mit HTTP ${response.status}.`);
    if (!response.body) throw new VaultRadarError("Leere Anbieterantwort.");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    let done = false;
    try {
      while (!done) {
        const result = await reader.read();
        if (result.done) { done = true; continue; }
        const value = result.value;
        length += value.length;
        if (length > MAX_RESPONSE_BYTES) {
          controller.abort();
          throw new VaultRadarError("Anbieterantwort ist zu groß.");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    clearTimeout(timer);
  }
}

export async function discoverFreeVaultModels() {
  try {
    const response = modelsSchema.parse(await fetchJson("https://openrouter.ai/api/v1/models", { method: "GET" }));
    const models = response.data
      .filter((model) => isFreeOpenRouterModel(model.id) && model.pricing.prompt === "0" && model.pricing.completion === "0")
      .map((model) => model.id)
      .slice(0, 100);
    if (!models.length) return { models: ["openrouter/free"], verified: false, message: "Keine passenden Nullpreis-Modelle gefunden; kuratierter Hinweis ungeprüft." };
    return { models, verified: true, message: "OpenRouter-Modellpreise laut aktueller Anbieterantwort; Verfügbarkeit und weitere Kosten nicht garantiert." };
  } catch {
    return { models: ["openrouter/free"], verified: false, message: "OpenRouter nicht erreichbar oder Antwort ungültig; kuratierter Hinweis ungeprüft." };
  }
}

export async function testFreeVaultModel(apiKey: string, model: string) {
  if (!apiKey || !isFreeOpenRouterModel(model)) throw new VaultRadarError("Nur ausdrücklich freie OpenRouter-Modelle sind für den Test zugelassen.");
  const started = performance.now();
  let result: z.infer<typeof completionSchema>;
  try {
    result = completionSchema.parse(await fetchJson("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Antworte nur mit OK" }],
        max_tokens: 16,
        temperature: 0,
        provider: ZERO_PRICE_PROVIDER,
      }),
    }));
  } catch (error) {
    if (error instanceof VaultRadarError) throw error;
    throw new VaultRadarError("Modelltest nicht verfügbar oder Anbieterantwort ungültig.");
  }
  const cost = result.usage?.cost;
  if (cost !== undefined && cost !== 0) throw new VaultRadarError("Anbieter meldet unerwartete Kosten. Bitte Abrechnung prüfen.");
  return {
    latencyMs: Math.round(performance.now() - started),
    response: result.choices[0].message.content.slice(0, 200),
    costConfirmed: cost === 0,
  };
}
