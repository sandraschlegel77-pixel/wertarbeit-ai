import { memo } from "react";
import { useFetcher } from "react-router";
import type { AgentDef, AgentPerformanceSummary, EarningsRow } from "../../services/agent-types";
import { InfoPop } from "./InfoPop";
import { C, badge, btnGold, card, eur } from "./theme";

const SEAL: Record<string, string> = {
  LEGAL: "LEGAL_VERIFIED_3X",
  FINANCE: "FINANCE_VERIFIED_3X",
  CRAFT: "CRAFT_VERIFIED_3X",
};

interface Props {
  agent: AgentDef;
  earn: EarningsRow | undefined;
  team: EarningsRow | undefined;
  audit: string | undefined;
  performance: AgentPerformanceSummary | undefined;
}

/** Eine Mitarbeiter-Karte: Verdienst (Monat/Gesamt), 3×-Prüfsiegel, i-Info, Sofort-Start. */
export const AgentCard = memo(function AgentCard({ agent, earn, team, audit, performance }: Props) {
  const fetcher = useFetcher<{ ok?: boolean; message?: string; mode?: string }>();
  const busy = fetcher.state !== "idle";
  const e = earn ?? { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 };
  const sealColor = audit === "VERIFIED_3X" ? C.emerald : audit === "BLOCKED" ? C.red : audit ? C.amber : C.muted;
  const sealText = agent.auditDomain
    ? audit === "VERIFIED_3X"
      ? `${SEAL[agent.auditDomain]} ✓`
      : audit
        ? audit === "BLOCKED" ? "Prüfung: BLOCKIERT" : "Prüfung: Freigabe nötig"
        : "3×-Prüfung bereit"
    : "Sync: bereit";
  const trendLabel = performance?.trend === "UP"
    ? "▲"
    : performance?.trend === "DOWN"
      ? "▼"
      : performance?.trend === "STABLE"
        ? "►"
        : "—";
  const academyLabel = !performance
    ? "Akademie · Metriken nicht verfügbar"
    : performance.academyStatus === "CERTIFIED"
      ? "Akademie · interne Statusstufe bestätigt"
      : performance.academyStatus === "RETRAINING"
        ? "Akademie · Nachschulung empfohlen"
        : "Akademie · Lernphase / Datenbasis zu klein";

  return (
    <div style={{ ...card, padding: 12, display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "center" }}>
        <strong style={{ color: C.champagne, fontSize: 13 }}>
          #{agent.number} {agent.name}
        </strong>
        <InfoPop title={`#${agent.number} ${agent.name}`}>
          <div>{agent.mission}</div>
          <div style={{ marginTop: 4 }}>Ebene {agent.level} · Abt. {agent.departmentId} · {agent.role}</div>
          <div style={{ marginTop: 4 }}>Verdienst-Mechanismus: {agent.revenueMechanism}</div>
          <div style={{ marginTop: 4 }}>Sidekick-Tool: {agent.tool.category}/{agent.tool.action}</div>
          <div style={{ marginTop: 4 }}>Kosten externer KI-, Hosting- und Plattformdienste hängen von Konfiguration und Anbieter ab.</div>
          <div style={{ marginTop: 4 }}>
            Note {performance?.grade === null || performance?.grade === undefined ? "nicht verfügbar" : performance.grade.toFixed(1).replace(".", ",")}
            {" "}{trendLabel} · {performance ? `${performance.sampleSize} Messereignisse` : "Metriken nicht verfügbar"}
          </div>
          <div style={{ marginTop: 4 }}>Karriere: {performance?.careerRank ?? "Metriken nicht verfügbar"} · {performance?.xp ?? "—"} XP</div>
          <div style={{ marginTop: 4 }}>{academyLabel}</div>
          <div style={{ marginTop: 4, color: C.muted }}>
            Note: gleich gewichteter Mittelwert verfügbarer Dimensionswerte (Freigabequote, mittlerer Evolutions-Score, positives/negatives Netto aus echten Verdienstbuchungen), auf 1,0–6,0 abgebildet. Ohne Ereignisse keine Note. Tendenz vergleicht 30 Tage mit den vorherigen 30 Tagen (±0,05); Approval-Status nutzt mangels Auflösungszeitpunkt das Erstellungsdatum.
          </div>
          <div style={{ marginTop: 4, color: C.muted }}>
            XP: Freigabe +25, Ablehnung +5, Evolution +10 und echte Buchung +10. Ränge: 0/100/250/500/1.000/2.000 XP. Interner Akademie-Status: zertifiziert ab 10 Ereignissen und Note ≤2,0; Nachschulung ab 5 Ereignissen und Note ≥3,5. Keine Personal-, Rechts- oder Fachzertifizierung.
          </div>
          {agent.advisoryOnly && <div style={{ marginTop: 4, color: C.amber }}>Rollenprofil ohne eigene Fachlogik; derzeit nicht ausführbar.</div>}
        </InfoPop>
      </div>

      <div style={{ fontSize: 12, color: C.muted }}>{agent.mission}</div>

      <div style={{ fontSize: 13 }}>
        Verdient (Monat): <strong style={{ color: C.emerald }}>{eur(e.monthReal)}</strong>
      </div>
      <div style={{ fontSize: 13 }}>
        Verdient (Gesamt): <strong style={{ color: C.emerald }}>{eur(e.totalReal)}</strong>
      </div>
      {(e.totalPotential > 0 || e.monthPotential > 0) && (
        <div style={{ fontSize: 11, color: C.amber }}>
          Potenzial (Dry-Run): Monat {eur(e.monthPotential)} · Gesamt {eur(e.totalPotential)}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, fontSize: 12 }}>
        <span style={badge(performance?.grade === null || performance?.grade === undefined ? C.muted : performance.grade <= 2 ? C.emerald : performance.grade >= 3.5 ? C.red : C.amber)}>
          Note {performance?.grade === null || performance?.grade === undefined ? "—" : performance.grade.toFixed(1).replace(".", ",")}
        </span>
        <span aria-label={performance?.trend === "UP" ? "Tendenz steigend" : performance?.trend === "DOWN" ? "Tendenz fallend" : performance?.trend === "STABLE" ? "Tendenz stabil" : "Tendenz nicht verfügbar"}>
          {trendLabel}
        </span>
        <span style={{ color: C.muted }}>{performance?.careerRank ?? "Metriken nicht verfügbar"} · {performance?.xp ?? "—"} XP</span>
        <span style={{ color: performance?.academyStatus === "CERTIFIED" ? C.emerald : performance?.academyStatus === "RETRAINING" ? C.red : C.muted }}>
          {academyLabel}
        </span>
      </div>
      {team && team.totalReal + team.totalPotential > e.totalReal + e.totalPotential && (
        <div style={{ fontSize: 11, color: C.muted }}>
          Team: Monat {eur(team.monthReal)} · Gesamt {eur(team.totalReal)}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={badge(sealColor)}>{sealText}</span>
        {agent.advisoryOnly ? (
          <span style={badge(C.amber)}>Profil · nicht ausführbar</span>
        ) : (
          <fetcher.Form method="post">
            <input type="hidden" name="type" value="run_agent" />
            <input type="hidden" name="agent" value={agent.number} />
            <button type="submit" style={btnGold} disabled={busy}>
              {busy ? "läuft…" : "Sofort ausführen"}
            </button>
          </fetcher.Form>
        )}
      </div>
      {fetcher.data?.message && (
        <div style={{ fontSize: 11, color: fetcher.data.ok ? C.emerald : C.amber }}>{fetcher.data.message}</div>
      )}
    </div>
  );
});
