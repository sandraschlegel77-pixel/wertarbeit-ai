import db from "../db.server";
import { STAMM_COUNT } from "./agent-roster";
import { isOwnerShop } from "./ai-agents.server";
import { isShopPaused } from "./autopilot-control.server";
import { runMetaSupervisorAudit } from "./meta-supervisor.server";

/** Nischen-Katalog der Agenten-Fabrik (0 € Betrieb: lokale Heuristik, keine kostenpflichtige API). */
const NICHE_SEEDS: { name: string; dept: number; mission: string; mechanism: string; value: number; price: number }[] = [
  { name: "Trauring-Gravur-Nische", dept: 20, mission: "Gravierte Trauringe als eigene Nische ausbauen", mechanism: "Zusatzumsatz durch Nischenprodukt", value: 180, price: 9.9 },
  { name: "Taufschmuck-Scout", dept: 11, mission: "Taufgeschenke saisonal bewerben", mechanism: "Saisonale Nachfrage", value: 120, price: 4.9 },
  { name: "Firmen-Jubiläums-Geschenke", dept: 16, mission: "B2B-Jubiläumsgeschenke mit Seriengravur", mechanism: "B2B-Aufträge", value: 260, price: 12.9 },
  { name: "Ring-Erweiterungs-Service", dept: 17, mission: "Größenänderung & Pflege als Service", mechanism: "Service-Umsatz", value: 90, price: 4.9 },
  { name: "Muttertags-Konzept", dept: 18, mission: "Muttertags-Kampagne mit Geburtssteinen", mechanism: "Saisonale Kampagne", value: 200, price: 6.9 },
  { name: "Nachhaltigkeits-Zertifikat", dept: 19, mission: "Recycling-Silber-Nachweis für Käufer", mechanism: "Höhere Preisakzeptanz", value: 110, price: 5.9 },
];

export async function nextAgentNumber(shop: string): Promise<number> {
  const last = await db.dynamicAiAgent.findFirst({
    where: { shop },
    orderBy: { agentNumber: "desc" },
    select: { agentNumber: true },
  });
  return Math.max(STAMM_COUNT, last?.agentNumber ?? STAMM_COUNT) + 1;
}

/** Erschafft einen neuen KI-Mitarbeiter ab #221 (CANDIDATE; ACTIVE nur ohne Zusatzpreis oder für Inhaber). */
export async function spawnAgent(input: {
  shop: string;
  name: string;
  departmentId: number;
  mission: string;
  revenueMechanism: string;
  expectedMonthlyValueEur: number;
  suggestedAddonPriceEur: number;
  reason: string;
  forceCandidate?: boolean;
}) {
  if (await isShopPaused(input.shop)) return null;
  const dupe = await db.dynamicAiAgent.findFirst({
    where: { shop: input.shop, name: input.name },
    select: { id: true },
  });
  if (dupe) return null;
  const audit = await runMetaSupervisorAudit({
    shop: input.shop,
    task: "governance",
    subject: `Neuer Agent: ${input.name}`,
    summary: `Abteilung ${input.departmentId}. Auftrag: ${input.mission}. Ertragsmechanismus: ${input.revenueMechanism}. Grund: ${input.reason}.`,
    primaryModel: "local-rules",
  });
  if (audit.decision === "BLOCK") return null;
  const agentNumber = await nextAgentNumber(input.shop);
  const status =
    input.forceCandidate || audit.decision === "REVIEW"
      ? "CANDIDATE"
      : isOwnerShop(input.shop) || input.suggestedAddonPriceEur === 0
        ? "ACTIVE"
        : "CANDIDATE";
  return db.dynamicAiAgent.create({
    data: {
      shop: input.shop,
      agentNumber,
      name: input.name,
      departmentId: input.departmentId,
      level: 5,
      reportsToId: "A161",
      mission: input.mission,
      revenueMechanism: input.revenueMechanism,
      systemPrompt: `Du bist ${input.name} der Wertarbeit Manufaktur. Mission: ${input.mission}. Ton: warmherzig, Familienbetrieb. OwnerRule und DRY_RUN_MODE haben Vorrang.`,
      suggestedAddonPriceEur: input.suggestedAddonPriceEur,
      status,
      autoSpawnedReason: `${input.reason} · Meta-Audit: ${audit.mode}/${audit.decision}`,
      expectedMonthlyValueEur: input.expectedMonthlyValueEur,
    },
  });
}

