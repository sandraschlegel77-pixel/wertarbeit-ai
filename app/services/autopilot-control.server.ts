import db from "../db.server";

const PAUSE_RULE = "GLOBAL_AI_PAUSE";

export async function isShopPaused(shop: string): Promise<boolean> {
  const rule = await db.companyRule.findUnique({
    where: { shop_key: { shop, key: PAUSE_RULE } },
    select: { active: true, value: true },
  });
  return rule?.active === true && (rule.value === true || rule.value === "true");
}

export async function setShopPaused(shop: string, paused: boolean): Promise<void> {
  await db.companyRule.upsert({
    where: { shop_key: { shop, key: PAUSE_RULE } },
    update: { value: paused, active: true, priority: 100 },
    create: { shop, key: PAUSE_RULE, value: paused, active: true, priority: 100 },
  });
}

export function supportsLocalUndo(action: string): boolean {
  return action === "sync_orders";
}

export async function undoAutopilotAction(
  shop: string,
  id: string
): Promise<{ ok: boolean; message: string }> {
  const row = await db.autopilotLog.findFirst({
    where: { id, shop },
    select: { id: true, action: true, status: true, undoable: true, undoneAt: true },
  });
  if (!row) return { ok: false, message: "Aktion nicht gefunden." };
  if (!row.undoable || row.undoneAt) return { ok: false, message: "Aktion wurde bereits erledigt oder ist nicht rückgängig zu machen." };
  if (!supportsLocalUndo(row.action) || row.status !== "success") {
    return { ok: false, message: "Für diese Aktion ist keine sichere Rücknahme implementiert." };
  }

  const result = await db.autopilotLog.updateMany({
    where: { id, shop, action: row.action, status: "success", undoable: true, undoneAt: null },
    data: { status: "undone", undoable: false, undoneAt: new Date() },
  });
  if (result.count !== 1) return { ok: false, message: "Aktion wurde zwischenzeitlich geändert." };

  return {
    ok: true,
    message: "Interner Sync-Protokolleintrag zurückgenommen. Externe Änderungen werden dadurch nicht rückgängig gemacht.",
  };
}
