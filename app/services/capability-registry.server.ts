import { createHash } from "node:crypto";
import db from "../db.server";
import {
  CAPABILITY_PROFILES,
  capabilityEvidenceIsFresh,
  resolveCapabilityProfile,
} from "./capability-registry-core";

const SOURCE_MAX_BYTES = 96 * 1024;
const SOURCE_TIMEOUT_MS = 6_000;
const EVIDENCE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export { CAPABILITY_PROFILES, resolveCapabilityProfile } from "./capability-registry-core";

interface SourceCheck {
  reachable: boolean;
  status: number | null;
  hash: string | null;
}

export interface CapabilityCheckResult {
  profileKey: string;
  displayName: string;
  feasibility: string;
  sourceUrl: string;
  sourceTitle: string;
  evidenceSummary: string;
  verifiedAt: string | null;
  checkedAt: string | null;
  isVerified: boolean;
  riskLevel: string;
}

async function fetchOfficialSource(profile: (typeof CAPABILITY_PROFILES)[number]): Promise<SourceCheck> {
  const response = await fetch(profile.sourceUrl, {
    method: "GET",
    redirect: "follow",
    headers: { Accept: "text/html,application/json,text/plain;q=0.9,*/*;q=0.1" },
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
  });
  const finalHost = new URL(response.url || profile.sourceUrl).hostname.toLowerCase();
  const hostAllowed = profile.allowedHosts.some((host) => finalHost === host || finalHost.endsWith(`.${host}`));
  if (!hostAllowed) {
    await response.body?.cancel();
    return { reachable: false, status: response.status, hash: null as string | null };
  }
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    return { reachable: false, status: response.status, hash: null as string | null };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  try {
    while (bytesRead < SOURCE_MAX_BYTES) {
      const next = await reader.read();
      if (next.done) break;
      const remaining = SOURCE_MAX_BYTES - bytesRead;
      const chunk = next.value.subarray(0, remaining);
      chunks.push(chunk);
      bytesRead += chunk.byteLength;
      if (chunk.byteLength < next.value.byteLength) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (bytesRead < 64) return { reachable: false, status: response.status, hash: null };
  const hash = createHash("sha256").update(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))).digest("hex");
  return { reachable: true, status: response.status, hash };
}

function checkedMessage(profile: (typeof CAPABILITY_PROFILES)[number], checkedAt: Date, reachable: boolean, status: number | null) {
  const state = reachable ? `Quelle per HTTPS erreichbar (HTTP ${status})` : `Quelle nicht verifizierbar${status === null ? "" : ` (HTTP ${status})`}`;
  return `${profile.evidenceSummary} ${state}; geprüft am ${checkedAt.toISOString()}. Es wurden keine Zugangsdaten, Berechtigungen oder Live-Verbindungen getestet.`;
}

export async function checkCapabilityProfile(shop: string, input: string): Promise<CapabilityCheckResult | null> {
  const profile = resolveCapabilityProfile(input);
  if (!profile) return null;

  const [current, channelConfig] = await Promise.all([
    db.domainCapability.findUnique({
      where: { shop_domainKey: { shop, domainKey: profile.domainKey } },
      select: {
        feasibility: true,
        sourceUrl: true,
        sourceTitle: true,
        evidenceSummary: true,
        verifiedAt: true,
        expiresAt: true,
        isVerified: true,
        riskLevel: true,
      },
    }),
    db.workspaceChannelConfig.findUnique({
      where: { shop_channelKey: { shop, channelKey: profile.domainKey } },
      select: { lastCheckedAt: true },
    }),
  ]);
  const cacheValid = current?.expiresAt && current.expiresAt.getTime() > Date.now();
  if (current && (capabilityEvidenceIsFresh(current, Date.now(), EVIDENCE_TTL_MS) || (!current.isVerified && cacheValid))) {
    return {
      profileKey: profile.domainKey,
      displayName: profile.displayName,
      feasibility: current.feasibility,
      sourceUrl: current.sourceUrl ?? profile.sourceUrl,
      sourceTitle: current.sourceTitle ?? profile.sourceTitle,
      evidenceSummary: current.evidenceSummary,
      verifiedAt: current.verifiedAt?.toISOString() ?? null,
      checkedAt: current.verifiedAt?.toISOString() ?? channelConfig?.lastCheckedAt?.toISOString() ?? null,
      isVerified: current.isVerified,
      riskLevel: current.riskLevel,
    };
  }

  const checkedAt = new Date();
  let source: SourceCheck = { reachable: false, status: null, hash: null };
  try {
    source = await fetchOfficialSource(profile);
  } catch {
    source = { reachable: false, status: null, hash: null };
  }
  const evidenceSummary = checkedMessage(profile, checkedAt, source.reachable, source.status);
  const expiresAt = new Date(checkedAt.getTime() + (source.reachable ? EVIDENCE_TTL_MS : 60 * 60 * 1000));
  const saved = await db.$transaction(async (tx) => {
    const capability = await tx.domainCapability.upsert({
      where: { shop_domainKey: { shop, domainKey: profile.domainKey } },
      update: {
        displayName: profile.displayName,
        feasibility: profile.feasibility,
        sourceUrl: profile.sourceUrl,
        sourceTitle: profile.sourceTitle,
        evidenceSummary,
        evidenceHash: source.hash,
        verifiedAt: source.reachable ? checkedAt : null,
        expiresAt,
        estimatedCostEur: null,
        riskLevel: profile.riskLevel,
        isVerified: source.reachable,
      },
      create: {
        shop,
        domainKey: profile.domainKey,
        displayName: profile.displayName,
        feasibility: profile.feasibility,
        sourceUrl: profile.sourceUrl,
        sourceTitle: profile.sourceTitle,
        evidenceSummary,
        evidenceHash: source.hash,
        verifiedAt: source.reachable ? checkedAt : null,
        expiresAt,
        riskLevel: profile.riskLevel,
        isVerified: source.reachable,
      },
      select: {
        feasibility: true,
        sourceUrl: true,
        sourceTitle: true,
        evidenceSummary: true,
        verifiedAt: true,
        isVerified: true,
        riskLevel: true,
      },
    });
    await tx.workspaceChannelConfig.upsert({
      where: { shop_channelKey: { shop, channelKey: profile.domainKey } },
      update: {
        displayName: profile.displayName,
        connectorStatus: source.reachable ? "SOURCE_VERIFIED_NOT_CONNECTED" : "SOURCE_CHECK_FAILED",
        lastCheckedAt: checkedAt,
      },
      create: {
        shop,
        channelKey: profile.domainKey,
        displayName: profile.displayName,
        connectorStatus: source.reachable ? "SOURCE_VERIFIED_NOT_CONNECTED" : "SOURCE_CHECK_FAILED",
        lastCheckedAt: checkedAt,
      },
    });
    return capability;
  });
  return {
    profileKey: profile.domainKey,
    displayName: profile.displayName,
    feasibility: saved.feasibility,
    sourceUrl: saved.sourceUrl ?? profile.sourceUrl,
    sourceTitle: saved.sourceTitle ?? profile.sourceTitle,
    evidenceSummary: saved.evidenceSummary,
    verifiedAt: saved.verifiedAt?.toISOString() ?? null,
    checkedAt: checkedAt.toISOString(),
    isVerified: saved.isVerified,
    riskLevel: saved.riskLevel,
  };
}

export async function checkCapabilityProfiles(shop: string) {
  const results: CapabilityCheckResult[] = [];
  for (const profile of CAPABILITY_PROFILES) {
    const checked = await checkCapabilityProfile(shop, profile.domainKey);
    if (checked) results.push(checked);
  }
  return results;
}
