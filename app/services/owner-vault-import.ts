export class VaultImportError extends Error {}

export function parseVaultEnv(input: string): Array<{ label: string; secret: string }> {
  if (new TextEncoder().encode(input).length > 262_144) throw new VaultImportError("Import ist größer als 256 KiB.");
  const entries: Array<{ label: string; secret: string }> = [];
  const labels = new Set<string>();
  const lines = input.split(/\r?\n/);
  for (const [index, raw] of lines.entries()) {
    const line = raw.trimStart();
    if (!line.trim() || line.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]{0,59})=(.*)$/.exec(line);
    if (!match) throw new VaultImportError(`Ungültige KEY=VALUE-Zeile ${index + 1}.`);
    const [, label, value] = match;
    const normalized = label.toLowerCase();
    if (labels.has(normalized)) throw new VaultImportError(`Doppelte Bezeichnung in Zeile ${index + 1}.`);
    labels.add(normalized);
    let secret = value;
    if (value.startsWith('"') || value.startsWith("'")) {
      if (value.length < 2 || value.at(-1) !== value[0]) throw new VaultImportError(`Nicht geschlossener Wert in Zeile ${index + 1}.`);
      secret = value.slice(1, -1);
    }
    if (!secret) throw new VaultImportError(`Leerer Wert in Zeile ${index + 1}.`);
    entries.push({ label, secret });
    if (entries.length > 100) throw new VaultImportError("Höchstens 100 Einträge pro Import.");
  }
  if (!entries.length) throw new VaultImportError("Keine Einträge zum Import gefunden.");
  return entries;
}
