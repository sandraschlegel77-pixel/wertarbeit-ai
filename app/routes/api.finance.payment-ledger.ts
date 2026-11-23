import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BankCsvInputError } from "../services/platform-connectors-core";
import { reconcilePaymentLedger } from "../services/platform-connectors.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") return json({ ok: false, error: "POST required." }, 405);
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv")) {
    return json({ ok: false, error: "Bitte eine CSV-Datei auswählen." }, 400);
  }
  if (file.size === 0 || file.size > 5_000_000) {
    return json({ ok: false, error: "CSV muss größer als 0 und höchstens 5 MB sein." }, 413);
  }

  try {
    const result = await reconcilePaymentLedger(session.shop, new Uint8Array(await file.arrayBuffer()));
    return json(result);
  } catch (error) {
    if (error instanceof BankCsvInputError) return json({ ok: false, error: error.message }, 400);
    console.error("[payment-ledger] CSV reconciliation failed:", error instanceof Error ? error.message : "unknown");
    return json({ ok: false, error: "Interner Abgleichfehler; es wurden keine vollständigen Bankdaten protokolliert." }, 500);
  }
};
