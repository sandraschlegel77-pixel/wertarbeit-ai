import type { LoaderFunctionArgs } from "react-router";
import { schemaFor } from "../services/ucp-profile.server";

/** JSON-Schemas der eigenen UCP-Capabilities (Host stimmt mit dem Namespace überein – Authority Binding). */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const schema = schemaFor(params.key ?? "", process.env.SHOPIFY_APP_URL);
  if (!schema) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(schema, null, 2), {
    headers: {
      "Content-Type": "application/schema+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
