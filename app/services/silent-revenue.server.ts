import db from "../db.server";
import type { AgentDef, EarningsRow, EarningsSummary } from "./agent-types";
import { STAMM_AGENTS } from "./agent-roster";
import {
  REWARD_LABELS,
  REWARD_TYPES,
  type CapturedRewardSnapshot,
  type RewardScannerCheck,
  type RewardStatus,
  type RewardType,
} from "./reward-types";

export { REWARD_LABELS, REWARD_TYPES } from "./reward-types";
export type { CapturedRewardItem, CapturedRewardSnapshot, RewardScannerCheck, RewardStatus, RewardType } from "./reward-types";

const emptyRow = (): EarningsRow => ({
  monthReal: 0,
  totalReal: 0,
  monthPotential: 0,
  totalPotential: 0,
});

const add = (a: EarningsRow, b: EarningsRow): EarningsRow => ({
  monthReal: a.monthReal + b.monthReal,
  totalReal: a.totalReal + b.totalReal,
  monthPotential: a.monthPotential + b.monthPotential,
  totalPotential: a.totalPotential + b.totalPotential,
});

/** Verdienst-Eintrag. isSimulated=true => Potenzial/Dry-Run, false => echter Verdienst. */
export async function recordRevenue(input: {
  shop: string;
  agentKey: string;
  departmentId: number;
  amountEur: number;
  category: string;
  isSimulated: boolean;
  referenceId?: string;
  description?: string;
}) {
  return db.agentRevenueEntry.create({ data: input });
}

/** Potenzial-Eintrag max. 1× pro Agent und 24 h (verhindert Aufblähen durch Mehrfachklicks). */
export async function recordPotentialOncePerDay(input: {
  shop: string;
  agentKey: string;
  departmentId: number;
  amountEur: number;
  category: string;
  description?: string;
}) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const exists = await db.agentRevenueEntry.findFirst({
    where: {
      shop: input.shop,
      agentKey: input.agentKey,
      isSimulated: true,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  if (exists) return null;
  return recordRevenue({ ...input, isSimulated: true });
}

/** Verdient (Monat €) & Verdient (Gesamt €) pro KI-Mitarbeiter, Team-Summen für Führungskräfte. */
export async function getAgentEarningsSummary(
  shop: string,
  roster?: AgentDef[]
): Promise<EarningsSummary> {
  const agents = roster ?? STAMM_AGENTS;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const entries = await db.agentRevenueEntry.findMany({
    where: { shop },
    select: { agentKey: true, amountEur: true, isSimulated: true, createdAt: true },
  });

  const perAgent: Record<string, EarningsRow> = {};
  const army = emptyRow();
  for (const e of entries) {
    const row = (perAgent[e.agentKey] ??= emptyRow());
    const inMonth = e.createdAt >= monthStart;
    if (e.isSimulated) {
      row.totalPotential += e.amountEur;
      army.totalPotential += e.amountEur;
      if (inMonth) {
        row.monthPotential += e.amountEur;
        army.monthPotential += e.amountEur;
      }
    } else {
      row.totalReal += e.amountEur;
      army.totalReal += e.amountEur;
      if (inMonth) {
        row.monthReal += e.amountEur;
        army.monthReal += e.amountEur;
      }
    }
  }

  const children = new Map<number, AgentDef[]>();
  for (const a of agents) {
    if (a.reportsTo === null) continue;
    const list = children.get(a.reportsTo) ?? [];
    list.push(a);
    children.set(a.reportsTo, list);
  }

  const team: Record<string, EarningsRow> = {};
  const compute = (a: AgentDef, depth: number): EarningsRow => {
    if (team[a.key]) return team[a.key];
    let sum = { ...(perAgent[a.key] ?? emptyRow()) };
    if (depth < 8) {
      for (const c of children.get(a.number) ?? []) sum = add(sum, compute(c, depth + 1));
    }
    team[a.key] = sum;
    return sum;
  };
  for (const a of agents) {
    if ((children.get(a.number) ?? []).length) compute(a, 0);
  }

  return { perAgent, team, army };
}

const isRewardType = (value: string): value is RewardType =>
  REWARD_TYPES.some((type) => type === value);
const isRewardStatus = (value: string): value is RewardStatus =>
  ["REVIEW", "READY", "REQUESTED", "RECEIVED"].includes(value);

export class RewardInputError extends Error {}

const REWARD_ENGINES: {
  type: RewardType;
  source: string;
  connected: boolean;
}[] = [
  { type: "CASH_REFUND", source: "DHL/DPD/Hermes-Belege und Tracking", connected: false },
  { type: "FEE_RECOVERY", source: "Lokaler Bank-CSV-Abgleich", connected: true },
  { type: "SKONTO_CASHBACK", source: "Lieferanten- und Einkaufsdaten", connected: false },
  { type: "GRANT_SUBSIDY", source: "Förderprogramme und Antragsportale", connected: false },
  { type: "AD_CREDIT_VOUCHER", source: "Werbe- und Cloud-Anbieterkonten", connected: false },
  { type: "AFFILIATE_COMMISSION", source: "Affiliate-Netzwerke und Empfehlungslinks", connected: false },
  { type: "PRECIOUS_METAL_VALUE", source: "Inventur, Wiegedaten und Ankaufskurse", connected: false },
  { type: "FREE_B2B_SAMPLE", source: "Lieferantenangebote und Musterbestellungen", connected: false },
  { type: "CREATOR_SPONSORSHIP", source: "Creator-/Werkstattverträge", connected: false },
  { type: "CUSTOM_OPPORTUNITY", source: "Manuelle Eingabe; keine externe Abfrage", connected: false },
];

function parseOptionalEur(value: string | number | undefined | null, label: string): number | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000) {
    throw new RewardInputError(`${label}: bitte einen Betrag zwischen 0 und 1.000.000 EUR angeben.`);
  }
  return Math.round(parsed * 100) / 100;
}

