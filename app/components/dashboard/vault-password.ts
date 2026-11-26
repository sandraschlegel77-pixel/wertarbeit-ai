const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%&()*+,-./:;<=>?@[]^_{}~";

export function generateVaultPassword(length: number): string {
  if (!Number.isInteger(length) || length < 16 || length > 48) throw new RangeError("Passwortlänge muss zwischen 16 und 48 Zeichen liegen.");
  const limit = 256 - (256 % CHARACTERS.length);
  let result = "";
  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length - result.length));
    for (const byte of bytes) {
      if (byte < limit) result += CHARACTERS[byte % CHARACTERS.length];
    }
  }
  return result;
}

export function vaultPasswordStrength(value: string): "schwach" | "mittel" | "stark" {
  const groups = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((pattern) => pattern.test(value)).length;
  if (value.length >= 16 && groups === 4) return "stark";
  if (value.length >= 12 && groups >= 3) return "mittel";
  return "schwach";
}
