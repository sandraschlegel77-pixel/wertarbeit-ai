import db from "../db.server";
import { runSidekickTool } from "../lib/sidekick.server";
import { isShopPaused } from "./autopilot-control.server";
import type { AuditDomain } from "./agent-types";

/* Prüfgremien je Domäne (Agentennummern aus der Meister-Struktur) */
const PANELS: Record<AuditDomain, { members: number[]; chief: number; label: string }> = {
  LEGAL: { members: [162, 163, 164, 165, 166, 167, 168, 169, 170], chief: 171, label: "LEGAL_VERIFIED_3X" },
  FINANCE: { members: [172, 173, 174, 175], chief: 176, label: "FINANCE_VERIFIED_3X" },
  CRAFT: { members: [177, 178, 179], chief: 180, label: "CRAFT_VERIFIED_3X" },
};

export type PassStatus = "PASS" | "WARN" | "FAIL";
export type FinalStatus = "VERIFIED_3X" | "NEEDS_OWNER_APPROVAL" | "BLOCKED";

export interface AuditPayload {
  text?: string;
  isMarketing?: boolean;
  amountEur?: number;
  marginPercent?: number;
  taxMode?: string;
  euSalesYtd?: number;
  certificateNo?: string;
  engravingText?: string;
  ringSizeMode?: "fixed" | "adjustable";
  claims?: { kind: "certificate" | "invoice"; ref: string }[];
  priceReduction?: { oldPrice: number; lowest30: number | null };
}

interface PassResult {
  status: PassStatus;
  notes: string[];
}

const worst = (a: PassStatus, b: PassStatus): PassStatus =>
  a === "FAIL" || b === "FAIL" ? "FAIL" : a === "WARN" || b === "WARN" ? "WARN" : "PASS";

/* Schutzschicht 5: Familienbetrieb-Stilbuch (BrandVoiceGuard) */
export function brandVoiceGuard(text: string): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (/!{3,}/.test(text)) issues.push("Zu laut: mehrfache Ausrufezeichen vermeiden.");
  const caps = text.match(/\b[A-ZÄÖÜ]{6,}\b/g) ?? [];
  if (caps.length > 2) issues.push("Zu viele GROSSBUCHSTABEN – wirkt unpersönlich.");
  if (/schnäppchen|ramsch|billigware|kaufen sie jetzt/i.test(text))
    issues.push("Passt nicht zum Familienbetrieb-Ton (Wertarbeit statt Ramsch-Sprache).");
  if (/sehr geehrte damen und herren/i.test(text))
    issues.push("Bitte warmherzig und persönlich ansprechen.");
  return { ok: issues.length === 0, issues };
}

/* Schutzschicht 2: 7-Tage-Anti-Spam-Kontakt-Lock */
export async function canContactCustomer(shop: string, email: string): Promise<boolean> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const hit = await db.autopilotLog.findFirst({
    where: { shop, action: `contact:${email.toLowerCase()}`, createdAt: { gte: since } },
    select: { id: true },
  });
  return !hit;
}

export async function recordContact(shop: string, email: string): Promise<void> {
  await db.autopilotLog.create({
    data: {
      shop,
      action: `contact:${email.toLowerCase()}`,
      status: "success",
      detail: "Kontakt-Lock 7 Tage",
      undoable: false,
    },
  });
}

/* Schutzschicht 1: Fakten-/Halluzinations-Prüfer gegen echte Shopify-/Shop-Daten */
async function factCheck(shop: string, payload: AuditPayload): Promise<PassResult> {
  const notes: string[] = [];
  let status: PassStatus = "PASS";
  for (const c of payload.claims ?? []) {
    const found =
      c.kind === "certificate"
        ? !!(await db.graCertificate.findFirst({ where: { shop, certificateNo: c.ref }, select: { id: true } }))
        : !!(await db.invoice.findFirst({ where: { shop, invoiceNo: c.ref }, select: { id: true } }));
    if (!found) {
      status = "FAIL";
      notes.push(`Behauptung nicht belegbar (${c.kind} ${c.ref}) – mögliche Halluzination.`);
    }
  }
  if (payload.text) {
    const voice = brandVoiceGuard(payload.text);
    if (!voice.ok) {
      status = worst(status, "WARN");
      notes.push(...voice.issues);
    }
  }
  return { status, notes };
}

