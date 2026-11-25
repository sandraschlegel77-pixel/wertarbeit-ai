const CREDENTIAL_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._~+/-]{12,}={0,2}/gi,
  /\b(?:api[_ -]?key|client[_ -]?secret|access[_ -]?token|refresh[_ -]?token|password|passwort|secret|token)\s*[:=]\s*["']?[^"'`\s,;]{8,}["']?/gi,
  /\b(?:sk_live_|sk_test_|ghp_|github_pat_|AKIA)[A-Za-z0-9_-]{12,}\b/gi,
];

export function redactCredentialsFromText(input: string): { text: string; redacted: boolean } {
  let text = input;
  let redacted = false;
  for (const pattern of CREDENTIAL_PATTERNS) {
    text = text.replace(pattern, () => {
      redacted = true;
      return "[ZUGANGSDATEN ENTFERNT]";
    });
  }
  return { text, redacted };
}

export function normalizeMarketplaceWishKey(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
