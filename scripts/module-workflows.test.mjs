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
let paused = false;
let subscription = null;
let failAudit = false;
let failFinish = false;
const db = {
  autopilotLog: {
    async create({ data }) {
      if (failAudit) throw new Error("database down");
      rows.push(data);
      return { id: "log-id" };
    },
    async update({ data }) {
      if (failFinish) throw new Error("database down");
      rows.push(data);
    },
  },
  shopSubscription: {
    async findUnique() { return subscription; },
  },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if ((parent?.filename.endsWith("access-control.server.ts") ||
       parent?.filename.endsWith("module-ai-execution.server.ts")) && request === "../db.server") {
    return { __esModule: true, default: db };
  }
  if (parent?.filename.endsWith("module-ai-execution.server.ts") && request === "./autopilot-control.server") {
    return { isShopPaused: async () => paused };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { runModuleWorkflow } = require("../app/services/module-workflows.server.ts");
Module._load = originalLoad;

const owner = "owner.myshopify.com";
const keys = ["OWNER_SHOP_DOMAIN", "AI_CLOUD_ENABLED", "OPENROUTER_API_KEY", "OPENROUTER_MODEL", "AETHERION_CASCADE_ENABLED"];
const originalEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
const oldFetch = global.fetch;

test.after(() => {
  global.fetch = oldFetch;
  for (const key of keys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

test("all six offline workflows return deterministic domain-specific drafts with auditable hashes", async () => {
  process.env.OWNER_SHOP_DOMAIN = owner;
  process.env.AI_CLOUD_ENABLED = "false";
  global.fetch = () => { throw new Error("offline workflow made a network request"); };
  const topics = ["Listing", "Rechnungsprüfung", "Kommunikationsentwurf", "Multichannel", "Werkstattvorbereitung", "Markt-Radar"];
  for (const [index, topic] of topics.entries()) {
    const moduleId = `m${index + 1}`;
    rows = [];
    const result = await runModuleWorkflow(owner, moduleId);
    assert.equal(result.ok, true);
    assert.equal(result.provider, "local");
    assert.match(result.text, new RegExp(topic));
    assert.match(result.failures[0], /disabled/);
    assert.equal(rows[0].shop, owner);
    assert.equal(rows[0].status, "started");
    assert.equal(rows[1].status, "completed");
    for (const row of rows) {
      const { metadata, sha256 } = JSON.parse(row.detail);
      assert.equal(metadata.scope, moduleId);
      assert.equal(sha256, createHash("sha256").update(JSON.stringify(metadata)).digest("hex"));
      assert.doesNotMatch(row.detail, new RegExp(topic));
    }
    const repeat = await runModuleWorkflow(owner, moduleId);
    assert.equal(repeat.text, result.text);
  }
});

test("cloud requests use only zero-price free models and fall back when unavailable", async () => {
  process.env.AI_CLOUD_ENABLED = "true";
  process.env.OPENROUTER_API_KEY = "test-key";
  process.env.AETHERION_CASCADE_ENABLED = "false";
  const requests = [];
  global.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return Response.json({ choices: [{ message: { content: '{"text":"Entwurf"}' } }] });
  };
  process.env.OPENROUTER_MODEL = "provider/paid";
  const blocked = await runModuleWorkflow(owner, "m1");
  assert.equal(blocked.provider, "local");
  assert.equal(requests.length, 0);
  process.env.OPENROUTER_MODEL = "provider/model:free";
  const cloud = await runModuleWorkflow(owner, "m1");
  assert.equal(cloud.provider, "openrouter");
  assert.equal(requests[0].model, "provider/model:free");
  assert.equal(requests[0].provider.max_price.prompt, "0");
  assert.equal(requests[0].provider.max_price.completion, "0");
  global.fetch = async () => new Response("", { status: 429 });
  const fallback = await runModuleWorkflow(owner, "m1");
  assert.equal(fallback.provider, "local");
  assert.match(fallback.failures[0], /HTTP_429/);
});

test("invalid or unauthorized modules, pause and audit failure prevent execution", async () => {
  process.env.AI_CLOUD_ENABLED = "false";
  rows = [];
  subscription = null;
  await assert.rejects(() => runModuleWorkflow(owner, "m7"), /AI_MODULE_INVALID/);
  await assert.rejects(() => runModuleWorkflow("subscriber.myshopify.com", "m2"), /AI_MODULE_SUBSCRIPTION_UNVERIFIED/);
  paused = true;
  await assert.rejects(() => runModuleWorkflow(owner, "m1"), /GLOBAL_AI_PAUSE/);
  paused = false;
  failAudit = true;
  await assert.rejects(() => runModuleWorkflow(owner, "m1"), /AI_AUDIT_START_FAILED/);
  failAudit = false;
  assert.equal(rows.length, 0);
  subscription = { active: true, moduleInvoices: true };
  await assert.rejects(() => runModuleWorkflow("subscriber.myshopify.com", "m2"), /AI_MODULE_SUBSCRIPTION_UNVERIFIED/);
  assert.equal(rows.length, 0);
  failFinish = true;
  await assert.rejects(() => runModuleWorkflow(owner, "m1"), /AI_AUDIT_FINISH_FAILED/);
  failFinish = false;
  assert.equal(rows[0].status, "started");
});