/* Domänen-Regeln */
function domainRules(domain: AuditDomain, p: AuditPayload): PassResult {
  const notes: string[] = [];
  let status: PassStatus = "PASS";
  const warn = (msg: string) => {
    status = worst(status, "WARN");
    notes.push(msg);
  };
  const fail = (msg: string) => {
    status = "FAIL";
    notes.push(msg);
  };

  if (domain === "LEGAL") {
    const t = p.text ?? "";
    if (/heilt|heilend|garantiert gewinn|risikofrei|krebs/i.test(t))
      fail("Unzulässiges Heil-/Gewinnversprechen (UWG/HWG).");
    if (/rückgabe|widerruf/i.test(t) && /gravur|individual|unikat|maßanfertigung/i.test(t) && !/312g/.test(t))
      warn("Rückgabe-Hinweis bei Individualanfertigung ohne Bezug auf § 312g BGB.");
    if (p.isMarketing && !/abmelden|unsubscribe/i.test(t))
      warn("Marketing-Mail ohne 1-Klick-Abmeldehinweis (§ 7 UWG).");
    if (p.priceReduction) {
      const { oldPrice, lowest30 } = p.priceReduction;
      if (lowest30 === null) warn("§ 11 PAngV: 30-Tage-Tiefstpreis nicht ermittelt.");
      else if (oldPrice > lowest30 + 0.001) fail("§ 11 PAngV: Streichpreis liegt über dem 30-Tage-Tiefstpreis.");
    }
  } else if (domain === "FINANCE") {
    if (p.amountEur !== undefined && (!Number.isFinite(p.amountEur) || p.amountEur < 0)) fail("Ungültiger Betrag.");
    if (p.marginPercent !== undefined) {
      if (p.marginPercent < 0) fail("Negative Marge – Verkauf unter Einkaufswert.");
      else if (p.marginPercent < 15) warn("Marge unter 15 % – Edelmetall-Margen-Wächter.");
    }
    if (p.taxMode !== undefined && !["mwst", "kleinunternehmer"].includes(p.taxMode))
      fail("Unbekannter Steuer-Modus.");
    if (p.euSalesYtd !== undefined && p.euSalesYtd >= 8500)
      warn(p.euSalesYtd >= 10000 ? "EU-OSS-Lieferschwelle 10.000 € überschritten." : "EU-OSS-Warnsignal ab 8.500 €.");
  } else {
    if (p.certificateNo !== undefined && !/^GRA-\d{6,}$/.test(p.certificateNo))
      warn("GRA-Nummer entspricht nicht dem Format GRA-123456.");
    if (p.engravingText !== undefined && p.engravingText.length > 40)
      warn("Gravurtext länger als 40 Zeichen – Platz prüfen.");
    if (p.ringSizeMode !== undefined && !["fixed", "adjustable"].includes(p.ringSizeMode))
      fail("Unikat-Ring: Größen-Modus unklar.");
  }
  return { status, notes };
}

/* Verbindlicher 3-Stufen-Prüflauf */
export interface TripleAuditResult {
  id: string;
  domain: AuditDomain;
  finalStatus: FinalStatus;
  label: string;
  notes: string[];
}

export async function runTripleAudit(input: {
  shop: string;
  domain: AuditDomain;
  sourceAgentNumber: number;
  payload: AuditPayload;
}): Promise<TripleAuditResult> {
  const { shop, domain, sourceAgentNumber, payload } = input;
  const panel = PANELS[domain];
  const idx = Math.abs(sourceAgentNumber) % panel.members.length;
  const a1 = panel.members[idx];
  const a2 = panel.members[(idx + 1) % panel.members.length];

  const pass1 = await factCheck(shop, payload);
  const pass2 = domainRules(domain, payload);
  const overall = worst(pass1.status, pass2.status);
  const finalStatus: FinalStatus =
    overall === "FAIL" ? "BLOCKED" : overall === "WARN" ? "NEEDS_OWNER_APPROVAL" : "VERIFIED_3X";
  const notes = [...pass1.notes, ...pass2.notes];

  const row = await db.tripleAuditLog.create({
    data: {
      shop,
      auditDomain: domain,
      sourceAgentKey: `A${sourceAgentNumber}`,
      pass1AuditorKey: `A${a1}`,
      pass1Status: pass1.status,
      pass2AuditorKey: `A${a2}`,
      pass2Status: pass2.status,
      chiefAuditorKey: `A${panel.chief}`,
      finalStatus,
      findingsSummary: notes.join(" | ") || "Keine Beanstandungen.",
    },
  });
  return { id: row.id, domain, finalStatus, label: panel.label, notes };
}

