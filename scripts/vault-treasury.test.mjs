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

const { assessGrantApplicationTiming } = require("../app/services/vault-treasury-core.ts");

test("grant timing is only a precheck and blocks applications not preceding commitment", () => {
  const applicationAt = new Date("2026-01-01T00:00:00Z");
  const commitmentAt = new Date("2026-01-02T00:00:00Z");
  assert.equal(assessGrantApplicationTiming({
    programmeRequiresPreapproval: null,
  }).status, "CHECK_PROGRAMME_TERMS");
  assert.equal(assessGrantApplicationTiming({
    programmeRequiresPreapproval: true,
    applicationAt,
    commitmentAt,
  }).status, "TIMING_PRECHECK_PASSED");
  assert.equal(assessGrantApplicationTiming({
    programmeRequiresPreapproval: true,
    applicationAt: commitmentAt,
    commitmentAt,
  }).status, "TIMING_BLOCKED");
});
