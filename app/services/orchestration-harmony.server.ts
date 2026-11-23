import db from "../db.server";
import type { HarmonyScore } from "./agent-types";
import { descendantsOf, getRoster } from "./ai-agents.server";
import { runAgent } from "./agent-runner.server";
import { getApprovals } from "./dashboard-data.server";
import type { ApprovalDto } from "./agent-types";

export {
  generateExecutiveThreeSentencePulse,
  runMetaSupervisorAudit,
  selectOptimalFreeModel,
} from "./meta-supervisor.server";

/* -------------------------------------------------------------------------- */
/*  Entity-Locks (keine Konflikte am selben Produkt / Kunden / Agenten)       */
/* -------------------------------------------------------------------------- */

const locks = new Map<string, { holder: string; until: number }>();

export function acquireLock(key: string, holder: string, ttlMs = 30_000): boolean {
  const now = Date.now();
  const current = locks.get(key);
  if (current && current.until > now && current.holder !== holder) return false;
  locks.set(key, { holder, until: now + ttlMs });
  return true;
}

export function releaseLock(key: string, holder: string): void {
  const current = locks.get(key);
  if (current && current.holder === holder) locks.delete(key);
}

export function activeLockCount(): number {
  const now = Date.now();
  let n = 0;
  for (const [key, v] of locks) {
    if (v.until > now) n++;
    else locks.delete(key);
  }
  return n;
}

/* -------------------------------------------------------------------------- */
/*  Speed-Messung                                                             */
/* -------------------------------------------------------------------------- */

const timings: number[] = [];

export function recordTiming(ms: number): void {
  timings.push(ms);
  if (timings.length > 200) timings.shift();
}

export interface PreparationDeskSnapshot {
  items: ApprovalDto[];
  pendingCount: number;
  contributingAgents: number;
}

/** #220 fasst die vorhandene, shopbezogene Freigabe-Warteschlange zusammen. */
export async function getPreparationDeskSnapshot(shop: string): Promise<PreparationDeskSnapshot> {
  const items = await getApprovals(shop);
  return {
    items,
    pendingCount: items.length,
    contributingAgents: new Set(items.map((item) => item.sourceAgentKey)).size,
  };
}

/* -------------------------------------------------------------------------- */
/*  Asynchrone Hintergrund-Ausführung                                         */
/* -------------------------------------------------------------------------- */

export function runInBackground(label: string, fn: () => Promise<void>): void {
  setImmediate(() => {
    fn().catch((err) => console.error(`[orchestration] ${label} error:`, err));
  });
}

/**
 * Kaskaden-Befehl: Ein Vorgesetzter gibt einen Auftrag an sein gesamtes Team
 * (alle direkten & indirekten Untergebenen). Läuft nicht-blockierend im
 * Hintergrund mit begrenzter Parallelität (4 Worker).
 */
export async function runHierarchyCommand(
  shop: string,
  fromNumber: number,
  opts: { maxAgents?: number; body?: Record<string, unknown> } = {}
): Promise<{ queued: number; numbers: number[] }> {
  const roster = await getRoster(shop);
  const maxAgents = opts.maxAgents ?? 200;
  const numbers = [fromNumber, ...descendantsOf(roster, fromNumber)].slice(0, maxAgents);

  runInBackground(`cascade:${fromNumber}`, async () => {
    const queue = [...numbers];
    const worker = async () => {
      while (queue.length) {
        const n = queue.shift();
        if (n === undefined) return;
        await runAgent(shop, n, { origin: "cascade", body: opts.body });
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  });

  return { queued: numbers.length, numbers };
}

/* -------------------------------------------------------------------------- */
/*  System-Harmonie- & Speed-Score (%)                                        */
/* -------------------------------------------------------------------------- */

export async function computeHarmony(shop: string): Promise<HarmonyScore> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let pending = 0;
  let failed = 0;
  try {
    [pending, failed] = await Promise.all([
      db.approvalQueueItem.count({ where: { shop, status: "PENDING" } }),
      db.autopilotLog.count({
        where: { shop, createdAt: { gte: since }, status: { in: ["error", "blocked"] } },
      }),
    ]);
  } catch {
    /* leere DB / noch nicht migriert -> Standardwerte */
  }
  const conflicts = activeLockCount();
  const harmony = Math.max(
    0,
    100 - Math.min(25, pending * 0.5) - Math.min(30, failed * 2) - Math.min(10, conflicts * 2)
  );
  const avg = timings.length ? timings.reduce((a, b) => a + b, 0) / timings.length : 0;
  const speed = Math.max(0, Math.min(100, 100 - Math.max(0, (avg - 150) / 20)));
  return {
    harmony: Math.round(harmony * 10) / 10,
    speed: Math.round(speed * 10) / 10,
    pending,
    conflicts,
  };
}
