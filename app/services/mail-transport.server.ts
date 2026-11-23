import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import db from "../db.server";
import { isDryRun } from "./ai-agents.server";
import { isShopPaused } from "./autopilot-control.server";
import { brandVoiceGuard, canContactCustomer, enqueueApproval, recordContact } from "./triple-audit-gate.server";
import { buildUnsubscribeUrl, isBlacklisted, uwgNotice } from "./unsubscribe.server";

/**
 * Sicherer Mail-Versand (0 €): SMTP oder Gmail-App-Passwort per .env.
 * Fehlen die Zugangsdaten, passiert nie ein Crash – der Status ist dann "no_smtp".
 * Schutzschichten: Blacklist (§ 7 UWG) → Betriebsferien → 7-Tage-Lock → Stilbuch → DRY_RUN_MODE.
 */

export type MailKind = "fit_check" | "stuck" | "cart" | "reply";
export type MailStatus =
  | "sent" | "dry_run" | "no_smtp" | "unsubscribed" | "holiday" | "locked" | "blocked" | "error";

export interface MailResult {
  status: MailStatus;
  detail?: string;
}

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export function mailConfig(): MailConfig | null {
  const gUser = process.env.GMAIL_USER;
  const gPass = process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || (gUser && gPass ? "smtp.gmail.com" : "");
  const user = process.env.SMTP_USER || gUser || "";
  const pass = process.env.SMTP_PASS || gPass || "";
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    user,
    pass,
    from: process.env.MAIL_FROM || user,
  };
}

let cached: { key: string; t: Transporter } | null = null;
function transporter(cfg: MailConfig): Transporter {
  const key = `${cfg.host}|${cfg.port}|${cfg.user}`;
  if (cached?.key === key) return cached.t;
  const t = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });
  cached = { key, t };
  return t;
}

/** Betriebsferien: CompanyRule `betriebsferien` = "2026-12-24..2027-01-06, 2027-08-01..2027-08-14". */
export async function isOnHoliday(shop: string, now = new Date()): Promise<boolean> {
  try {
    const rule = await db.companyRule.findUnique({ where: { shop_key: { shop, key: "betriebsferien" } } });
    if (!rule || !rule.active) return false;
    const day = now.toISOString().slice(0, 10);
    return String(rule.value)
      .replace(/"/g, "")
      .split(",")
      .some((range) => {
        const [from, to] = range.trim().split("..");
        return !!from && !!to && day >= from && day <= to;
      });
  } catch {
    return false;
  }
}

/** Deterministische „menschliche“ Verzögerung 4–11 Minuten je Vorgang (stabil über mehrere Cron-Läufe). */
export function humanDelayMs(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (4 + (h % 8)) * 60_000; // 4..11 Min.
}

const SIGNATURE = "\n\nHerzliche Grüße\nIhre Wertarbeit Manufaktur\nEin deutscher Familienbetrieb";

export interface SendInput {
  shop: string;
  to: string;
  subject: string;
  text: string;
  kind: MailKind;
  marketing?: boolean;
  sourceAgentKey: string;
}

export async function sendMail(input: SendInput): Promise<MailResult> {
  const { shop, to, subject, kind } = input;
  if (await isShopPaused(shop)) return { status: "blocked", detail: "Globale KI-Pause – keine Mail versendet." };
  if (await isBlacklisted(shop, to)) return { status: "unsubscribed" };
  if (await isOnHoliday(shop)) return { status: "holiday", detail: "Betriebsferien – wird danach versendet." };
  // Antworten auf eine Kundenanfrage dürfen nie durch den Kontakt-Lock verhindert werden.
  if (kind !== "reply" && !(await canContactCustomer(shop, to))) return { status: "locked" };

  let body = input.text.trim();
  if (input.marketing) {
    const base = process.env.SHOPIFY_APP_URL || "";
    if (!base) return { status: "blocked", detail: "SHOPIFY_APP_URL fehlt – Pflicht-Abmeldelink (§ 7 UWG) nicht möglich." };
    body += `\n\n${uwgNotice(buildUnsubscribeUrl(base, shop, to))}`;
  }
  const voice = brandVoiceGuard(body);
  if (!voice.ok) {
    await enqueueApproval({
      shop,
      sourceAgentKey: input.sourceAgentKey,
      category: "support",
      title: `Mail-Stilprüfung: ${subject}`.slice(0, 120),
      summary: voice.issues.join(" "),
      riskLevel: "LOW",
    });
    return { status: "blocked", detail: voice.issues.join(" ") };
  }

  if (await isDryRun(shop)) return { status: "dry_run", detail: "DRY_RUN_MODE – keine Mail versendet." };
  const cfg = mailConfig();
  if (!cfg) return { status: "no_smtp", detail: "SMTP/Gmail nicht konfiguriert." };

  try {
    await transporter(cfg).sendMail({
      from: `"Wertarbeit Manufaktur" <${cfg.from}>`,
      to,
      subject,
      text: body + SIGNATURE,
      headers: input.marketing ? { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
    });
    await recordContact(shop, to);
    return { status: "sent" };
  } catch (err) {
    return { status: "error", detail: err instanceof Error ? err.message.slice(0, 160) : "Versandfehler" };
  }
}
