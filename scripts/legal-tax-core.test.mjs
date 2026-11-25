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

const {
  assessEuDistanceSales,
  assessEuSmeTurnover,
  assessPackagingVoidRatio,
  buildEpcGiroCodePayload,
  calculateUnitPrice,
  checkThirtyDayLowestPrice,
  normalizeHsCode,
  UNVERIFIED_REQUESTED_CLAIMS,
} = require("../app/services/legal-tax-core.ts");

test("OSS assessment requires complete supplied turnover and distinguishes warning from threshold", () => {
  assert.equal(assessEuDistanceSales({ crossBorderB2cEur: 9_000, periodComplete: true }).status, "APPROACHING_THRESHOLD");
  assert.equal(assessEuDistanceSales({ crossBorderB2cEur: 10_000, periodComplete: true }).status, "THRESHOLD_REACHED");
  assert.equal(assessEuDistanceSales({ crossBorderB2cEur: 10_000, periodComplete: false }).status, "INCOMPLETE_DATA");
  assert.equal(assessEuSmeTurnover({ unionAnnualTurnoverEur: 100_000, recordsComplete: true }).status, "SCREENING_WITHIN_LIMIT");
});

test("packaging and customs checks validate inputs without inventing duties", () => {
  assert.equal(assessPackagingVoidRatio({ packageVolumeCm3: 100, productVolumeCm3: 50 }).status, "SCREENING_WITHIN_LIMIT");
  assert.equal(assessPackagingVoidRatio({ packageVolumeCm3: 100, productVolumeCm3: 20 }).status, "SCREENING_OVER_LIMIT");
  assert.equal(normalizeHsCode("7113.11"), "711311");
  assert.equal(normalizeHsCode("7113.11.20"), null);
  assert.equal(calculateUnitPrice({ priceEur: 10, quantity: 500, unit: "g" }).unitPriceEur, 20);
});

test("the 30-day price check requires a complete baseline and finds the true minimum", () => {
  const checkedAt = new Date("2026-11-24T00:00:00.000Z");
  const history = [
    { priceEur: 20, effectiveAt: "2026-10-01T00:00:00.000Z" },
    { priceEur: 15, effectiveAt: "2026-11-01T00:00:00.000Z" },
    { priceEur: 18, effectiveAt: "2026-11-20T00:00:00.000Z" },
  ];
  assert.equal(checkThirtyDayLowestPrice({ history, declaredReferencePriceEur: 15, checkedAt }).status, "REFERENCE_MATCHES_HISTORY");
  assert.equal(checkThirtyDayLowestPrice({ history, declaredReferencePriceEur: 18, checkedAt }).status, "REFERENCE_PRICE_MISMATCH");
  assert.equal(checkThirtyDayLowestPrice({ history: history.slice(1), declaredReferencePriceEur: 15, checkedAt }).status, "INCOMPLETE_HISTORY");
});

test("EPC payload validates IBAN checksum and marks disputed legal claims unverified", () => {
  const payload = buildEpcGiroCodePayload({
    beneficiary: "Wertarbeit Manufaktur",
    iban: "DE89370400440532013000",
    amountEur: 12.5,
    remittance: "Rechnung 123",
  });
  assert.match(payload, /BCD\n002\n1\nSCT/);
  assert.match(payload, /EUR12\.50/);
  assert.throws(() => buildEpcGiroCodePayload({
    beneficiary: "Wertarbeit Manufaktur",
    iban: "DE00370400440532013000",
    amountEur: 12.5,
  }), /IBAN/);
  assert.ok(UNVERIFIED_REQUESTED_CLAIMS.length >= 5);
});
