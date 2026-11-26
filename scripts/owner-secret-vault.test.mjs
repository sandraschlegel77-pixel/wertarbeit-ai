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
let initializationAttempts = 0;
let failInitialization = false;
let ddl = [];
let audit = [];
let failAudit = false;
const db = {
  autopilotLog: {
    async create({ data }) {
      if (failAudit) throw new Error("audit unavailable");
      audit.push(data);
      return { id: String(audit.length) };
    },
  },
  async $queryRaw(strings) {
    assert.match(strings.join(""), /pg_advisory_xact_lock/);
  },
  async $executeRaw(strings) {
    const sql = strings.join("");
    ddl.push(sql);
    if (failInitialization) throw new Error("DDL unavailable");
  },
  ownerVaultSecret: {
    async count({ where }) { return rows.filter((row) => row.shop === where.shop).length; },
    async create({ data }) { rows.push({ ...data, createdAt: new Date() }); },
    async findMany({ where, select }) {
      if (select.ciphertext) {
        assert.deepEqual(select, { id: true, label: true, ciphertext: true, createdAt: true });
        return rows.filter((row) => row.shop === where.shop).map(({ id, label, ciphertext, createdAt }) => ({ id, label, ciphertext, createdAt }));
      }
      assert.deepEqual(select, { id: true, label: true });
      return rows.filter((row) => row.shop === where.shop).map(({ id, label }) => ({ id, label }));
    },
    async findFirst({ where }) { return rows.find((row) => row.shop === where.shop && row.id === where.id) ?? null; },
    async updateMany({ where, data }) {
      const row = rows.find((item) => item.shop === where.shop && item.id === where.id);
      if (!row) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    },
    async deleteMany({ where }) {
      const before = rows.length;
      rows = rows.filter((row) => row.shop !== where.shop || row.id !== where.id);
      return { count: before - rows.length };
    },
  },
  async $transaction(callback, options) {
    if (options) assert.equal(options.isolationLevel, "Serializable");
    else initializationAttempts++;
    return callback(this);
  },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if ((parent?.filename.endsWith("owner-vault.server.ts") || parent?.filename.endsWith("owner-vault-auth.server.ts")) && request === "../db.server") {
    return { __esModule: true, default: db };
  }
  if (parent?.filename.endsWith("api.owner-vault.ts") && request === "../shopify.server") {
    return { authenticate: { admin: async () => ({ session: { shop: sessionShop, id: `session-${sessionShop}` } }) } };
  }
  return originalLoad.call(this, request, parent, isMain);
};
const service = require("../app/services/owner-vault.server.ts");
const route = require("../app/routes/api.owner-vault.ts");
const auth = require("../app/services/owner-vault-auth.server.ts");
const { decryptVaultBlob, encryptVaultBlob } = require("../app/services/aetherion-vault.server.ts");
const { parseOwnerVaultRecord } = require("../app/services/owner-vault-record.ts");
const { generateVaultPassword, vaultPasswordStrength } = require("../app/components/dashboard/vault-password.ts");
Module._load = originalLoad;

const originalOwner = process.env.OWNER_SHOP_DOMAIN;
const originalKey = process.env.AETHERION_VAULT_KEY;
const originalPassword = process.env.VAULT_MASTER_PASSWORD;
test.after(() => {
  if (originalOwner === undefined) delete process.env.OWNER_SHOP_DOMAIN;
  else process.env.OWNER_SHOP_DOMAIN = originalOwner;
  if (originalKey === undefined) delete process.env.AETHERION_VAULT_KEY;
  else process.env.AETHERION_VAULT_KEY = originalKey;
  if (originalPassword === undefined) delete process.env.VAULT_MASTER_PASSWORD;
  else process.env.VAULT_MASTER_PASSWORD = originalPassword;
});

function request(fields) {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return new Request("https://example.invalid/api/owner-vault", { method: "POST", body });
}

async function unlock() {
  const response = await route.action({ request: request({ type: "unlock", password: process.env.VAULT_MASTER_PASSWORD || process.env.AETHERION_VAULT_KEY }) });
  assert.equal(response.status, 200);
  return (await response.json()).token;
}

async function call(token, fields) {
  return route.action({ request: request({ ...fields, token }) });
}

