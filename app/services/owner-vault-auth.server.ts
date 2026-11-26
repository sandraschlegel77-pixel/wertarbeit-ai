import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import db from "../db.server";

const IDLE_MS = 15 * 60_000;
const WINDOW_MS = 15 * 60_000;
const LOCKS_MS = [5 * 60_000, 15 * 60_000, 60 * 60_000];
const MAX_SESSIONS = 1024;
const sessions = new Map<string, { shop: string; session: string; expires: number }>();
const attempts = new Map<string, { failures: number; since: number; lockUntil: number; level: number; last: number }>();

export class VaultAuthError extends Error {
  constructor(message: string, public readonly status = 401) {
    super(message);
  }
}

function signingKey() {
  const vaultKey = process.env.AETHERION_VAULT_KEY ?? "";
  const password = process.env.VAULT_MASTER_PASSWORD || vaultKey;
  if (!/^[a-f\d]{64}$/i.test(vaultKey) || !password) {
    throw new VaultAuthError("Tresorschlüssel oder General-Passwort ist nicht konfiguriert.", 503);
  }
  return createHmac("sha256", Buffer.from(vaultKey, "hex")).update("owner-vault-cockpit-v1\0").update(password).digest();
}

function signature(id: string) {
  return createHmac("sha256", signingKey()).update(id).digest("base64url");
}

function clean(now: number) {
  for (const [id, session] of sessions) if (session.expires <= now) sessions.delete(id);
  for (const [shop, entry] of attempts) {
    if (entry.lockUntil <= now && now - entry.last > 24 * 60 * 60_000) attempts.delete(shop);
  }
}

export function vaultAuditData(shop: string, action: string, status: string) {
  const metadata = { action, status, at: new Date().toISOString() };
  return {
    shop,
    action: `owner_vault_${action}`,
    status,
    detail: JSON.stringify({ metadata, sha256: createHash("sha256").update(JSON.stringify(metadata)).digest("hex") }),
    undoable: false,
  };
}

export async function auditVaultAction(shop: string, action: string, status: string) {
  await db.autopilotLog.create({ data: vaultAuditData(shop, action, status) });
}

export async function unlockOwnerVault(shop: string, session: string, password: string, now = Date.now()) {
  if (!session) throw new VaultAuthError("Shopify-Sitzung fehlt.", 403);
  signingKey();
  clean(now);
  let state = attempts.get(shop);
  if (state && state.lockUntil > now) throw new VaultAuthError("Tresor vorübergehend gesperrt. Bitte später erneut versuchen.", 429);
  if (!state) {
    state = { failures: 0, since: now, lockUntil: 0, level: 0, last: now };
    attempts.set(shop, state);
  }
  if (now - state.since >= WINDOW_MS || (state.lockUntil && state.lockUntil <= now)) {
    state.failures = 0;
    state.since = now;
    state.lockUntil = 0;
  }
  state.last = now;
  const expected = process.env.VAULT_MASTER_PASSWORD || process.env.AETHERION_VAULT_KEY || "";
  const actualHash = createHash("sha256").update(password).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(actualHash, expectedHash)) {
    state.failures++;
    if (state.failures >= 5) {
      state.lockUntil = now + LOCKS_MS[Math.min(state.level, LOCKS_MS.length - 1)];
      state.level++;
    }
    await auditVaultAction(shop, "unlock_failed", state.lockUntil > now ? "locked" : "denied");
    throw new VaultAuthError(state.lockUntil > now ? "Zu viele Fehlversuche. Tresor vorübergehend gesperrt." : "General-Passwort ist falsch.", state.lockUntil > now ? 429 : 401);
  }
  if (sessions.size >= MAX_SESSIONS) throw new VaultAuthError("Zu viele Tresorsitzungen.", 503);
  await auditVaultAction(shop, "unlock", "completed");
  attempts.delete(shop);
  const id = randomBytes(32).toString("base64url");
  sessions.set(id, { shop, session, expires: now + IDLE_MS });
  return `${id}.${signature(id)}`;
}

export function requireVaultSession(token: string, shop: string, session: string, now = Date.now()) {
  clean(now);
  const [id, sig, extra] = token.split(".");
  if (!id || !sig || extra || !/^[A-Za-z0-9_-]{43}$/.test(id) || !/^[A-Za-z0-9_-]{43}$/.test(sig)) {
    throw new VaultAuthError("Tresor ist gesperrt.");
  }
  const supplied = Buffer.from(sig, "base64url");
  const expected = Buffer.from(signature(id), "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new VaultAuthError("Tresor ist gesperrt.");
  const entry = sessions.get(id);
  if (!entry || entry.shop !== shop || entry.session !== session || entry.expires <= now) {
    throw new VaultAuthError("Tresorsitzung abgelaufen. Bitte erneut entsperren.");
  }
  entry.expires = now + IDLE_MS;
  return id;
}

export function lockOwnerVault(token: string, shop: string, session: string) {
  sessions.delete(requireVaultSession(token, shop, session));
}
