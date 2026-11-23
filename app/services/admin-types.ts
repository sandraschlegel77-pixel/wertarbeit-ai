import type { authenticate } from "../shopify.server";

/** Admin-API-Kontext exakt so, wie ihn `authenticate.admin` liefert (kein handgebauter Typ). */
export type ShopifyAdmin = Awaited<ReturnType<typeof authenticate.admin>>["admin"];
