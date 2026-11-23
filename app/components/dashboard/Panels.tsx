import type { AgentDef, AuditDto, EarningsSummary } from "../../services/agent-types";
import { C, badge, card, eur, grid } from "./theme";

const sealOf = (s: string) =>
  s === "VERIFIED_3X" ? C.emerald : s === "BLOCKED" ? C.red : C.amber;

/** Tab 3: Top-Verdiener & Hintergrund-Geld-Armada (#46–#66 & #112–#132). */
export function TopEarners({ roster, earnings }: { roster: AgentDef[]; earnings: EarningsSummary }) {
  const ranked = roster
    .map((a) => {
      const e = earnings.perAgent[a.key];
      return { a, real: e?.totalReal ?? 0, pot: e?.totalPotential ?? 0 };
    })
    .sort((x, y) => y.real + y.pot - (x.real + x.pot))
    .slice(0, 10);
  const army = roster.filter(
    (a) => (a.number >= 46 && a.number <= 66) || (a.number >= 112 && a.number <= 132)
  );
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={card}>
        <strong style={{ color: C.champagne }}>Top-10-Verdiener</strong>
        <ol style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 13 }}>
          {ranked.map(({ a, real, pot }) => (
            <li key={a.key}>
              #{a.number} {a.name} – Echt {eur(real)} · Potenzial {eur(pot)}
            </li>
          ))}
        </ol>
      </div>
      <div style={card}>
        <strong style={{ color: C.champagne }}>Hintergrund-Geld-Armada (#46–#66 & #112–#132)</strong>
        <div style={{ ...grid(220), marginTop: 8 }}>
          {army.map((a) => {
            const e = earnings.perAgent[a.key];
            return (
              <div key={a.key} style={{ fontSize: 12, border: `1px solid ${C.line}`, borderRadius: 8, padding: 8 }}>
                <strong>#{a.number}</strong> {a.name}
                <div>Verdient (Monat): {eur(e?.monthReal ?? 0)}</div>
                <div>Verdient (Gesamt): {eur(e?.totalReal ?? 0)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Tab 4: 3×-Prüfgremien (Recht #162–#171, Steuer #172–#176, Werkstatt #177–#180). */
export function AuditPanels({ audits, harmonyText }: { audits: AuditDto[]; harmonyText: string }) {
  const panels = [
    { t: "KI-Justiziariat (Recht)", r: "#162–#171", s: "LEGAL_VERIFIED_3X", d: "LEGAL" },
    { t: "Steuer- & Prüfungs-Kammer", r: "#172–#176", s: "FINANCE_VERIFIED_3X", d: "FINANCE" },
    { t: "Meisterwerkstatt-Abnahme", r: "#177–#180", s: "CRAFT_VERIFIED_3X", d: "CRAFT" },
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={grid(260)}>
        {panels.map((p) => {
          const rows = audits.filter((a) => a.auditDomain === p.d);
          const ok = rows.filter((a) => a.finalStatus === "VERIFIED_3X").length;
          return (
            <div key={p.d} style={card}>
              <strong style={{ color: C.champagne }}>{p.t}</strong>
              <div style={{ fontSize: 12, color: C.muted }}>Mitglieder {p.r} · Siegel {p.s}</div>
              <div style={{ marginTop: 6 }}>{ok} von {rows.length} Läufen bestanden</div>
            </div>
          );
        })}
      </div>
      <div style={card}>
        <strong style={{ color: C.champagne }}>System-Harmonie</strong>
        <div style={{ fontSize: 13 }}>{harmonyText}</div>
      </div>
      <div style={card}>
        <strong style={{ color: C.champagne }}>Letzte Prüfläufe</strong>
        {audits.length === 0 && (
          <div style={{ fontSize: 12, color: C.muted }}>
            Noch keine Prüfläufe – starten Sie einen Mitarbeiter aus Abt. 5, 6, 9 oder 12–19.
          </div>
        )}
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "grid", gap: 6 }}>
          {audits.map((a) => (
            <li key={a.id} style={{ fontSize: 12 }}>
              <span style={badge(sealOf(a.finalStatus))}>{a.finalStatus}</span> {a.auditDomain} ·{" "}
              {a.sourceAgentKey} → {a.pass1AuditorKey}/{a.pass2AuditorKey} → {a.chiefAuditorKey} ·{" "}
              {a.findingsSummary}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
