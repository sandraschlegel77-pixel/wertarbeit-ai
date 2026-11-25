/**
 * APEX RESCUE-112 — 4-stufiger Not-KI & Triple-Failover-Router (streng 2500ms Timeout)
 * Dauerhaft 0,00 € Stack. Automatische Kaskade: Primary → Not-KI 1 → Not-KI 2 → Autarker Offline-Kern.
 * Zusätzlich: PostgreSQL (DATABASE_URL) / SQLite/Turso (TURSO_DATABASE_URL) als Ausweich-Speicher.
 */
import { maskPiiForExternalModel } from "./ai-provider-router-core";

type Provider = "groq" | "google" | "openrouter" | "ollama" | "local";

interface ModelCandidate {
  provider: Provider;
  model: string;
}

interface AttemptResult {
  ok: boolean;
  provider: Provider;
  model: string;
  text: string | null;
  failures?: string;
}

const STAGE_1_PRIMARY: ModelCandidate[] = [
  { provider: "groq", model: "mixtral-8x7b-32768" },
  { provider: "groq", model: "gemma-7b-it" },
  { provider: "google", model: "gemini-1.5-flash" },
];

const STAGE_2_FREE: ModelCandidate[] = [
  { provider: "openrouter", model: "anthropic/claude-3.5-sonnet:free" },
  { provider: "openrouter", model: "anthropic/claude-3-haiku:free" },
  { provider: "openrouter", model: "mistralai/mistral-large-2:free" },
  { provider: "openrouter", model: "google/gemini-1.5-flash:free" },
  { provider: "openrouter", model: "meta-llama/llama-3.1-8b-instruct:free" },
];

const STAGE_3_OLLAMA: ModelCandidate[] = [
  { provider: "ollama", model: "llama3:8b" },
  { provider: "ollama", model: "mixtral:instruct" },
  { provider: "ollama", model: "phi:2.7b" },
];

const OFFLINE_KERN_RULES = [
  "IF-THEN-REGEL: Wenn Investition < 1000 € → Autopilot (299 € / 2 Threads)",
  "IF-THEN-REGEL: Wenn Investition >= 1000 € und < 5000 € → Enterprise (990 € / 8 Threads)",
  "IF-THEN-REGEL: Wenn Investition >= 5000 € → Apex Sovereign (3.500 €+ / 64 Threads)",
  "SICHERHEIT: Blockiere jede Anfrage, die biometrische Daten anfordert",
  "SICHERHEIT: High-Risk AI nach EU AI Act ablehnen (kein Scoring, keine biometrische ID)",
  "KONFORMITÄT: DSGVO standardmäßig aktiv (Privacy by Design / by Default)",
  "KONFORMITÄT: EU AI Act Risikomanagement Dokumentation nutzen",
];
function makeTimeoutSignal(): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 2500);
  return controller.signal;
}

async function fetchWithTimeout(
  endpoint: string,
  headers: Record<string, string>,
  body: object
): Promise<Response> {
  const signal = makeTimeoutSignal();
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });
  return response;
}

async function callOpenRouter(candidate: ModelCandidate, system: string, prompt: string, maxTokens: number): Promise<AttemptResult> {
  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`, "Content-Type": "application/json" },
    { model: candidate.model, temperature: 0, max_tokens: maxTokens, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }
  );
  if (!response.ok) return { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: `HTTP ${response.status}` };
  const json = await response.json();
  const text = (json as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? null;
  return text ? { ok: true, provider: candidate.provider, model: candidate.model, text } : { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: "EMPTY_RESPONSE" };
}

async function callGroq(candidate: ModelCandidate, system: string, prompt: string, maxTokens: number): Promise<AttemptResult> {
  const response = await fetchWithTimeout(
    "https://api.groq.com/openai/v1/chat/completions",
    { Authorization: `Bearer ${process.env.GROQ_API_KEY || ""}`, "Content-Type": "application/json" },
    { model: candidate.model, temperature: 0, max_tokens: maxTokens, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }
  );
  if (!response.ok) return { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: `HTTP ${response.status}` };
  const json = await response.json();
  const text = (json as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? null;
  return text ? { ok: true, provider: candidate.provider, model: candidate.model, text } : { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: "EMPTY_RESPONSE" };
}

async function callGoogle(candidate: ModelCandidate, system: string, prompt: string, maxTokens: number): Promise<AttemptResult> {
  const model = candidate.model.replace(/^models\//, "");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${process.env.GEMINI_API_KEY || ""}`;
  const response = await fetchWithTimeout(
    endpoint,
    { "Content-Type": "application/json" },
    { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0, maxOutputTokens: maxTokens, responseMimeType: "application/json" } }
  );
  if (!response.ok) return { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: `HTTP ${response.status}` };
  const json = await response.json();
  const text = (json as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? null;
  return text ? { ok: true, provider: candidate.provider, model: candidate.model, text } : { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: "EMPTY_RESPONSE" };
}

