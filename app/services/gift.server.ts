import { randomBytes } from "node:crypto";
import db from "../db.server";

/** Digitale Geschenk-Botschaft: unratbarer Token (128 Bit), optionaler Ablauf, keine Shop-/Kundendaten im Link. */

export interface GiftInput {
  shop: string;
  senderName: string;
  recipientName: string;
  message: string;
  productTitle: string;
  certificateNo?: string;
  isUnique?: boolean;
  locale?: "de" | "en";
  validDays?: number;
}

const clip = (s: string, n: number) => s.replace(/\s+/g, " ").trim().slice(0, n);

export async function createGiftMessage(input: GiftInput) {
  const token = randomBytes(16).toString("base64url");
  const days = Math.min(Math.max(input.validDays ?? 365, 1), 730);
  const row = await db.giftMessage.create({
    data: {
      shop: input.shop,
      token,
      senderName: clip(input.senderName, 60) || "Jemand Besonderes",
      recipientName: clip(input.recipientName, 60),
      message: input.message.trim().slice(0, 800),
      productTitle: clip(input.productTitle, 120) || "Ihr Schmuckstück",
      certificateNo: input.certificateNo ? clip(input.certificateNo, 40) : null,
      isUnique: !!input.isUnique,
      locale: input.locale === "en" ? "en" : "de",
      expiresAt: new Date(Date.now() + days * 86_400_000),
    },
  });
  return { token: row.token, path: `/gift/${row.token}` };
}

export interface PublicGift {
  senderName: string;
  recipientName: string;
  message: string;
  productTitle: string;
  certificateNo: string | null;
  isUnique: boolean;
  locale: "de" | "en";
}

/** Liefert nur öffentliche Felder. Unbekannt/abgelaufen => null (gleiche Antwort, kein Rückschluss). */
export async function getGiftByToken(token: string): Promise<PublicGift | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const g = await db.giftMessage.findUnique({ where: { token } });
  if (!g) return null;
  if (g.expiresAt && g.expiresAt < new Date()) return null;
  if (!g.viewedAt) {
    await db.giftMessage.update({ where: { id: g.id }, data: { viewedAt: new Date() } }).catch(() => undefined);
  }
  return {
    senderName: g.senderName,
    recipientName: g.recipientName,
    message: g.message,
    productTitle: g.productTitle,
    certificateNo: g.certificateNo,
    isUnique: g.isUnique,
    locale: g.locale === "en" ? "en" : "de",
  };
}
