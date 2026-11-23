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

const { DEPARTMENTS, STAMM_AGENTS, STAMM_COUNT } = require("../app/services/agent-roster.ts");

test("the roster contains exactly 220 consecutive permanent agents across 26 departments", () => {
  assert.equal(STAMM_COUNT, 220);
  assert.equal(STAMM_AGENTS.length, 220);
  assert.deepEqual(STAMM_AGENTS.map((agent) => agent.number), Array.from({ length: 220 }, (_, index) => index + 1));
  assert.equal(DEPARTMENTS.length, 26);
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 206)?.departmentId, 25);
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 207)?.departmentId, 26);
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 220)?.name, "Chief 1-Click Preparation & Daily Briefing Officer");
});
