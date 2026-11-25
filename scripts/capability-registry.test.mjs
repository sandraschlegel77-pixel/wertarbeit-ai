import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
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

const { CAPABILITY_PROFILES, capabilityEvidenceIsFresh, resolveCapabilityProfile } =
  require("../app/services/capability-registry-core.ts");

test("known marketplace aliases resolve to conservative interface classifications", () => {
  assert.equal(resolveCapabilityProfile("Bitte nebenan.de lokal prüfen").domainKey, "nebenan-local-post-assistant");
  assert.equal(resolveCapabilityProfile("Etsy Open API").feasibility, "API_DIRECT");
  assert.equal(resolveCapabilityProfile("Catawiki").feasibility, "MANUAL_ASSISTANT");
  assert.equal(resolveCapabilityProfile("unknown channel"), null);
});

test("the capability catalog distinguishes docs evidence from an active connection", () => {
  const shopify = CAPABILITY_PROFILES.find((profile) => profile.domainKey === "shopify-admin-graphql-2026-10");
  assert.equal(shopify.sourceUrl, "https://shopify.dev/docs/api/admin-graphql/2026-10");
  assert.equal(shopify.evidenceSummary.includes("Marktplatz-Verbindung"), true);
});

test("only current verified evidence qualifies for use", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  assert.equal(capabilityEvidenceIsFresh({
    isVerified: true,
    verifiedAt: new Date("2026-11-01T12:00:00Z"),
    expiresAt: new Date("2026-12-01T12:00:00Z"),
  }, now), true);
  assert.equal(capabilityEvidenceIsFresh({
    isVerified: true,
    verifiedAt: new Date("2026-08-01T12:00:00Z"),
    expiresAt: null,
  }, now), false);
  assert.equal(capabilityEvidenceIsFresh({ isVerified: false, verifiedAt: new Date(now), expiresAt: null }, now), false);
});
