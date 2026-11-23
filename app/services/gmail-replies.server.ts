import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { enqueueApproval } from "./triple-audit-gate.server";
import { isShopPaused } from "./autopilot-control.server";
import { humanDelayMs, sendMail } from "./mail-transport.server";

/** Sicherheits-Veto: Reklamation, Streit, Rechtliches -> nie automatisch antworten. */
const VETO_RE =
  /reklamation|beschwerde|mangel|defekt|kaputt|betrug|anwalt|rechtsanwalt|klage|chargeback|rÃ¼ckbuchung|paypal.?fall|widerruf|polizei|verbraucherzentrale|schadenersatz|abmahn/i;

export const needsVeto = (text: string): boolean => VETO_RE.test(text);

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}$/;

/** Verlassener-Warenkorb-Retter: max. 1 Erinnerung pro Warenkorb, nur nach 1â€“24 Std., mit UWG-Abmeldelink. */
export async function sendCartRecoveryMails(shops: string[]): Promise<string> {
  let sent = 0;
  let queued = 0;
  for (const shop of shops.slice(0, 3)) {
    if (await isShopPaused(shop)) continue;
    try {
      const { admin } = await unauthenticated.admin(shop);
      const res = await admin.graphql(`#graphql
        query Abandoned {
          abandonedCheckouts(first: 10, reverse: true) {
            nodes { id abandonedCheckoutUrl createdAt completedAt customer { email firstName } }
          }
        }`);
      const json = (await res.json()) as {
        data?: { abandonedCheckouts?: { nodes?: {
          id: string; abandonedCheckoutUrl: string; createdAt: string; completedAt: string | null;
          customer: { email: string | null; firstName: string | null } | null;
        }[] } };
      };
      for (const c of json.data?.abandonedCheckouts?.nodes ?? []) {
        const email = c.customer?.email;
        if (c.completedAt || !email || !EMAIL_RE.test(email)) continue;
        const age = Date.now() - new Date(c.createdAt).getTime();
        if (age < 3_600_000 + humanDelayMs(c.id) || age > 86_400_000) continue;
        const key = c.id.split("/").pop() ?? c.id;
        const done = await db.autopilotLog.findFirst({ where: { shop, action: "cart_mail", detail: key }, select: { id: true } });
        if (done) continue;
        const r = await sendMail({
          shop,
          to: email,
          kind: "cart",
          marketing: true,
          sourceAgentKey: "A54",
          subject: "Ihr SchmuckstÃ¼ck wartet noch auf Sie",
          text:
            `${c.customer?.firstName ? `Liebe/r ${c.customer.firstName}` : "Guten Tag"},\n\nSie haben ein StÃ¼ck in Ihrem Warenkorb zurÃ¼ckgelassen. ` +
            `Falls Sie Fragen zu GrÃ¶ÃŸe, Material oder Gravur haben, antworten Sie einfach auf diese Mail.\n\nHier geht es zurÃ¼ck: ${c.abandonedCheckoutUrl}`,
        });
        if (r.status === "sent" || r.status === "dry_run") {
          await db.autopilotLog.create({ data: { shop, action: "cart_mail", status: r.status, detail: key, undoable: false } });
          if (r.status === "sent") sent++;
          else queued++;
        }
      }
    } catch {
      /* Shop nicht erreichbar */
    }
  }
  return `Warenkorb-Retter: ${sent} gesendet, ${queued} als Vorschau`;
}

/**
 * IMAP-Posteingang: ungelesene Kundenmails lesen. Bei StreitfÃ¤llen -> Freigabe-Warteschlange (Veto),
 * sonst Antwort-Entwurf zur Freigabe. Ohne IMAP-Zugang passiert nichts (kein Crash).
 */
export async function processInbox(shops: string[]): Promise<string> {
  const user = process.env.IMAP_USER || process.env.GMAIL_USER;
  const pass = process.env.IMAP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.IMAP_HOST || (process.env.GMAIL_USER ? "imap.gmail.com" : "");
  const shop = shops[0];
  if (!user || !pass || !host || !shop) return "Posteingang: nicht konfiguriert";
  if (await isShopPaused(shop)) return "Posteingang: wegen globaler KI-Pause nicht verarbeitet";

  const client = new ImapFlow({
    host,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: { user, pass },
    logger: false,
    socketTimeout: 12000,
  });
  let veto = 0;
  let drafts = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = (await client.search({ seen: false })) || [];
      for (const uid of uids.slice(0, 5)) {
        const msg = await client.fetchOne(String(uid), { source: true });
        if (!msg || !msg.source) continue;
        const mail = await simpleParser(msg.source);
        const from = mail.from?.value?.[0]?.address ?? "";
        const text = `${mail.subject ?? ""}\n${mail.text ?? ""}`.slice(0, 4000);
        if (!EMAIL_RE.test(from) || /no-?reply|mailer-daemon/i.test(from)) continue;
        const isVeto = needsVeto(text);
        await enqueueApproval({
          shop,
          sourceAgentKey: "A43",
          category: "support",
          title: `${isVeto ? "âš  Streitfall" : "Kundenantwort"}: ${(mail.subject ?? "ohne Betreff").slice(0, 80)}`,
          summary: isVeto
            ? "Sicherheits-Veto: Reklamation/Streit erkannt. Bitte persÃ¶nlich antworten â€“ keine Automatik."
            : `Antwort-Entwurf bereit (Versand nach Freigabe, frÃ¼hestens ${Math.round(humanDelayMs(String(uid)) / 60000)} Min. verzÃ¶gert).`,
          riskLevel: isVeto ? "HIGH" : "LOW",
          payload: { kind: "reply", uid, veto: isVeto },
        });
        isVeto ? veto++ : drafts++;
        await client.messageFlagsAdd(String(uid), ["\\Seen"]);
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err) {
    return `Posteingang: ${err instanceof Error ? err.message.slice(0, 80) : "Fehler"}`;
  }
  return `Posteingang: ${drafts} EntwÃ¼rfe, ${veto} StreitfÃ¤lle`;
}
