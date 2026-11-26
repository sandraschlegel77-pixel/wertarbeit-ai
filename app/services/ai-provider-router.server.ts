import { isFreeOpenRouterModel, maskPiiForExternalModel, ZERO_PRICE_PROVIDER } from "./ai-provider-router-core";
import { queryAetherionCascade } from "./aetherion-vault.server";

export interface RoutedCompletion {
  ok: boolean;
  provider: "openrouter" | "aetherion" | "local";
  model: string;
  text: string | null;
  failures: string[];
}

export interface CompletionInput {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
}

function directCandidate() {
  if (process.env.AI_CLOUD_ENABLED !== "true") return null;
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();
  return apiKey && model && isFreeOpenRouterModel(model) ? { apiKey, model } : null;
}

export function getConfiguredAiProviderSlots() {
  const candidate = directCandidate();
  return {
    cloudEnabled: process.env.AI_CLOUD_ENABLED === "true",
    configuredSlots: candidate ? [{ provider: "openrouter", model: candidate.model }] : [],
    offlineFallback: "deterministic-local-rules" as const,
  };
}

export async function routeAiCompletion(input: CompletionInput): Promise<RoutedCompletion> {
  if (!Number.isInteger(input.maxTokens) || input.maxTokens < 1 || input.maxTokens > 4096) {
    throw new Error("AI_MAX_TOKENS_INVALID");
  }
  const failures: string[] = [];
  const candidate = directCandidate();
  const messages = [
    { role: "system" as const, content: maskPiiForExternalModel(input.systemPrompt).slice(0, 4_000) },
    { role: "user" as const, content: maskPiiForExternalModel(input.userPrompt).slice(0, 8_000) },
  ];

  if (candidate) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${candidate.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: candidate.model,
          messages,
          temperature: 0,
          max_tokens: input.maxTokens,
          response_format: { type: "json_object" },
          provider: ZERO_PRICE_PROVIDER,
        }),
        signal: AbortSignal.timeout(6_000),
        redirect: "error",
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const result: unknown = await response.json();
      const text = (result as { choices?: { message?: { content?: unknown } }[] } | null)?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text) throw new Error("EMPTY_RESPONSE");
      return { ok: true, provider: "openrouter", model: candidate.model, text, failures };
    } catch (error) {
      const reason = error instanceof Error && /^HTTP_\d{3}$|^EMPTY_RESPONSE$/.test(error.message)
        ? error.message : "REQUEST_FAILED";
      failures.push(`openrouter/${candidate.model}: ${reason}`);
    }
  }

  if (process.env.AI_CLOUD_ENABLED === "true" && process.env.AETHERION_CASCADE_ENABLED === "true") {
    try {
      const result = await queryAetherionCascade(messages, input.maxTokens);
      return { ok: true, provider: "aetherion", model: result.model, text: result.content, failures };
    } catch (error) {
      const reason = error instanceof Error && /^AETHERION_[A-Z_]+(?::.*)?$/.test(error.message)
        ? error.message.slice(0, 500) : "AETHERION_REQUEST_FAILED";
      failures.push(reason);
    }
  }
  if (!failures.length) {
    failures.push(process.env.AI_CLOUD_ENABLED === "true"
      ? "No eligible free OpenRouter model is configured and the Aetherion cascade is disabled."
      : "Cloud inference is disabled; no external request was sent.");
  }
  return { ok: false, provider: "local", model: "deterministic-local-rules", text: null, failures };
}
