import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import db from "../db.server";
import { getOwnerShopDomains, isConfiguredOwnerShop } from "./access-control-core";

const IDLE_MS = 15 * 60_000;
const WINDOW_MS = 15 * 60_000;
const MAX_SESSIONS = 1024;

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

export function signStandaloneVaultValue(value: string) {
  return createHmac("sha256", signingKey()).update("standalone-v1\0").update(value).digest("base64url");
}

function cockpitSessionDetail(session: string) {
  const metadata = { sessionHash: createHash("sha256").update(session).digest("hex") };
  return JSON.stringify({ metadata, sha256: createHash("sha256").update(JSON.stringify(metadata)).digest("hex") });
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

export async function verifyOwnerVaultPassword(shop: string, password: string, now = Date.now()) {
  if (!isConfiguredOwnerShop(shop, process.env.OWNER_SHOP_DOMAIN)) throw new VaultAuthError("Tresorzugriff nicht erlaubt.", 403);
  signingKey();
  const expected = process.env.VAULT_MASTER_PASSWORD || process.env.AETHERION_VAULT_KEY || "";
  const actualHash = createHash("sha256").update(password).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  const matches = timingSafeEqual(actualHash, expectedHash);
  const result = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(1096043604, 1447842893)::text`;
    const failures = await tx.autopilotLog.count({
      where: {
        shop: { in: getOwnerShopDomains(process.env.OWNER_SHOP_DOMAIN) },
        action: "owner_vault_unlock_failed",
        createdAt: { gte: new Date(now - WINDOW_MS) },
      },
    });
    if (failures >= 5) return "locked";
    if (!matches) {
      await tx.autopilotLog.create({
        data: { ...vaultAuditData(shop, "unlock_failed", failures === 4 ? "locked" : "denied"), createdAt: new Date(now) },
      });
      return failures === 4 ? "locked" : "denied";
    }
    await tx.autopilotLog.create({ data: { ...vaultAuditData(shop, "unlock", "completed"), createdAt: new Date(now) } });
    return "ok";
  }, { isolationLevel: "ReadCommitted" });
  if (result === "locked") throw new VaultAuthError("Zu viele Fehlversuche in den letzten 15 Minuten. Bitte später erneut versuchen.", 429);
  if (result === "denied") throw new VaultAuthError("General-Passwort ist falsch.", 401);
}

export async function unlockOwnerVault(shop: string, session: string, password: string, now = Date.now()) {
  if (!session) throw new VaultAuthError("Shopify-Sitzung fehlt.", 403);
  await verifyOwnerVaultPassword(shop, password, now);
  const id = randomBytes(32).toString("base64url");
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(1096043604, 1447842895)::text`;
    const active = await tx.autopilotLog.count({
      where: { shop, action: "owner_vault_cockpit_session", status: "active", createdAt: { gte: new Date(now - IDLE_MS + 1) } },
    });
    if (active >= MAX_SESSIONS) throw new VaultAuthError("Zu viele Tresorsitzungen.", 503);
    await tx.autopilotLog.create({
      data: {
        id: createHash("sha256").update(id).digest("hex"),
        shop,
        action: "owner_vault_cockpit_session",
        status: "active",
        detail: cockpitSessionDetail(session),
        undoable: false,
        createdAt: new Date(now),
      },
    });
  }, { isolationLevel: "ReadCommitted" });
  return `${id}.${signature(id)}`;
}

async function updateCockpitSession(token: string, shop: string, session: string, revoke: boolean, now: number) {
  const [id, sig, extra] = token.split(".");
  if (!id || !sig || extra || !/^[A-Za-z0-9_-]{43}$/.test(id) || !/^[A-Za-z0-9_-]{43}$/.test(sig)) {
    throw new VaultAuthError("Tresor ist gesperrt.");
  }
  const supplied = Buffer.from(sig, "ascii");
  const expected = Buffer.from(signature(id), "ascii");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new VaultAuthError("Tresor ist gesperrt.");
  const result = await db.autopilotLog.updateMany({
    where: {
      id: createHash("sha256").update(id).digest("hex"),
      shop,
      action: "owner_vault_cockpit_session",
      status: "active",
      detail: cockpitSessionDetail(session),
      createdAt: { gt: new Date(now - IDLE_MS) },
    },
    data: revoke ? { status: "revoked" } : { createdAt: new Date(now) },
  });
  if (result.count !== 1) {
    throw new VaultAuthError("Tresorsitzung abgelaufen. Bitte erneut entsperren.");
  }
}

export async function requireVaultSession(token: string, shop: string, session: string, now = Date.now()) {
  await updateCockpitSession(token, shop, session, false, now);
}

export async function lockOwnerVault(token: string, shop: string, session: string) {
  await updateCockpitSession(token, shop, session, true, Date.now());
}
