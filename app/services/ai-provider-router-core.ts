const PII_REPLACEMENT = "[DATENSCHUTZ-REDAKTIERT]";

export function isFreeOpenRouterModel(model: string): boolean {
  return model === "openrouter/free" || /^[a-z0-9._-]+\/[a-z0-9._-]+:free$/.test(model);
}

export const ZERO_PRICE_PROVIDER = {
  max_price: { prompt: "0", completion: "0", request: "0", image: "0", audio: "0" },
} as const;

export function maskPiiForExternalModel(input: string): string {
  return input
    .replace(/("(?:fullName|firstName|lastName|customerName|email|phone|telephone|address|street|postalCode|zipCode|iban)"\s*:\s*")[^"]*(")/gi, `$1${PII_REPLACEMENT}$2`)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, PII_REPLACEMENT)
    .replace(/\b[A-Z]{2}\d{2}(?:[\s-]?[A-Z0-9]){11,30}\b/gi, PII_REPLACEMENT)
    .replace(/(?<!\w)(?:\+|00)\d[\d\s()./-]{7,18}(?!\w)/g, PII_REPLACEMENT)
    .replace(/\b(?:Bearer\s+)[A-Za-z0-9._~+/-]{12,}={0,2}/gi, `Bearer ${PII_REPLACEMENT}`)
    .replace(/\b(?:api[_ -]?key|client[_ -]?secret|access[_ -]?token|refresh[_ -]?token|password|passwort|secret|token)\s*[:=]\s*["']?[^"'`\s,;]{8,}["']?/gi, PII_REPLACEMENT)
    .replace(/(?:kunde|customer|empfänger|recipient|name|telefon|phone|adresse|address)\s*:\s*[^\r\n;]{2,120}/gi, PII_REPLACEMENT);
}

export function splitConfiguredList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
