import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { enqueueApproval } from "./triple-audit-gate.server";
import { isShopPaused } from "./autopilot-control.server";
import { humanDelayMs, isOnHoliday, sendMail, type MailResult } from "./mail-transport.server";

/**
 * Gmail/SMTP-Autopilot. Wird vom 5-Min.-Herzschlag (/api/cron) aufgerufen.
 * Jede Mail: Warteschlange in AutopilotLog â†’ menschliche VerzÃ¶gerung 4â€“11 Min. â†’ Schutzschichten â†’ Versand/Vorschau.
 * Es werden keine Kundendaten im Log gespeichert (nur Bestellnummer + Status).
 */

const BATCH = 5;
const DAY = 86_400_000;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}$/;

interface OrderNode {
  id: string;
  name: string;
  email: string | null;
  customer: { firstName: string | null } | null;
  displayFulfillmentStatus: string;
}

async function orderById(shop: string, name: string): Promise<OrderNode | null> {
  const { admin } = await unauthenticated.admin(shop);
  const res = await admin.graphql(
    `#graphql
    query OrderByName($q: String!) {
      orders(first: 1, query: $q) {
        nodes { id name email displayFulfillmentStatus customer { firstName } }
      }
    }`,
    { variables: { q: `name:${name.replace(/[^\w#-]/g, "")}` } }
  );
  const json = (await res.json()) as { data?: { orders?: { nodes?: OrderNode[] } } };
  return json.data?.orders?.nodes?.[0] ?? null;
}

const hello = (first: string | null | undefined) => (first ? `Liebe/r ${first}` : "Guten Tag");

/** Stufe 1: â€žPasst alles?â€œ 15 Min. nach Bestellung, nur solange noch NICHT versendet wurde. */
export async function sendFitCheckMails(shops: string[]): Promise<string> {
  const stat: Record<string, number> = {};
  const bump = (k: string) => (stat[k] = (stat[k] ?? 0) + 1);
  for (const shop of shops) {
    if (await isShopPaused(shop)) continue;
    const rows = await db.autopilotLog.findMany({
      where: { shop, action: "fit_check_mail", status: { in: ["queued", "dry_run"] } },
      orderBy: { createdAt: "asc" },
      take: BATCH,
    });
    for (const row of rows) {
      const orderLog = row.detail ? await db.autopilotLog.findUnique({ where: { id: row.detail } }) : null;
      const orderName = orderLog?.detail;
      if (!orderName) {
        await db.autopilotLog.update({ where: { id: row.id }, data: { status: "skipped" } });
        continue;
      }
      // Menschliche VerzÃ¶gerung: 15 Min. + 4â€“11 Min. ab Bestellung
      const dueAt = (orderLog?.createdAt.getTime() ?? 0) + 15 * 60_000 + humanDelayMs(row.id);
      if (Date.now() < dueAt) continue;
      try {
        const o = await orderById(shop, orderName);
        if (!o?.email || !EMAIL_RE.test(o.email)) {
          await db.autopilotLog.update({ where: { id: row.id }, data: { status: "skipped" } });
          continue;
        }
        if (o.displayFulfillmentStatus !== "UNFULFILLED") {
          await db.autopilotLog.update({ where: { id: row.id }, data: { status: "skipped" } });
          continue; // schon versendet â€“ PrÃ¼fmail wÃ¤re sinnlos
        }
        const r = await sendMail({
          shop,
          to: o.email,
          kind: "fit_check",
          sourceAgentKey: "A44",
          subject: `Passt alles bei Ihrer Bestellung ${o.name}?`,
          text:
            `${hello(o.customer?.firstName)},\n\nvielen Dank fÃ¼r Ihre Bestellung ${o.name}! Bevor wir Ihr SchmuckstÃ¼ck sorgfÃ¤ltig verpacken und auf den Weg bringen, ` +
            `eine kurze Frage: Passen RinggrÃ¶ÃŸe, Gravurtext und Lieferadresse so, wie Sie es sich wÃ¼nschen? ` +
            `Antworten Sie einfach auf diese Mail â€“ wir kÃ¼mmern uns persÃ¶nlich darum.`,
        });
        await finish(row.id, r);
        bump(r.status);
      } catch {
        bump("error");
      }
    }
  }
  return summary("PrÃ¼fmails", stat);
}

/** Stufe 2: Sendungs-Stau >48 h â€“ Entwurf fÃ¼r den Inhaber, Kunde erst nach Freigabe. */
export async function sendStuckParcelMails(shops: string[]): Promise<string> {
  let queued = 0;
  for (const shop of shops.slice(0, 5)) {
    if (await isShopPaused(shop)) continue;
    const cutoff = new Date(Date.now() - 2 * DAY).toISOString();
    try {
      const { admin } = await unauthenticated.admin(shop);
      const res = await admin.graphql(
        `#graphql
        query Stuck($q: String!) { orders(first: 10, query: $q) { nodes { id name email customer { firstName } } } }`,
        { variables: { q: `fulfillment_status:unfulfilled financial_status:paid created_at:<${cutoff}` } }
      );
      const json = (await res.json()) as { data?: { orders?: { nodes?: OrderNode[] } } };
      for (const o of json.data?.orders?.nodes ?? []) {
        if (!o.email || !EMAIL_RE.test(o.email)) continue;
        const done = await db.autopilotLog.findFirst({ where: { shop, action: "stuck_mail", detail: o.name }, select: { id: true } });
        if (done) continue;
        await enqueueApproval({
          shop,
          sourceAgentKey: "A24",
          category: "support",
          title: `VerzÃ¶gerungs-Mail fÃ¼r ${o.name} senden?`,
          summary: `${o.name} ist seit Ã¼ber 48 Std. bezahlt, aber unversendet. Ehrliche Info an den Kunden vorbereitet.`,
          riskLevel: "LOW",
          payload: { kind: "stuck", order: o.name },
        });
        await db.autopilotLog.create({ data: { shop, action: "stuck_mail", status: "queued", detail: o.name, undoable: false } });
        queued++;
      }
    } catch {
      /* Shop nicht erreichbar */
    }
  }
  return `${queued} VerzÃ¶gerungs-Mail(s) zur Freigabe`;
}

async function finish(id: string, r: MailResult) {
  if (r.status === "holiday" || r.status === "locked") return; // spÃ¤ter erneut versuchen
  await db.autopilotLog.update({ where: { id }, data: { status: r.status === "sent" ? "sent" : r.status } });
}

const summary = (label: string, s: Record<string, number>) =>
  Object.keys(s).length ? `${label}: ${Object.entries(s).map(([k, v]) => `${v}Ã— ${k}`).join(", ")}` : `${label}: nichts fÃ¤llig`;

export { isOnHoliday };
