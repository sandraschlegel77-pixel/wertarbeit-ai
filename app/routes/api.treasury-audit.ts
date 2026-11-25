import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { runVaultTreasuryAudit } from "../services/vault-treasury.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  const { session } = await authenticate.admin(request);
  const result = await runVaultTreasuryAudit(session.shop);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
