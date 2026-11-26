import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import process from "node:process";
import test from "node:test";
import * as ts from "typescript";

const require = createRequire(import.meta.url);
require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(outputText, filename);
};

const { maskPiiForExternalModel } = require("../app/services/ai-provider-router-core.ts");
const { routeAiCompletion } = require("../app/services/ai-provider-router.server.ts");
const { queryAetherionCascade } = require("../app/services/aetherion-vault.server.ts");

test("PII and credential-like values are masked before provider prompts", () => {
  const masked = maskPiiForExternalModel(
    'Kunde: Max Mustermann; email: max@example.com; IBAN: DE89370400440532013000; Telefon: +49 151 12345678; api_key=sk_live_1234567890123456'
  );
  assert.equal(masked.includes("max@example.com"), false);
  assert.equal(masked.includes("DE89370400440532013000"), false);
  assert.equal(masked.includes("+49 151 12345678"), false);
  assert.equal(masked.includes("sk_live_1234567890123456"), false);
  assert.equal(masked.includes("Max Mustermann"), false);
});

test("only free OpenRouter slugs are eligible; fallback and prompts remain restricted", async () => {
  const keys = ["AI_CLOUD_ENABLED", "OPENROUTER_API_KEY", "OPENROUTER_MODEL", "AETHERION_CASCADE_ENABLED", "CF_AIG_BASE_URL", "CF_AIG_TOKEN"];
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const oldFetch = global.fetch;
  const requests = [];
  let failDirectOnce = true;
  global.fetch = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    if (url === "https://openrouter.ai/api/v1/chat/completions" && failDirectOnce) {
      failDirectOnce = false;
      return new Response("", { status: 429 });
    }
    return Response.json({ choices: [{ message: { content: "{}" } }] });
  };
  try {
    process.env.AI_CLOUD_ENABLED = "true";
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "openrouter/free";
    process.env.AETHERION_CASCADE_ENABLED = "true";
    process.env.CF_AIG_BASE_URL = "https://gateway.ai.cloudflare.com/v1/account/gateway";
    process.env.CF_AIG_TOKEN = "test-token";
    const result = await routeAiCompletion({ systemPrompt: "review", userPrompt: "email: max@example.com", maxTokens: 20 });
    assert.equal(result.provider, "aetherion");
    assert.equal(requests[0].body.model, "openrouter/free");
    assert.match(requests[1].body.model, /^openrouter\/.+:free$/);
    for (const { body } of requests) {
      assert.equal(body.provider.max_price.prompt, "0");
      assert.equal(body.provider.max_price.completion, "0");
      assert.doesNotMatch(JSON.stringify(body.messages), /max@example\.com/);
    }
    requests.length = 0;
    process.env.AETHERION_CASCADE_ENABLED = "false";
    process.env.OPENROUTER_MODEL = "provider/paid-model";
    const blocked = await routeAiCompletion({ systemPrompt: "review", userPrompt: "safe", maxTokens: 20 });
    assert.equal(blocked.ok, false);
    assert.equal(requests.length, 0);
    await assert.rejects(() => queryAetherionCascade([]), /AETHERION_CASCADE_LOCKED/);
    process.env.OPENROUTER_MODEL = "provider/model:free";
    const free = await routeAiCompletion({ systemPrompt: "review", userPrompt: "safe", maxTokens: 20 });
    assert.equal(free.ok, true);
    assert.equal(requests[0].body.model, "provider/model:free");
  } finally {
    global.fetch = oldFetch;
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test("cloud routing remains offline unless explicitly enabled and configured", async () => {
  const original = process.env.AI_CLOUD_ENABLED;
  delete process.env.AI_CLOUD_ENABLED;
  try {
    const result = await routeAiCompletion({ systemPrompt: "review", userPrompt: "safe", maxTokens: 20 });
    assert.equal(result.ok, false);
    assert.equal(result.provider, "local");
    assert.match(result.failures[0], /disabled/);
  } finally {
    if (original === undefined) delete process.env.AI_CLOUD_ENABLED;
    else process.env.AI_CLOUD_ENABLED = original;
  }
});
