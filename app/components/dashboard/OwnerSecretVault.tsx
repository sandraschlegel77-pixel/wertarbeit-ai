import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { C, btn, btnGold, card } from "./theme";

type VaultResponse = {
  ok: boolean;
  message?: string;
  action?: "save" | "delete";
  keyConfigured?: boolean;
  entries?: {
    id: string; label: string; createdAt: string; provider?: string; category?: string;
    stage?: string; username?: string; url?: string; modelHint?: string; notes?: string;
    expiresAt?: string; favorite?: boolean;
  }[];
};

export function OwnerSecretVault() {
  const listing = useFetcher<VaultResponse>();
  const mutation = useFetcher<VaultResponse>();
  const { load } = listing;
  const formRef = useRef<HTMLFormElement>(null);
  const [secret, setSecret] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Alle");

  useEffect(() => {
    load("/api/owner-vault");
  }, [load]);

  useEffect(() => {
    if (mutation.data?.ok) {
      if (mutation.data.action === "save") {
        formRef.current?.reset();
        setSecret("");
      }
      load("/api/owner-vault");
    }
  }, [mutation.data, load]);

  const snapshot = listing.data;
  const busy = mutation.state !== "idle";

  return (
    <section style={{ ...card, display: "grid", gap: 12 }} aria-label="Inhaber-Passwort- und API-Tresor">
      <strong style={{ color: C.champagne }}>Inhaber-Tresor · AES-256-GCM</strong>
      <p style={{ color: C.muted, margin: 0 }}>
        Geheimnisse und zusätzliche Angaben werden verschlüsselt gespeichert; Geheimnisse werden nicht wieder angezeigt. Nur Bezeichnungen ohne Zugangsdaten eingeben.
        Die Einträge verbinden keine Dienste und ändern keine Serverkonfiguration.
      </p>
      {listing.state !== "idle" && !snapshot && <div role="status">Tresor wird geladen…</div>}
      {listing.data && !listing.data.ok && <div role="alert">{listing.data.message}</div>}
      {snapshot?.ok && !snapshot.keyConfigured && (
        <div role="alert">AETHERION_VAULT_KEY fehlt oder ist ungültig. Den dauerhaften Schlüssel sicher konfigurieren und sichern.</div>
      )}
      <mutation.Form method="post" action="/api/owner-vault" ref={formRef} style={{ display: "grid", gap: 8 }}>
        <input type="hidden" name="type" value="save" />
        <label>Bezeichnung <input name="label" required maxLength={60} autoComplete="off" /></label>
        <label>Anbieter <select name="provider" defaultValue="custom">
          <option value="custom">Sonstige</option><option value="openrouter">OpenRouter</option>
          <option value="cloudflare">Cloudflare</option><option value="groq">Groq</option>
          <option value="huggingface">Hugging Face</option>
        </select></label>
        <label>Kategorie <select name="category" defaultValue="Sichere Notizen">
          {["KI & APIs", "Beta & Experimentell", "Logins & Accounts", "Shop & Webhooks", "Sichere Notizen"].map((item) => <option key={item}>{item}</option>)}
        </select></label>
        <label>Phase <select name="stage" defaultValue="production">
          <option value="production">Produktion</option><option value="beta">Beta</option>
          <option value="experimental">Experimentell</option><option value="test">Test</option>
        </select></label>
        <label>Benutzername <input name="username" maxLength={512} autoComplete="off" /></label>
        <label>URL <input name="url" maxLength={2048} autoComplete="off" /></label>
        <label>Modell-Hinweis <input name="modelHint" maxLength={512} autoComplete="off" /></label>
        <label>Notiz <textarea name="notes" maxLength={4096} autoComplete="off" /></label>
        <label>Ablaufdatum <input name="expiresAt" type="date" /></label>
        <label><input name="favorite" type="checkbox" /> Favorit</label>
        <label>API-Key oder Passwort <input name="value" type="password" required maxLength={8192} autoComplete="new-password" value={secret} onChange={(event) => setSecret(event.target.value)} /></label>
        <button type="submit" style={btnGold} disabled={busy || !snapshot?.keyConfigured}>
          {busy && mutation.formData?.get("type") === "save" ? "Wird verschlüsselt…" : "Verschlüsselt speichern"}
        </button>
      </mutation.Form>
      {mutation.data?.message && (
        <div role={mutation.data.ok ? "status" : "alert"}>{mutation.data.message}</div>
      )}
      {snapshot?.entries && (
        <div>
          <strong>Gespeicherte Einträge (höchstens 100)</strong>
          <label> Suchen <input value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" /></label>
          <label> Filter <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            {["Alle", "Favoriten", "Beta & Experimentell", "KI & APIs", "Logins", "Ablaufend"].map((item) => <option key={item}>{item}</option>)}
          </select></label>
          {snapshot.entries.length === 0 && <p>Keine Einträge vorhanden.</p>}
          {snapshot.entries.filter((entry) => {
            const text = [entry.label, entry.provider, entry.category, entry.stage, entry.username, entry.url, entry.modelHint, entry.notes].join(" ").toLocaleLowerCase();
            if (!text.includes(query.toLocaleLowerCase())) return false;
            if (filter === "Favoriten") return entry.favorite;
            if (filter === "Beta & Experimentell") return ["beta", "experimental", "test"].includes(entry.stage ?? "");
            if (filter === "KI & APIs") return entry.category === "KI & APIs";
            if (filter === "Logins") return entry.category === "Logins & Accounts";
            if (filter === "Ablaufend") {
              if (!entry.expiresAt) return false;
              const days = (Date.parse(`${entry.expiresAt}T23:59:59Z`) - Date.now()) / 86_400_000;
              return days >= 0 && days <= 30;
            }
            return true;
          }).map((entry) => (
            <div key={entry.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span>{entry.label} · {entry.provider} · {entry.category} · {entry.stage} · ••••••••</span>
              <mutation.Form method="post" action="/api/owner-vault" onSubmit={(event) => {
                if (!window.confirm("Diesen Tresoreintrag unwiderruflich löschen?")) event.preventDefault();
              }}>
                <input type="hidden" name="type" value="delete" />
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" style={btn} disabled={busy} aria-label={`${entry.label} löschen`}>
                  {busy && mutation.formData?.get("id") === entry.id ? "Wird gelöscht…" : "Löschen"}
                </button>
              </mutation.Form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
