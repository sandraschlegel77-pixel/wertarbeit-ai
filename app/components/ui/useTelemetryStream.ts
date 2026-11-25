/**
 * useTelemetryStream — Client-Hook für den SSE-Telemetry-Stream des Singularity Cockpits.
 * Verbindet sich mit /api/telemetry-stream und ruft onEvent für jedes empfangene Event auf.
 */
import { useEffect, useRef } from "react";

// TelemetryEvent Typ lokal definieren (statt Import aus .server.ts)
export interface TelemetryEvent {
  type: string;
  channelKey?: string;
  agentKey?: string | null;
  eventType?: string;
  outcome?: string;
  latencyMs?: number;
  model?: string;
  activeWorkers?: number;
  [key: string]: unknown;
}

export function useTelemetryStream(
  onEvent: (event: TelemetryEvent) => void,
  enabled: boolean = true
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    let es: EventSource | null = null;

    const connect = () => {
      es = new EventSource("/api/telemetry-stream");
      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as TelemetryEvent;
          onEventRef.current(event);
        } catch {
          /* ignore malformed */
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
        const t = setTimeout(() => {
          if (!es) connect();
        }, 3000);
        return () => clearTimeout(t);
      };
    };

    connect();

    return () => {
      es?.close();
    };
  }, [enabled]);
}