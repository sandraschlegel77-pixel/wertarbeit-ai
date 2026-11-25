export function assessGrantApplicationTiming(input: {
  programmeRequiresPreapproval: boolean | null;
  applicationAt?: Date | null;
  commitmentAt?: Date | null;
}) {
  if (input.programmeRequiresPreapproval !== true) {
    return {
      status: "CHECK_PROGRAMME_TERMS" as const,
      note: "Förderbedingungen prüfen. Bei Digitalbonus Bayern und vergleichbaren Programmen vor Auftragsvergabe klären, ob der Antrag vorher gestellt und bewilligt sein muss.",
    };
  }
  if (!input.applicationAt || !input.commitmentAt) {
    return { status: "DATES_REQUIRED" as const, note: "Antrags- und Auftragsdaten fehlen; keine Förderfähigkeit abgeleitet." };
  }
  return input.applicationAt.getTime() < input.commitmentAt.getTime()
    ? { status: "TIMING_PRECHECK_PASSED" as const, note: "Der Antrag liegt vor dem Auftrag; Förderfähigkeit und Bewilligung bleiben ungeprüft." }
    : { status: "TIMING_BLOCKED" as const, note: "Antrag liegt nicht vor der Auftragsvergabe; vor einer Zusage beim Förderträger klären." };
}
