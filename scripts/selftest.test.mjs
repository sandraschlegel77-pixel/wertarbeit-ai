import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
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

let calls = 0;
let failDb = false;
let failWorkflow = false;
let tamperAudit = false;
const metadata = { scope: "m1", status: "completed" };
const db = {
  async $queryRaw() {
    calls++;
    if (failDb) throw new Error("database down");
  },
  autopilotLog: {
    async findFirst({ where }) {
      assert.equal(where.id, "test-log");
      assert.equal(where.shop, "owner.myshopify.com");
      return { detail: JSON.stringify({ metadata, sha256: tamperAudit ? "bad" : createHash("sha256").update(JSON.stringify(metadata)).digest("hex") }) };
    },
  },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent?.filename.endsWith("api.selftest.ts") && request === "../db.server") {
    return { __esModule: true, default: db };
  }
  if (parent?.filename.endsWith("api.selftest.ts") && request === "../services/module-workflows.server") {
    return { runModuleWorkflow: async (shop, moduleId, options) => {
      assert.equal(shop, "owner.myshopify.com");
      assert.equal(moduleId, "m1");
      assert.equal(options.localOnly, true);
      if (failWorkflow) throw new Error("GLOBAL_AI_PAUSE");
      return { ok: true, auditLogId: "test-log" };
    } };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const { action } = require("../app/routes/api.selftest.ts");
const { encryptVaultBlob, decryptVaultBlob } = require("../app/services/aetherion-vault.server.ts");
Module._load = originalLoad;

const keys = ["SELFTEST_TOKEN", "CRON_SECRET", "OWNER_SHOP_DOMAIN", "AI_CLOUD_ENABLED", "AETHERION_CASCADE_ENABLED", "SHOPIFY_APP_URL"];
const originalEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
test.after(() => {
  for (const key of keys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
const invoke = (token = "") => action({
  request: new Request("http://localhost/api/selftest", {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }),
});

test("selftest requires a configured secret and rejects missing and invalid credentials", async () => {
  delete process.env.SELFTEST_TOKEN;
  delete process.env.CRON_SECRET;
  assert.equal((await invoke()).status, 503);
  process.env.SELFTEST_TOKEN = "test-token-at-least-16";
  assert.equal((await invoke()).status, 401);
  assert.equal((await invoke("not-the-token")).status, 401);
  assert.equal(calls, 0);
});

test("selftest reports only configuration presence and verifies the exact audit row", async () => {
  process.env.OWNER_SHOP_DOMAIN = "owner.myshopify.com";
  process.env.AI_CLOUD_ENABLED = "false";
  process.env.AETHERION_CASCADE_ENABLED = "false";
  process.env.SHOPIFY_APP_URL = "https://example.invalid";
  let response = await invoke(process.env.SELFTEST_TOKEN);
  let data = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(data.checks, {
    database: true,
    env: { OWNER_SHOP_DOMAIN: true, AI_CLOUD_ENABLED: true, AETHERION_CASCADE_ENABLED: true, SHOPIFY_APP_URL: true },
    encryption: true,
    workflow: true,
  });
  assert.doesNotMatch(JSON.stringify(data), /owner\.myshopify|example\.invalid|test-token/);
  tamperAudit = true;
  response = await invoke(process.env.SELFTEST_TOKEN);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).checks.workflow, false);
  tamperAudit = false;
  failWorkflow = true;
  response = await invoke(process.env.SELFTEST_TOKEN);
  assert.equal((await response.json()).checks.workflow, false);
  failWorkflow = false;
  failDb = true;
  response = await invoke(process.env.SELFTEST_TOKEN);
  assert.equal((await response.json()).checks.database, false);
  failDb = false;
  process.env.CRON_SECRET = "another-token-at-least-16";
  assert.equal((await invoke(process.env.CRON_SECRET)).status, 200);
});

test("vault encryption authenticates ciphertext and rejects malformed keys", () => {
  const key = randomBytes(32).toString("hex");
  const blob = encryptVaultBlob("example", key);
  assert.equal(decryptVaultBlob(blob, key), "example");
  const tampered = Buffer.from(blob, "base64");
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => decryptVaultBlob(tampered.toString("base64"), key));
  assert.throws(() => encryptVaultBlob("example", `${key}zz`), /VAULT_KEY_INVALID/);
  assert.throws(() => decryptVaultBlob(blob, `${key}zz`), /VAULT_KEY_INVALID/);
});
