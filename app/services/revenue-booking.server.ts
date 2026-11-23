import db from "../db.server";
import { bookRealRevenue } from "./agent-runner.server";

/**
 * Echte Verdienst-Buchung aus orders/paid (isSimulated: false).
 * Der Netto-Warenwert einer bezahlten Bestellung wird nach einer festen, offenen Regel auf die beteiligten
 * KI-Mitarbeiter verteilt. Doppelbuchungen (Shopify liefert Webhooks mehrfach) verhindert `referenceId`.
 * Keine Kundendaten: nur Bestellnummer und Beträge.
 */

interface PaidOrder {
  name?: string;
  id?: number | string;
  subtotal_price?: string;
  total_tax?: string;
  taxes_included?: boolean;
  source_name?: string;
  note_attributes?: { name?: string; value?: string }[];
  line_items?: { title?: string; properties?: { name?: string; value?: string }[] | null }[];
}

/** [Agent-Nr., Anteil in %, Kategorie] – Summe immer 100. Nummern aus der Meister-Struktur. */
// #4 Auto-Listing-Schreiber · #7 Foto-Freisteller · #10 Startseiten-Wächter · #19 Shopify-Sync · #25 Repricer
// #27 § 11 PAngV-Prüfer · #34 ZUGFeRD-Rechnungen · #44 Passt-alles-Prüfmail · #57 Gravur-Spruch-Generator
const SPLIT_BASE: [number, number, string][] = [
  [4, 20, "Auto-Listing: Produkt online gebracht"],
  [7, 15, "Studio-Medien: Bildqualität"],
  [19, 15, "Shopify-Sync"],
  [25, 10, "Preis-Optimierung"],
  [27, 5, "§ 11 PAngV-Prüfung"],
  [44, 10, "Post-Checkout: „Passt alles?“-Prüfung"],
  [34, 10, "Rechnung & Buchhaltung"],
  [10, 15, "Premium-Startseite"],
];
const SPLIT_ENGRAVED: [number, number, string][] = [
  [57, 20, "Gravur: Individualisierung"],
  [4, 15, "Auto-Listing: Produkt online gebracht"],
  [7, 10, "Studio-Medien: Bildqualität"],
  [19, 10, "Shopify-Sync"],
  [25, 10, "Preis-Optimierung"],
  [27, 5, "§ 11 PAngV-Prüfung"],
  [44, 10, "Post-Checkout: „Passt alles?“-Prüfung"],
  [34, 10, "Rechnung & Buchhaltung"],
  [10, 10, "Premium-Startseite"],
];

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const isEngraved = (o: PaidOrder): boolean =>
  (o.line_items ?? []).some((li) => (li.properties ?? []).some((p) => /gravur|engrav/i.test(`${p.name ?? ""}`)));

/** Netto-Warenwert in EUR-Cent-genauer Rundung. */
export function netGoods(o: PaidOrder): number {
  const sub = num(o.subtotal_price);
  const tax = num(o.total_tax);
  return Math.max(0, Math.round((o.taxes_included ? sub - tax : sub) * 100) / 100);
}

export async function bookOrderRevenue(shop: string, o: PaidOrder): Promise<{ booked: number; amountEur: number }> {
  const ref = `order:${o.name ?? o.id ?? ""}`;
  if (ref === "order:") return { booked: 0, amountEur: 0 };

  const already = await db.agentRevenueEntry.findFirst({
    where: { shop, referenceId: { startsWith: ref }, isSimulated: false },
    select: { id: true },
  });
  if (already) return { booked: 0, amountEur: 0 };

  const net = netGoods(o);
  if (net <= 0) return { booked: 0, amountEur: 0 };

  // Der KI-Anteil ist ein interner Zuordnungswert (Wertbeitrag), kein zusätzlicher Umsatz: 3 % des Netto-Warenwerts.
  const pool = Math.round(net * 0.03 * 100) / 100;
  const split = isEngraved(o) ? SPLIT_ENGRAVED : SPLIT_BASE;
  let booked = 0;
  for (const [agent, pct, category] of split) {
    const amount = Math.round(pool * pct) / 100;
    if (amount <= 0) continue;
    await bookRealRevenue(shop, agent, amount, category, `${ref}:A${agent}`);
    booked++;
  }
  return { booked, amountEur: pool };
}

/** checkouts/update: nur Beobachtung (Potenzial) – es fließt noch kein Geld, also nie als „echt“ buchen. */
export async function noteCheckoutUpdate(
  shop: string,
  payload: { token?: string; completed_at?: string | null }
): Promise<void> {
  if (!payload.token) return;
  const key = payload.token.slice(0, 40);
  const done = await db.autopilotLog.findFirst({ where: { shop, action: "checkout_seen", detail: key }, select: { id: true } });
  if (done) return;
  await db.autopilotLog.create({
    data: {
      shop,
      action: "checkout_seen",
      status: payload.completed_at ? "completed" : "open",
      detail: key,
      undoable: false,
    },
  });
}
