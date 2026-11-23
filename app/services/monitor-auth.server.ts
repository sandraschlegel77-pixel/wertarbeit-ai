import { createHmac, timingSafeEqual } from "node:crypto";
import { ownerShopDomain } from "./ai-agents.server";

/**
 * Zugang zum Handy-Kontrollmonitor:
 *  1) QR-Login-Link mit kurzlebigem signiertem Token (vom eingeloggten Shopify-Admin erzeugt), oder
 *  2) das feste MOBILE_MONITOR_TOKEN per ?token=
 * Danach hält ein signiertes HttpOnly-Cookie die Anmeldung (30 Tage).
 * Ohne MOBILE_MONITOR_TOKEN ist der Monitor gesperrt.
 */

const COOKIE = "ap_monitor";
const COOKIE_DAYS = 30;
const LINK_MINUTES = 10;

const secret = (): string => process.env.MOBILE_MONITOR_TOKEN ?? "";
export const monitorEnabled = (): boolean => secret().length >= 16;

const sig = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

function safeEq(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Kurzlebiger QR-Login-Pfad (10 Min.), erzeugt im authentifizierten Dashboard. */
export function createLoginPath(shop: string): string | null {
  if (!monitorEnabled()) return null;
  const exp = Date.now() + LINK_MINUTES * 60_000;
  return `/mobile-monitor?l=${encodeURIComponent(`${shop}.${exp}.${sig(`link|${shop}|${exp}`)}`)}`;
}

/** Shop-Domains enthalten Punkte: Format `a.b.myshopify.com.<exp>.<sig>`. */
function joinShop(value: string): [string, string, string] {
  const parts = value.split(".");
  const signature = parts.pop() ?? "";
  const exp = parts.pop() ?? "";
  return [parts.join("."), exp, signature];
}

function cookieHeader(shop: string): string {
  const exp = Date.now() + COOKIE_DAYS * 86_400_000;
  const value = `${shop}.${exp}.${sig(`cookie|${shop}|${exp}`)}`;
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}

function readCookie(request: Request): string | null {
  const raw = request.headers.get("cookie") ?? "";
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!hit) return null;
  const [shop, expStr, signature] = joinShop(decodeURIComponent(hit.slice(COOKIE.length + 1)));
  const exp = Number(expStr);
  if (!shop || !signature || !Number.isFinite(exp) || exp < Date.now()) return null;
  return safeEq(signature, sig(`cookie|${shop}|${exp}`)) ? shop : null;
}

export interface MonitorAuth {
  shop: string | null;
  setCookie?: string;
  redirectTo?: string;
}

export function authenticateMonitor(request: Request): MonitorAuth {
  if (!monitorEnabled()) return { shop: null };
  const url = new URL(request.url);

  const link = url.searchParams.get("l");
  if (link) {
    const [shop, expStr, signature] = joinShop(link);
    const exp = Number(expStr);
    if (shop && exp > Date.now() && safeEq(signature, sig(`link|${shop}|${exp}`))) {
      return { shop, setCookie: cookieHeader(shop), redirectTo: "/mobile-monitor" };
    }
    return { shop: null };
  }

  const token = url.searchParams.get("token");
  if (token && safeEq(token, secret())) {
    const shop = ownerShopDomain();
    return { shop, setCookie: cookieHeader(shop), redirectTo: "/mobile-monitor" };
  }

  return { shop: readCookie(request) };
}
