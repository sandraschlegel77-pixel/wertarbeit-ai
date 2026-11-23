import { useState } from "react";
import { useFetcher } from "react-router";
import { C, btn, card, input } from "./theme";

interface Props {
  demoInventory: boolean;
  taxMode: string;
  logs: { id: string; action: string; status: string; detail: string | null; canUndo: boolean }[];
  onboardingDone: boolean;
}

/** Tab 1 (Zusatz): 30-Sek.-Sofort-Audit, 1-Klick-Demo-Modus, Steuer-Modus, Live-Protokoll. */
export function OverviewExtras({ demoInventory, taxMode, logs, onboardingDone }: Props) {
  const tax = useFetcher();
  const undo = useFetcher<{ ok: boolean; message: string }>();
  const [step, setStep] = useState(0);
  const steps = [
    "1. Shop wird gelesen (Produkte, Bestände, Preise).",
    "2. KI-Audit prüft Texte, Bilder, Rechtstexte und Startseite.",
    "3. Ergebnis: Verbesserungsliste mit 1-Klick-Freigabe.",
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...card, display: "grid", gap: 8 }}>
        <strong style={{ color: C.champagne }}>30-Sekunden-Sofort-Audit</strong>
        <div style={{ fontSize: 13 }}>{steps[step]}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={btn} onClick={() => setStep((s) => (s + 1) % steps.length)}>
            Weiter (Schritt {step + 1}/3)
          </button>
          <span style={{ ...btn, cursor: "default" }}>
            Datenquelle: {demoInventory ? "Demo-Bestand" : "Live-Shop-Bestand"}
          </span>
        </div>
        {!onboardingDone && (
          <div style={{ fontSize: 12, color: C.muted }}>
            Ohne API-Schlüssel läuft sofort die lokale Haus-KI – kein Fehler, alle Funktionen testbar.
          </div>
        )}
      </div>

      <div style={{ ...card, display: "grid", gap: 8 }}>
        <strong style={{ color: C.champagne }}>Steuer-Modus</strong>
        <tax.Form method="post" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="type" value="toggle_tax" />
          <select name="taxMode" defaultValue={taxMode} style={input} aria-label="Steuer-Modus">
            <option value="mwst">MwSt. (Regelbesteuerung)</option>
            <option value="kleinunternehmer">Kleinunternehmer § 19 UStG</option>
          </select>
          <button type="submit" style={btn}>Speichern</button>
        </tax.Form>
        <div style={{ fontSize: 12, color: C.muted }}>
          Warnung statt Blockieren: Aktionen lassen sich per „Trotzdem ausführen“ bestätigen und mit 1-Klick-Rückgängig widerrufen.
        </div>
      </div>

      <div style={card}>
        <strong style={{ color: C.champagne }}>Live-Protokoll</strong>
        {logs.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Noch keine Einträge.</div>}
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12 }}>
          {logs.map((l) => (
            <li key={l.id}>
              {l.action} — {l.status}
              {l.detail ? ` (${l.detail})` : ""}
              {l.canUndo && (
                <undo.Form method="post" style={{ display: "inline", marginLeft: 8 }}>
                  <input type="hidden" name="type" value="undo_action" />
                  <input type="hidden" name="id" value={l.id} />
                  <button type="submit" style={btn}>Rückgängig</button>
                </undo.Form>
              )}
            </li>
          ))}
        </ul>
        {undo.data?.message && <div role="status" style={{ fontSize: 12, color: undo.data.ok ? C.emerald : C.amber }}>{undo.data.message}</div>}
        <div style={{ fontSize: 11, color: C.muted }}>Undo ist nur für interne, erfolgreiche Bestell-Sync-Protokolle freigegeben; externe Shopify-Änderungen werden nicht automatisch zurückgesetzt.</div>
      </div>
    </div>
  );
}
