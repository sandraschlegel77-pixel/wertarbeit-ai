import db from "../db.server";
import { isShopPaused } from "./autopilot-control.server";

export async function vaultCloudExecutionAllowed(shop: string, action: "sandbox_test" | "ai-fallback"): Promise<boolean> {
  if (process.env.AI_CLOUD_ENABLED !== "true" || await isShopPaused(shop)) return false;
  const [dryRule, veto] = await Promise.all([
    db.companyRule.findUnique({ where: { shop_key: { shop, key: "DRY_RUN_MODE" } } }),
    db.companyRule.findUnique({ where: { shop_key: { shop, key: `veto:owner-vault:${action}` } } }),
  ]);
  const dryRun = dryRule?.active
    ? !["false", "0", "off"].includes(String(dryRule.value).replace(/"/g, "").toLowerCase())
    : process.env.DRY_RUN_MODE !== "false";
  return !dryRun && !veto?.active;
}
