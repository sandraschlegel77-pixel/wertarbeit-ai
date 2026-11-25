/**
 * /api/health — Öffentlicher Health-Check-Endpoint für Cloudflare DNS Load-Balancing,
 * UptimeRobot & Render/Koyeb Health-Checks. Keine Auth nötig, 0,00 € Stack.
 * Gibt JSON zurück: { status: "ok", timestamp, stage, uptimeMs, memory }
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  const uptimeMs = process.uptime() * 1000;
  const mem = process.memoryUsage();
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeMs: Math.round(uptimeMs),
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }
  );
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const uptimeMs = process.uptime() * 1000;
  const mem = process.memoryUsage();
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeMs: Math.round(uptimeMs),
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }
  );
};