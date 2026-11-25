import { createHash, timingSafeEqual } from "node:crypto";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { runHeartbeat } from "../services/heartbeat.server";
import { runDailyGoogleSheetsSync } from "../services/platform-connectors.server";
import { runSilentRevenueSweepForAllShops } from "../services/silent-revenue.server";
import { runStorageJanitor } from "../services/storage-janitor.server";

/**
 * 24/7-Cloud-Cron-Endpunkt (0 €): ein externer Gratis-Pinger (z. B. cron-job.org, UptimeRobot, GitHub Actions)
 * ruft alle 5 Minuten `GET /api/cron?secret=…` oder mit Header `Authorization: Bearer …` auf.
 * Ohne gesetztes CRON_SECRET ist der Endpunkt komplett gesperrt.
 */

const sha = (s: string) => createHash("sha256").update(s).digest();

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected || expected.length < 16) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const given = bearer || new URL(request.url).searchParams.get("secret") || "";
  return timingSafeEqual(sha(given), sha(expected));
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });

async function handle(request: Request) {
  const secretConfigured = !!process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16;
  if (!secretConfigured) {
    return json({ ok: false, error: "CRON_SECRET nicht gesetzt (mind. 16 Zeichen)." }, 503);
  }
  if (!authorized(request)) return json({ ok: false, error: "unauthorized" }, 401);
  const job = new URL(request.url).searchParams.get("job");
  if (job === "google-sheets-daily") {
    const result = await runDailyGoogleSheetsSync();
    return json({ ...result, job, at: new Date().toISOString() });
  }
  if (job === "silent-revenue-sweep") {
    const result = await runSilentRevenueSweepForAllShops();
    return json({ ...result, job, at: new Date().toISOString() });
  }
  if (job === "storage-janitor") {
    const result = await runStorageJanitor();
    return json({ ...result, job, at: new Date().toISOString() });
  }
  if (job) return json({ ok: false, error: "unknown_job" }, 400);
  const result = await runHeartbeat();
  return json({ ...result, at: new Date().toISOString() });
}

export const loader = async ({ request }: LoaderFunctionArgs) => handle(request);
export const action = async ({ request }: ActionFunctionArgs) => handle(request);
