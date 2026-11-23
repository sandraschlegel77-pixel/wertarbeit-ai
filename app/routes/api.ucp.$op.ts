import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";
import { loadShopProfile } from "../services/shop-profile.server";
import { fromCircumference, fromDiameter, fromUs } from "../services/ring-size";
import { ownerShopDomain } from "../services/ai-agents.server";

/**
 * Öffentliche, rein lesende Manufaktur-Schnittstelle für KI-Agenten (siehe /.well-known/ucp).
 * Kein Checkout, keine Zahlung, keine Kundendaten. Kauf nur über die Shopify-Storefront (continue_url).
 */

const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    if (hits.size > 2000) hits.clear();
    return false;
  }
  return ++h.n > 30;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });

const ADVICE: { match: RegExp; de: string; en: string }[] = [
  { match: /gravur|engrav/i, de: "Gravuren fertigen wir per Laser nach Ihrem Text. Personalisierte Stücke sind vom Widerruf ausgeschlossen (§ 312g Abs. 2 Nr. 1 BGB); Mängelrechte bleiben unberührt.", en: "We laser-engrave your text. Personalised pieces are excluded from withdrawal (§ 312g (2) no. 1 BGB); statutory warranty rights remain." },
  { match: /pflege|care|reinig/i, de: "Silber und Moissanit mit weichem Tuch und mildem Seifenwasser reinigen; getrennt und trocken lagern; Parfüm und Chlor meiden.", en: "Clean silver and moissanite with a soft cloth and mild soapy water; store separately and dry; avoid perfume and chlorine." },
  { match: /zertifikat|gra|echt|certif/i, de: "Zertifizierter Moissanit wird mit GRA-Echtheitszertifikat geliefert; die Nummer lässt sich über diese Schnittstelle prüfen.", en: "Certified moissanite ships with a GRA certificate; the number can be verified through this interface." },
  { match: /größe|groesse|size|ring/i, de: "Ringgröße = Innenumfang in mm (ISO 8653). Nutzen Sie den Größen-Umrechner; Unikate gibt es in fester Größe oder größenverstellbar.", en: "Ring size = inner circumference in mm (ISO 8653). Use the size converter; unique pieces come in a fixed size or adjustable." },
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return json({ error: "rate_limited" }, 429);
  const q = new URL(request.url).searchParams;

  switch (params.op) {
    case "products": {
      const p = await loadShopProfile();
      const term = (q.get("q") ?? "").toLowerCase().slice(0, 60);
      const onlyUnique = q.get("unique") === "true";
      const items = p.products
        .filter((x) => (!term || `${x.title} ${x.productType}`.toLowerCase().includes(term)) && (!onlyUnique || x.unique))
        .slice(0, 20)
        .map((x) => ({
          title: x.title, price: x.price, currency: x.currency, available: x.available, unique: x.unique,
          url: `${p.baseUrl}/products/${x.handle}`,
        }));
      return json({ continue_url: p.baseUrl, count: items.length, items });
    }
    case "ring-size": {
      const val = Number(q.get("value"));
      const unit = q.get("unit");
      const r = unit === "diameter_mm" ? fromDiameter(val) : unit === "us" ? fromUs(val) : fromCircumference(val);
      return r ? json(r) : json({ error: "value_out_of_range", hint: "Innenumfang 44–78 mm, unit=circumference_mm|diameter_mm|us" }, 400);
    }
    case "gra": {
      const no = (q.get("no") ?? "").trim().toUpperCase();
      if (!/^GRA-\d{6,}$/.test(no)) return json({ error: "invalid_format", expected: "GRA-123456" }, 400);
      const c = await db.graCertificate.findFirst({
        where: { shop: ownerShopDomain(), certificateNo: no },
        select: { stoneType: true, carat: true },
      });
      // Bewusst nur „gültig ja/nein“ + Steindaten – keine Bestell- oder Kundendaten.
      return c ? json({ valid: true, stoneType: c.stoneType, carat: c.carat }) : json({ valid: false });
    }
    case "advice": {
      const topic = (q.get("topic") ?? "").slice(0, 80);
      const hit = ADVICE.filter((a) => a.match.test(topic));
      return json({ topic, answers: (hit.length ? hit : ADVICE).map(({ de, en }) => ({ de, en })) });
    }
    default:
      return json({ error: "unknown_operation" }, 404);
  }
};
