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

const { isApprovalException } = require("../app/services/approval-exceptions.ts");
const item = (overrides = {}) => ({
  financialImpactEur: 0,
  riskLevel: "LOW",
  sourceAgentKey: "A18",
  title: "Routine",
  summary: "Routine",
  ...overrides,
});

test("the preparation desk admits only persisted exception indicators", () => {
  assert.equal(isApprovalException(item()), false);
  assert.equal(isApprovalException(item({ financialImpactEur: 0.01 })), true);
  assert.equal(isApprovalException(item({ riskLevel: "HIGH" })), true);
  assert.equal(isApprovalException(item({ sourceAgentKey: "A224" })), true);
  assert.equal(isApprovalException(item({ summary: "Vorher 10 €, nachher 12 €" })), true);
});
