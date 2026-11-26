import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";
import { getOwnerShopDomains } from "../services/access-control-core";
import { decryptVaultBlob, encryptVaultBlob } from "../services/aetherion-vault.server";
import { runModuleWorkflow } from "../services/module-workflows.server";

const digest = (value: string) => createHash("sha256").update(value).digest();

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const secrets = [process.env.SELFTEST_TOKEN, process.env.CRON_SECRET]
    .filter((secret): secret is string => !!secret && secret.length >= 16);
  if (!secrets.length) return json({ ok: false, error: "SELFTEST_TOKEN_OR_CRON_SECRET_NOT_CONFIGURED" }, 503);
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") ?? "");
  const given = match?.[1] ?? "";
  if (!given || !secrets.some((secret) => timingSafeEqual(digest(given), digest(secret)))) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const env = {
    OWNER_SHOP_DOMAIN: !!process.env.OWNER_SHOP_DOMAIN?.trim(),
    AI_CLOUD_ENABLED: !!process.env.AI_CLOUD_ENABLED?.trim(),
    AETHERION_CASCADE_ENABLED: !!process.env.AETHERION_CASCADE_ENABLED?.trim(),
    SHOPIFY_APP_URL: !!process.env.SHOPIFY_APP_URL?.trim(),
  };
  let database = false;
  let encryption = false;
  let workflow = false;
  try {
    await db.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    console.error("[selftest] Datenbankprüfung fehlgeschlagen.");
  }
  try {
    const key = randomBytes(32).toString("hex");
    const plaintext = randomBytes(32).toString("hex");
    encryption = decryptVaultBlob(encryptVaultBlob(plaintext, key), key) === plaintext;
  } catch {
    console.error("[selftest] Verschlüsselungsprüfung fehlgeschlagen.");
  }
  if (database) {
    try {
      const shop = getOwnerShopDomains(process.env.OWNER_SHOP_DOMAIN)[0];
      if (!shop) throw new Error("OWNER_NOT_CONFIGURED");
      const result = await runModuleWorkflow(shop, "m1", { localOnly: true });
      const log = await db.autopilotLog.findFirst({
        where: { id: result.auditLogId, shop, action: "ai_completion_audit", status: "completed" },
        select: { detail: true },
      });
      if (!log?.detail) throw new Error("AUDIT_MISSING");
      const entry: unknown = JSON.parse(log.detail);
      if (!entry || typeof entry !== "object" || !("metadata" in entry) || !("sha256" in entry)) {
        throw new Error("AUDIT_INVALID");
      }
      const { metadata, sha256 } = entry;
      workflow = result.ok && !!metadata && typeof metadata === "object" &&
        "scope" in metadata && metadata.scope === "m1" &&
        typeof sha256 === "string" &&
        sha256 === createHash("sha256").update(JSON.stringify(metadata), "utf8").digest("hex");
    } catch {
      console.error("[selftest] Workflow- oder Auditprüfung fehlgeschlagen.");
    }
  }
  const ok = database && encryption && workflow;
  return json({ ok, checks: { database, env, encryption, workflow } }, ok ? 200 : 503);
}