test("vault access requires an explicitly configured owner shop", async () => {
  process.env.OWNER_SHOP_DOMAIN = `${owner},custom.myshopify.com`;
  assert.equal(service.canAccessOwnerVault(owner), true);
  assert.equal(service.canAccessOwnerVault(otherOwner), false);
  assert.equal(service.canAccessOwnerVault("custom.myshopify.com"), true);
  assert.equal(service.canAccessOwnerVault(`${owner}.evil.example`), false);
  sessionShop = otherOwner;
  assert.equal((await route.loader({ request: new Request("https://example.invalid/api/owner-vault") })).status, 403);
  assert.equal((await route.action({ request: request({ type: "save", label: "Test", value: "placeholder" }) })).status, 403);
  assert.equal(rows.length, 0);
  assert.equal(initializationAttempts, 0);
});

test("failed initialization is reported and concurrent first writes retry only once", async () => {
  sessionShop = owner;
  process.env.OWNER_SHOP_DOMAIN = owner;
  failInitialization = true;
  process.env.AETHERION_VAULT_KEY = randomBytes(32).toString("hex");
  const token = await unlock();
  const failed = await call(token, { type: "list" });
  assert.equal(failed.status, 503);
  failInitialization = false;
  ddl = [];
  await Promise.all([
    service.saveOwnerVaultSecret(owner, "Test 1", "placeholder"),
    service.saveOwnerVaultSecret(owner, "Test 2", "placeholder"),
  ]);
  assert.equal((await service.listOwnerVaultSecrets(owner)).entries.length, 2);
  assert.equal(initializationAttempts, 2);
  assert.equal(ddl.length, 2);
  assert.match(ddl[0], /CREATE TABLE IF NOT EXISTS "OwnerVaultSecret"/);
  assert.match(ddl[1], /CREATE INDEX IF NOT EXISTS "OwnerVaultSecret_shop_createdAt_idx"/);
  rows = [];
});

test("vault stores authenticated ciphertext and returns only shop-scoped masked-entry metadata", async () => {
  sessionShop = owner;
  process.env.OWNER_SHOP_DOMAIN = `${owner},${otherOwner}`;
  process.env.AETHERION_VAULT_KEY = randomBytes(32).toString("hex");
  const token = await unlock();
  const secret = "example-test-value";
  const response = await call(token, { type: "save", label: "Test API", value: secret });
  assert.equal(response.status, 200);
  assert.doesNotMatch(await response.text(), /example-test-value/);
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].ciphertext, secret);
  assert.equal(parseOwnerVaultRecord(decryptVaultBlob(rows[0].ciphertext.slice(3), process.env.AETHERION_VAULT_KEY, `${owner}:${rows[0].id}:v1`), "Test API", true).secret, secret);
  assert.throws(() => decryptVaultBlob(rows[0].ciphertext.slice(3), process.env.AETHERION_VAULT_KEY, `${otherOwner}:${rows[0].id}:v1`));
  assert.throws(() => decryptVaultBlob(rows[0].ciphertext.slice(3), process.env.AETHERION_VAULT_KEY, `${owner}:${rows[0].id}`));
  const list = await call(token, { type: "list" });
  assert.equal(list.headers.get("cache-control"), "no-store");
  const text = await list.text();
  assert.match(text, /Test API/);
  assert.doesNotMatch(text, /example-test-value|ciphertext/);
  sessionShop = otherOwner;
  assert.equal((await call(token, { type: "list" })).status, 401);
  const otherToken = await unlock();
  const otherList = await call(otherToken, { type: "list" });
  assert.equal((await otherList.json()).entries.length, 0);
  assert.equal((await call(otherToken, { type: "delete", id: rows[0].id })).status, 400);
  assert.equal(rows.length, 1);
  sessionShop = owner;
  assert.equal((await call(token, { type: "delete", id: rows[0].id })).status, 200);
  assert.equal(rows.length, 0);
});

test("structured metadata and unicode secrets round-trip without exposing the secret", async () => {
  rows = [];
  sessionShop = owner;
  const token = await unlock();
  const secret = "  Schlüssel-ä🔑  ";
  const response = await call(token, {
    type: "save", label: "Beta Zugang", value: secret, provider: "openrouter",
    category: "Beta & Experimentell", stage: "experimental", username: "Jürgen",
    notes: "Überprüfung", modelHint: "openrouter/free", favorite: "on", expiresAt: "2027-01-31",
  });
  assert.equal(response.status, 200);
  const raw = decryptVaultBlob(rows[0].ciphertext.slice(3), process.env.AETHERION_VAULT_KEY, `${owner}:${rows[0].id}:v1`);
  const record = parseOwnerVaultRecord(raw, "Beta Zugang", true);
  assert.equal(record.secret, secret.trim());
  assert.equal(record.notes, "Überprüfung");
  const result = await (await call(token, { type: "list" })).json();
  assert.equal(result.entries[0].stage, "experimental");
  assert.equal(result.entries[0].username, "Jürgen");
  assert.equal(result.entries[0].favorite, true);
  assert.doesNotMatch(JSON.stringify(result), /Schlüssel|ciphertext/);
  rows = [];
});

