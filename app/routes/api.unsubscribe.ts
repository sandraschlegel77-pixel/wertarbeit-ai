import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { blacklistEmail, verifyUnsubscribe } from "../services/unsubscribe.server";

/**
 * § 7 Abs. 3 UWG – 1-Klick-Abmeldung.
 * GET  = Klick auf den Link in der Mail.
 * POST = RFC 8058 "List-Unsubscribe=One-Click" (Mail-Programme).
 * Beides trägt die Adresse sofort in die Blacklist ein.
 */

const SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

function page(title: string, text: string, status = 200): Response {
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#0F172A;color:#E2E8F0;display:grid;place-items:center;min-height:100vh;padding:24px}
main{max-width:480px;text-align:center}h1{color:#F7E7CE;font-size:22px}p{color:#94A3B8;line-height:1.6}</style></head>
<body><main><h1>${title}</h1><p>${text}</p></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const shop = url.searchParams.get("s") ?? "";
  const e = url.searchParams.get("e") ?? "";
  const t = url.searchParams.get("t") ?? "";

  if (!SHOP_RE.test(shop)) {
    return page("Link ungültig", "Dieser Abmeldelink ist nicht vollständig. Bitte antworten Sie auf die Mail, wir tragen Sie gern manuell aus.", 400);
  }
  const email = verifyUnsubscribe(shop, e, t);
  if (!email) {
    return page("Link ungültig", "Dieser Abmeldelink ist ungültig oder abgelaufen. Bitte antworten Sie auf die Mail, wir tragen Sie gern manuell aus.", 400);
  }

  await blacklistEmail(shop, email, "unsubscribe");
  return page(
    "Sie sind abgemeldet",
    "Wir senden Ihnen keine Werbung mehr. Notwendige Mails zu bestehenden Bestellungen (z. B. Versand) erhalten Sie weiterhin. Vielen Dank – Ihre Wertarbeit Manufaktur."
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => handle(request);
export const action = async ({ request }: ActionFunctionArgs) => handle(request);
