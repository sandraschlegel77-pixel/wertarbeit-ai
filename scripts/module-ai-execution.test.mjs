import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import process from "node:process";
import test from "node:test";
import * as ts from "typescript";

const require = createRequire(import.meta.url);
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(outputText, filename);
};

let rows = [];
let calls = 0;
let failStart = false;
let failFinish = false;
let paused = false;
let subscription = null;
let subscriptionShop;
let vaultAllowed = false;
let vaultReads = 0;
let lastVaultCandidates = [];
const db = {
  autopilotLog: {
    async create({ data }) {
      if (failStart) throw new Error("database down");
      rows.push(data);
      return { id: "log-id" };
    },
    async update({ data }) {
      if (failFinish) throw new Error("database down");
      rows.push(data);
    },
  },
  shopSubscription: {
    async findUnique({ where }) {
      subscriptionShop = where.shop;
      return subscription;
    },
  },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent?.filename.endsWith("access-control.server.ts") && request === "../db.server") {
    return { __esModule: true, default: db };
  }
  if (parent?.filename.endsWith("module-ai-execution.server.ts")) {
    if (request === "../db.server") return { __esModule: true, default: db };
    if (request === "./autopilot-control.server") return { isShopPaused: async () => paused };
    if (request === "./owner-vault.server") return {
      canAccessOwnerVault: (shop) => shop === "owner.myshopify.com",
      getOwnerVaultFreeCandidates: async () => {
        vaultReads++;
        return [{ apiKey: "test-vault-key", model: "example/model:free" }];
      },
    };
    if (request === "./owner-vault-policy.server") return { vaultCloudExecutionAllowed: async () => vaultAllowed };
    if (request === "./ai-provider-router.server") return {
      routeAiCompletion: async (_input, candidates) => {
        calls++;
        lastVaultCandidates = candidates;
        return { ok: true, provider: "openrouter", model: "openrouter/free", text: "private response", failures: [] };
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { executeModuleWithAudit, executeMetaSupervisorWithAudit } = require("../app/services/module-ai-execution.server.ts");
const { isOwnerShop } = require("../app/services/access-control.server.ts");
Module._load = originalLoad;

const prompt = { systemPrompt: "private system", userPrompt: "private user", maxTokens: 20 };
process.env.OWNER_SHOP_DOMAIN = "owner.myshopify.com";

test("module and supervisor calls create shop-scoped verifiable metadata hashes without prompt contents", async () => {
  for (const moduleId of ["m1", "m2", "m3", "m4", "m5", "m6"]) {
    rows = [];
    await executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId });
    assert.equal(rows[0].shop, "owner.myshopify.com");
    assert.equal(rows[0].status, "started");
    assert.equal(rows[1].status, "completed");
    const { metadata, sha256 } = JSON.parse(rows[1].detail);
    assert.equal(metadata.scope, moduleId);
    assert.equal(sha256, createHash("sha256").update(JSON.stringify(metadata)).digest("hex"));
    assert.doesNotMatch(rows[1].detail, /private/);
  }
  rows = [];
  await executeMetaSupervisorWithAudit({ ...prompt, shop: "owner.myshopify.com" });
  assert.equal(JSON.parse(rows[1].detail).metadata.scope, "meta-supervisor");
});

test("vault fallback is limited to authorized owners, enabled policy and missing environment key", async () => {
  const originalVaultKey = process.env.AETHERION_VAULT_KEY;
  const originalOpenRouter = process.env.OPENROUTER_API_KEY;
  process.env.AETHERION_VAULT_KEY = "test-key";
  delete process.env.OPENROUTER_API_KEY;
  vaultAllowed = true;
  vaultReads = 0;
  subscription = { active: true, moduleInvoices: true };
  try {
    await executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m1" });
    assert.equal(vaultReads, 1);
    assert.deepEqual(lastVaultCandidates, [{ apiKey: "test-vault-key", model: "example/model:free" }]);
    await executeModuleWithAudit({ ...prompt, shop: "subscriber.myshopify.com", moduleId: "m2" });
    assert.equal(vaultReads, 1);
    assert.deepEqual(lastVaultCandidates, []);
    vaultAllowed = false;
    await executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m1" });
    assert.equal(vaultReads, 1);
    assert.deepEqual(lastVaultCandidates, []);
    vaultAllowed = true;
    process.env.OPENROUTER_API_KEY = "test-env-key";
    await executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m1" });
    assert.equal(vaultReads, 1);
    assert.deepEqual(lastVaultCandidates, []);
  } finally {
    vaultAllowed = false;
    if (originalVaultKey === undefined) delete process.env.AETHERION_VAULT_KEY; else process.env.AETHERION_VAULT_KEY = originalVaultKey;
    if (originalOpenRouter === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = originalOpenRouter;
  }
});

test("subscriber access follows only active, shop-scoped module flags", async () => {
  for (const [moduleId, flag] of [
    ["m2", "moduleInvoices"], ["m3", "moduleGrowth"],
    ["m4", "moduleMultichannel"], ["m5", "moduleCertificates"],
  ]) {
    subscription = { active: true, [flag]: true };
    rows = [];
    await executeModuleWithAudit({ ...prompt, shop: "subscriber.myshopify.com", moduleId });
    assert.equal(subscriptionShop, "subscriber.myshopify.com");
    assert.equal(rows[0].shop, "subscriber.myshopify.com");
    assert.equal(JSON.parse(rows[1].detail).metadata.scope, moduleId);
    for (const other of ["m1", "m2", "m3", "m4", "m5", "m6"].filter((id) => id !== moduleId)) {
      await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "subscriber.myshopify.com", moduleId: other }), /AI_MODULE_ACCESS_DENIED/);
    }
  }
  for (const value of [null, { active: false, moduleInvoices: true }, { moduleInvoices: true }]) {
    subscription = value;
    await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "subscriber.myshopify.com", moduleId: "m2" }), /AI_MODULE_ACCESS_DENIED/);
  }
});

test("the module wrapper requires an explicitly configured owner domain", async () => {
  assert.equal(isOwnerShop("owner.myshopify.com"), true);
  assert.equal(isOwnerShop("wertarbeit-testshop.myshopify.com"), true);
  assert.equal(isOwnerShop("wertarbeitmanufaktur.myshopify.com"), true);
  assert.equal(isOwnerShop("owner.myshopify.com.evil.example"), false);
  subscription = null;
  for (const shop of ["wertarbeitmanufaktur.myshopify.com", "wertarbeit-testshop.myshopify.com"]) {
    await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop, moduleId: "m1" }), /AI_MODULE_ACCESS_DENIED/);
  }
});

test("module validation, subscription, pause and audit failures fail closed", async () => {
  rows = [];
  calls = 0;
  subscription = { active: true, moduleInvoices: true };
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m7" }), /AI_MODULE_INVALID/);
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "subscriber.myshopify.com", moduleId: "m1" }), /AI_MODULE_ACCESS_DENIED/);
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m1", localOnly: true }), /AI_LOCAL_FALLBACK_REQUIRED/);
  paused = true;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m1" }), /GLOBAL_AI_PAUSE/);
  paused = false;
  failStart = true;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner.myshopify.com", moduleId: "m1" }), /AI_AUDIT_START_FAILED/);
  failStart = false;
  assert.equal(calls, 0);
  failFinish = true;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "subscriber.myshopify.com", moduleId: "m2" }), /AI_AUDIT_FINISH_FAILED/);
  failFinish = false;
  assert.equal(calls, 1);
});
