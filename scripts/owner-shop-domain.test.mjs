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

const { getOwnerShopDomains, getPrimaryOwnerShopDomain, isConfiguredOwnerShop, isCanonicalOwnerShop } =
  require("../app/services/access-control-core.ts");
const { OWNER_MODULE_IDS, getAccessibleDepartmentIds } =
  require("../app/services/module-access.ts");

test("owner shop configuration supports a normalized comma-separated domain list", () => {
  const config = " wertarbeitmanufaktur.myshopify.com, wertarbeit-testshop.myshopify.com ";
  assert.deepEqual(getOwnerShopDomains(config), [
    "wertarbeitmanufaktur.myshopify.com",
    "wertarbeit-testshop.myshopify.com",
  ]);
  assert.equal(isConfiguredOwnerShop("wertarbeitmanufaktur.myshopify.com", config), true);
  assert.equal(isConfiguredOwnerShop(" WERTARBEIT-TESTSHOP.MYSHOPIFY.COM ", config), true);
  assert.equal(isConfiguredOwnerShop("subscriber.myshopify.com", config), false);
  assert.equal(isConfiguredOwnerShop("wertarbeit-testshop.myshopify.com", undefined), false);
  assert.equal(
    getPrimaryOwnerShopDomain(config, "fallback.myshopify.com"),
    "wertarbeitmanufaktur.myshopify.com",
  );
  assert.equal(getPrimaryOwnerShopDomain("", "fallback.myshopify.com"), "fallback.myshopify.com");
});

test("the two canonical owner shops remain owners regardless of process environment", () => {
  for (const shop of ["wertarbeitmanufaktur.myshopify.com", "wertarbeit-testshop.myshopify.com"]) {
    assert.equal(isCanonicalOwnerShop(shop), true);
  }
  assert.equal(isCanonicalOwnerShop("subscriber.myshopify.com"), false);
  assert.equal(isConfiguredOwnerShop("custom-owner.myshopify.com", "custom-owner.myshopify.com"), true);
});

test("owner access includes every module and department even without a subscription", () => {
  assert.deepEqual([...OWNER_MODULE_IDS], ["m1", "m2", "m3", "m4", "m5", "m6"]);
  assert.ok(getAccessibleDepartmentIds([], true).length > 0);
});
