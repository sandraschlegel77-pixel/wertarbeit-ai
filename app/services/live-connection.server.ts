import { createHash } from "node:crypto";
import db from "../db.server";

export interface LiveConnectionTraceDto {
  id: string;
  channelKey: string;
  agentKey: string | null;
  eventType: string;
  outcome: string;
  requestHash: string | null;
  responseHash: string | null;
  detail: string | null;
  occurredAt: string;
}

function hash(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function recordAgentConnectionTrace(input: {
  shop: string;
  agentKey: string;
  channelKey: string;
  outcome: "SUCCESS" | "FAILED";
  trigger: "manual" | "cascade" | "cron";
  durationMs: number;
}) {
  const identity = JSON.stringify([input.shop, input.agentKey, input.channelKey, input.trigger]);
  return db.liveConnectionTrace.create({
    data: {
      shop: input.shop,
      channelKey: input.channelKey,
      agentKey: input.agentKey,
      eventType: "SIDEKICK_TOOL_CALL",
      outcome: input.outcome,
      requestHash: hash(identity),
      responseHash: hash(input.outcome),
      detail: `trigger=${input.trigger};duration_ms=${Math.max(0, Math.round(input.durationMs))}`,
    },
    select: { id: true },
  });
}

export async function getRecentLiveConnectionTraces(
  shop: string,
  allowedAgentKeys?: readonly string[]
): Promise<LiveConnectionTraceDto[]> {
  if (allowedAgentKeys && allowedAgentKeys.length === 0) return [];
  const rows = await db.liveConnectionTrace.findMany({
    where: {
      shop,
      ...(allowedAgentKeys ? { agentKey: { in: [...allowedAgentKeys] } } : {}),
    },
    orderBy: { occurredAt: "desc" },
    take: 100,
    select: {
      id: true,
      channelKey: true,
      agentKey: true,
      eventType: true,
      outcome: true,
      requestHash: true,
      responseHash: true,
      detail: true,
      occurredAt: true,
    },
  });
  return rows.map((row) => ({ ...row, occurredAt: row.occurredAt.toISOString() }));
}
