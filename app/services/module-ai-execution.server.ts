import { createHash, randomUUID } from "node:crypto";
import db from "../db.server";
import { requireModuleAccess } from "./access-control.server";
import { isShopPaused } from "./autopilot-control.server";
import { routeAiCompletion, type CompletionInput, type RoutedCompletion } from "./ai-provider-router.server";
import { OWNER_MODULE_IDS } from "./module-access";

type ModuleId = (typeof OWNER_MODULE_IDS)[number];
type AuditScope = ModuleId | "meta-supervisor";

function auditDetail(metadata: Record<string, string | number>) {
  const canonical = JSON.stringify(metadata);
  return JSON.stringify({
    metadata,
    sha256: createHash("sha256").update(canonical, "utf8").digest("hex"),
  });
}

async function auditedCompletion(
  shop: string,
  scope: AuditScope,
  input: CompletionInput,
  offlineFallback?: string,
  localOnly = false,
): Promise<RoutedCompletion & { auditLogId: string }> {
  if (localOnly && !offlineFallback) throw new Error("AI_LOCAL_FALLBACK_REQUIRED");
  if (await isShopPaused(shop)) throw new Error("GLOBAL_AI_PAUSE");
  const executionId = randomUUID();
  const startedAt = new Date().toISOString();
  const inputMetadata = {
    executionId,
    scope,
    startedAt,
    systemChars: input.systemPrompt.length,
    userChars: input.userPrompt.length,
    maxTokens: input.maxTokens,
  };
  let logId: string;
  try {
    const row = await db.autopilotLog.create({
      data: {
        shop,
        action: "ai_completion_audit",
        status: "started",
        detail: auditDetail({ ...inputMetadata, status: "started" }),
        undoable: false,
      },
      select: { id: true },
    });
    logId = row.id;
  } catch {
    console.error("[ai-audit] Startprotokoll konnte nicht gespeichert werden; KI-Aufruf abgebrochen.");
    throw new Error("AI_AUDIT_START_FAILED");
  }

  let result: RoutedCompletion;
  try {
    result = localOnly && offlineFallback
      ? { ok: true, provider: "local", model: "deterministic-local-rules", text: offlineFallback, failures: [] }
      : await routeAiCompletion(input);
    if (!result.ok && offlineFallback) {
      result = { ...result, ok: true, provider: "local", model: "deterministic-local-rules", text: offlineFallback };
    }
  } catch {
    try {
      await db.autopilotLog.update({
        where: { id: logId },
        data: {
          status: "error",
          detail: auditDetail({ ...inputMetadata, finishedAt: new Date().toISOString(), status: "error" }),
        },
      });
    } catch {
      console.error("[ai-audit] Fehlerprotokoll konnte nicht gespeichert werden.");
      throw new Error("AI_AUDIT_FINISH_FAILED");
    }
    throw new Error("AI_COMPLETION_FAILED");
  }

  try {
    await db.autopilotLog.update({
      where: { id: logId },
      data: {
        status: result.ok ? "completed" : "unavailable",
        detail: auditDetail({
          ...inputMetadata,
          finishedAt: new Date().toISOString(),
          status: result.ok ? "completed" : "unavailable",
          provider: result.provider,
          model: result.model,
          outputChars: result.text?.length ?? 0,
          failureCount: result.failures.length,
        }),
      },
    });
  } catch {
    console.error("[ai-audit] Ergebnisprotokoll konnte nicht gespeichert werden; Ergebnis wird nicht freigegeben.");
    throw new Error("AI_AUDIT_FINISH_FAILED");
  }
  return { ...result, auditLogId: logId };
}

export async function executeModuleWithAudit(input: CompletionInput & { shop: string; moduleId: string; offlineFallback?: string; localOnly?: boolean }) {
  const moduleId = OWNER_MODULE_IDS.find((id) => id === input.moduleId);
  if (!moduleId) throw new Error("AI_MODULE_INVALID");
  await requireModuleAccess(input.shop, moduleId);
  return auditedCompletion(input.shop, moduleId, input, input.offlineFallback, input.localOnly);
}

export async function executeMetaSupervisorWithAudit(input: CompletionInput & { shop: string }): Promise<RoutedCompletion> {
  return auditedCompletion(input.shop, "meta-supervisor", input);
}
