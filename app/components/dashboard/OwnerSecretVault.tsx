import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { C, btn, btnGold, card } from "./theme";

type VaultResponse = {
  ok: boolean;
  message?: string;
  action?: "save" | "delete";
  keyConfigured?: boolean;
  entries?: { id: string; label: string; createdAt: string }[];
};

export function OwnerSecretVault() {
  const listing = useFetcher<VaultResponse>();
  const mutation = useFetcher<VaultResponse>();
  const { load } = listing;
  const formRef = useRef<HTMLFormElement>(null);
  const [secret, setSecret] = useState("");

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
        Geheimnisse werden verschlüsselt gespeichert und nicht wieder angezeigt. Nur Bezeichnungen ohne Zugangsdaten eingeben.
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
          {snapshot.entries.length === 0 && <p>Keine Einträge vorhanden.</p>}
          {snapshot.entries.map((entry) => (
            <div key={entry.id} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span>{entry.label} · ••••••••</span>
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
