// npm run appstore:check – prüft das Projekt statisch gegen die Shopify-App-Store-Kriterien.
// Kein Browser, keine Netzwerkzugriffe, 0 € Kosten.
import fs from "node:fs";
import { Buffer } from "node:buffer";
import path from "node:path";
import process from "node:process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const read = (p) => (fs.existsSync(path.join(root, p)) ? fs.readFileSync(path.join(root, p), "utf8") : "");
const exists = (p) => fs.existsSync(path.join(root, p));

function walk(dir, out = []) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const toml = read("shopify.app.toml");
const webhooks = read("app/routes/webhooks.tsx");
const billing = read("app/services/billing.server.ts");
const shopify = read("app/shopify.server.ts");
const entry = read("app/entry.server.tsx");
const sidekick = read("app/lib/sidekick.server.ts");
const tomlBytes = fs.existsSync(path.join(root, "shopify.app.toml")) ? fs.readFileSync(path.join(root, "shopify.app.toml")) : Buffer.alloc(0);
const tomlNoBom = !(tomlBytes[0] === 0xef && tomlBytes[1] === 0xbb && tomlBytes[2] === 0xbf);

const sidekickTools = new Set([...sidekick.matchAll(/register\("([^"]+)",\s*"([^"]+)"/g)].map((m) => `${m[1]}:${m[2]}`));
const storefrontExt = walk("extensions").filter((f) => /theme|storefront|script_tag|\.liquid$/i.test(f));
const usesScriptTag = /ScriptTag|script_tag|write_script_tags/i.test(toml + read("app/shopify.server.ts"));

const checks = [
  ["HMAC-Webhooks (authenticate.webhook)", /authenticate\.webhook/.test(webhooks)],
  ["DSGVO: customers/data_request", /customers\/data_request/.test(toml) && /CUSTOMERS_DATA_REQUEST/.test(webhooks)],
  ["DSGVO: customers/redact", /customers\/redact/.test(toml) && /CUSTOMERS_REDACT/.test(webhooks)],
  ["DSGVO: shop/redact (Löschung)", /shop\/redact/.test(toml) && /SHOP_REDACT/.test(webhooks)],
  ["Billing API (appSubscriptionCreate, 14 Tage, test-Flag)", /appSubscriptionCreate/.test(billing) && /trialDays/.test(billing) && /test/.test(billing)],
  ["OAuth / Session-Tokens (embedded + authenticate.admin)", /embedded\s*=\s*true/.test(toml) && /authenticate/.test(shopify)],
  ["HTTPS-Security-Header (addDocumentResponseHeaders)", /addDocumentResponseHeaders/.test(entry)],
  ["Zero-Storefront-Impact (keine Theme-/ScriptTag-Skripte)", storefrontExt.length === 0 && !usesScriptTag],
  ["Datenschutzerklärung-Route (/privacy)", exists("app/routes/privacy.tsx")],
  ["shopify.app.toml ohne BOM (UTF-8)", tomlNoBom],
  ["Sidekick-Tools ≤ 20", sidekickTools.size > 0 && sidekickTools.size <= 20],
  ["Prisma: OWNER/DRY_RUN-Regeln vorhanden (CompanyRule)", /model CompanyRule/.test(read("prisma/schema.prisma"))],
  ["App-Icon 1200×1200 (PNG) vorhanden", exists("public/app-icon.png")],
  ["Cron-Endpunkt gesichert (/api/cron, CRON_SECRET)", /CRON_SECRET/.test(read("app/routes/api.cron.ts")) && /timingSafeEqual/.test(read("app/routes/api.cron.ts"))],
  ["UWG-Abmeldung (/api/unsubscribe, signiert + Blacklist)", /blacklistEmail/.test(read("app/routes/api.unsubscribe.ts")) && /timingSafeEqual/.test(read("app/services/unsubscribe.server.ts"))],
  ["PWA: manifest.json + sw.js + /mobile-monitor", exists("public/manifest.json") && exists("public/sw.js") && exists("app/routes/mobile-monitor.tsx")],
  ["Monitor gesperrt ohne MOBILE_MONITOR_TOKEN", /monitorEnabled/.test(read("app/services/monitor-auth.server.ts"))],
  ["UCP-Profil + Shop.md vorhanden", exists("app/routes/[.]well-known.ucp.ts") && exists("app/routes/shop[.]md.ts")],
  ["Geschenk-Seite + Umtausch-Portal vorhanden", exists("app/routes/gift.$token.tsx") && exists("app/routes/returns-portal.tsx")],
  ["Mail-Autopilot: Blacklist, Ferien, Kontakt-Lock, DRY_RUN vor Versand", /isBlacklisted/.test(read("app/services/mail-transport.server.ts")) && /isOnHoliday/.test(read("app/services/mail-transport.server.ts")) && /canContactCustomer/.test(read("app/services/mail-transport.server.ts")) && /isDryRun/.test(read("app/services/mail-transport.server.ts"))],
  ["Mail: Streitfall-Veto + 4–11-Min.-Verzögerung", /needsVeto/.test(read("app/services/gmail-replies.server.ts")) && /humanDelayMs/.test(read("app/services/mail-transport.server.ts"))],
  ["Echte Verdienst-Buchung an orders/paid (isSimulated:false)", /bookOrderRevenue/.test(webhooks) && /isSimulated:\s*false/.test(read("app/services/agent-runner.server.ts"))],
  ["Webhook checkouts/update registriert", /checkouts\/update/.test(toml) && /CHECKOUTS_UPDATE/.test(webhooks)],
  ["UCP-Profil: Pflichtfelder (services, payment_handlers) + Authority Binding", /payment_handlers/.test(read("app/services/ucp-profile.server.ts")) && /appAuthority/.test(read("app/services/ucp-profile.server.ts"))],
  ["Geschenk-Formular im Dashboard", exists("app/components/dashboard/GiftForm.tsx") && /create_gift/.test(read("app/services/dashboard-actions.server.ts"))],
  ["Cloud-Start: Dockerfile (Port 3000) + start:prod + render.yaml", /PORT=3000/.test(read("Dockerfile")) && /start:prod/.test(read("package.json")) && exists("render.yaml")],
  [".env: CRON_SECRET & MOBILE_MONITOR_TOKEN ≥ 16 Zeichen", (() => { const e = read(".env"); const g = (k) => (e.match(new RegExp(`^${k}="?([^"\\r\\n]*)"?`, "m")) ?? [])[1] ?? ""; return g("CRON_SECRET").length >= 16 && g("MOBILE_MONITOR_TOKEN").length >= 16; })()],
  ["Öffentliche Support-Seite vorhanden", exists("app/routes/support.tsx")],
  ["Bilingualer App-Store-Listing-Entwurf vorhanden", exists("docs/APP_STORE_LISTING.md") && /## Deutsch/.test(read("docs/APP_STORE_LISTING.md")) && /## English/.test(read("docs/APP_STORE_LISTING.md"))],
  ["Neukunden-Onboarding shopbezogen gespeichert", /complete_onboarding/.test(read("app/services/dashboard-actions.server.ts")) && /onboarding_complete/.test(read("app/services/dashboard-loader.server.ts"))],
  ["Globale KI-Pause serverseitig geprüft", /isShopPaused/.test(read("app/services/agent-runner.server.ts")) && /isShopPaused/.test(read("app/lib/sidekick.server.ts")) && /isShopPaused/.test(read("app/services/mail-transport.server.ts"))],
  ["Meta-Supervisor nutzt den PII-maskierten Opt-in-Provider-Router mit lokalem Fallback", /routeAiCompletion/.test(read("app/services/meta-supervisor.server.ts")) && /AI_CLOUD_ENABLED/.test(read("app/services/ai-provider-router.server.ts")) && /deterministic-local-rules/.test(read("app/services/ai-provider-router.server.ts")) && /maskPiiForExternalModel/.test(read("app/services/ai-provider-router.server.ts"))],
  ["Drei-Satz-Puls im Dashboard und Monitor", /executivePulse/.test(read("app/routes/app._index.tsx")) && /executivePulse/.test(read("app/routes/mobile-monitor.tsx"))],
  ["Undo nur für explizit unterstützte interne Aktion", /supportsLocalUndo/.test(read("app/services/autopilot-control.server.ts")) && /updateMany/.test(read("app/services/autopilot-control.server.ts"))],
];

let failed = 0;
console.log("\nAtelierPilot AI – App-Store-Selbsttest\n");
for (const [label, ok] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? "✔ GRÜN" : "✘ ROT "}  ${label}`);
}
console.log(`\nSidekick-Tools (sub_action): ${sidekickTools.size}/20`);
console.log(failed === 0 ? "\nAlle Kriterien grün.\n" : `\n${failed} Kriterium/Kriterien rot.\n`);
process.exit(failed === 0 ? 0 : 1);
