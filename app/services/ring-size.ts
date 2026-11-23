/**
 * Ringgrößen-Umrechner (DE/AT = ISO 8653 Innenumfang in mm, US/CA, UK/AU, Innendurchmesser).
 * Formeln laut ISO 8653:2016 bzw. Wikipedia „Ring size“:
 *   US:  Umfang = 2,55 × US + 36,5 mm
 *   UK:  Größe C = 40 mm, ein Buchstabe = 1,25 mm (Halbgrößen = 0,625 mm)
 * Näherungswerte – Hersteller-Tabellen weichen um bis zu ±0,5 mm ab. Reine Funktion, client- und server-sicher.
 */

export interface RingSize {
  circumferenceMm: number;
  diameterMm: number;
  de: string;
  us: string;
  uk: string;
  note: string;
}

const MIN_C = 44;
const MAX_C = 78;
const NOTE = "Näherungswerte nach ISO 8653:2016. Bitte immer am Finger nachmessen – bei Unikaten in fester Größe ist ein Umtausch nur gegen ein anderes Stück möglich.";

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const quarter = (n: number) => Math.round(n * 4) / 4;

function ukLabel(c: number): string {
  const halves = Math.round((c - 37.5) / 0.625);
  if (halves < 0) return "unter A";
  const letter = Math.floor(halves / 2);
  if (letter > 25) return "über Z";
  return `${String.fromCharCode(65 + letter)}${halves % 2 ? " ½" : ""}`;
}

export function fromCircumference(circumferenceMm: number): RingSize | null {
  if (!Number.isFinite(circumferenceMm) || circumferenceMm < MIN_C || circumferenceMm > MAX_C) return null;
  const c = round(circumferenceMm, 1);
  return {
    circumferenceMm: c,
    diameterMm: round(c / Math.PI, 1),
    de: String(Math.round(c)),
    us: String(quarter((c - 36.5) / 2.55)).replace(".", ","),
    uk: ukLabel(c),
    note: NOTE,
  };
}

export const fromDiameter = (diameterMm: number): RingSize | null => fromCircumference(diameterMm * Math.PI);
export const fromUs = (us: number): RingSize | null => fromCircumference(2.55 * us + 36.5);
