/** Die 20 bestehenden Sidekick-Tools (Kurzcode -> category/action = sub_action). */
export const OWNER_SHOP_DOMAIN_DEFAULT = "wertarbeitmanufaktur.myshopify.com";

export const TOOLS = {
  DNA: { category: "brand", action: "audit-dna" },
  LST: { category: "catalog", action: "auto-styled-listing" },
  MED: { category: "catalog", action: "media-upgrade" },
  EXP: { category: "brand", action: "expand-store" },
  UCP: { category: "catalog", action: "bilingual-ucp" },
  MST: { category: "marketplace", action: "status" },
  MSY: { category: "marketplace", action: "autopilot-sync" },
  MOR: { category: "marketplace", action: "sync-orders" },
  GRA: { category: "jewelry", action: "gra-certificates" },
  BSP: { category: "jewelry", action: "bespoke-orders" },
  VLT: { category: "jewelry", action: "vault" },
  PRF: { category: "finance", action: "profit-guard" },
  INV: { category: "inventory", action: "smart-ops" },
  ABT: { category: "catalog", action: "growth-ab-test" },
  BRF: { category: "ops", action: "briefing" },
  HEL: { category: "ops", action: "self-heal" },
  RUL: { category: "ops", action: "rules" },
  FIN: { category: "finance", action: "invoices" },
  CON: { category: "marketing", action: "concierge" },
  SUP: { category: "support", action: "ops" },
} as const;

export type ToolCode = keyof typeof TOOLS;

/** Tools, die Daten schreiben/ändern (durch DRY_RUN_MODE geschützt). */
export const WRITE_TOOLS: ReadonlySet<ToolCode> = new Set<ToolCode>([
  "LST", "EXP", "MSY", "MOR", "GRA", "FIN", "RUL", "SUP", "HEL",
]);
