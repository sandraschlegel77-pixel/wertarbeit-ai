export const REWARD_TYPES = [
  "CASH_REFUND",
  "FEE_RECOVERY",
  "SKONTO_CASHBACK",
  "AD_CREDIT_VOUCHER",
  "GRANT_SUBSIDY",
  "AFFILIATE_COMMISSION",
  "PRECIOUS_METAL_VALUE",
  "FREE_B2B_SAMPLE",
  "CREATOR_SPONSORSHIP",
  "CUSTOM_OPPORTUNITY",
] as const;

export type RewardType = (typeof REWARD_TYPES)[number];
export type RewardStatus = "REVIEW" | "READY" | "REQUESTED" | "RECEIVED";

export const REWARD_LABELS: Record<RewardType, string> = {
  CASH_REFUND: "Versand-Erstattung",
  FEE_RECOVERY: "Gebühren-/Zahlungsabweichung",
  SKONTO_CASHBACK: "Lieferanten-Skonto & Cashback",
  AD_CREDIT_VOUCHER: "Werbe-/Cloud-Guthaben",
  GRANT_SUBSIDY: "Fördermittel & Zuschüsse",
  AFFILIATE_COMMISSION: "Affiliate-/Empfehlungsprovision",
  PRECIOUS_METAL_VALUE: "Edelmetall-Restwert",
  FREE_B2B_SAMPLE: "Gratis-B2B-Muster",
  CREATOR_SPONSORSHIP: "Werkstatt-/Creator-Sponsoring",
  CUSTOM_OPPORTUNITY: "Sonstige Chance",
};

export type RewardScannerCheck = {
  type: RewardType;
  label: string;
  source: string;
  status: "LOCAL_SCAN" | "NO_CONNECTION" | "MANUAL";
  findings: number;
};

export type CapturedRewardItem = {
  id: string;
  type: RewardType;
  title: string;
  sourceLabel: string | null;
  sourceUrl: string | null;
  estimatedValueEur: number | null;
  actualValueEur: number | null;
  productCount: number | null;
  receivedQuantity: number | null;
  code: string | null;
  evidence: string | null;
  requestDraft: string | null;
  status: RewardStatus;
  accountingReview: string;
  createdAt: string;
  requestedAt: string | null;
  receivedAt: string | null;
};

export type CapturedRewardSnapshot = {
  items: CapturedRewardItem[];
  summary: {
    readyEur: number;
    requestedEur: number;
    receivedEur: number;
    receivedProducts: number;
  };
};
