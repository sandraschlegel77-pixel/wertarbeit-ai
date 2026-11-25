import db from "../db.server";
import { requireSubscriberShop } from "./access-control.server";
import { checkCapabilityProfile } from "./capability-registry.server";
import { capabilityEvidenceIsFresh } from "./capability-registry-core";
import { PLATFORM_CATALOG } from "./marketplace-catalog";
import { normalizeMarketplaceWishKey, redactCredentialsFromText } from "./owner-directive-core";

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_EVIDENCE_AGE_DAYS = 90;

export class MarketplaceWishInputError extends Error {}

function freshEvidence(capability: {
  isVerified: boolean;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  sourceUrl: string | null;
  evidenceSummary: string;
}) {
  return capabilityEvidenceIsFresh(capability, Date.now(), MAX_EVIDENCE_AGE_DAYS * 24 * 60 * 60 * 1000) &&
    Boolean(capability.sourceUrl?.startsWith("https://")) &&
    capability.evidenceSummary.trim().length > 0;
}

export async function submitSubscriberFeatureWish(
  shop: string,
  input: { title: string; description: string }
) {
  await requireSubscriberShop(shop);
  const sanitizedTitle = redactCredentialsFromText(input.title.trim());
  const sanitizedDescription = redactCredentialsFromText(input.description.trim());
  if (sanitizedTitle.redacted || sanitizedDescription.redacted) {
    throw new MarketplaceWishInputError("Bitte Zugangsdaten entfernen. Sie wurden nicht gespeichert.");
  }
  const title = sanitizedTitle.text;
  const description = sanitizedDescription.text;
  if (title.length < 2 || title.length > MAX_TITLE_LENGTH) {
    throw new MarketplaceWishInputError(`Der Marktplatzname muss 2 bis ${MAX_TITLE_LENGTH} Zeichen enthalten.`);
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new MarketplaceWishInputError(`Die Beschreibung darf höchstens ${MAX_DESCRIPTION_LENGTH} Zeichen enthalten.`);
  }
  const wishKey = normalizeMarketplaceWishKey(title);
  if (!wishKey) throw new MarketplaceWishInputError("Der Marktplatzname enthält keine gültigen Zeichen.");

  const sourceCheck = await checkCapabilityProfile(shop, title);
  const capability = sourceCheck?.isVerified
    ? await db.domainCapability.findUnique({
      where: { shop_domainKey: { shop, domainKey: sourceCheck.profileKey } },
      select: {
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
    })
    : await db.domainCapability.findFirst({
      where: { shop, domainKey: wishKey },
      select: {
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
    });
  const verified = capability && freshEvidence(capability);
  const result = await db.$transaction(async (tx) => {
    const wish = await tx.subscriberFeatureWish.upsert({
      where: { wishKey },
      update: verified ? {
        preflightStatus: "SOURCE_RECORD_FOUND",
        feasibility: capability.feasibility,
        riskLevel: capability.riskLevel,
        estimatedCostEur: capability.estimatedCostEur,
        evidenceJson: {
          sourceUrl: capability.sourceUrl,
          sourceTitle: capability.sourceTitle,
          evidenceSummary: capability.evidenceSummary,
          evidenceHash: capability.evidenceHash,
          verifiedAt: capability.verifiedAt?.toISOString() ?? null,
        },
      } : {},
      create: {
        shop,
        wishKey,
        title,
        description,
        preflightStatus: verified ? "SOURCE_RECORD_FOUND" : "NEEDS_RESEARCH",
        feasibility: verified ? capability.feasibility : "UNVERIFIED",
        riskLevel: verified ? capability.riskLevel : "UNKNOWN",
        estimatedCostEur: verified ? capability.estimatedCostEur : null,
        evidenceJson: verified ? {
          sourceUrl: capability.sourceUrl,
          sourceTitle: capability.sourceTitle,
          evidenceSummary: capability.evidenceSummary,
          evidenceHash: capability.evidenceHash,
          verifiedAt: capability.verifiedAt?.toISOString() ?? null,
        } : undefined,
      },
    });
    const vote = await tx.subscriberFeatureWishVote.createMany({
      data: { shop, wishId: wish.id },
      skipDuplicates: true,
    });
    if (vote.count) {
      return tx.subscriberFeatureWish.update({
        where: { id: wish.id },
        data: { voteCount: { increment: 1 } },
        select: { id: true, title: true, voteCount: true, preflightStatus: true, feasibility: true },
      });
    }
    return tx.subscriberFeatureWish.findUniqueOrThrow({
      where: { id: wish.id },
      select: { id: true, title: true, voteCount: true, preflightStatus: true, feasibility: true },
    });
  });
  return {
    ...result,
    ok: true as const,
    message: verified
      ? `Wunsch gebündelt. Die offizielle Quelle war am ${capability.verifiedAt?.toISOString() ?? "unbekannten Datum"} erreichbar; API-Zugang, Kosten und Risiken benötigen weiterhin eine Prüfung.`
      : sourceCheck
        ? `Wunsch gespeichert. Die Quelle für ${sourceCheck.displayName} wurde am ${sourceCheck.checkedAt ?? "unbekannten Datum"} geprüft, aber nicht verifiziert; es wurde keine Anbindung behauptet.`
        : "Wunsch gespeichert und mit anderen Shops gebündelt. Für diesen Marktplatz liegt noch keine aktuelle Quellenprüfung vor; es wurde keine Anbindung behauptet.",
  };
}

export async function getWorkspaceChannelConfigs(shop: string) {
  return db.workspaceChannelConfig.findMany({
    where: { shop },
    select: { channelKey: true, displayName: true, isVisible: true, connectorStatus: true, lastCheckedAt: true },
    orderBy: { displayName: "asc" },
  });
}

export async function getSubscriberWishSnapshot(shop: string, owner: boolean) {
  if (owner) {
    return db.subscriberFeatureWish.findMany({
      orderBy: [{ voteCount: "desc" }, { updatedAt: "desc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        voteCount: true,
        preflightStatus: true,
        feasibility: true,
        riskLevel: true,
        estimatedCostEur: true,
        evidenceJson: true,
      },
    });
  }
  return db.subscriberFeatureWish.findMany({
    where: { votes: { some: { shop } } },
    orderBy: [{ voteCount: "desc" }, { updatedAt: "desc" }],
    take: 10,
    select: {
      id: true,
      title: true,
      voteCount: true,
      preflightStatus: true,
      feasibility: true,
      riskLevel: true,
      estimatedCostEur: true,
      evidenceJson: true,
    },
  });
}

export async function setWorkspaceChannelVisibility(
  shop: string,
  input: { channelKey: string; displayName: string; isVisible: boolean }
) {
  await requireSubscriberShop(shop);
  const channelKey = input.channelKey.trim().toLowerCase();
  const platform = PLATFORM_CATALOG.find((item) => item.key === channelKey);
  if (!platform || input.displayName.trim() !== platform.name) {
    throw new MarketplaceWishInputError("Ungültige Kanalangaben.");
  }
  const displayName = platform.name;
  return db.workspaceChannelConfig.upsert({
    where: { shop_channelKey: { shop, channelKey } },
    update: { displayName, isVisible: input.isVisible },
    create: {
      shop,
      channelKey,
      displayName,
      isVisible: input.isVisible,
      connectorStatus: "NOT_CONNECTED",
    },
    select: { channelKey: true, displayName: true, isVisible: true, connectorStatus: true },
  });
}
