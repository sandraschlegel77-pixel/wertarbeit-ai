import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import db from "../db.server";
import { getOwnerShopDomains } from "./access-control-core";
import { signStandaloneVaultValue, vaultAuditData } from "./owner-vault-auth.server";

const COOKIE = "atelierpilot_vault";
const LIFETIME_MS = 15 * 60_000;
const detailSchema = z.object({
  metadata: z.object({ nonceHash: z.string().regex(/^[a-f0-9]{64}$/), expiresAt: z.number().int() }).strict(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export function standaloneOwnerShops() {
  const shops = [...new Set(getOwnerShopDomains(process.env.OWNER_SHOP_DOMAIN))];
  if (!shops.length || shops.length > 20 || shops.some((shop) => !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop))) {
    throw new Error("STANDALONE_OWNER_SHOPS_INVALID");
  }
  return shops;
}

export function standaloneOriginAllowed(request: Request) {
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const host = (request.headers.get("X-Forwarded-Host") ?? request.headers.get("Host") ?? new URL(request.url).host).trim();
  if (!/^[a-z\d.:[\]-]+$/i.test(host)) return false;
  try {
    const target = new URL(`https://${host}`);
    const origin = request.headers.get("Origin");
    const source = origin ?? request.headers.get("Referer");
    if (!source) return false;
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    if (origin && (url.pathname !== "/" || url.search || url.hash)) return false;
    return url.origin === target.origin;
  } catch {
    return false;
  }
}

export async function createStandaloneSession(shop: string, now = Date.now()) {
  if (standaloneOwnerShops()[0] !== shop) throw new Error("STANDALONE_SHOP_INVALID");
  const id = randomUUID();
  const nonce = randomBytes(32).toString("base64url");
  const expiresAt = now + LIFETIME_MS;
  const metadata = { nonceHash: createHash("sha256").update(nonce).digest("hex"), expiresAt };
  const detail = JSON.stringify({ metadata, sha256: createHash("sha256").update(JSON.stringify(metadata)).digest("hex") });
  const value = `${id}.${nonce}.${expiresAt}`;
  const signature = signStandaloneVaultValue(`${shop}.${value}`);
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(1096043604, 1447842894)::text`;
    const active = await tx.autopilotLog.count({
      where: { shop, action: "owner_vault_standalone_session", status: "active", createdAt: { gte: new Date(now - LIFETIME_MS) } },
    });
    if (active >= 100) throw new Error("STANDALONE_SESSION_LIMIT");
    await tx.autopilotLog.create({ data: { id, shop, action: "owner_vault_standalone_session", status: "active", detail, undoable: false, createdAt: new Date(now) } });
    await tx.autopilotLog.create({ data: vaultAuditData(shop, "standalone_unlock", "completed") });
  }, { isolationLevel: "ReadCommitted" });
  return `${COOKIE}=${value}.${signature}; Path=/vault; Max-Age=900; HttpOnly; Secure; SameSite=Strict`;
}

export async function getStandaloneSession(request: Request, now = Date.now()): Promise<{ id: string; shop: string; expiresAt: number } | null> {
  const cookies = (request.headers.get("Cookie") ?? "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${COOKIE}=`));
  if (cookies.length !== 1) return null;
  const [id, nonce, expiry, signature, extra] = cookies[0].slice(COOKIE.length + 1).split(".");
  if (!id || !nonce || !expiry || !signature || extra ||
    !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id) ||
    !/^[A-Za-z0-9_-]{43}$/.test(nonce) || !/^\d{13}$/.test(expiry) ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
  const expiresAt = Number(expiry);
  if (expiresAt <= now || expiresAt > now + LIFETIME_MS) return null;
  const shop = standaloneOwnerShops()[0];
  const expected = Buffer.from(signStandaloneVaultValue(`${shop}.${id}.${nonce}.${expiry}`), "ascii");
  const actual = Buffer.from(signature, "ascii");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  const row = await db.autopilotLog.findFirst({
    where: { id, shop, action: "owner_vault_standalone_session", status: "active" },
    select: { detail: true },
  });
  if (!row?.detail) return null;
  try {
    const parsed = detailSchema.parse(JSON.parse(row.detail));
    const hash = createHash("sha256").update(nonce).digest("hex");
    const metadataHash = createHash("sha256").update(JSON.stringify(parsed.metadata)).digest("hex");
    if (parsed.metadata.expiresAt !== expiresAt || parsed.metadata.nonceHash !== hash || parsed.sha256 !== metadataHash) return null;
    return { id, shop, expiresAt };
  } catch {
    return null;
  }
}

export async function revokeStandaloneSession(session: { id: string; shop: string }) {
  await db.$transaction(async (tx) => {
    const result = await tx.autopilotLog.updateMany({
      where: { id: session.id, shop: session.shop, action: "owner_vault_standalone_session", status: "active" },
      data: { status: "revoked" },
    });
    if (result.count !== 1) throw new Error("STANDALONE_SESSION_NOT_FOUND");
    await tx.autopilotLog.create({ data: vaultAuditData(session.shop, "standalone_lock", "completed") });
  }, { isolationLevel: "ReadCommitted" });
}

export const clearStandaloneCookie = `${COOKIE}=; Path=/vault; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
