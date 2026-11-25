import { DEPARTMENTS } from "./agent-roster";

export { OWNER_MODULE_IDS } from "./module-access-core";

export const DEPARTMENT_MODULES: Readonly<Record<number, readonly string[]>> = {
  1: ["m1"],
  2: ["m1"],
  3: ["m1"],
  4: ["m1"],
  5: ["m1", "m5"],
  6: ["m1"],
  7: ["m4"],
  8: ["m4"],
  9: ["m2"],
  10: ["m6"],
  11: ["m6"],
  12: ["m2"],
  13: ["m2"],
  14: ["m3"],
  15: ["m3"],
  16: ["m3"],
  17: ["m3"],
  18: ["m3"],
  19: ["m2", "m6"],
  20: ["m3", "m6"],
  21: ["m2"],
  22: ["m2"],
  23: ["m5"],
  24: [],
  25: ["m4"],
  26: ["m5"],
};

export function getAccessibleDepartmentIds(modules: readonly string[], isOwner: boolean): number[] {
  if (isOwner) return DEPARTMENTS.map(({ id }) => id);
  const active = new Set(modules);
  return DEPARTMENTS
    .filter(({ id }) => (DEPARTMENT_MODULES[id] ?? []).some((moduleId) => active.has(moduleId)))
    .map(({ id }) => id);
}

export function moduleIdsFromSubscription(subscription: {
  active?: boolean | null;
  moduleInvoices?: boolean | null;
  moduleCertificates?: boolean | null;
  moduleMultichannel?: boolean | null;
  moduleGrowth?: boolean | null;
} | null): string[] {
  if (!subscription || subscription.active === false) return [];
  return [
    subscription.moduleInvoices ? "m2" : null,
    subscription.moduleCertificates ? "m5" : null,
    subscription.moduleMultichannel ? "m4" : null,
    subscription.moduleGrowth ? "m3" : null,
  ].filter((moduleId): moduleId is string => moduleId !== null);
}
