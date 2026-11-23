export interface BankCsvRow {
  bookingDate: string;
  valueDate: string;
  purpose: string;
  amount: number;
  currency: string;
}

export class BankCsvInputError extends Error {}
export class WorkshopSvgInputError extends Error {}

function decodeCsv(input: string | Uint8Array): string {
  if (typeof input === "string") return input.replace(/^\uFEFF/, "");
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(input).replace(/^\uFEFF/, "");
  } catch {
    return new TextDecoder("iso-8859-1").decode(input).replace(/^\uFEFF/, "");
  }
}

function countOutsideQuotes(line: string, delimiter: string): number {
  let count = 0;
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (quoted && line[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && line[i] === delimiter) {
      count++;
    }
  }
  return count;
}

function parseRecords(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === delimiter) {
      row.push(value);
      value = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (quoted) throw new BankCsvInputError("CSV enthält ein nicht geschlossenes Anführungszeichen.");
  row.push(value);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function parseDate(value: string): string {
  const text = value.trim();
  const german = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
  if (german) {
    const [, day, month, year] = german;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() !== Number(month) - 1 ||
      date.getUTCDate() !== Number(day)
    ) {
      throw new BankCsvInputError(`Ungültiges Buchungsdatum in CSV: ${text}`);
    }
    return date.toISOString();
  }
  const date = new Date(text);
  if (!Number.isFinite(date.getTime())) throw new BankCsvInputError(`Ungültiges Buchungsdatum in CSV: ${text}`);
  return date.toISOString();
}

function parseGermanAmount(value: string): number {
  let normalized = value.trim().replace(/\s|€/g, "");
  if (!normalized) throw new BankCsvInputError("CSV enthält einen leeren Betrag.");
  let negative = false;
  if (/^\(.*\)$/.test(normalized)) {
    negative = true;
    normalized = normalized.slice(1, -1);
  }
  if (normalized.startsWith("-")) {
    negative = !negative;
    normalized = normalized.slice(1);
  } else if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }
  if (!/^[\d.,]+$/.test(normalized)) throw new BankCsvInputError("CSV enthält einen ungültigen Betrag.");

  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    const decimalSeparator = comma > dot ? "," : ".";
    const groupingSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized.split(groupingSeparator).join("");
    if (decimalSeparator === ",") normalized = normalized.replace(",", ".");
    else normalized = normalized.replace(",", "");
  } else if (comma >= 0) {
    const decimals = normalized.length - comma - 1;
    normalized = decimals > 0 && decimals <= 2
      ? `${normalized.slice(0, comma).replace(/,/g, "")}.${normalized.slice(comma + 1)}`
      : normalized.replace(/,/g, "");
  } else if (dot >= 0) {
    const decimals = normalized.length - dot - 1;
    if (decimals > 2) normalized = normalized.replace(/\./g, "");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) throw new BankCsvInputError("CSV enthält einen ungültigen Betrag.");
  const rounded = Math.round(amount * 100) / 100;
  return negative ? -rounded : rounded;
}

export function parseGermanBankCsv(input: string | Uint8Array): BankCsvRow[] {
  const text = decodeCsv(input);
  const headerLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = countOutsideQuotes(headerLine, ";") >= countOutsideQuotes(headerLine, ",") ? ";" : ",";
  const records = parseRecords(text, delimiter);
  const headers = records.shift()?.map(normalizeHeader);
  if (!headers?.length) throw new BankCsvInputError("CSV ist leer oder enthält keine Kopfzeile.");

  const index = (name: string) => headers.indexOf(name);
  const bookingDate = index("buchungstag");
  const valueDate = index("valuta");
  const purpose = index("verwendungszweck");
  const amount = index("betrag");
  const currency = index("waehrung") >= 0 ? index("waehrung") : index("wahrung");
  if (bookingDate < 0 || purpose < 0 || amount < 0 || currency < 0) {
    throw new BankCsvInputError("CSV benötigt Buchungstag, Verwendungszweck, Betrag und Waehrung.");
  }

  return records.map((record, rowIndex) => {
    const cell = (position: number) => (position >= 0 ? record[position]?.trim() ?? "" : "");
    const parsedAmount = parseGermanAmount(cell(amount));
    const code = cell(currency).toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) throw new BankCsvInputError(`Ungültige Währung in CSV-Zeile ${rowIndex + 2}.`);
    return {
      bookingDate: parseDate(cell(bookingDate)),
      valueDate: cell(valueDate) ? parseDate(cell(valueDate)) : "",
      purpose: cell(purpose),
      amount: parsedAmount,
      currency: code,
    };
  });
}

export function escapeXml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function validateWorkshopSvg(svg: string): void {
  if (svg.length > 1_000_000 || !/<svg(?:\s|>)/i.test(svg) || !/<\/svg\s*>/i.test(svg)) {
    throw new WorkshopSvgInputError("SVG ist leer, unvollständig oder größer als 1 MB.");
  }
  if (
    /<!DOCTYPE|<!ENTITY|<\s*script\b|<\s*foreignObject\b|\bon[a-z]+\s*=|@import\b|(?:href|src)\s*=\s*["']?\s*(?!#)|url\s*\(\s*["']?\s*(?!#)/i.test(svg)
  ) {
    throw new WorkshopSvgInputError("SVG enthält nicht erlaubte aktive oder externe Inhalte.");
  }
}
