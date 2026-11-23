import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeXml,
  parseGermanBankCsv,
  validateWorkshopSvg,
  WorkshopSvgInputError,
} from "../app/services/platform-connectors-core.ts";

test("parses semicolon CSV and German thousands/decimal separators without retaining IBAN", () => {
  const csv = [
    "Buchungstag;Valuta;Auftraggeber_Empfaenger;Verwendungszweck;Betrag;Waehrung;IBAN_Masked",
    "23.11.2026;23.11.2026;Zahlung;Rechnung INV-204;1.234,56;EUR;DE89••••",
  ].join("\r\n");
  assert.deepEqual(parseGermanBankCsv(csv), [{
    bookingDate: "2026-11-23T00:00:00.000Z",
    valueDate: "2026-11-23T00:00:00.000Z",
    purpose: "Rechnung INV-204",
    amount: 1234.56,
    currency: "EUR",
  }]);
});

test("parses quoted comma CSV with an ISO-8859-1 currency heading and decimal comma", () => {
  const csv = Buffer.from(
    '"Buchungstag","Verwendungszweck","Betrag","Währung"\n"2026-11-23","Zahlung, Rechnung INV-9","129,90","EUR"',
    "latin1"
  );
  const [row] = parseGermanBankCsv(csv);
  assert.equal(row.amount, 129.9);
  assert.equal(row.purpose, "Zahlung, Rechnung INV-9");
  assert.equal(row.currency, "EUR");
});

test("escapes all XML-sensitive characters", () => {
  assert.equal(escapeXml(`A&B <ring> "925" 'Silber'`), "A&amp;B &lt;ring&gt; &quot;925&quot; &apos;Silber&apos;");
});

test("accepts local SVG references but rejects active or external content", () => {
  assert.doesNotThrow(() => validateWorkshopSvg('<svg><defs><linearGradient id="g"/></defs><rect fill="url(#g)"/></svg>'));
  assert.throws(() => validateWorkshopSvg('<svg><image href="https://example.com/image.png"/></svg>'), WorkshopSvgInputError);
  assert.throws(() => validateWorkshopSvg('<svg onload="alert(1)"></svg>'), WorkshopSvgInputError);
});
