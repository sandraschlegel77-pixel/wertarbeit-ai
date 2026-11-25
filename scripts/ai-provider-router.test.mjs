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
