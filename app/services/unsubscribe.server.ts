import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import db from "../db.server";

/** § 7 Abs. 3 UWG: signierter 1-Klick-Abmeldelink + Blacklist (nur Hash der E-Mail wird gespeichert). */

const secret = (): string => process.env.UNSUBSCRIBE_SECRET || process.env.SHOPIFY_API_SECRET || "";

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const hashEmail = (email: string): string =>
  createHash("sha256").update(normalizeEmail(email)).digest("hex");

function sign(shop: string, email: string): string {
  return createHmac("sha256", secret()).update(`${shop}|${normalizeEmail(email)}`).digest("base64url");
}

/** Link für Mails/Rechnungen. Leeres Secret => Link wird nie akzeptiert (sicher). */
export function buildUnsubscribeUrl(baseUrl: string, shop: string, email: string): string {
  const e = Buffer.from(normalizeEmail(email), "utf8").toString("base64url");
  return `${baseUrl.replace(/\/$/, "")}/api/unsubscribe?s=${encodeURIComponent(shop)}&e=${e}&t=${sign(shop, email)}`;
}

/** Prüft die HMAC-Signatur zeitkonstant. Gibt die E-Mail zurück oder null. */
export function verifyUnsubscribe(shop: string, e: string, token: string): string | null {
  if (!secret() || !e || !token) return null;
  let email: string;
  try {
    email = Buffer.from(e, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!/^[^\s@]{1,64}@[^\s@]{1,255}$/.test(email)) return null;
  const expected = Buffer.from(sign(shop, email));
  const given = Buffer.from(token);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return normalizeEmail(email);
}

export async function blacklistEmail(shop: string, email: string, reason = "unsubscribe"): Promise<void> {
  const emailHash = hashEmail(email);
  await db.emailBlacklist.upsert({
    where: { shop_emailHash: { shop, emailHash } },
    update: { reason },
    create: { shop, emailHash, reason },
  });
}

export async function isBlacklisted(shop: string, email: string): Promise<boolean> {
  const hit = await db.emailBlacklist.findUnique({
    where: { shop_emailHash: { shop, emailHash: hashEmail(email) } },
    select: { id: true },
  });
  return !!hit;
}

/** Pflicht-Hinweis nach § 7 Abs. 3 Nr. 4 UWG für Mails/Rechnungen mit Werbung an Bestandskunden. */
export const uwgNotice = (unsubscribeUrl: string): string =>
  `Sie können der Verwendung Ihrer E-Mail-Adresse für Werbung jederzeit widersprechen, ohne dass dafür andere als die Übermittlungskosten nach den Basistarifen entstehen: ${unsubscribeUrl}`;