/** Nischen-Scanner: legt fehlende Nischen-Agenten an (max. 2 pro Lauf, kein Spam). */
export async function scanNichesAndSpawn(shop: string): Promise<number> {
  if (await isShopPaused(shop)) return 0;
  let created = 0;
  for (const n of NICHE_SEEDS) {
    if (created >= 2) break;
    const row = await spawnAgent({
      shop,
      name: n.name,
      departmentId: n.dept,
      mission: n.mission,
      revenueMechanism: n.mechanism,
      expectedMonthlyValueEur: n.value,
      suggestedAddonPriceEur: n.price,
      reason: "Nischen-Scanner (lokale Heuristik)",
    });
    if (row) created++;
  }
  return created;
}

export async function setDynamicAgentStatus(shop: string, id: string, status: "CANDIDATE" | "ACTIVE" | "PAUSED") {
  return db.dynamicAiAgent.updateMany({ where: { id, shop }, data: { status } });
}

/** Wöchentliche Selbst-Weiterentwicklung v(n) -> v(n+1) für einen Agenten. */
export async function evolveAgent(shop: string, agentKey: string, score = 0.7) {
  if (await isShopPaused(shop)) return null;
  const last = await db.agentSkillEvolution.findFirst({
    where: { shop, agentKey },
    orderBy: { skillVersion: "desc" },
  });
  const version = (last?.skillVersion ?? 1) + 1;
  const [ok, fail] = await Promise.all([
    db.autopilotLog.count({ where: { shop, status: "success" } }),
    db.autopilotLog.count({ where: { shop, status: { in: ["error", "blocked"] } } }),
  ]);
  const insights = `Auswertung: ${ok} erfolgreiche, ${fail} fehlerhafte Aktionen. Fokus auf kürzere, wärmere Texte und weniger Rückfragen.`;
  const audit = await runMetaSupervisorAudit({
    shop,
    task: "governance",
    subject: `Skill-Evolution ${agentKey} v${version}`,
    summary: `Bisherige Erkenntnisse: ${insights} Neuer Prompt-Hinweis: v${version}: ${insights}`,
    primaryModel: "local-rules",
  });
  if (audit.decision !== "PASS") return null;
  return db.agentSkillEvolution.create({
    data: {
      shop,
      agentKey,
      skillVersion: version,
      learnedInsights: insights,
      successScore: score,
      previousPromptHint: last?.evolvedPromptHint ?? "Basis-Prompt v1",
      evolvedPromptHint: `v${version}: ${insights}`,
    },
  });
}

/** 1-Klick-Rollback: entfernt die neueste Version, v1 bleibt immer erhalten. */
export async function rollbackAgent(shop: string, agentKey: string): Promise<boolean> {
  const last = await db.agentSkillEvolution.findFirst({
    where: { shop, agentKey },
    orderBy: { skillVersion: "desc" },
  });
  if (!last || last.skillVersion <= 1) return false;
  await db.agentSkillEvolution.delete({ where: { id: last.id } });
  return true;
}

export async function weeklyEvolutionRun(shop: string): Promise<{ evolved: number; spawned: number; paused: number }> {
  if (await isShopPaused(shop)) return { evolved: 0, spawned: 0, paused: 0 };
  const keys = ["A158", "A159", "A160", "A161"];
  let evolved = 0;
  for (const k of keys) {
    if (await evolveAgent(shop, k)) evolved++;
  }
  const spawned = await scanNichesAndSpawn(shop);
  const paused = await pauseUnproductiveDynamicAgents(shop);
  return { evolved, spawned, paused };
}

/** Pauses only dynamic agents after repeated live runs without attributable real revenue. */
async function pauseUnproductiveDynamicAgents(shop: string): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const active = await db.dynamicAiAgent.findMany({
    where: { shop, status: "ACTIVE" },
    select: { id: true, agentNumber: true, name: true },
  });
  let paused = 0;
  for (const agent of active) {
    const agentKey = `A${agent.agentNumber}`;
    const [runs, revenue] = await Promise.all([
      db.autopilotLog.count({
        where: { shop, action: `agent_run:${agentKey}`, status: "success", createdAt: { gte: since } },
      }),
      db.agentRevenueEntry.count({
        where: { shop, agentKey, isSimulated: false, createdAt: { gte: since } },
      }),
    ]);
    if (runs < 5 || revenue > 0) continue;
    const changed = await db.dynamicAiAgent.updateMany({
      where: { id: agent.id, shop, status: "ACTIVE" },
      data: { status: "PAUSED" },
    });
    if (changed.count !== 1) continue;
    await db.autopilotLog.create({
      data: {
        shop,
        action: "roi_auto_pause",
        status: "success",
        detail: `${agentKey} (${agent.name}) nach ${runs} erfolgreichen Live-Läufen ohne zugeordnete Echt-Buchung in 30 Tagen pausiert.`,
        undoable: false,
      },
    });
    paused++;
  }
  return paused;
}
