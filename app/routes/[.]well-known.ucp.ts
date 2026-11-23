import type { LoaderFunctionArgs } from "react-router";
import { loadShopProfile } from "../services/shop-profile.server";
import { buildProfile } from "../services/ucp-profile.server";

/**
 * UCP-Discovery-Profil (/.well-known/ucp), Version 2026-08-25.
 * Ehrlich: Es werden NUR Angaben veröffentlicht, die wirklich vorhanden sind. Da diese App keinen eigenen
 * UCP-Checkout betreibt (der Kauf läuft über den Shopify-Shop), sind `services` und `capabilities` leer –
 * Agenten werden per `continue_url` auf den Shop geleitet. Die Felder unter `business` sind nicht Teil der
 * UCP-Spezifikation, sondern zusätzliche, maschinenlesbare Manufaktur-Angaben.
 */
export const loader = async (_args: LoaderFunctionArgs) => {
  const p = await loadShopProfile();
  const body = buildProfile(
    {
      name: p.name,
      tagline: p.tagline,
      baseUrl: p.baseUrl,
      currency: p.products[0]?.currency ?? "EUR",
      productCount: p.products.length,
    },
    process.env.SHOPIFY_APP_URL
  );
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=900",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
