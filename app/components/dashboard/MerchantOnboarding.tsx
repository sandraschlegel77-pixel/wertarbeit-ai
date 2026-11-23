import { useState } from "react";
import { useFetcher } from "react-router";
import { ALL_IN_ONE_PRICE, BUILDING_MODULES, formatEur } from "../../services/pricing";
import type { InventoryValue } from "../../services/agent-types";
import { C, btn, btnGold, card, input } from "./theme";

interface Props {
  owner: boolean;
  inventory: InventoryValue;
  inventoryIsLive: boolean;
  onClose?: () => void;
}

export function MerchantOnboarding({ owner, inventory, inventoryIsLive, onClose }: Props) {
  const fetcher = useFetcher<{ ok: boolean; message: string }>();
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("jewelry");
  const [tone, setTone] = useState("warm");
  const [plan, setPlan] = useState("free_audit");
  const [starterTeam, setStarterTeam] = useState("catalog_finance_ops");

  return (
    <section style={{ ...card, borderColor: C.gold, display: "grid", gap: 14, maxWidth: 760, margin: "24px auto" }}>
      <header>
        <div style={{ color: C.champagne, fontSize: 20, fontWeight: 800 }}>AtelierPilot Schnellstart</div>
        <div style={{ color: C.muted, fontSize: 13 }}>Schritt {step + 1} von 3 · Setup ohne Live-Shopänderung</div>
      </header>
      <fetcher.Form method="post" style={{ display: "grid", gap: 14 }}>
        <input type="hidden" name="type" value="complete_onboarding" />
        <input type="hidden" name="industry" value={industry} />
        <input type="hidden" name="tone" value={tone} />
        <input type="hidden" name="plan" value={plan} />
        <input type="hidden" name="starterTeam" value={starterTeam} />

        {step === 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Branche
              <select value={industry} onChange={(event) => setIndustry(event.target.value)} style={input}>
                <option value="jewelry">Schmuck, Edelsteine & Manufaktur</option>
                <option value="craft">Handwerk & Atelierbedarf</option>
                <option value="other">Andere Branche</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Marken-Ton
              <select value={tone} onChange={(event) => setTone(event.target.value)} style={input}>
                <option value="warm">Herzlich & handwerklich</option>
                <option value="minimal">Klar & minimal</option>
                <option value="professional">Sachlich & professionell</option>
              </select>
            </label>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              3er-Starter-Team
              <select value={starterTeam} onChange={(event) => setStarterTeam(event.target.value)} style={input}>
                <option value="catalog_finance_ops">Produkt, Finanzen & Betrieb (A158–A160)</option>
                <option value="catalog_growth_support">Produkt, Wachstum & Support (A158, A161, A160)</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Preismodell (Auswahl löst keine Buchung aus)
              <select value={plan} onChange={(event) => setPlan(event.target.value)} style={input}>
                <option value="free_audit">Core / Free Audit · 0,00 €</option>
                <option value="m1">{BUILDING_MODULES[0].short} · {formatEur(BUILDING_MODULES[0].priceEur)} / Monat</option>
                <option value="m2">{BUILDING_MODULES[1].short} · {formatEur(BUILDING_MODULES[1].priceEur)} / Monat</option>
                <option value="all_in_one">All-in-One · {formatEur(ALL_IN_ONE_PRICE)} / Monat</option>
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "grid", gap: 8, lineHeight: 1.5 }}>
            <strong style={{ color: C.champagne }}>Sicherer Testlauf</strong>
            <p style={{ margin: 0 }}>
              Der Abschluss speichert nur Ihre Setup-Auswahl, aktiviert bei Neukunden den Dry-Run und schreibt einen
              internen Prüfprotokoll-Eintrag. Er führt keine Shopify-Änderung aus und startet kein kostenpflichtiges Abo.
            </p>
            <div style={{ border: `1px solid ${inventoryIsLive ? C.emerald : C.amber}`, borderRadius: 10, padding: 10 }}>
              <strong style={{ color: inventoryIsLive ? C.emerald : C.amber }}>Live-Shop-Schnellcheck</strong>
              {inventoryIsLive ? (
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {inventory.items} lagernde Einheiten · geschätzter Bestandsgewinn {formatEur(inventory.expectedNetProfit)}.
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
                    Bestandsrechnung aus verfügbaren Shop-Preisen und Einstandskosten; 19%-MwSt.-Annahme, keine Umsatz- oder Gewinnprognose.
                  </div>
                </div>
              ) : (
                <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
                  Für diesen Scan konnten keine lagernden Einheiten bestätigt werden. Demo-Werte werden nicht als Live-Shop-Daten angezeigt.
                </div>
              )}
            </div>
            {fetcher.data?.message && <div role="status">{fetcher.data.message}</div>}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {step > 0 && <button type="button" style={btn} onClick={() => setStep((value) => value - 1)}>Zurück</button>}
          {step < 2 && <button type="button" style={btnGold} onClick={() => setStep((value) => value + 1)}>Weiter</button>}
          {step === 2 && <button type="submit" style={btnGold} disabled={fetcher.state !== "idle"}>Sicheren Testlauf abschließen</button>}
          {owner && onClose && <button type="button" style={btn} onClick={onClose}>Schließen</button>}
        </div>
      </fetcher.Form>
    </section>
  );
}
