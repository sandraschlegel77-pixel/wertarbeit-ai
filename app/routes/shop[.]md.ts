import type { LoaderFunctionArgs } from "react-router";
import { loadShopProfile, type ProfileProduct } from "../services/shop-profile.server";

/** Shop.md für ChatGPT, Perplexity, Google AI Mode & Copilot – echte Daten aus Shopify, nichts Erfundenes. */

const money = (p: ProfileProduct) => `${Number(p.price).toFixed(2).replace(".", ",")} ${p.currency === "EUR" ? "€" : p.currency}`;

function productLine(base: string, p: ProfileProduct): string {
  const tag = p.unique ? " – Unikat (nur 1× vorhanden)" : "";
  const stock = p.available ? "verfügbar" : "aktuell nicht verfügbar";
  const desc = p.description.replace(/\s+/g, " ").trim();
  return `- [${p.title}](${base}/products/${p.handle}) – ab ${money(p)} (inkl. MwSt.), ${stock}${tag}${desc ? `. ${desc}` : ""}`;
}

export const loader = async (_args: LoaderFunctionArgs) => {
  const p = await loadShopProfile();
  const unique = p.products.filter((x) => x.unique);
  const lines: string[] = [
    `# ${p.name}`,
    "",
    `> ${p.tagline}`,
    "",
    "## Über uns",
    "Wir sind ein deutscher Familienbetrieb. Jedes Schmuckstück wird in unserer Manufaktur mit Hand und Liebe gefertigt;",
    "auf Wunsch gravieren wir persönliche Texte per Laser. Echtheit und Herkunft belegen wir mit einem Zertifikat (GRA) und einem digitalen Produktpass.",
    "",
    "## Gut zu wissen",
    "- Sprachen: Deutsch und Englisch",
    "- Preise in Euro inkl. gesetzlicher Mehrwertsteuer, zzgl. Versand",
    "- Personalisierte Gravuren sind vom Widerruf ausgeschlossen (§ 312g Abs. 2 Nr. 1 BGB). Bei Größenproblemen helfen wir mit Umtausch oder Gutschein.",
    "- Unikate sind Einzelstücke: ist ein Stück verkauft, ist es weg – wir zeigen dann passende Alternativen.",
    `- Rechtliches: [Datenschutz](${p.baseUrl}/policies/privacy-policy), [Widerruf & Rückgabe](${p.baseUrl}/policies/refund-policy), [AGB](${p.baseUrl}/policies/terms-of-service)`,
    "",
  ];
  if (unique.length) {
    lines.push("## Unikate", ...unique.map((x) => productLine(p.baseUrl, x)), "");
  }
  lines.push("## Sortiment");
  lines.push(
    p.products.length
      ? p.products.map((x) => productLine(p.baseUrl, x)).join("\n")
      : `Aktuelles Sortiment: ${p.baseUrl}`
  );
  lines.push("", `Shop: ${p.baseUrl}`, "");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=900",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