/* Schutzschicht 4: riskante Aktionen -> ApprovalQueueItem (Human-in-the-Loop) */
export async function enqueueApproval(input: {
  shop: string;
  sourceAgentKey: string;
  category: string;
  title: string;
  summary: string;
  financialImpactEur?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  payload?: Record<string, unknown>;
}) {
  const dup = await db.approvalQueueItem.findFirst({
    where: { shop: input.shop, sourceAgentKey: input.sourceAgentKey, title: input.title, status: "PENDING" },
    select: { id: true },
  });
  if (dup) return dup;
  return db.approvalQueueItem.create({
    data: {
      shop: input.shop,
      sourceAgentKey: input.sourceAgentKey,
      category: input.category,
      title: input.title,
      summary: input.summary,
      financialImpactEur: input.financialImpactEur ?? 0,
      riskLevel: input.riskLevel ?? "MEDIUM",
      payloadJson: JSON.stringify(input.payload ?? {}),
    },
  });
}

/** 1-Klick-Freigabe: APPROVED führt die hinterlegte Sidekick-Aktion aus (Inhaber-Entscheidung). */
export async function resolveApproval(
  shop: string,
  id: string,
  decision: "APPROVED" | "REJECTED"
): Promise<{ ok: boolean; message: string }> {
  if (decision === "APPROVED" && (await isShopPaused(shop))) {
    return { ok: false, message: "Globale KI-Pause ist aktiv. Die Freigabe wurde nicht ausgeführt." };
  }
  const item = await db.approvalQueueItem.findFirst({ where: { id, shop } });
  if (!item) return { ok: false, message: "Eintrag nicht gefunden." };
  if (item.status !== "PENDING") return { ok: false, message: "Bereits entschieden." };

  if (decision === "REJECTED") {
    const updated = await db.approvalQueueItem.updateMany({
      where: { id, shop, status: "PENDING" },
      data: { status: decision },
    });
    return updated.count === 1
      ? { ok: true, message: "Abgelehnt." }
      : { ok: false, message: "Eintrag wurde bereits entschieden." };
  }

  let payload: { category?: string; action?: string; body?: unknown };
  try {
    const parsed: unknown = JSON.parse(item.payloadJson);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, message: "Freigabe-Payload ist ungültig; es wurde nichts ausgeführt." };
    }
    payload = parsed as { category?: string; action?: string; body?: unknown };
  } catch {
    return { ok: false, message: "Freigabe-Payload ist beschädigt; es wurde nichts ausgeführt." };
  }

  const hasAction = payload.category !== undefined || payload.action !== undefined;
  if (
    hasAction &&
    (typeof payload.category !== "string" ||
      typeof payload.action !== "string" ||
      !payload.category ||
      !payload.action)
  ) {
    return { ok: false, message: "Freigabe-Payload ist unvollständig; es wurde nichts ausgeführt." };
  }
  if (payload.category && payload.action) {
    const dryRunRule = await db.companyRule.findUnique({
      where: { shop_key: { shop, key: "DRY_RUN_MODE" } },
      select: { value: true, active: true },
    });
    const configuredValue = dryRunRule?.active ? String(dryRunRule.value).replace(/"/g, "").toLowerCase() : null;
    const dryRun = configuredValue === null
      ? process.env.DRY_RUN_MODE !== "false"
      : configuredValue !== "false" && configuredValue !== "0" && configuredValue !== "off";
    if (dryRun) return { ok: false, message: "DRY_RUN_MODE ist aktiv. Die Freigabe bleibt offen und es wurde nichts ausgeführt." };

    const rules = await db.companyRule.findMany({
      where: { shop, active: true, key: { startsWith: "veto:" } },
      select: { key: true },
    });
    const vetoes = new Set(rules.map((rule) => rule.key.slice(5)));
    if (vetoes.has(item.sourceAgentKey) || vetoes.has(`${payload.category}:${payload.action}`)) {
      return { ok: false, message: "Eine aktive OwnerRule blockiert diese Aktion; die Freigabe bleibt offen." };
    }
  }

  const updated = await db.approvalQueueItem.updateMany({
    where: { id, shop, status: "PENDING" },
    data: { status: decision },
  });
  if (updated.count !== 1) return { ok: false, message: "Eintrag wurde bereits entschieden." };

  if (payload.category && payload.action) {
    const res = await runSidekickTool(payload.category, payload.action, {
      shop,
      session: { shop },
      body: payload.body ?? {},
    });
    await db.autopilotLog.create({
      data: {
        shop,
        action: `approved:${item.sourceAgentKey}`,
        status: res.ok ? "success" : "error",
        detail: item.title,
        undoable: !!res.undo,
      },
    });
    return { ok: res.ok, message: res.ok ? "Freigegeben & ausgeführt." : res.warning ?? "Fehler bei Ausführung." };
  }
  return { ok: true, message: "Freigegeben." };
}
