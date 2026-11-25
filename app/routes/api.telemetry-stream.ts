/**
 * SSE-Route für den Singularity Live Cockpit Telemetry-Stream.
 * Streamt echte Telemetrie-Events vom Server an verbundene UI-Clients (text/event-stream).
 */
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  subscribeTelemetry,
  getRecentTracesForShop,
  getCurrentLevel,
  getActiveWorkerCount,
} from "../services/real-telemetry-engine.server";
import type { TelemetryEvent } from "../services/real-telemetry-engine.server";

const encoder = new TextEncoder();

function serialize(event: TelemetryEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const level = getCurrentLevel();
  const activeWorkers = getActiveWorkerCount();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const id = crypto.randomUUID();
      let closed = false;

      const send = (event: TelemetryEvent) => {
        if (closed) return;
        try {
          controller.enqueue(serialize(event));
        } catch {
          closed = true;
        }
      };

      const unsubscribe = subscribeTelemetry({ id, shop, send, level });

      // Aktuellen Status sofort senden
      send({ type: "WORKER_START", workerId: -1, level });
      send({ type: "HEARTBEAT", activeWorkers, queueDepth: 0 });

      // Letzte echten Traces replayen
      void getRecentTracesForShop(shop).then((traces) => {
        for (const trace of traces) send(trace);
      });

      // Keep-alive Kommentar alle 20s
      const keepAlive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          closed = true;
        }
      }, 20_000);

      const cleanup = () => {
        if (closed && keepAlive === null) return;
        closed = true;
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};