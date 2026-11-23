// Legt .env / .env.example an und ergänzt fehlende oder zu kurze Geheimnisse (nur lokal, nie im Log).
// Aufruf: node scripts/ensure-env.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

const token = () => crypto.randomBytes(24).toString("base64url").slice(0, 32); // 32 Zeichen
const SECRETS = ["CRON_SECRET", "MOBILE_MONITOR_TOKEN"];

const parse = (text) => {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) map.set(m[1], m[2].trim().replace(/^["']|["']$/g, ""));
  }
  return map;
};

let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const current = parse(text);
const changed = [];

for (const key of SECRETS) {
  const v = current.get(key) ?? "";
  if (v.length >= 16) continue;
  const value = token();
  const line = `${key}="${value}"`;
  const re = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
  text = re.test(text) ? text.replace(re, line) : `${text}${text && !text.endsWith("\n") ? "\n" : ""}${line}\n`;
  changed.push(key);
}

// Sinnvolle Standardwerte nur ergänzen, wenn sie fehlen.
const defaults = {
  OWNER_SHOP_DOMAIN: "wertarbeitmanufaktur.myshopify.com",
  DRY_RUN_MODE: "true",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/atelierpilot?schema=public",
  PORT: "3000",
};
for (const [k, v] of Object.entries(defaults)) {
  if (!current.has(k)) {
    text += `${text && !text.endsWith("\n") ? "\n" : ""}${k}="${v}"\n`;
    changed.push(k);
  }
}

fs.writeFileSync(envPath, text, { encoding: "utf8" }); // UTF-8 ohne BOM
console.log(changed.length ? `.env ergänzt: ${changed.join(", ")} (Werte werden nicht angezeigt)` : ".env war bereits vollständig.");

const example = `# AtelierPilot AI – Vorlage. Kopieren nach .env und ausfüllen. NIE echte Werte hier eintragen.
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SHOPIFY_APP_URL="https://IHRE-DOMAIN"
SCOPES="read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_content,write_content,read_files,write_files"
OWNER_SHOP_DOMAIN="wertarbeitmanufaktur.myshopify.com"
DRY_RUN_MODE="true"
BILLING_LIVE="false"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atelierpilot?schema=public"
PORT="3000"

# Geheimnisse (mind. 16 Zeichen, am besten 32 – erzeugt: node scripts/ensure-env.mjs)
CRON_SECRET=""
MOBILE_MONITOR_TOKEN=""
UNSUBSCRIBE_SECRET=""

# KI (optional – ohne Schlüssel läuft die Haus-KI)
GEMINI_API_KEYS=""
GROQ_API_KEY=""
OPENROUTER_API_KEY=""

# E-Mail-Versand (optional). Gmail: App-Passwort verwenden, nie das Kontopasswort.
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
# oder beliebiger SMTP:
SMTP_HOST=""
SMTP_PORT="465"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM=""
# Posteingang (optional)
IMAP_HOST=""
IMAP_USER=""
IMAP_PASS=""

STOREFRONT_URL=""
`;
fs.writeFileSync(examplePath, example, { encoding: "utf8" });
console.log(".env.example geschrieben (nur Platzhalter).");