test("legacy plaintext values and JSON-like values remain readable after decryption", async () => {
  const id = "550e8400-e29b-41d4-a716-446655440000";
  const legacy = '{"secret":"altes Passwort"}';
  rows = [{ id, shop: owner, label: "Alt", ciphertext: encryptVaultBlob(legacy, process.env.AETHERION_VAULT_KEY, `${owner}:${id}`), createdAt: new Date() }];
  const listing = await service.listOwnerVaultSecrets(owner);
  assert.equal(listing.entries[0].label, "Alt");
  assert.equal(listing.entries[0].stage, "production");
  assert.equal(parseOwnerVaultRecord(legacy, "Alt", false).secret, legacy);
  assert.equal(parseOwnerVaultRecord("atelierpilot-vault-record-v1:{broken", "Alt", false).secret, "atelierpilot-vault-record-v1:{broken");
  rows = [];
});

test("invalid metadata and dates fail without storing entries", async () => {
  const token = await unlock();
  assert.equal((await call(token, { type: "save", label: "Test", value: "placeholder", stage: "untrusted" })).status, 400);
  assert.equal((await call(token, { type: "save", label: "Test", value: "placeholder", expiresAt: "2026-02-31" })).status, 400);
  assert.equal((await call(token, { type: "save", label: "Test", value: "  ", provider: "groq" })).status, 400);
  assert.equal(rows.length, 0);
});

test("all supported stages survive encryption and custom passwords preserve whitespace", async () => {
  const token = await unlock();
  for (const stage of ["production", "beta", "experimental", "test"]) {
    const response = await call(token, { type: "save", label: `Stufe ${stage}`, value: "  ü 🔑  ", stage });
    assert.equal(response.status, 200);
  }
  const listing = await service.listOwnerVaultSecrets(owner);
  assert.deepEqual(listing.entries.map((entry) => entry.stage), ["production", "beta", "experimental", "test"]);
  const record = parseOwnerVaultRecord(decryptVaultBlob(rows[0].ciphertext.slice(3), process.env.AETHERION_VAULT_KEY, `${owner}:${rows[0].id}:v1`), rows[0].label, true);
  assert.equal(record.secret, "  ü 🔑  ");
  rows = [];
});

test("missing keys and invalid inputs fail without writing a secret", async () => {
  delete process.env.AETHERION_VAULT_KEY;
  assert.equal((await route.action({ request: request({ type: "unlock", password: "placeholder" }) })).status, 503);
  process.env.AETHERION_VAULT_KEY = randomBytes(32).toString("hex");
  const token = await unlock();
  assert.equal((await call(token, { type: "save", label: "", value: "placeholder" })).status, 400);
  assert.equal((await call(token, { type: "save", label: "Test", value: "x".repeat(8193) })).status, 400);
  assert.equal(rows.length, 0);
});

test("vault refuses entries beyond the per-shop limit", async () => {
  rows = Array.from({ length: 100 }, (_, i) => ({ id: String(i), shop: owner }));
  const token = await unlock();
  assert.equal((await call(token, { type: "save", label: "Test", value: "placeholder" })).status, 400);
  assert.equal(rows.length, 100);
  rows = [];
});

test("reveal requires an unlocked, shop-bound session and records no secret in the audit", async () => {
  process.env.VAULT_MASTER_PASSWORD = "test-general-password";
  process.env.AETHERION_VAULT_KEY = randomBytes(32).toString("hex");
  sessionShop = owner;
  const token = await unlock();
  await call(token, { type: "save", label: "Reveal", value: "private-example" });
  const id = rows[0].id;
  assert.equal((await route.action({ request: request({ type: "reveal", id }) })).status, 401);
  assert.equal((await call(`${token}x`, { type: "reveal", id })).status, 401);
  const response = await call(token, { type: "reveal", id });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).secret, "private-example");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.doesNotMatch(JSON.stringify(audit), /private-example|test-general-password/);
  const log = audit.findLast((entry) => entry.action === "owner_vault_reveal");
  assert.match(JSON.parse(log.detail).sha256, /^[a-f0-9]{64}$/);
  assert.equal((await call(token, { type: "lock" })).status, 200);
  assert.equal((await call(token, { type: "reveal", id })).status, 401);
  rows = [];
});

