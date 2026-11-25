import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import db from "../db.server";

export type JudicialDecision = "PROCEED" | "ESCALATE" | "HOLD";

export interface JudicialLedgerEntry {
  id: string;
  caseId: string;
  sequence: number;
  stage: number;
  sourceAgentNumber: number;
  caseTitle: string;
  decision: string;
  rationale: string;
  evidenceHash: string | null;
  previousHash: string | null;
  entryHash: string;
  createdAt: string;
}

export interface JudicialLedgerSnapshot {
  status: "available" | "unavailable";
  verified: boolean | null;
  message: string | null;
  entries: JudicialLedgerEntry[];
}

export class JudicialLedgerInputError extends Error {}

export class JudicialLedgerConflictError extends Error {}

const STAGE_AGENTS = [221, 222, 223, 224, 225];
const validDecisions = new Set<JudicialDecision>(["PROCEED", "ESCALATE", "HOLD"]);

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function entryHash(entry: {
  shop: string;
  caseId: string;
  sequence: number;
  stage: number;
  sourceAgentNumber: number;
  caseTitle: string;
  decision: string;
  rationale: string;
  evidenceHash: string | null;
  previousHash: string | null;
  createdAt: Date;
}) {
  return sha256(JSON.stringify([
    entry.shop,
    entry.caseId,
    entry.sequence,
    entry.stage,
    entry.sourceAgentNumber,
    entry.caseTitle,
    entry.decision,
    entry.rationale,
    entry.evidenceHash,
    entry.previousHash,
    entry.createdAt.toISOString(),
  ]));
}

function isRetryableConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2034" || error.code === "P2002");
}

export async function appendJudicialDecision(input: {
  shop: string;
  caseId?: string;
  stage: number;
  caseTitle: string;
  decision: string;
  rationale: string;
  evidenceReference?: string;
}) {
  const caseId = input.caseId?.trim() || randomUUID();
  const caseTitle = input.caseTitle.trim();
  const rationale = input.rationale.trim();
  const evidenceReference = input.evidenceReference?.trim() ?? "";

  if (!Number.isInteger(input.stage) || input.stage < 0 || input.stage >= STAGE_AGENTS.length) {
    throw new JudicialLedgerInputError("Bitte eine gültige interne Prüfstufe 0–4 auswählen.");
  }
  if (input.caseId && !/^[0-9a-f-]{36}$/i.test(caseId)) {
    throw new JudicialLedgerInputError("Die Fall-ID muss eine gültige UUID sein.");
  }
  if (caseTitle.length < 5 || caseTitle.length > 160) {
    throw new JudicialLedgerInputError("Der Falltitel muss zwischen 5 und 160 Zeichen lang sein.");
  }
  if (rationale.length < 10 || rationale.length > 2000) {
    throw new JudicialLedgerInputError("Die interne Begründung muss zwischen 10 und 2.000 Zeichen lang sein.");
  }
  if (!validDecisions.has(input.decision as JudicialDecision)) {
    throw new JudicialLedgerInputError("Ungültige interne Entscheidung.");
  }
  if (evidenceReference.length > 200) {
    throw new JudicialLedgerInputError("Der Belegverweis darf höchstens 200 Zeichen lang sein.");
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        const previousForCase = await tx.judicialDecisionLedger.findFirst({
          where: { shop: input.shop, caseId },
          orderBy: { stage: "desc" },
        });
        const expectedStage = previousForCase ? previousForCase.stage + 1 : 0;
        if (previousForCase?.decision === "HOLD") {
          throw new JudicialLedgerInputError("Der Fall wurde mit HALT geschlossen; eine weitere Prüfstufe ist nicht möglich.");
        }
        if (previousForCase && previousForCase.caseTitle !== caseTitle) {
          throw new JudicialLedgerInputError("Der Falltitel muss über alle Prüfstufen unverändert bleiben.");
        }
        if (expectedStage !== input.stage || input.stage >= STAGE_AGENTS.length) {
          throw new JudicialLedgerInputError(
            `Für diesen Fall ist Prüfstufe ${expectedStage} erforderlich; Stufen dürfen nicht übersprungen werden.`
          );
        }

        const previousShopEntry = await tx.judicialDecisionLedger.findFirst({
          where: { shop: input.shop },
          orderBy: { sequence: "desc" },
          select: { sequence: true, entryHash: true },
        });
        const createdAt = new Date();
        const record = {
          shop: input.shop,
          caseId,
          sequence: (previousShopEntry?.sequence ?? 0) + 1,
          stage: input.stage,
          sourceAgentNumber: STAGE_AGENTS[input.stage],
          caseTitle,
          decision: input.decision,
          rationale,
          evidenceHash: evidenceReference ? sha256(evidenceReference) : null,
          previousHash: previousShopEntry?.entryHash ?? null,
          createdAt,
        };
        return tx.judicialDecisionLedger.create({
          data: { ...record, entryHash: entryHash(record) },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof JudicialLedgerInputError) throw error;
      if (!isRetryableConflict(error)) throw error;
      if (attempt === 2) {
        throw new JudicialLedgerConflictError("Gleichzeitige Ledger-Änderung; bitte den Eintrag erneut versuchen.");
      }
    }
  }
  throw new JudicialLedgerConflictError("Ledger-Eintrag konnte nicht sicher angefügt werden.");
}

export async function getJudicialLedgerSnapshot(shop: string): Promise<JudicialLedgerSnapshot> {
  try {
    const rows = await db.judicialDecisionLedger.findMany({
      where: { shop },
      orderBy: { sequence: "asc" },
    });
    let previousHash: string | null = null;
    let verified = true;
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (
        row.sequence !== index + 1 ||
        row.previousHash !== previousHash ||
        row.sourceAgentNumber !== STAGE_AGENTS[row.stage] ||
        row.entryHash !== entryHash(row)
      ) {
        verified = false;
        break;
      }
      previousHash = row.entryHash;
    }
    const entries = rows.slice(-50).reverse().map((row) => ({
      id: row.id,
      caseId: row.caseId,
      sequence: row.sequence,
      stage: row.stage,
      sourceAgentNumber: row.sourceAgentNumber,
      caseTitle: row.caseTitle,
      decision: row.decision,
      rationale: row.rationale,
      evidenceHash: row.evidenceHash,
      previousHash: row.previousHash,
      entryHash: row.entryHash,
      createdAt: row.createdAt.toISOString(),
    }));
    return {
      status: "available",
      verified,
      message: verified ? null : "Hash-Kette stimmt nicht; Einträge nicht als verifiziert behandeln.",
      entries,
    };
  } catch {
    console.error("[judicial-ledger] Ledger-Abfrage oder Verifikation fehlgeschlagen.");
    return {
      status: "unavailable",
      verified: null,
      message: "Ledger nicht verfügbar. Datenbankverbindung und Schema-Bereitstellung prüfen.",
      entries: [],
    };
  }
}
