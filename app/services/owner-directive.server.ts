import db from "../db.server";
import { requireOwnerShop } from "./access-control.server";
import { checkCapabilityProfile } from "./capability-registry.server";
import { capabilityEvidenceIsFresh } from "./capability-registry-core";
import { redactCredentialsFromText } from "./owner-directive-core";
import { PLATFORM_CATALOG } from "./marketplace-catalog";

const MAX_DIRECTIVE_LENGTH = 1000;
const MAX_EVIDENCE_AGE_DAYS = 90;

function isFreshVerifiedCapability(capability: {
  isVerified: boolean;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  sourceUrl: string | null;
  evidenceSummary: string;
}): boolean {
  return capabilityEvidenceIsFresh(capability, Date.now(), MAX_EVIDENCE_AGE_DAYS * 24 * 60 * 60 * 1000) &&
    Boolean(capability.sourceUrl?.startsWith("https://")) &&
    capability.evidenceSummary.trim().length > 0;
}

function localVisibilityDirective(text: string): { channel: typeof PLATFORM_CATALOG[number]; visible: boolean } | null {
  const match = /^(?:kanal\s+)?(ausblenden|verbergen|einblenden|anzeigen)\s*:\s*(.{2,80})$/i.exec(text.trim());
  if (!match) return null;
  const action = match[1].toLowerCase();
  const name = match[2].trim().toLowerCase();
  const channel = PLATFORM_CATALOG.find((item) =>
    item.key === name || item.name.toLowerCase() === name
  );
  return channel ? { channel, visible: action === "einblenden" || action === "anzeigen" } : null;
}

export async function submitOwnerDirective(shop: string, rawRequest: string) {
  await requireOwnerShop(shop);
  const input = rawRequest.trim();
  if (input.length < 5 || input.length > MAX_DIRECTIVE_LENGTH) {
    return { ok: false as const, message: `Bitte einen Wunsch mit 5 bis ${MAX_DIRECTIVE_LENGTH} Zeichen eingeben.` };
  }

  const sanitized = redactCredentialsFromText(input);
  if (sanitized.text.replace("[ZUGANGSDATEN ENTFERNT]", "").trim().length < 5) {
    return { ok: false as const, message: "Der Wunsch enthält überwiegend Zugangsdaten. Sie wurden nicht gespeichert; bitte ohne Geheimnisse neu formulieren." };
  }

  const visibility = localVisibilityDirective(sanitized.text);
  if (visibility) {
    await db.$transaction(async (tx) => {
      await tx.workspaceChannelConfig.upsert({
        where: { shop_channelKey: { shop, channelKey: visibility.channel.key } },
        update: { isVisible: visibility.visible, displayName: visibility.channel.name },
        create: {
          shop,
          channelKey: visibility.channel.key,
          displayName: visibility.channel.name,
          isVisible: visibility.visible,
          connectorStatus: "NOT_CONNECTED",
        },
      });
      await tx.ownerDirective.create({
        data: {
          shop,
          requestText: sanitized.text,
          feasibility: "LOCAL_CONFIGURATION",
          executionStatus: "EXECUTED",
          resultSummary: `${visibility.channel.name} wurde im Cockpit ${visibility.visible ? "eingeblendet" : "ausgeblendet"}. Das ändert keine Verbindung und startet keine Synchronisierung.`,
          credentialsRedacted: sanitized.redacted,
          completedAt: new Date(),
        },
      });
      await tx.autopilotLog.create({
        data: {
          shop,
          action: "owner_directive_channel_visibility",
          status: "success",
          detail: `${visibility.channel.key} visibility=${visibility.visible}`,
          undoable: false,
        },
      });
    });
    return {
      ok: true as const,
      feasibility: "LOCAL_CONFIGURATION",
      message: `${visibility.channel.name} wurde ${visibility.visible ? "eingeblendet" : "ausgeblendet"}; eine Plattformverbindung wurde dadurch nicht hergestellt.`,
      credentialsRedacted: sanitized.redacted,
    };
  }

  const sourceCheck = await checkCapabilityProfile(shop, sanitized.text);
  const tokens = sanitized.text.toLowerCase().split(/[^a-z0-9äöüß.-]+/).filter((token) => token.length >= 3);
  const capabilities = await db.domainCapability.findMany({
    where: { shop, isVerified: true },
    select: {
      domainKey: true,
      displayName: true,
      feasibility: true,
      sourceUrl: true,
      sourceTitle: true,
      evidenceSummary: true,
      evidenceHash: true,
      verifiedAt: true,
      expiresAt: true,
      estimatedCostEur: true,
      riskLevel: true,
      isVerified: true,
    },
    take: 200,
  });
  const match = capabilities.find((capability) =>
    isFreshVerifiedCapability(capability) &&
    (capability.domainKey === sourceCheck?.profileKey ||
      tokens.some((token) => capability.domainKey.toLowerCase().includes(token)) ||
      tokens.some((token) => capability.displayName.toLowerCase().includes(token)))
  );
  const feasibility = match?.feasibility ?? "UNVERIFIED";
  const evidenceJson = match ? {
    sourceUrl: match.sourceUrl,
    sourceTitle: match.sourceTitle,
    evidenceSummary: match.evidenceSummary,
    evidenceHash: match.evidenceHash,
    verifiedAt: match.verifiedAt?.toISOString() ?? null,
    estimatedCostEur: match.estimatedCostEur,
    riskLevel: match.riskLevel,
  } : undefined;
  const summary = match
    ? `Quellenbasierter Eintrag für ${match.displayName} (${match.feasibility}) geprüft am ${match.verifiedAt?.toISOString() ?? "unbekannten Datum"}. Der Dokumentationsnachweis bestätigt weder API-Zugriff noch Verbindung; es wurde nichts extern ausgeführt.`
    : sourceCheck
      ? `Offizielle Quelle für ${sourceCheck.displayName} am ${sourceCheck.checkedAt ?? "unbekannten Datum"} geprüft, aber nicht verifiziert erreichbar. Recherche bleibt erforderlich; es wurde nichts ausgeführt.`
      : "Kein aktueller, quellenbelegter Capability-Eintrag passt zum Wunsch. Recherche ist erforderlich; es wurde nichts ausgeführt.";

  const directive = await db.ownerDirective.create({
    data: {
      shop,
      requestText: sanitized.text,
      feasibility,
      executionStatus: match ? "OWNER_REVIEW_REQUIRED" : "NEEDS_RESEARCH",
      resultSummary: summary,
      evidenceJson,
      credentialsRedacted: sanitized.redacted,
    },
    select: { id: true },
  });
  await db.autopilotLog.create({
    data: {
      shop,
      action: "owner_directive_received",
      status: match ? "review_required" : "needs_research",
      detail: `Direktive ${directive.id} · ${feasibility} · ${sanitized.redacted ? "Zugangsdaten entfernt" : "ohne erkannte Zugangsdaten"}`,
      undoable: false,
    },
  });
  return {
    ok: true as const,
    feasibility,
    message: summary,
    credentialsRedacted: sanitized.redacted,
  };
}

export async function getRecentOwnerDirectives(shop: string) {
  await requireOwnerShop(shop);
  return db.ownerDirective.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      requestText: true,
      feasibility: true,
      executionStatus: true,
      resultSummary: true,
      credentialsRedacted: true,
      createdAt: true,
    },
  });
}
