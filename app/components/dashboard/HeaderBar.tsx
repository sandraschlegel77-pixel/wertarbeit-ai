import { useFetcher } from "react-router";
import { InfoPop } from "./InfoPop";
import { C, badge, btn, btnGold, card, eur, grid } from "./theme";
import type { HarmonyScore, InventoryValue, EarningsRow } from "../../services/agent-types";
import { OWNER_MODULE_IDS } from "../../services/module-access-core";

interface Props {
  shop: string;
  isOwner: boolean;
  dryRun: boolean;
  paused: boolean;
  harmony: HarmonyScore;
  army: EarningsRow;
  extraAgents: number;
  inventory: InventoryValue;
  activeModules: string[];
  apiKeysMissing: boolean;
  inventorySource: "LIVE" | "DEMO";
  snapshotAt: string;
  databaseHealth: { status: "online" | "unavailable"; latencyMs: number | null };
  serverUptimeSeconds: number | null;
  rules: { key: string; value: unknown }[];
  onQr: () => void;
  onCoinRain: () => void;
  coinSound: boolean;
  onToggleCoinSound: () => void;
  soundPreferenceMessage: string;
}

const kpi = (label: string, value: string, color: string = C.champagne) => (
  <div style={{ ...card, padding: 10 }} key={label}>
    <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
  </div>
);

