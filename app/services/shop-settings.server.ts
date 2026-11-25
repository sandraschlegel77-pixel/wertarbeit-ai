import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import db from "../db.server";

export interface ShopBrandSettings {
  available: boolean;
  message: string | null;
  businessName: string;
  primaryColor: string;
  accentColor: string;
  fontStyle: "CLASSIC" | "MODERN";
  tone: string;
  greeting: string;
  hasLogo: boolean;
  bankName: string;
  iban: string;
  bic: string;
  maskedIban: string | null;
  bankDetailsConfigured: boolean;
  bankDetailsLocked: boolean;
  bankDetailsEncryptionConfigured: boolean;
}

export interface ShopBrandDocumentSettings extends ShopBrandSettings {
  invoiceLogoBase64: string | null;
}

export class ShopSettingsInputError extends Error {}

const DEFAULTS = {
  businessName: "Wertarbeit Manufaktur",
  primaryColor: "#172033",
  accentColor: "#D4AF37",
  fontStyle: "CLASSIC" as const,
  tone: "HERZLICH_HANDWERKLICH",
  greeting: "Mit Hand und Liebe gefertigt.",
};

function encryptionKey() {
  const raw = process.env.BRAND_SETTINGS_ENCRYPTION_KEY ?? "";
  const key = /^[\da-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new ShopSettingsInputError("Bankdaten benötigen einen BRAND_SETTINGS_ENCRYPTION_KEY mit 32 zufälligen Bytes (64 Hex-Zeichen).");
  }
  return key;
}

function hasEncryptionKey() {
  const raw = process.env.BRAND_SETTINGS_ENCRYPTION_KEY ?? "";
  const key = /^[\da-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  return key.length === 32;
}

function encryptBankDetails(details: { bankName: string; iban: string; bic: string }) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(details), "utf8"),
    cipher.final(),
  ]);
  return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptBankDetails(value: string) {
  const [version, ivText, tagText, encryptedText] = value.split(":");
  if (version !== "v1" || !ivText || !tagText || !encryptedText) {
    throw new Error("Unbekanntes Format verschlüsselter Bankdaten.");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64"));
  decipher.setAuthTag(Buffer.from(tagText, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64")),
    decipher.final(),
  ]).toString("utf8");
  const parsed = JSON.parse(plaintext) as { bankName?: string; iban?: string; bic?: string };
  return {
    bankName: parsed.bankName ?? "",
    iban: parsed.iban ?? "",
    bic: parsed.bic ?? "",
  };
}

export function normalizeIban(value: string) {
  const iban = value.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) {
    throw new ShopSettingsInputError("Bitte eine gültig formatierte IBAN angeben.");
  }
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = char >= "A" && char <= "Z" ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  if (remainder !== 1) throw new ShopSettingsInputError("Die IBAN-Prüfsumme ist ungültig.");
  return iban;
}

async function loadShopBrandSettings(shop: string): Promise<ShopBrandDocumentSettings> {
  try {
    const row = await db.shopSettings.findUnique({ where: { shop } });
    let bank = { bankName: "", iban: "", bic: "" };
    let bankDetailsLocked = false;
    if (row?.bankDetailsCiphertext) {
      try {
        bank = decryptBankDetails(row.bankDetailsCiphertext);
      } catch {
        bankDetailsLocked = true;
        console.error("[shop-settings] Bankdaten konnten nicht entschlüsselt werden; Schlüssel prüfen.");
      }
    }
    return {
      available: true,
      message: bankDetailsLocked
        ? "Gespeicherte Bankdaten sind gesperrt; den ursprünglichen Verschlüsselungsschlüssel wiederherstellen."
        : null,
      businessName: row?.businessName ?? DEFAULTS.businessName,
      primaryColor: row?.primaryColor ?? DEFAULTS.primaryColor,
      accentColor: row?.accentColor ?? DEFAULTS.accentColor,
      fontStyle: row?.fontStyle === "MODERN" ? "MODERN" : "CLASSIC",
      tone: row?.tone ?? DEFAULTS.tone,
      greeting: row?.greeting ?? DEFAULTS.greeting,
      hasLogo: Boolean(row?.invoiceLogoBase64),
      invoiceLogoBase64: row?.invoiceLogoBase64 ?? null,
      ...bank,
      maskedIban: bank.iban ? `${bank.iban.slice(0, 4)} **** **** **** ${bank.iban.slice(-4)}` : null,
      bankDetailsConfigured: Boolean(row?.bankDetailsCiphertext),
      bankDetailsLocked,
      bankDetailsEncryptionConfigured: hasEncryptionKey(),
    };
  } catch {
    console.error("[shop-settings] Mandanteneinstellungen konnten nicht geladen werden.");
    return {
      available: false,
      message: "Einstellungen nicht verfügbar. Datenbankverbindung und Schema-Bereitstellung prüfen.",
      ...DEFAULTS,
      hasLogo: false,
      invoiceLogoBase64: null,
      bankName: "",
      iban: "",
      bic: "",
      maskedIban: null,
      bankDetailsConfigured: false,
      bankDetailsLocked: false,
      bankDetailsEncryptionConfigured: hasEncryptionKey(),
    };
  }
}

