import {
  buildCapturedRewardAccountantCsv,
  getCapturedRewardSnapshot,
  runSilentRevenueSweep,
} from "./silent-revenue.server";
import { REWARD_LABELS, REWARD_TYPES } from "./reward-types";
import { assessGrantApplicationTiming } from "./vault-treasury-core";

export { assessGrantApplicationTiming } from "./vault-treasury-core";

export async function runVaultTreasuryAudit(shop: string) {
  const scan = await runSilentRevenueSweep(shop);
  const snapshot = await getCapturedRewardSnapshot(shop);
  return {
    scan,
    summary: snapshot.summary,
    categories: REWARD_TYPES.map((type) => ({
      type,
      label: REWARD_LABELS[type],
      checks: scan.checks.find((check) => check.type === type) ?? null,
      recordedCases: snapshot.items.filter((item) => item.type === type).length,
      ...(type === "GRANT_SUBSIDY"
        ? { timingNotice: assessGrantApplicationTiming({ programmeRequiresPreapproval: null }) }
        : {}),
    })),
    export: {
      available: true,
      kind: "accountant-review-csv" as const,
      note: "Nur tatsächlich verbuchte Datensätze; kein bestätigter Anspruch und keine automatische Einreichung.",
    },
  };
}

export async function buildVaultTreasuryCsv(shop: string) {
  return buildCapturedRewardAccountantCsv(shop);
}