async function callOllama(candidate: ModelCandidate, system: string, prompt: string, maxTokens: number): Promise<AttemptResult> {
  const base = process.env.OLLAMA_BASE_URL || "";
  if (!base) return { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: "OLLAMA_BASE_URL nicht gesetzt" };
  const response = await fetchWithTimeout(
    `${base}/api/chat`,
    { "Content-Type": "application/json" },
    { model: candidate.model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], stream: false }
  );
  if (!response.ok) return { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: `HTTP ${response.status}` };
  const json = await response.json();
  const text = (json as { message?: { content?: string } }).message?.content ?? null;
  return text ? { ok: true, provider: candidate.provider, model: candidate.model, text } : { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: "EMPTY_RESPONSE" };
}
async function callProvider(candidate: ModelCandidate, system: string, prompt: string, maxTokens: number): Promise<AttemptResult> {
  if (candidate.provider === "openrouter") return callOpenRouter(candidate, system, prompt, maxTokens);
  if (candidate.provider === "groq") return callGroq(candidate, system, prompt, maxTokens);
  if (candidate.provider === "google") return callGoogle(candidate, system, prompt, maxTokens);
  if (candidate.provider === "ollama") return callOllama(candidate, system, prompt, maxTokens);
  return { ok: false, provider: candidate.provider, model: candidate.model, text: null, failures: "UNKNOWN_PROVIDER" };
}

export interface FailoverResult {
  stage: number;
  provider: Provider;
  model: string;
  text: string | null;
  failures: string[];
}

export async function runRescue112Failover(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<FailoverResult> {
  const system = maskPiiForExternalModel(systemPrompt).slice(0, 4000);
  const prompt = maskPiiForExternalModel(userPrompt).slice(0, 8000);
  const allFailures: string[] = [];

  for (const c of STAGE_1_PRIMARY) {
    const res = await callProvider(c, system, prompt, maxTokens);
    if (res.ok && res.text) return { stage: 1, provider: res.provider, model: res.model, text: res.text, failures: allFailures };
    if (res.failures) allFailures.push(`${res.provider}/${res.model}: ${res.failures}`);
  }

  for (const c of STAGE_2_FREE) {
    const res = await callProvider(c, system, prompt, maxTokens);
    if (res.ok && res.text) return { stage: 2, provider: res.provider, model: res.model, text: res.text, failures: allFailures };
    if (res.failures) allFailures.push(`${res.provider}/${res.model}: ${res.failures}`);
  }

  for (const c of STAGE_3_OLLAMA) {
    const res = await callProvider(c, system, prompt, maxTokens);
    if (res.ok && res.text) return { stage: 3, provider: res.provider, model: res.model, text: res.text, failures: allFailures };
    if (res.failures) allFailures.push(`${res.provider}/${res.model}: ${res.failures}`);
  }

  return {
    stage: 4,
    provider: "local",
    model: "deterministic-offline-kern",
    text: OFFLINE_KERN_RULES.join(" | "),
    failures: allFailures,
  };
}

export interface StorageBackend {
  type: "postgres" | "sqlite" | "turso";
  connectionString: string;
}

export function detectStorageBackend(): StorageBackend | null {
  const dbUrl = process.env.DATABASE_URL;
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (tursoUrl) return { type: "turso", connectionString: tursoUrl };
  if (dbUrl) return { type: "postgres", connectionString: dbUrl };
  return { type: "sqlite", connectionString: "file:./apx-rescue112.db?mode=memory&cache=shared" };
}

export function generateOfflineAuditLog(stage: number, provider: Provider, model: string): string {
  const ts = new Date().toISOString();
  const label = { 1: "PRIMARY", 2: "NOT-KI-1", 3: "NOT-KI-2", 4: "OFFLINE-KERN" }[stage] ?? "UNBEKANNT";
  return `[${ts}] APEX RESCUE-112 — ${label} aktiviert | Provider: ${provider} | Modell: ${model} | Stack: 0,00 € N+2 Triple-Redundanz`;
}
