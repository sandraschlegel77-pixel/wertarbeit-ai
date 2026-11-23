import { useMemo, useState } from "react";
import { useFetcher } from "react-router";
import { BUILDING_MODULES, ALL_IN_ONE_PRICE, calcQuote } from "../../services/pricing";
import { InfoPop } from "./InfoPop";
import { C, badge, btn, btnGold, card, eur, grid } from "./theme";

/** Live-Baukasten-Preisrechner inkl. 1-Klick-Aktivierung (Shopify Billing API). */
export function PriceConfigurator({
  isOwner,
  selectedModules,
  onSelectedModulesChange,
}: {
  isOwner: boolean;
  selectedModules: string[];
  onSelectedModulesChange: (modules: string[]) => void;
}) {
  const fetcher = useFetcher<{ ok?: boolean; confirmationUrl?: string; message?: string }>();
  const [yearly, setYearly] = useState(false);
  const quote = useMemo(
    () => calcQuote(selectedModules, yearly, isOwner),
    [selectedModules, yearly, isOwner]
  );

  const toggle = (id: string) =>
    onSelectedModulesChange(
      selectedModules.includes(id)
        ? selectedModules.filter((x) => x !== id)
        : [...selectedModules, id]
    );
  const selectAll = () => onSelectedModulesChange(BUILDING_MODULES.map((m) => m.id));

  const confirmUrl = fetcher.data?.confirmationUrl;

  return (
    <div id="price-configurator" style={{ ...card, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <strong style={{ color: C.champagne }}>Live-Baukasten-Preisrechner</strong>
        <span style={badge(C.emerald)}>
          {isOwner ? "Für wertarbeitmanufaktur.myshopify.com: 0,00 € OWNER UNLIMITED" : "14 Tage kostenlos testen"}
        </span>
      </div>

      <div style={{ ...card, padding: 10, borderColor: C.gold }}>
        <strong>Core-Prozessor</strong> – Basis-App + 30-Sek.-Audit + 10 Gratis-Listings/Monat:{" "}
        <span style={{ color: C.gold }}>0,00 € / Monat</span>
      </div>

      <div style={grid(260)}>
        {BUILDING_MODULES.map((m, i) => {
          const on = selectedModules.includes(m.id);
          return (
            <label
              key={m.id}
              style={{ ...card, padding: 10, cursor: "pointer", borderColor: on ? C.gold : C.line, display: "grid", gap: 4 }}
            >
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span>
                  <input type="checkbox" checked={on} onChange={() => toggle(m.id)} /> <strong>Modul {i + 1}</strong>
                </span>
                <InfoPop title={m.label}>
                  <div>{m.description}</div>
                  <div style={{ marginTop: 6, color: C.champagne }}>Ersparnis: {m.savingsPerMonth}</div>
                  <div style={{ marginTop: 6 }}>Preis: <strong>{eur(m.priceEur)}</strong> / Monat</div>
                </InfoPop>
              </span>
              <span style={{ fontSize: 12, color: C.muted }}>{m.short}</span>
              <span style={{ color: C.gold, fontWeight: 700 }}>{eur(m.priceEur)} / Monat</span>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" style={yearly ? btn : btnGold} onClick={() => setYearly(false)}>Monatlich</button>
        <button type="button" style={yearly ? btnGold : btn} onClick={() => setYearly(true)}>Jährlich (2 Monate gratis)</button>
        <button type="button" style={btn} onClick={selectAll}>
          All-in-One wählen ({eur(ALL_IN_ONE_PRICE)}, statt 134,40 € – 40 % Ersparnis)
        </button>
        <button type="button" style={btn} onClick={() => onSelectedModulesChange([])}>Zurücksetzen</button>
      </div>

      <div style={{ ...card, padding: 12, display: "grid", gap: 4 }} aria-live="polite">
        <div>Gewählt: <strong>{quote.count}</strong> Modul(e) · Listenpreis {eur(quote.listSum)}</div>
        {quote.discountPercent > 0 && <div style={{ color: C.emerald }}>Bündel-Rabatt: −{quote.discountPercent} %</div>}
        <div style={{ fontSize: 20, color: C.gold, fontWeight: 800 }}>
          {yearly ? `${eur(quote.yearlyTotal)} / Jahr` : `${eur(quote.monthly)} / Monat`}
        </div>
        {quote.hint && <div style={{ color: C.champagne, fontSize: 13 }}>{quote.hint}</div>}
      </div>

      <fetcher.Form method="post" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input type="hidden" name="type" value="activate_plan" />
        <input type="hidden" name="modules" value={selectedModules.join(",")} />
        <input type="hidden" name="yearly" value={yearly ? "1" : "0"} />
        <button type="submit" style={btnGold} disabled={fetcher.state !== "idle" || (quote.count === 0 && !isOwner)}>
          {isOwner ? "Alle Module aktivieren (0,00 €)" : "1-Klick-Aktivierung (14 Tage gratis)"}
        </button>
        {fetcher.data?.message && <span style={{ fontSize: 13 }}>{fetcher.data.message}</span>}
        {confirmUrl && (
          <a href={confirmUrl} target="_top" style={{ color: C.gold }}>Jetzt bei Shopify bestätigen →</a>
        )}
      </fetcher.Form>
    </div>
  );
}
