import { maskPiiForExternalModel, splitConfiguredList } from "./ai-provider-router-core";

type CloudProvider = "google" | "mistral" | "groq" | "openrouter";

interface ProviderCandidate {
  provider: CloudProvider;
  model: string;
  apiKey: string;
}

export interface RoutedCompletion {
  ok: boolean;
  provider: CloudProvider | "local";
  model: string;
  text: string | null;
  failures: string[];
}

const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 6_000;
let geminiKeyCursor = 0;

function providerCandidates(): ProviderCandidate[] {
  if (process.env.AI_CLOUD_ENABLED !== "true") return [];
  const candidates: ProviderCandidate[] = [];
  const geminiKeys = splitConfiguredList(process.env.GEMINI_API_KEYS);
  const geminiModels = splitConfiguredList(process.env.GEMINI_MODEL_CANDIDATES).slice(0, 4);
  if (geminiKeys.length && geminiModels.length) {
    const start = geminiKeyCursor++ % geminiKeys.length;
    for (const [index, model] of geminiModels.entries()) {
      candidates.push({
        provider: "google",
        model,
        apiKey: geminiKeys[(start + index) % geminiKeys.length],
      });
    }
  }
  const providers: { provider: CloudProvider; key?: string; model?: string }[] = [
    { provider: "mistral", key: process.env.MISTRAL_API_KEY, model: process.env.MISTRAL_MODEL },
    { provider: "groq", key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL },
    { provider: "openrouter", key: process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL },
  ];
  for (const item of providers) {
    if (item.key?.trim() && item.model?.trim()) {
      candidates.push({ provider: item.provider, apiKey: item.key.trim(), model: item.model.trim() });
    }
  }
  return candidates;
}

export function getConfiguredAiProviderSlots() {
  const candidates = providerCandidates();
  return {
    cloudEnabled: process.env.AI_CLOUD_ENABLED === "true",
    configuredSlots: candidates.map(({ provider, model }) => ({ provider, model })),
    offlineFallback: "deterministic-local-rules" as const,
  };
}

async function providerCompletion(candidate: ProviderCandidate, systemPrompt: string, userPrompt: string, maxTokens: number) {
  const system = maskPiiForExternalModel(systemPrompt).slice(0, 4_000);
  const prompt = maskPiiForExternalModel(userPrompt).slice(0, 8_000);
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  let url: string;
  let headers: Record<string, string>;
  let body: Record<string, unknown>;

  if (candidate.provider === "google") {
    const model = candidate.model.replace(/^models\//, "");
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(candidate.apiKey)}`;
    headers = { "Content-Type": "application/json" };
    body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: maxTokens, responseMimeType: "application/json" },
    };
  } else {
    const base = {
      model: candidate.model,
      temperature: 0,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    };
    const endpoint = candidate.provider === "mistral"
      ? "https://api.mistral.ai/v1/chat/completions"
      : candidate.provider === "groq"
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
    url = endpoint;
    headers = { Authorization: `Bearer ${candidate.apiKey}`, "Content-Type": "application/json" };
    body = base;
  }

  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object") throw new Error("INVALID_RESPONSE");
  if (candidate.provider === "google") {
    const candidates = (result as { candidates?: { content?: { parts?: { text?: string }[] } }[] }).candidates;
    const text = candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
    if (!text) throw new Error("EMPTY_RESPONSE");
    return text;
  }
  const choices = (result as { choices?: { message?: { content?: string } }[] }).choices;
  const text = choices?.[0]?.message?.content;
  if (!text) throw new Error("EMPTY_RESPONSE");
  return text;
}

export async function routeAiCompletion(input: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
}): Promise<RoutedCompletion> {
  const candidates = providerCandidates().slice(0, MAX_ATTEMPTS);
  if (!candidates.length) {
    return {
      ok: false,
      provider: "local",
      model: "deterministic-local-rules",
      text: null,
      failures: [process.env.AI_CLOUD_ENABLED === "true"
        ? "No cloud provider has both a key and explicit model configuration."
        : "Cloud inference is disabled; no external request was sent."],
    };
  }
  const failures: string[] = [];
  for (const candidate of candidates) {
    try {
      const text = await providerCompletion(candidate, input.systemPrompt, input.userPrompt, input.maxTokens);
      return { ok: true, provider: candidate.provider, model: candidate.model, text, failures };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "REQUEST_FAILED";
      failures.push(`${candidate.provider}/${candidate.model}: ${reason.slice(0, 40)}`);
    }
  }
  return { ok: false, provider: "local", model: "deterministic-local-rules", text: null, failures };
}
