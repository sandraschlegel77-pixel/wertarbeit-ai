import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { C, btn, btnGold, card } from "./theme";
import { generateVaultPassword, vaultPasswordStrength } from "./vault-password";
import { parseVaultEnv, VaultImportError } from "../../services/owner-vault-import";

type VaultResponse = {
  ok: boolean;
  message?: string;
  action?: "unlock" | "lock" | "ping" | "list" | "save" | "delete" | "reveal" | "bulk_import";
  locked?: boolean;
  token?: string;
  marker?: string;
  id?: string;
  secret?: string;
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
  const authentication = useFetcher<VaultResponse>();
  const reveal = useFetcher<VaultResponse>();
  const heartbeat = useFetcher<VaultResponse>();
  const { submit: listSubmit } = listing;
  const { submit: heartbeatSubmit } = heartbeat;
  const { submit: mutationSubmit } = mutation;
  const formRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const [secret, setSecret] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [token, setToken] = useState<string | null>(null);
  const [listingMarker, setListingMarker] = useState("");
  const [shown, setShown] = useState<{ id: string; value: string } | null>(null);
  const [copySeconds, setCopySeconds] = useState(0);
  const [copyMessage, setCopyMessage] = useState("");
  const [passwordLength, setPasswordLength] = useState(24);
  const [generatorError, setGeneratorError] = useState("");
  const [importText, setImportText] = useState("");
  const [preview, setPreview] = useState<string[] | null>(null);
  const [importError, setImportError] = useState("");
  const copied = useRef<{ value: string; deadline: number } | null>(null);
  const revealToken = useRef<string | null>(null);
  const unlockCounter = useRef(0);
  const copyActive = copySeconds > 0;

  useEffect(() => {
    if (authentication.data?.ok && authentication.data.action === "unlock" && authentication.data.token) {
      passwordFormRef.current?.reset();
      unlockCounter.current++;
      setListingMarker(String(unlockCounter.current));
      setToken(authentication.data.token);
    }
  }, [authentication.data]);

  useEffect(() => {
    if (token && listingMarker) listSubmit({ type: "list", token, marker: listingMarker }, { method: "post", action: "/api/owner-vault" });
  }, [token, listingMarker, listSubmit]);

  useEffect(() => {
    if (token && mutation.data?.ok && (mutation.data.action === "save" || mutation.data.action === "delete" || mutation.data.action === "bulk_import")) {
      if (mutation.data.action === "save") {
        formRef.current?.reset();
        setSecret("");
      }
      if (mutation.data.action === "bulk_import") { setImportText(""); setPreview(null); }
      listSubmit({ type: "list", token, marker: listingMarker }, { method: "post", action: "/api/owner-vault" });
    }
  }, [mutation.data, token, listingMarker, listSubmit]);

  useEffect(() => {
    if (token && revealToken.current === token && reveal.data?.ok && reveal.data.action === "reveal" && reveal.data.id && reveal.data.secret !== undefined) {
      setShown({ id: reveal.data.id, value: reveal.data.secret });
      revealToken.current = null;
      reveal.submit({ type: "ping", token }, { method: "post", action: "/api/owner-vault" });
    }
  }, [reveal, reveal.data, token]);

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(null), 60_000);
    return () => window.clearTimeout(timer);
  }, [shown]);

  useEffect(() => {
    if (!token) return;
    let lastPing = Date.now();
    let timer: number;
    const lock = () => {
      mutationSubmit({ type: "lock", token }, { method: "post", action: "/api/owner-vault" });
      setToken(null);
      setShown(null);
      setSecret("");
      setImportText("");
      setPreview(null);
      revealToken.current = null;
    };
    const activity = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(lock, 15 * 60_000);
      if (Date.now() - lastPing >= 60_000) {
        lastPing = Date.now();
        heartbeatSubmit({ type: "ping", token }, { method: "post", action: "/api/owner-vault" });
      }
    };
    activity();
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [token, heartbeatSubmit, mutationSubmit]);

  useEffect(() => {
    if (listing.data?.locked) { setToken(null); setShown(null); setSecret(""); setImportText(""); setPreview(null); }
  }, [listing.data]);
  useEffect(() => {
    if (mutation.data?.locked) { setToken(null); setShown(null); setSecret(""); setImportText(""); setPreview(null); }
  }, [mutation.data]);
  useEffect(() => {
    if (reveal.data?.locked) { setToken(null); setShown(null); setSecret(""); setImportText(""); setPreview(null); }
  }, [reveal.data]);
  useEffect(() => {
    if (heartbeat.data?.locked) { setToken(null); setShown(null); setSecret(""); setImportText(""); setPreview(null); }
  }, [heartbeat.data]);

  useEffect(() => {
    if (!copyActive) return;
    const timer = window.setInterval(() => {
      const currentCopy = copied.current;
      if (!currentCopy) { setCopySeconds(0); return; }
      const remaining = Math.ceil((currentCopy.deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        copied.current = null;
        void navigator.clipboard.readText().then((current) => {
          if (current === currentCopy.value && !copied.current) return navigator.clipboard.writeText("");
        }).catch(() => setCopyMessage("Zwischenablage konnte nicht automatisch geleert werden."));
        setCopySeconds(0);
      } else {
        setCopySeconds(remaining);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [copyActive]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied.current = { value, deadline: Date.now() + 30_000 };
      setCopySeconds(30);
      setCopyMessage("Kopiert. Automatisches Leeren wird nach 30 Sekunden versucht.");
    } catch {
      setCopyMessage("Kopieren nicht möglich. Browserberechtigung prüfen.");
    }
  }

  const snapshot = listing.data?.marker === listingMarker ? listing.data : undefined;
  const busy = mutation.state !== "idle";

  return (
    <section style={{ ...card, display: "grid", gap: 12 }} aria-label="Inhaber-Passwort- und API-Tresor">
      <strong style={{ color: C.champagne }}>Inhaber-Tresor · AES-256-GCM</strong>
      <p style={{ color: C.muted, margin: 0 }}>
        Geheimnisse und zusätzliche Angaben werden verschlüsselt gespeichert. Nur Bezeichnungen ohne Zugangsdaten eingeben.
        Die Einträge verbinden keine Dienste und ändern keine Serverkonfiguration.
      </p>
      {!token && <authentication.Form method="post" action="/api/owner-vault" ref={passwordFormRef}>
        <input type="hidden" name="type" value="unlock" />
        <label>General-Passwort <input type="password" name="password" required maxLength={1024} autoComplete="off" /></label>
        <button type="submit" style={btnGold} disabled={authentication.state !== "idle"}>Tresor entsperren</button>
      </authentication.Form>}
      {!token && authentication.data?.message && <div role="alert">{authentication.data.message}</div>}
      {token && <button type="button" style={btn} onClick={() => {
        mutationSubmit({ type: "lock", token }, { method: "post", action: "/api/owner-vault" });
        setToken(null);
        setShown(null);
        setSecret("");
        setImportText("");
        setPreview(null);
        revealToken.current = null;
      }}>Tresor sperren</button>}
      {token && <>
      {listing.state !== "idle" && !snapshot && <div role="status">Tresor wird geladen…</div>}
      {snapshot && !snapshot.ok && <div role="alert">{snapshot.message}</div>}
      {snapshot?.ok && !snapshot.keyConfigured && (
        <div role="alert">AETHERION_VAULT_KEY fehlt oder ist ungültig. Den dauerhaften Schlüssel sicher konfigurieren und sichern.</div>
      )}
      <mutation.Form method="post" action="/api/owner-vault" ref={formRef} style={{ display: "grid", gap: 8 }}>
        <input type="hidden" name="type" value="save" />
        <input type="hidden" name="token" value={token} />
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
        <label>Generator-Länge <input type="number" min={16} max={48} value={passwordLength} onChange={(event) => setPasswordLength(Number(event.target.value))} /></label>
        <button type="button" style={btn} onClick={() => {
          try {
            setSecret(generateVaultPassword(passwordLength));
            setGeneratorError("");
          } catch {
            setGeneratorError("Passwort konnte nicht erzeugt werden. Länge und Browser-Unterstützung prüfen.");
          }
        }}>Passwort erzeugen und übernehmen</button>
        {secret && <div>Stärke-Indikator: {vaultPasswordStrength(secret)} (nur Länge und Zeichenarten)</div>}
        {generatorError && <div role="alert">{generatorError}</div>}
        <button type="submit" style={btnGold} disabled={busy || !snapshot?.keyConfigured}>
          {busy && mutation.formData?.get("type") === "save" ? "Wird verschlüsselt…" : "Verschlüsselt speichern"}
        </button>
      </mutation.Form>
      {mutation.data?.message && (
        <div role={mutation.data.ok ? "status" : "alert"}>{mutation.data.message}</div>
      )}
      <details>
        <summary>.env-Sammelimport</summary>
        <mutation.Form method="post" action="/api/owner-vault" style={{ display: "grid", gap: 8 }}>
          <input type="hidden" name="type" value="bulk_import" />
          <input type="hidden" name="token" value={token} />
          <p>Nur KEY=VALUE-Zeilen, Kommentare und Leerzeilen; keine Variablenersetzung oder Escape-Verarbeitung. Die Vorschau zeigt nur Namen.</p>
          <label>Inhalt <textarea name="input" required autoComplete="off" value={importText} onChange={(event) => {
            setImportText(event.target.value); setPreview(null); setImportError("");
          }} /></label>
          <label>Anbieter <select name="provider" defaultValue="custom">
            <option value="custom">Sonstige</option><option value="openrouter">OpenRouter</option><option value="cloudflare">Cloudflare</option>
            <option value="groq">Groq</option><option value="huggingface">Hugging Face</option>
          </select></label>
          <label>Kategorie <select name="category" defaultValue="KI & APIs">
            {["KI & APIs", "Beta & Experimentell", "Logins & Accounts", "Shop & Webhooks", "Sichere Notizen"].map((item) => <option key={item}>{item}</option>)}
          </select></label>
          <label>Phase <select name="stage" defaultValue="production">
            <option value="production">Produktion</option><option value="beta">Beta</option>
            <option value="experimental">Experimentell</option><option value="test">Test</option>
          </select></label>
          <label>Duplikate <select name="mode"><option value="skip">Überspringen</option><option value="update">Aktualisieren</option></select></label>
          <button type="button" style={btn} onClick={() => {
            try { setPreview(parseVaultEnv(importText).map((entry) => entry.label)); setImportError(""); }
            catch (error) { setPreview(null); setImportError(error instanceof VaultImportError ? error.message : "Vorschau nicht verfügbar."); }
          }}>Vorschau erstellen</button>
          {importError && <div role="alert">{importError}</div>}
          {preview && <div>{preview.length} Einträge: {preview.join(", ")}</div>}
          <button type="submit" style={btnGold} disabled={!preview || busy || !snapshot?.keyConfigured}>Verschlüsselt importieren</button>
        </mutation.Form>
      </details>
      {reveal.data && !reveal.data.ok && <div role="alert">{reveal.data.message}</div>}
      {copyMessage && <div role="status">{copyMessage} {copySeconds > 0 && `${copySeconds} s`}</div>}
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
              <span>{entry.label} · {entry.provider} · {entry.category} · {entry.stage} · {shown?.id === entry.id ? shown.value : "••••••••"}</span>
              <button type="button" style={btn} disabled={reveal.state !== "idle"} onClick={() => {
                if (shown?.id === entry.id) setShown(null);
                else {
                  revealToken.current = token;
                  reveal.submit({ type: "reveal", token, id: entry.id }, { method: "post", action: "/api/owner-vault" });
                }
              }}>{shown?.id === entry.id ? "Verbergen" : "Anzeigen"}</button>
              <button type="button" style={btn} disabled={!entry.username} onClick={() => void copy(entry.username ?? "")}>Benutzername kopieren</button>
              <button type="button" style={btn} disabled={shown?.id !== entry.id} onClick={() => {
                if (shown?.id === entry.id) void copy(shown.value);
              }}>Secret kopieren</button>
              <mutation.Form method="post" action="/api/owner-vault" onSubmit={(event) => {
                if (!window.confirm("Diesen Tresoreintrag unwiderruflich löschen?")) event.preventDefault();
              }}>
                <input type="hidden" name="type" value="delete" />
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" style={btn} disabled={busy} aria-label={`${entry.label} löschen`}>
                  {busy && mutation.formData?.get("id") === entry.id ? "Wird gelöscht…" : "Löschen"}
                </button>
              </mutation.Form>
            </div>
          ))}
        </div>
      )}
      </>}
    </section>
  );
}
