import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
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

const owner = "wertarbeitmanufaktur.myshopify.com";
const otherOwner = "wertarbeit-testshop.myshopify.com";
let sessionShop = owner;
let rows = [];
const db = {
  ownerVaultSecret: {
    async count({ where }) { return rows.filter((row) => row.shop === where.shop).length; },
    async create({ data }) { rows.push({ ...data, createdAt: new Date() }); },
    async findMany({ where, select }) {
      assert.deepEqual(select, { id: true, label: true, createdAt: true });
      return rows.filter((row) => row.shop === where.shop).map(({ id, label, createdAt }) => ({ id, label, createdAt }));
    },
    async deleteMany({ where }) {
      const before = rows.length;
      rows = rows.filter((row) => row.shop !== where.shop || row.id !== where.id);
      return { count: before - rows.length };
    },
  },
  async $transaction(callback, options) {
    assert.equal(options.isolationLevel, "Serializable");
    return callback(this);
  },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent?.filename.endsWith("owner-vault.server.ts") && request === "../db.server") {
    return { __esModule: true, default: db };
  }
  if (parent?.filename.endsWith("api.owner-vault.ts") && request === "../shopify.server") {
    return { authenticate: { admin: async () => ({ session: { shop: sessionShop } }) } };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const service = require("../app/services/owner-vault.server.ts");
const route = require("../app/routes/api.owner-vault.ts");
const { decryptVaultBlob } = require("../app/services/aetherion-vault.server.ts");
Module._load = originalLoad;

const originalOwner = process.env.OWNER_SHOP_DOMAIN;
const originalKey = process.env.AETHERION_VAULT_KEY;
test.after(() => {
  if (originalOwner === undefined) delete process.env.OWNER_SHOP_DOMAIN;
  else process.env.OWNER_SHOP_DOMAIN = originalOwner;
  if (originalKey === undefined) delete process.env.AETHERION_VAULT_KEY;
  else process.env.AETHERION_VAULT_KEY = originalKey;
});

function request(fields) {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return new Request("https://example.invalid/api/owner-vault", { method: "POST", body });
}

test("vault requires a canonical shop that is also explicitly configured", async () => {
  process.env.OWNER_SHOP_DOMAIN = `${owner},custom.myshopify.com`;
  assert.equal(service.canAccessOwnerVault(owner), true);
  assert.equal(service.canAccessOwnerVault(otherOwner), false);
  assert.equal(service.canAccessOwnerVault("custom.myshopify.com"), false);
  assert.equal(service.canAccessOwnerVault(`${owner}.evil.example`), false);
  sessionShop = "custom.myshopify.com";
  assert.equal((await route.loader({ request: new Request("https://example.invalid/api/owner-vault") })).status, 403);
  assert.equal((await route.action({ request: request({ type: "save", label: "Test", value: "placeholder" }) })).status, 403);
  assert.equal(rows.length, 0);
});

test("vault stores authenticated ciphertext and returns only shop-scoped masked-entry metadata", async () => {
  sessionShop = owner;
  process.env.OWNER_SHOP_DOMAIN = `${owner},${otherOwner}`;
  process.env.AETHERION_VAULT_KEY = randomBytes(32).toString("hex");
  const secret = "example-test-value";
  const response = await route.action({ request: request({ type: "save", label: "Test API", value: secret }) });
  assert.equal(response.status, 200);
  assert.doesNotMatch(await response.text(), /example-test-value/);
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].ciphertext, secret);
  assert.equal(decryptVaultBlob(rows[0].ciphertext, process.env.AETHERION_VAULT_KEY, `${owner}:${rows[0].id}`), secret);
  assert.throws(() => decryptVaultBlob(rows[0].ciphertext, process.env.AETHERION_VAULT_KEY, `${otherOwner}:${rows[0].id}`));
  const list = await route.loader({ request: new Request("https://example.invalid/api/owner-vault") });
  assert.equal(list.headers.get("cache-control"), "no-store");
  const text = await list.text();
  assert.match(text, /Test API/);
  assert.doesNotMatch(text, /example-test-value|ciphertext/);
  sessionShop = otherOwner;
  const otherList = await route.loader({ request: new Request("https://example.invalid/api/owner-vault") });
  assert.equal((await otherList.json()).entries.length, 0);
  assert.equal((await route.action({ request: request({ type: "delete", id: rows[0].id }) })).status, 400);
  assert.equal(rows.length, 1);
  sessionShop = owner;
  assert.equal((await route.action({ request: request({ type: "delete", id: rows[0].id }) })).status, 200);
  assert.equal(rows.length, 0);
});

test("missing keys and invalid inputs fail without writing a secret", async () => {
  delete process.env.AETHERION_VAULT_KEY;
  assert.equal((await route.action({ request: request({ type: "save", label: "Test", value: "placeholder" }) })).status, 400);
  process.env.AETHERION_VAULT_KEY = randomBytes(32).toString("hex");
  assert.equal((await route.action({ request: request({ type: "save", label: "", value: "placeholder" }) })).status, 400);
  assert.equal((await route.action({ request: request({ type: "save", label: "Test", value: "x".repeat(8193) }) })).status, 400);
  assert.equal(rows.length, 0);
});

test("vault refuses entries beyond the per-shop limit", async () => {
  rows = Array.from({ length: 100 }, (_, i) => ({ id: String(i), shop: owner }));
  assert.equal((await route.action({ request: request({ type: "save", label: "Test", value: "placeholder" }) })).status, 400);
  assert.equal(rows.length, 100);
});
