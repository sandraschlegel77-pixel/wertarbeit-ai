import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { buildCapturedRewardAccountantCsv } from "../services/silent-revenue.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const csv = await buildCapturedRewardAccountantCsv(session.shop);
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="atelierpilot-vorteile-steuerberater-pruefliste.csv"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