test("password fallback, idle expiry, session binding and escalating lockouts", async () => {
  const now = Date.now();
  delete process.env.VAULT_MASTER_PASSWORD;
  const vaultKey = process.env.AETHERION_VAULT_KEY;
  const token = await auth.unlockOwnerVault(owner, "session-a", vaultKey, now);
  assert.throws(() => auth.requireVaultSession(token, owner, "session-b", now));
  auth.requireVaultSession(token, owner, "session-a", now + 14 * 60_000);
  assert.throws(() => auth.requireVaultSession(token, owner, "session-a", now + 30 * 60_000));

  process.env.VAULT_MASTER_PASSWORD = "test-general-password";
  const shop = "lockout-test.myshopify.com";
  let time = now;
  for (const delay of [5, 15, 60]) {
    for (let i = 0; i < 5; i++) {
      await assert.rejects(auth.unlockOwnerVault(shop, "session-a", "bad-password", time), (error) => error.status === (i === 4 ? 429 : 401));
    }
    await assert.rejects(auth.unlockOwnerVault(shop, "session-a", "test-general-password", time + delay * 60_000 - 1), (error) => error.status === 429);
    time += delay * 60_000;
  }
  assert.ok(await auth.unlockOwnerVault(shop, "session-a", "test-general-password", time));
  assert.doesNotMatch(JSON.stringify(audit), /bad-password|test-general-password/);
});

test("password generator enforces length bounds and strength indicator is only a heuristic", () => {
  for (const length of [16, 24, 48]) {
    const value = generateVaultPassword(length);
    assert.equal(value.length, length);
    assert.match(value, /^[A-Za-z0-9!#$%&()*+,\-./:;<=>?@[\]^_{}~]+$/);
  }
  for (const length of [0, 15, 49, 16.5]) assert.throws(() => generateVaultPassword(length), RangeError);
  assert.equal(vaultPasswordStrength("kurz"), "schwach");
  assert.equal(vaultPasswordStrength("Test1234567890!x"), "stark");
});

test("bulk import ignores comments, detects duplicates and updates only the current shop", async () => {
  process.env.VAULT_MASTER_PASSWORD = "test-general-password";
  sessionShop = owner;
  const token = await unlock();
  const settings = { type: "bulk_import", provider: "custom", category: "Logins & Accounts", stage: "test" };
  assert.equal((await route.action({ request: request({ ...settings, input: "EXAMPLE=placeholder", mode: "skip" }) })).status, 401);
  const initial = await call(token, { ...settings, input: "# Kommentar\n\nEXAMPLE='älter = value'\nSECOND=ü🔑", mode: "skip" });
  assert.equal(initial.status, 200);
  assert.match((await initial.json()).message, /2 neu/);
  assert.equal(rows.length, 2);
  const id = rows[0].id;
  const skip = await call(token, { ...settings, input: "example=new-value", mode: "skip" });
  assert.match((await skip.json()).message, /1 übersprungen/);
  assert.equal((await call(token, { type: "reveal", id }).then((response) => response.json())).secret, "älter = value");
  const update = await call(token, { ...settings, input: "example=new-value", mode: "update" });
  assert.match((await update.json()).message, /1 aktualisiert/);
  assert.equal((await call(token, { type: "reveal", id }).then((response) => response.json())).secret, "new-value");
  assert.equal((await call(token, { ...settings, input: "A=one\na=two", mode: "update" })).status, 400);
  assert.equal((await call(token, { ...settings, input: "BAD LINE", mode: "update" })).status, 400);
  assert.equal((await call(token, { ...settings, input: "A='unclosed", mode: "skip" })).status, 400);
  assert.equal(rows.length, 2);
  assert.doesNotMatch(JSON.stringify(audit), /älter = value|new-value|ü🔑/);
  rows = [];
});

test("unlock and reveal fail closed when audit logging is unavailable", async () => {
  const token = await unlock();
  await call(token, { type: "save", label: "Audit", value: "temporary-example" });
  const id = rows[0].id;
  failAudit = true;
  try {
    const revealResponse = await call(token, { type: "reveal", id });
    assert.equal(revealResponse.status, 503);
    assert.doesNotMatch(await revealResponse.text(), /temporary-example/);
    const unlockResponse = await route.action({ request: request({ type: "unlock", password: "test-general-password" }) });
    assert.equal(unlockResponse.status, 503);
    assert.equal((await unlockResponse.json()).token, undefined);
  } finally {
    failAudit = false;
    rows = [];
  }
});
