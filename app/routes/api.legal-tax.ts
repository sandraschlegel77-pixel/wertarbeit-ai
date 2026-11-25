import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { isOwnerShop } from "../services/access-control.server";
import { LEGAL_RULE_PROFILES } from "../services/legal-tax-core";
import { syncLegalTaxRuleLedger } from "../services/legal-tax-engine.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!isOwnerShop(session.shop)) return json({ error: "owner_only" }, 403);
  return json({ rules: LEGAL_RULE_PROFILES, note: "Quellenabruf ist keine rechtliche Prüfung oder Freigabe." });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!isOwnerShop(session.shop)) return json({ error: "owner_only" }, 403);
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("ruleKeys" in body) ||
      !Array.isArray(body.ruleKeys) || body.ruleKeys.length < 1 || body.ruleKeys.length > 3 ||
      body.ruleKeys.some((key) => typeof key !== "string")) {
    return json({ error: "ruleKeys must contain 1 to 3 known identifiers" }, 400);
  }
  const result = await syncLegalTaxRuleLedger(session.shop, body.ruleKeys);
  return json(result);
};