function classifyOpportunity(text: string): RewardType {
  const value = text.toLocaleLowerCase("de");
  const rules: [RewardType, RegExp][] = [
    ["CASH_REFUND", /dhl|dpd|hermes|verspät|transportschaden|versanderstattung|porto/],
    ["FEE_RECOVERY", /gebühr|fee|storno|paypal|etsy|ebay|shopify|zahlungsabweichung/],
    ["SKONTO_CASHBACK", /skonto|cashback|lieferant|10\s*\+\s*1|mengenzugabe|payback/],
    ["GRANT_SUBSIDY", /förder|zuschuss|digitalbonus|bafa|kfw|handwerkskammer|hwk/],
    ["AD_CREDIT_VOUCHER", /werbeguthaben|ads|freelistings?|cloud.?credits?|ki.?credits?|anzeigenguthaben/],
    ["AFFILIATE_COMMISSION", /affiliate|provision|empfehlungslink|post.?checkout/],
    ["PRECIOUS_METAL_VALUE", /edelmetall|silberrest|goldrest|schmelz|restwert|metallankauf/],
    ["FREE_B2B_SAMPLE", /muster|gratisprobe|materialmuster|musterversand|kostenlose probe|free sample/],
    ["CREATOR_SPONSORSHIP", /sponsoring|creator|werkstatt.?test|xtool|fotostudio|testprodukt/],
  ];
  return rules.find(([, pattern]) => pattern.test(value))?.[0] ?? "CUSTOM_OPPORTUNITY";
}

function makeRequestDraft(type: RewardType, title: string, evidence: string, url?: string | null): string {
  const category = REWARD_LABELS[type];
  return [
    "Guten Tag,",
    "",
    `bitte prüfen Sie, ob für folgende Anfrage ein Anspruch oder eine Teilnahme möglich ist: ${category}.`,
    `Anlass: ${title}`,
    evidence ? `Weitere Angaben: ${evidence}` : "",
    url ? `Aktions-/Informationslink: ${url}` : "",
    "",
    "Bitte teilen Sie mir die Voraussetzungen, erforderlichen Nachweise und die mögliche Höhe bzw. Art des Vorteils mit. Diese Anfrage ist noch keine bestätigte Anspruchsanmeldung.",
    "",
    "Freundliche Grüße",
    "Wertarbeit Manufaktur",
  ].filter(Boolean).join("\n");
}

function validateHttpsUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new RewardInputError("Der Aktions-Link ist keine gültige URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.href.length > 2048) {
    throw new RewardInputError("Der Aktions-Link muss eine HTTPS-URL ohne Zugangsdaten sein (max. 2.048 Zeichen).");
  }
  return url.toString();
}

/** Erfasst eine vom Händler eingereichte Chance; prüft keine externen Ansprüche und sendet nichts ab. */
export async function assimilateCustomOpportunity(
  shop: string,
  input: {
    description: string;
    sourceUrl?: string;
    sourceLabel?: string;
    amountEur?: string | number | null;
    productCount?: string | number | null;
    code?: string;
  }
) {
  const description = input.description.trim();
  if (description.length < 3 || description.length > 2_000) {
    throw new RewardInputError("Bitte eine Beschreibung mit 3 bis 2.000 Zeichen eingeben.");
  }
  const sourceUrl = input.sourceUrl?.trim() ? validateHttpsUrl(input.sourceUrl.trim()) : null;
  const amountEur = parseOptionalEur(input.amountEur, "Schätzwert");
  const rawCount = input.productCount === undefined || input.productCount === null || String(input.productCount).trim() === ""
    ? null
    : Number(input.productCount);
  if (rawCount !== null && (!Number.isInteger(rawCount) || rawCount < 1 || rawCount > 100_000)) {
    throw new RewardInputError("Die Stückzahl muss eine ganze Zahl zwischen 1 und 100.000 sein.");
  }
  const code = input.code?.trim() || null;
  if (code && code.length > 256) throw new RewardInputError("Gutschein-/Aktionscode darf höchstens 256 Zeichen lang sein.");
  const sourceLabel = input.sourceLabel?.trim().slice(0, 120) || (sourceUrl ? new URL(sourceUrl).hostname : null);
  const type = classifyOpportunity(`${description} ${sourceUrl ?? ""}`);
  const title = description.split(/\r?\n/, 1)[0].trim().slice(0, 180) || REWARD_LABELS[type];
  const requestDraft = makeRequestDraft(type, title, description, sourceUrl);
  const row = await db.capturedReward.create({
    data: {
      shop,
      type,
      title,
      sourceLabel,
      sourceUrl,
      estimatedValueEur: amountEur,
      productCount: rawCount,
      code,
      evidence: description,
      requestDraft,
      status: "REVIEW",
    },
    select: { id: true, type: true, title: true },
  });
  return {
    ok: true,
    item: row,
    message: `Als unverifizierter Prüffall „${REWARD_LABELS[type]}“ gespeichert. Anspruch und Betrag bitte anhand von Belegen prüfen.`,
  };
}