export async function getShopBrandSettings(shop: string): Promise<ShopBrandSettings> {
  const settings = await loadShopBrandSettings(shop);
  return {
    available: settings.available,
    message: settings.message,
    businessName: settings.businessName,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    fontStyle: settings.fontStyle,
    tone: settings.tone,
    greeting: settings.greeting,
    hasLogo: settings.hasLogo,
    bankName: "",
    iban: "",
    bic: "",
    maskedIban: settings.maskedIban,
    bankDetailsConfigured: settings.bankDetailsConfigured,
    bankDetailsLocked: settings.bankDetailsLocked,
    bankDetailsEncryptionConfigured: settings.bankDetailsEncryptionConfigured,
  };
}

export async function getShopBrandDocumentSettings(shop: string): Promise<ShopBrandDocumentSettings> {
  return loadShopBrandSettings(shop);
}

export async function saveShopBrandSettings(
  shop: string,
  input: {
    businessName: string;
    primaryColor: string;
    accentColor: string;
    fontStyle: string;
    tone: string;
    greeting: string;
    logoDataUrl?: string;
    clearLogo: boolean;
    bankName: string;
    iban: string;
    bic: string;
    clearBankDetails: boolean;
  }
) {
  const businessName = input.businessName.trim();
  const tone = input.tone.trim();
  const greeting = input.greeting.trim();
  if (businessName.length < 2 || businessName.length > 120) {
    throw new ShopSettingsInputError("Der Betriebsname muss zwischen 2 und 120 Zeichen lang sein.");
  }
  if (!/^#[\da-f]{6}$/i.test(input.primaryColor) || !/^#[\da-f]{6}$/i.test(input.accentColor)) {
    throw new ShopSettingsInputError("Farben müssen als Hex-Farbwert (#RRGGBB) angegeben werden.");
  }
  if (input.fontStyle !== "CLASSIC" && input.fontStyle !== "MODERN") {
    throw new ShopSettingsInputError("Bitte einen gültigen Schriftstil auswählen.");
  }
  if (tone.length < 2 || tone.length > 80 || greeting.length < 2 || greeting.length > 240) {
    throw new ShopSettingsInputError("Ton oder Grußformel überschreitet die erlaubte Länge.");
  }

  const logo = input.logoDataUrl?.trim() ?? "";
  if (logo) {
    const match = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(logo);
    if (!match || Buffer.from(match[2], "base64").byteLength > 350_000) {
      throw new ShopSettingsInputError("Bitte ein PNG/JPEG-Logo mit höchstens 350 KB hochladen.");
    }
  }

  let bankDetailsCiphertext: string | null | undefined;
  const bankName = input.bankName.trim();
  const ibanInput = input.iban.trim();
  const bic = input.bic.trim().toUpperCase();
  if (input.clearBankDetails) {
    bankDetailsCiphertext = null;
  } else if (bankName || ibanInput || bic) {
    if (bankName.length > 120 || (bic && !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(bic))) {
      throw new ShopSettingsInputError("Bankname oder BIC ist ungültig.");
    }
    bankDetailsCiphertext = encryptBankDetails({
      bankName,
      iban: normalizeIban(ibanInput),
      bic,
    });
  }

  const data = {
    businessName,
    primaryColor: input.primaryColor.toUpperCase(),
    accentColor: input.accentColor.toUpperCase(),
    fontStyle: input.fontStyle,
    tone,
    greeting,
    ...(bankDetailsCiphertext !== undefined ? { bankDetailsCiphertext } : {}),
  };
  const existing = await db.shopSettings.findUnique({
    where: { shop },
    select: { invoiceLogoBase64: true },
  });
  const invoiceLogoBase64 = logo || (input.clearLogo ? null : existing?.invoiceLogoBase64 || null);
  await db.shopSettings.upsert({
    where: { shop },
    update: { ...data, invoiceLogoBase64 },
    create: { shop, ...data, invoiceLogoBase64 },
  });
  return { ok: true as const, message: "Brand-Einstellungen shopbezogen gespeichert." };
}
