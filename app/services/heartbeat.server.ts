import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { weeklyEvolutionRun } from "./ai-evolution.server";
import { isDryRun } from "./ai-agents.server";
import { enqueueApproval } from "./triple-audit-gate.server";
import { sendFitCheckMails, sendStuckParcelMails } from "./gmail-autopilot.server";
import { processInbox, sendCartRecoveryMails } from "./gmail-replies.server";
import { isShopPaused } from "./autopilot-control.server";

/**
 * 5-Min.-Herzschlag (aufgerufen von /api/cron). Jeder Schritt ist zeitlich begrenzt und
 * fehlertolerant, damit die Antwort immer unter ~2 Sekunden bleibt.
 */

const STEP_TIMEOUT_MS = 1200;
const OFFLINE_SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export interface StepResult {
  ok: boolean;
  detail: string;
  ms: number;
}

const MAIL_STEP_MS = 1700;

async function step(fn: () => Promise<string>, timeoutMs = STEP_TIMEOUT_MS): Promise<StepResult> {
  const t0 = Date.now();
  try {
    const detail = await Promise.race([
      fn(),
      new Promise<string>((_, rej) => setTimeout(() => rej(new Error("Timeout")), timeoutMs)),
    ]);
    return { ok: true, detail, ms: Date.now() - t0 };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "Fehler", ms: Date.now() - t0 };
  }
}

async function shops(): Promise<string[]> {
  const rows = await db.session.findMany({
    where: { isOnline: false },
    select: { shop: true },
    distinct: ["shop"],
    take: 200,
  });
  return rows.map((r) => r.shop).filter((s) => OFFLINE_SHOP_RE.test(s));
}

/** OAuth-Token-Refresh: `unauthenticated.admin` erneuert abgelaufene Offline-Tokens (expiring tokens) selbst. */
async function refreshTokens(list: string[]): Promise<string> {
  const batch = list.slice(0, 50);
  const results = await Promise.allSettled(batch.map((shop) => unauthenticated.admin(shop)));
  const ok = results.filter((r) => r.status === "fulfilled").length;
  return `${ok} Shops OK, ${results.length - ok} Fehler`;
}

/** >48-h-Paket-Stau: bezahlte, unversendete Bestellungen -> Freigabe-Eintrag (kein Auto-Versand). */
async function stuckParcels(list: string[]): Promise<string> {
  let found = 0;
  const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  for (const shop of list.slice(0, 5)) {
    try {
      const { admin } = await unauthenticated.admin(shop);
      const res = await admin.graphql(
        `#graphql
        query Stuck($q: String!) { orders(first: 20, query: $q) { nodes { id name createdAt } } }`,
        { variables: { q: `fulfillment_status:unfulfilled financial_status:paid created_at:<${cutoff}` } }
      );
      const json = (await res.json()) as { data?: { orders?: { nodes?: { id: string; name: string }[] } } };
      const nodes = json.data?.orders?.nodes ?? [];
      found += nodes.length;
      if (nodes.length > 0) {
        await enqueueApproval({
          shop,
          sourceAgentKey: "A24",
          category: "marketplace",
          title: `Sendungs-Stau: ${nodes.length} Bestellung(en) älter als 48 Std.`,
          summary: `Unversendet: ${nodes.map((n) => n.name).join(", ")}. Bitte prüfen oder Lieferanten nachfassen.`,
          riskLevel: "MEDIUM",
        });
      }
    } catch {
      /* Shop nicht erreichbar -> nächster */
    }
  }
  return `${found} Bestellung(en) im Stau`;
}

/** „Passt alles?“-Prüfmail 15 Min. nach Bestellung: nur Queue-Eintrag (Versand erst nach Freigabe/Live-Modus). */
async function checkMailQueue(list: string[]): Promise<string> {
  let queued = 0;
  const since = new Date(Date.now() - 6 * 3600 * 1000);
  for (const shop of list) {
    const logs = await db.autopilotLog.findMany({
      where: { shop, action: "order_paid", createdAt: { gte: since, lte: new Date(Date.now() - 15 * 60 * 1000) } },
      take: 20,
    });
    for (const l of logs) {
      const done = await db.autopilotLog.findFirst({
        where: { shop, action: "fit_check_mail", detail: l.id },
        select: { id: true },
      });
      if (done) continue;
      const live = !(await isDryRun(shop));
      await db.autopilotLog.create({
        data: { shop, action: "fit_check_mail", status: live ? "queued" : "dry_run", detail: l.id, undoable: false },
      });
      queued++;
    }
  }
  return `${queued} Prüfmail(s) vorgemerkt`;
}

/** 0-€-Watchdog: misst DB-Latenz, schreibt bei Auffälligkeit ein Protokoll. */
async function watchdog(): Promise<string> {
  const t0 = Date.now();
  await db.$queryRaw`SELECT 1`;
  const ms = Date.now() - t0;
  if (ms > 500) {
    await db.autopilotLog.create({
      data: { shop: "system", action: "watchdog", status: "slow", detail: `DB-Latenz ${ms} ms`, undoable: false },
    });
  }
  return `DB-Latenz ${ms} ms`;
}

/** Evolution & Nischen-Scan höchstens 1× pro 7 Tage je Shop. */
async function scheduledEvolution(list: string[]): Promise<string> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  let ran = 0;
  for (const shop of list.slice(0, 3)) {
    const last = await db.autopilotLog.findFirst({
      where: { shop, action: "weekly_evolution", createdAt: { gte: weekAgo } },
      select: { id: true },
    });
    if (last) continue;
    await weeklyEvolutionRun(shop);
    await db.autopilotLog.create({
      data: { shop, action: "weekly_evolution", status: "success", detail: "Geplanter Lauf", undoable: false },
    });
    ran++;
  }
  return `${ran} Shop(s) geprüft und weiterentwickelt`;
}

export async function runHeartbeat() {
  const started = Date.now();
  const candidates = await shops().catch(() => [] as string[]);
  const list: string[] = [];
  let pausedShops = 0;
  for (const shop of candidates) {
    if (await isShopPaused(shop)) pausedShops++;
    else list.push(shop);
  }
  // Alle Schritte parallel (Gesamtzeit = längster Schritt < 2 s). Die Prüfmail-Queue ist höchstens einen
  // 5-Min.-Takt alt – bei 15 Min. Wartezeit + 4–11 Min. Verzögerung unkritisch.
  const [tokens, stuck, mails, dog, evo, fitSend, stuckMail, cart, inbox] = await Promise.all([
    step(() => refreshTokens(list)),
    step(() => stuckParcels(list)),
    step(() => checkMailQueue(list)),
    step(() => watchdog()),
    step(() => scheduledEvolution(list)),
    step(() => sendFitCheckMails(list), MAIL_STEP_MS),
    step(() => sendStuckParcelMails(list), MAIL_STEP_MS),
    step(() => sendCartRecoveryMails(list), MAIL_STEP_MS),
    step(() => processInbox(list), MAIL_STEP_MS),
  ]);
  const steps = {
    tokenRefresh: tokens,
    stuckParcels: stuck,
    fitCheckMailQueue: mails,
    watchdog: dog,
    evolution: evo,
    fitCheckMailSend: fitSend,
    stuckParcelMail: stuckMail,
    cartRecovery: cart,
    inbox,
  };
  return {
    ok: Object.values(steps).every((s) => s.ok),
    shops: list.length,
    pausedShops,
    durationMs: Date.now() - started,
    steps,
  };
}
