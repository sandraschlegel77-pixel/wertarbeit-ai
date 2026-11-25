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

test("the roster contains 232 core and 100 Apex profiles across the expected number ranges", () => {
  assert.equal(STAMM_COUNT, 332);
  assert.equal(STAMM_AGENTS.length, 332);
  const coreNumbers = STAMM_AGENTS.filter((agent) => agent.number <= 232).map((agent) => agent.number);
  assert.deepEqual(coreNumbers, Array.from({ length: 232 }, (_, index) => index + 1));
  assert.deepEqual(
    STAMM_AGENTS.filter((agent) => agent.number >= 301).map((agent) => agent.number),
    Array.from({ length: 100 }, (_, index) => index + 301)
  );
  assert.equal(DEPARTMENTS.length, 26);
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 206)?.departmentId, 25);
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 207)?.departmentId, 26);
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 220)?.name, "Chief 1-Click Preparation & Daily Briefing Officer");
  assert.ok(STAMM_AGENTS.filter((agent) => agent.number >= 221 && agent.number <= 232).every((agent) => agent.advisoryOnly));
  assert.equal(STAMM_AGENTS.find((agent) => agent.number === 400)?.specialistCluster, "apex-system-coordinator");
});