/** Prüft lokale Bankabgleich-Differenzen und meldet fehlende externe Datenquellen transparent. */
export async function runSilentRevenueSweep(shop: string): Promise<{
  ok: true;
  candidateCount: number;
  checks: RewardScannerCheck[];
  message: string;
}> {
  const deviations = await db.paymentLedgerEntry.findMany({
    where: { shop, status: "FEE_DEVIATION", currency: "EUR", feeDelta: { lt: -0.02 } },
    select: { id: true, feeDelta: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  for (const entry of deviations) {
    const difference = Math.round(Math.abs(entry.feeDelta ?? 0) * 100) / 100;
    const sourceRef = `payment-ledger:${entry.id}`;
    await db.capturedReward.upsert({
      where: { shop_sourceRef: { shop, sourceRef } },
      update: {},
      create: {
        shop,
        type: "FEE_RECOVERY",
        title: `Zahlungsabweichung prüfen · ${entry.id.slice(0, 8)}`,
        sourceLabel: "Lokaler Bank-CSV-Abgleich",
        sourceRef,
        estimatedValueEur: difference,
        evidence: `Der Bankabgleich zeigt eine Abweichung von ${difference.toFixed(2)} EUR. Das ist kein bestätigter Gebührenfehler oder Rückforderungsanspruch. Rechnung und Zahlungsanbieter-Abrechnung manuell prüfen.`,
        requestDraft: makeRequestDraft(
          "FEE_RECOVERY",
          "Zahlungsabweichung aus Bankabgleich",
          `Abweichung laut internem Abgleich: ${difference.toFixed(2)} EUR. Bitte die Originalabrechnung und Rechnung beifügen und Anspruch/Voraussetzungen prüfen.`
        ),
        status: "REVIEW",
      },
    });
  }

  const checks = REWARD_ENGINES.map((engine): RewardScannerCheck => ({
    type: engine.type,
    label: REWARD_LABELS[engine.type],
    source: engine.source,
    status: engine.type === "CUSTOM_OPPORTUNITY"
      ? "MANUAL"
      : engine.connected
        ? "LOCAL_SCAN"
        : "NO_CONNECTION",
    findings: engine.type === "FEE_RECOVERY" ? deviations.length : 0,
  }));
  return {
    ok: true,
    candidateCount: deviations.length,
    checks,
    message: `10 Vorteilskategorien geprüft: ${deviations.length} lokale Zahlungsabweichung(en) als unverifizierte Prüffälle. Andere externe Konten/Programme sind nicht angebunden; es wurde nichts beantragt oder eingelöst.`,
  };
}

export async function runSilentRevenueSweepForAllShops() {
  const sessions = await db.session.findMany({ distinct: ["shop"], select: { shop: true } });
  let candidates = 0;
  for (const session of sessions) {
    const result = await runSilentRevenueSweep(session.shop);
    candidates += result.candidateCount;
  }
  return { ok: true, shopsChecked: sessions.length, candidateCount: candidates };
}

export async function getCapturedRewardSnapshot(shop: string): Promise<CapturedRewardSnapshot> {
  const [rows, statusGroups, typeGroups] = await Promise.all([
    db.capturedReward.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.capturedReward.groupBy({
      by: ["status"],
      where: { shop },
      _sum: { estimatedValueEur: true, actualValueEur: true },
    }),
    db.capturedReward.groupBy({
      by: ["type"],
      where: { shop, status: "RECEIVED" },
      _sum: { receivedQuantity: true },
    }),
  ]);
  const byStatus = new Map(statusGroups.map((row) => [row.status, row._sum]));
  const byType = new Map(typeGroups.map((row) => [row.type, row._sum.receivedQuantity ?? 0]));
  const readyEur = byStatus.get("READY")?.estimatedValueEur ?? 0;
  const requestedEur = byStatus.get("REQUESTED")?.estimatedValueEur ?? 0;
  const receivedEur = byStatus.get("RECEIVED")?.actualValueEur ?? 0;
  return {
    items: rows.map((row) => {
      if (!isRewardType(row.type) || !isRewardStatus(row.status)) {
        throw new Error(`Ungültiger Vorteilsdatensatz ${row.id}; Typ oder Status ist unbekannt.`);
      }
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        sourceLabel: row.sourceLabel,
        sourceUrl: row.sourceUrl,
        estimatedValueEur: row.estimatedValueEur,
        actualValueEur: row.actualValueEur,
        productCount: row.productCount,
        receivedQuantity: row.receivedQuantity,
        code: row.code,
        evidence: row.evidence,
        requestDraft: row.requestDraft,
        status: row.status,
        accountingReview: row.accountingReview,
        createdAt: row.createdAt.toISOString(),
        requestedAt: row.requestedAt?.toISOString() ?? null,
        receivedAt: row.receivedAt?.toISOString() ?? null,
      };
    }),
    summary: {
      readyEur,
      requestedEur,
      receivedEur,
      receivedProducts:
        (byType.get("FREE_B2B_SAMPLE") ?? 0) + (byType.get("CREATOR_SPONSORSHIP") ?? 0),
    },
  };
}

export async function transitionCapturedReward(
  shop: string,
  id: string,
  nextStatus: "READY" | "REQUESTED" | "RECEIVED",
  input: { actualValueEur?: string | number | null; receivedQuantity?: string | number | null } = {}
) {
  if (!id || id.length > 64) throw new RewardInputError("Ungültige Vorteils-ID.");
  const reward = await db.capturedReward.findFirst({ where: { id, shop } });
  if (!reward) throw new RewardInputError("Vorteil nicht gefunden.");
  const allowed =
    (reward.status === "REVIEW" && nextStatus === "READY") ||
    (reward.status === "READY" && (nextStatus === "REQUESTED" || nextStatus === "RECEIVED")) ||
    (reward.status === "REQUESTED" && nextStatus === "RECEIVED");
  if (!allowed) throw new RewardInputError(`Statuswechsel von ${reward.status} nach ${nextStatus} ist nicht zulässig.`);

  const data: {
    status: string;
    requestedAt?: Date;
    receivedAt?: Date;
    actualValueEur?: number | null;
    receivedQuantity?: number | null;
  } = { status: nextStatus };
  if (nextStatus === "REQUESTED") data.requestedAt = new Date();
  if (nextStatus === "RECEIVED") {
    const actualValueEur = parseOptionalEur(input.actualValueEur, "Tatsächlich erhalten");
    const rawQuantity =
      input.receivedQuantity === undefined || input.receivedQuantity === null || String(input.receivedQuantity).trim() === ""
        ? null
        : Number(input.receivedQuantity);
    if (rawQuantity !== null && (!Number.isInteger(rawQuantity) || rawQuantity < 1 || rawQuantity > 100_000)) {
      throw new RewardInputError("Die erhaltene Stückzahl muss zwischen 1 und 100.000 liegen.");
    }
    const nonCash = reward.type === "FREE_B2B_SAMPLE" || reward.type === "CREATOR_SPONSORSHIP";
    if ((!nonCash && (actualValueEur === null || actualValueEur <= 0)) ||
        (nonCash && (actualValueEur === null || actualValueEur <= 0) && rawQuantity === null)) {
      throw new RewardInputError("Bitte den tatsächlich erhaltenen EUR-Betrag oder bei Gratisprodukten die erhaltene Stückzahl angeben.");
    }
    data.receivedAt = new Date();
    data.actualValueEur = actualValueEur;
    data.receivedQuantity = rawQuantity;
  }
  const updated = await db.capturedReward.updateMany({
    where: { id, shop, status: reward.status },
    data,
  });
  if (updated.count !== 1) throw new RewardInputError("Der Prüffall wurde parallel geändert. Bitte Dashboard aktualisieren.");
  return { ok: true, message: nextStatus === "READY"
    ? "Manuell als geprüft und anforderbar markiert."
    : nextStatus === "REQUESTED"
      ? "Als beantragt markiert. Es wurde keine Anfrage versendet."
      : "Erhalt manuell verbucht; steuerliche Einordnung bleibt für den Steuerberater offen." };
}

function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

/** CSV-Prüfliste für Steuerberater; absichtlich kein DATEV-Buchungsstapel oder automatischer Buchungssatz. */
export async function buildCapturedRewardAccountantCsv(shop: string): Promise<string> {
  const rows = await db.capturedReward.findMany({
    where: { shop, status: "RECEIVED" },
    orderBy: { receivedAt: "asc" },
    select: {
      id: true,
      type: true,
      title: true,
      sourceLabel: true,
      sourceUrl: true,
      evidence: true,
      actualValueEur: true,
      receivedQuantity: true,
      receivedAt: true,
      accountingReview: true,
    },
  });
  const header = [
    "Vorgangs-ID", "Erhalten am", "Kategorie", "Bezeichnung", "Quelle", "Quellenlink",
    "Tatsächlicher Betrag EUR", "Erhaltene Stückzahl", "Nachweis/Notiz", "Steuerprüfung",
  ];
  const lines = rows.map((row) => [
    row.id,
    row.receivedAt?.toISOString() ?? "",
    isRewardType(row.type) ? REWARD_LABELS[row.type] : row.type,
    row.title,
    row.sourceLabel,
    row.sourceUrl,
    row.actualValueEur,
    row.receivedQuantity,
    row.evidence,
    row.accountingReview,
  ].map(csvCell).join(";"));
  return [header.map(csvCell).join(";"), ...lines].join("\r\n");
}
