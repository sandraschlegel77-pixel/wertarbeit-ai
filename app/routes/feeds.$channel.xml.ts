import type { LoaderFunctionArgs } from "react-router";
import { buildMarketplaceFeed } from "../services/platform-connectors.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") ?? "";
  const signature = url.searchParams.get("signature") ?? "";

  try {
    const xml = await buildMarketplaceFeed(params.channel ?? "", shop, signature);
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "Invalid feed signature." || message === "Feed channel is unavailable."
      ? 404
      : message.includes("not configured")
        ? 503
        : message.includes("Invalid shop domain")
          ? 400
          : 502;
    return new Response("Marketplace feed unavailable.", {
      status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }
};
