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

const { calculateAgentPerformance } = require("../app/services/agent-performance.ts");

const evidence = (overrides = {}) => ({
  approvedCount: 0,
  rejectedCount: 0,
  evolutionCount: 0,
  evolutionScoreTotal: 0,
  realRevenueEntryCount: 0,
  realRevenueEur: 0,
  ...overrides,
});

test("performance grades use recorded outcomes and never invent a grade without evidence", () => {
  const noData = calculateAgentPerformance(evidence(), evidence(), evidence());
  assert.equal(noData.grade, null);
  assert.equal(noData.trend, "UNAVAILABLE");
  assert.equal(noData.academyStatus, "IN_TRAINING");

  const strong = calculateAgentPerformance(
    evidence({ approvedCount: 10, evolutionCount: 2, evolutionScoreTotal: 2, realRevenueEntryCount: 1, realRevenueEur: 50 }),
    evidence({ approvedCount: 2, evolutionCount: 1, evolutionScoreTotal: 1 }),
    evidence({ rejectedCount: 2, evolutionCount: 1, evolutionScoreTotal: 0 })
  );
  assert.equal(strong.grade, 1);
  assert.equal(strong.trend, "UP");
  assert.equal(strong.academyStatus, "CERTIFIED");
  assert.equal(strong.careerRank, "Spezialist");
});

test("negative outcomes lower the score and can trigger retraining", () => {
  const result = calculateAgentPerformance(
    evidence({ rejectedCount: 5, evolutionCount: 1, evolutionScoreTotal: 0, realRevenueEntryCount: 1, realRevenueEur: -10 }),
    evidence(),
    evidence()
  );
  assert.equal(result.grade, 6);
  assert.equal(result.academyStatus, "RETRAINING");
});
