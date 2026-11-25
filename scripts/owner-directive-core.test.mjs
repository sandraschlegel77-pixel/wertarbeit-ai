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

const { normalizeMarketplaceWishKey, redactCredentialsFromText } =
  require("../app/services/owner-directive-core.ts");

test("credential-like values are redacted before owner directives can be stored", () => {
  const result = redactCredentialsFromText(
    "Bitte nebenan.de prüfen; api_key=sk_live_12345678901234567890 und Bearer abcdefghijklmnop"
  );
  assert.equal(result.redacted, true);
  assert.equal(result.text.includes("sk_live_12345678901234567890"), false);
  assert.equal(result.text.includes("abcdefghijklmnop"), false);
  assert.equal((result.text.match(/\[ZUGANGSDATEN ENTFERNT\]/g) ?? []).length, 2);
});

test("marketplace wish keys normalize equivalent names consistently", () => {
  assert.equal(normalizeMarketplaceWishKey("  Nebenan.DE  "), "nebenan-de");
  assert.equal(normalizeMarketplaceWishKey("Märkte & Mehr"), "markte-mehr");
  assert.equal(normalizeMarketplaceWishKey("!!!"), "");
});
