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
  assertSellableUniqueInventory,
  buildGs1DigitalLink,
  buildXtoolLayeredSvg,
  projectDppFacts,
  ManufakturInputError,
} = require("../app/services/manufaktur-apex-core.ts");

test("SVG creates three distinct color-coded layers and escapes customer text", () => {
  const result = buildXtoolLayeredSvg({
    engravingText: "A&B <C>",
    material: "Silber",
    widthMm: 30,
    heightMm: 15,
    font: "SERIF",
  });
  assert.match(result.svg, /Gravur #000000/);
  assert.match(result.svg, /Schnitt #FF0000/);
  assert.match(result.svg, /A&amp;B &lt;C&gt;/);
  assert.equal(result.nativeXcsPresetCreated, false);
});

test("sold-out unique items are blocked and invalid measurements fail", () => {
  assert.throws(() => assertSellableUniqueInventory(0), ManufakturInputError);
  assert.doesNotThrow(() => assertSellableUniqueInventory(1));
  assert.throws(() => buildXtoolLayeredSvg({
    engravingText: "Test", material: "Silber", widthMm: 0, heightMm: 15,
  }), ManufakturInputError);
});

test("DPP disclosure filters fields by role and requires a valid GTIN checksum", () => {
  const facts = {
    gtin: "4006381333931",
    productName: "Unikat",
    material: "925 Silber",
    supplierEvidence: "private supplier record",
    batchOrSerial: "SERIAL-1",
    complianceDocuments: ["doc.pdf"],
  };
  assert.equal(buildGs1DigitalLink(facts.gtin), "https://id.gs1.org/01/4006381333931");
  assert.equal("supplierEvidence" in projectDppFacts(facts, "PUBLIC"), false);
  assert.equal("supplierEvidence" in projectDppFacts(facts, "BUSINESS_PARTNER"), true);
  assert.throws(() => buildGs1DigitalLink("4006381333930"), ManufakturInputError);
});