export function OwnerRulesPanel({ rules }: { rules: { key: string; value: unknown }[] }) {
  const fetcher = useFetcher();

  return (
    <section aria-label="Inhaber-Regeln" style={{ ...card, padding: 12, display: "grid", gap: 8 }}>
      <strong style={{ color: C.champagne }}>OwnerRule-Manager · {rules.length} Regeln · höchste Priorität</strong>
      <fetcher.Form method="post" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <input type="hidden" name="type" value="add_rule" />
        <input name="key" placeholder="Schlüssel, z. B. veto:A44" required style={{ background: C.slate, color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 10px" }} />
        <input name="value" placeholder="Wert" required style={{ background: C.slate, color: C.text, border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 10px" }} />
        <button type="submit" style={btn}>Regel speichern</button>
      </fetcher.Form>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.muted, maxHeight: 160, overflowY: "auto" }}>
        {rules.map((r) => (
          <li key={r.key}><strong style={{ color: C.text }}>{r.key}</strong>: {String(r.value)}</li>
        ))}
      </ul>
    </section>
  );
}

/** Kopfleiste: Logo, Badges, Harmonie, Verdienst, Belegschaft, DRY_RUN, OwnerRule, QR. */
function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} Std. ${minutes} Min.` : `${minutes} Min.`;
}

export function HeaderBar({
  shop,
  isOwner,
  dryRun,
  paused,
  harmony,
  army,
  extraAgents,
  inventory,
  activeModules,
  apiKeysMissing,
  inventorySource,
  snapshotAt,
  databaseHealth,
  serverUptimeSeconds,
  rules,
  onQr,
  onCoinRain,
  coinSound,
  onToggleCoinSound,
  soundPreferenceMessage,
}: Props) {
  const dryFetcher = useFetcher();
  const pauseFetcher = useFetcher();
  const dry = dryFetcher.formData ? dryFetcher.formData.get("value") !== "false" : dryRun;
  const isPaused = pauseFetcher.formData
    ? pauseFetcher.formData.get("value") === "true"
    : paused;

  return (
    <div style={{ ...card, display: "grid", gap: 12, borderColor: C.gold }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/app-icon.svg" alt="AtelierPilot AI Logo" width={56} height={56} style={{ borderRadius: 12 }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.champagne }}>AtelierPilot AI</div>
            <div style={{ fontSize: 12, color: C.muted }}>Das autonome Familienatelier-Gehirn · Wertarbeit Manufaktur</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", fontSize: 11 }}>
          <a href="/institution/patrol-01" style={{ color: C.gold, textDecoration: "underline", whiteSpace: "nowrap", marginRight: 6 }}>PATROL-01</a>
          <a href="/institution/bureau-x" style={{ color: C.gold, textDecoration: "underline", whiteSpace: "nowrap", marginRight: 6 }}>BUREAU-X</a>
          <a href="/institution/rescue-112" style={{ color: C.gold, textDecoration: "underline", whiteSpace: "nowrap", marginRight: 6 }}>RESCUE-112</a>
          <a href="/institution/med-center" style={{ color: C.gold, textDecoration: "underline", whiteSpace: "nowrap", marginRight: 6 }}>MED-CENTER</a>
          <a href="/institution/rnd" style={{ color: C.gold, textDecoration: "underline", whiteSpace: "nowrap", marginRight: 6 }}>R&D Nischen-Labor</a>
          <span style={{ color: C.muted }}>· 28 Institutionen im Ledger</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={badge(C.emerald)}>{isOwner ? "KI-Steuerung mit Inhaber-Veto" : "Gebuchte Fachbereiche"}</span>
          {isOwner
            ? <span style={badge(C.gold)}>👑 INHABER-MODUS (OWNER UNLIMITED – 0,00 €) · {shop}</span>
            : <span style={badge(C.muted)}>session.shop · {shop}</span>}
          {inventorySource === "DEMO" && <span style={badge(C.amber)}>Demo-Bestand – keine Live-Inventardaten</span>}
          {isOwner && apiKeysMissing && <span style={badge(C.amber)}>Keine Cloud-KI-Schlüssel · lokale Regeln aktiv</span>}
          {isOwner && <span style={badge(C.emerald)}>Harmonie {harmony.harmony.toFixed(1).replace(".", ",")} %</span>}
          {isOwner && <span style={badge(C.muted)}>Interner Speed-Score {harmony.speed.toFixed(0)} %</span>}
          <button type="button" style={btn} onClick={onQr}>QR-Code · Handy-Monitor</button>
          <a href="/mobile-monitor" style={{ ...btn, textDecoration: "none" }}>/mobile-monitor</a>
          <button type="button" style={{ ...btnGold, marginLeft: 8 }} onClick={onCoinRain}>
            VERMARKTUNG &amp; SHOWREEL
            <span style={{ fontSize: 9, marginLeft: 8, opacity: 0.8 }}>
              15s Live-Tour · Branchen-Chamäleon · 60s Domain-Scanner · Pricing 299€–25.000€+ · DSGVO/EU-AI Act
            </span>
          </button>
        </div>
      </div>

      {isOwner && (
        <section aria-label="Interne Agenten-Zuordnung" style={{ display: "grid", gap: 8 }}>
          <strong style={{ color: C.champagne }}>Interne Agenten-Zuordnung · kein Shop-Guthaben und keine Auszahlung</strong>
          <div style={grid(170)}>
            {kpi("Echt zugeordnet (Monat)", eur(army.monthReal), C.emerald)}
            {kpi("Echt zugeordnet (Gesamt)", eur(army.totalReal), C.emerald)}
            {kpi("Potenzial (Monat, Dry-Run)", eur(army.monthPotential), C.amber)}
            {kpi("Potenzial (Gesamt, Dry-Run)", eur(army.totalPotential), C.amber)}
          </div>
        </section>
      )}

      <section aria-label="Shop-Bestand und Warenwert" style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
          <strong style={{ color: C.champagne }}>Shop-Bestand & geschätzte Werte</strong>
          <span style={badge(inventorySource === "LIVE" ? C.emerald : C.amber)}>
            {inventorySource === "LIVE" ? "LIVE-Daten" : "DEMO-Daten"} · Stand {snapshotAt.slice(0, 16).replace("T", " ")} UTC
          </span>
        </div>
        <div style={grid(170)}>
          {isOwner ? (
            <>
              {kpi("Freigeschaltete Module", `${activeModules.length}/${OWNER_MODULE_IDS.length}`)}
              {kpi("Rollenprofile", `332 + ${extraAgents} dynamische`)}
            </>
          ) : kpi("Gebuchte Module", String(activeModules.length))}
          {isOwner && <small style={{ color: C.muted, gridColumn: "1 / -1" }}>Stammprofile #1–#232 und #301–#400; die Agenten-Fabrik beginnt ab #401.</small>}
          {kpi("Bestandsmenge", `${inventory.items} Einheiten`)}
          {kpi("Warenwert (brutto)", eur(inventory.grossSalesValue))}
          {kpi("Verkaufswert (netto)", eur(inventory.netSalesValue))}
          {kpi("Einkaufswert", eur(inventory.purchaseValue))}
          {kpi("Geschätzter Bestandsgewinn", eur(inventory.expectedNetProfit), C.emerald)}
          {kpi("Ø Marge", `${inventory.avgMarginPercent.toFixed(1).replace(".", ",")} %`)}
        </div>
        <small style={{ color: C.muted }}>
          Werte sind Bestands-Schätzungen aus Shopify-Preis/Einstandskosten; Netto nutzt eine 19%-MwSt.-Annahme und ersetzt keine Buchhaltung oder Steuerberechnung.
        </small>
      </section>

      {isOwner && <section aria-label="Betriebsgesundheit" style={{ display: "grid", gap: 8 }}>
        <strong style={{ color: C.champagne }}>Betriebsgesundheit</strong>
        <div style={grid(170)}>
          {kpi("Datenbank-Ping", databaseHealth.latencyMs === null ? "Nicht verfügbar" : `${databaseHealth.latencyMs} ms`,
            databaseHealth.status === "online" ? C.emerald : C.red)}
          {kpi("Datenbank-Status", databaseHealth.status === "online" ? "Antwortet" : "Nicht erreichbar",
            databaseHealth.status === "online" ? C.emerald : C.red)}
          {kpi("Server-Prozess läuft seit", serverUptimeSeconds === null ? "Nicht verfügbar" : formatUptime(serverUptimeSeconds))}
          {kpi("Harmonie-Score (kein Uptime-Wert)", `${Math.round(harmony.harmony)} %`)}
        </div>
      </section>}

      {isOwner && <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <dryFetcher.Form method="post" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="hidden" name="type" value="set_dry_run" />
          <input type="hidden" name="value" value={dry ? "false" : "true"} />
          <button type="submit" style={{ ...btn, borderColor: dry ? C.amber : C.emerald }} disabled={dryFetcher.state !== "idle"}>
            DRY_RUN_MODE: {dry ? "AN (geschützt)" : "AUS (LIVE)"}
          </button>
          <InfoPop title="DRY_RUN_MODE">
            Im Dry-Run werden keine Live-Änderungen vorgenommen: Änderungen landen als Vorschau in der 1-Klick-Freigabe-Warteschlange, bis Sie live schalten.
          </InfoPop>
        </dryFetcher.Form>

        <pauseFetcher.Form method="post">
          <input type="hidden" name="type" value="set_global_pause" />
          <input type="hidden" name="value" value={isPaused ? "false" : "true"} />
          <button type="submit" style={{ ...btn, borderColor: isPaused ? C.emerald : "#EF4444", color: isPaused ? C.emerald : "#FCA5A5" }} disabled={pauseFetcher.state !== "idle"}>
            {isPaused ? "KI-Aktionen dieses Shops fortsetzen" : "ALLE KI-AKTIONEN DIESES SHOPS SOFORT PAUSIEREN"}
          </button>
        </pauseFetcher.Form>

        <button type="button" style={btnGold} onClick={onCoinRain}>Test-Münzregen</button>
        <button type="button" style={btn} onClick={onToggleCoinSound} aria-pressed={coinSound}>
          Münzton: {coinSound ? "AN" : "AUS"}
        </button>
        <span style={{ color: C.muted, fontSize: 11 }}>Dekoration only – keine echten Einnahmen oder Coins</span>
        {soundPreferenceMessage && <span role="status" style={{ color: C.amber, fontSize: 11 }}>{soundPreferenceMessage}</span>}
      </div>}

      {isOwner && <OwnerRulesPanel rules={rules} />}
    </div>
  );
}
