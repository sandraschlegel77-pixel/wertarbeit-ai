import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
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
  shopSubscription: { async findUnique() { return { active: true, moduleInvoices: true }; } },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent?.filename.endsWith("module-ai-execution.server.ts")) {
    if (request === "../db.server") return { __esModule: true, default: db };
    if (request === "./access-control.server") return { isOwnerShop: (shop) => shop === "owner" };
    if (request === "./autopilot-control.server") return { isShopPaused: async () => paused };
    if (request === "./module-access") return {
      OWNER_MODULE_IDS: ["m1", "m2", "m3", "m4", "m5", "m6"],
      moduleIdsFromSubscription: (subscription) => subscription?.active && subscription.moduleInvoices ? ["m2"] : [],
    };
    if (request === "./ai-provider-router.server") return {
      routeAiCompletion: async () => {
        calls++;
        return { ok: true, provider: "openrouter", model: "openrouter/free", text: "private response", failures: [] };
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { executeModuleWithAudit, executeMetaSupervisorWithAudit } = require("../app/services/module-ai-execution.server.ts");
Module._load = originalLoad;

const prompt = { systemPrompt: "private system", userPrompt: "private user", maxTokens: 20 };

test("module and supervisor calls create shop-scoped verifiable metadata hashes without prompt contents", async () => {
  for (const moduleId of ["m1", "m2", "m3", "m4", "m5", "m6"]) {
    rows = [];
    await executeModuleWithAudit({ ...prompt, shop: "owner", moduleId });
    assert.equal(rows[0].shop, "owner");
    assert.equal(rows[0].status, "started");
    assert.equal(rows[1].status, "completed");
    const { metadata, sha256 } = JSON.parse(rows[1].detail);
    assert.equal(metadata.scope, moduleId);
    assert.equal(sha256, createHash("sha256").update(JSON.stringify(metadata)).digest("hex"));
    assert.doesNotMatch(rows[1].detail, /private/);
  }
  rows = [];
  await executeMetaSupervisorWithAudit({ ...prompt, shop: "owner" });
  assert.equal(JSON.parse(rows[1].detail).metadata.scope, "meta-supervisor");
});

test("module validation, subscription, pause and audit failures fail closed", async () => {
  rows = [];
  calls = 0;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner", moduleId: "m7" }), /AI_MODULE_INVALID/);
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "subscriber", moduleId: "m1" }), /AI_MODULE_ACCESS_DENIED/);
  paused = true;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner", moduleId: "m1" }), /GLOBAL_AI_PAUSE/);
  paused = false;
  failStart = true;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "owner", moduleId: "m1" }), /AI_AUDIT_START_FAILED/);
  failStart = false;
  assert.equal(calls, 0);
  failFinish = true;
  await assert.rejects(() => executeModuleWithAudit({ ...prompt, shop: "subscriber", moduleId: "m2" }), /AI_AUDIT_FINISH_FAILED/);
  failFinish = false;
  assert.equal(calls, 1);
});
