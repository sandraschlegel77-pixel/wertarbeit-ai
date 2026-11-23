import type { MonitorData } from "../../services/monitor-data.server";
import { card, eur } from "./style";

/** Verdienst-Übersicht (Heute/Monat/Gesamt) + Status. „Echt“ und „Potenzial“ getrennt. */
export function Overview({ m }: { m: MonitorData }) {
  const cols = [
    ["Heute", m.real.day],
    ["Monat", m.real.month],
    ["Gesamt", m.real.total],
  ] as const;
  const stat = (label: string, value: string, color = "#E2E8F0") => (
    <div key={label}>
      <div style={{ fontSize: 11, color: "#94A3B8" }}>{label}</div>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
  return (
    <>
      <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: "#F7E7CE" }}>AtelierPilot AI</div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>{m.shop}</div>
        </div>
        {m.owner && (
          <span style={{ color: "#D4AF37", border: "1px solid #D4AF37", borderRadius: 999, padding: "2px 10px", fontSize: 11 }}>
            OWNER UNLIMITED 0,00 €
          </span>
        )}
      </header>

      <section style={{ ...card, display: "grid", gap: 6 }} aria-label="Verdienst">
        <div style={{ fontSize: 12, color: "#94A3B8" }}>Verdient (echt)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, textAlign: "center" }}>
          {cols.map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981" }}>{eur(v)}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#F59E0B" }}>
          Potenzial (Dry-Run, nicht verdient): Heute {eur(m.potential.day)} · Monat {eur(m.potential.month)} · Gesamt{" "}
          {eur(m.potential.total)}
        </div>
      </section>

      <section style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} aria-label="Status">
        {stat("Belegschaft", `${m.stammCount} + ${m.staffExtra} KI`)}
        {stat("Harmonie", `${m.harmony.harmony.toFixed(1).replace(".", ",")} %`, "#10B981")}
        {stat("Modus", m.dryRun ? "DRY_RUN (geschützt)" : "LIVE", m.dryRun ? "#F59E0B" : "#10B981")}
        {stat("Offene Freigaben", String(m.approvals.length))}
      </section>
    </>
  );
}
