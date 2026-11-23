import db from "../db.server";
import { ownerShopDomain } from "./ai-agents.server";
import { guide, type Guidance, type Reason } from "./returns-guide";

/**
 * Nachhaltiges Umtausch-Portal: lenkt gezielt auf Umtausch/Wertgutschein statt Retoure.
 * Rechtlich: § 312g Abs. 2 Nr. 1 BGB – kein Widerrufsrecht bei nach Kundenspezifikation angefertigten
 * oder eindeutig auf persönliche Bedürfnisse zugeschnittenen Waren (z. B. Gravur). Gesetzliche
 * Mängelrechte bleiben davon unberührt. Die Entscheidung über Kulanz trifft immer der Inhaber.
 */

export interface ReturnInput {
  email: string;
  orderNo: string;
  reason: Reason;
  engraved: boolean;
  note: string;
  honeypot: string;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const REASONS: Reason[] = ["size", "changed_mind", "defect", "other"];

export type SubmitResult = { ok: true; guidance: Guidance } | { ok: false; error: string };

export async function submitReturnRequest(raw: ReturnInput): Promise<SubmitResult> {
  if (raw.honeypot) return { ok: true, guidance: guide("other", false) }; // Bots: stilles OK
  const email = raw.email.trim().toLowerCase();
  const orderNo = raw.orderNo.replace(/[^\w#-]/g, "").slice(0, 30);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." };
  if (!REASONS.includes(raw.reason)) return { ok: false, error: "Bitte wählen Sie einen Grund aus." };

  const shop = ownerShopDomain();
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const recent = await db.supportCase.count({ where: { shop, customerEmail: email, createdAt: { gte: since } } });
  if (recent >= 3) return { ok: false, error: "Wir haben Ihre Anfragen erhalten und melden uns bald bei Ihnen." };

  const g = guide(raw.reason, raw.engraved);
  await db.supportCase.create({
    data: {
      shop,
      orderId: orderNo || null,
      customerEmail: email,
      topic: `return:${raw.reason}${raw.engraved ? ":engraved" : ""}`,
      status: "open",
      draftBody: raw.note.trim().slice(0, 1000),
    },
  });
  return { ok: true, guidance: g };
}
