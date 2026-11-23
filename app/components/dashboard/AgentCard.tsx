import { memo } from "react";
import { useFetcher } from "react-router";
import type { AgentDef, EarningsRow } from "../../services/agent-types";
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
}

/** Eine Mitarbeiter-Karte: Verdienst (Monat/Gesamt), 3×-Prüfsiegel, i-Info, Sofort-Start. */
export const AgentCard = memo(function AgentCard({ agent, earn, team, audit }: Props) {
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
          <div style={{ marginTop: 4 }}>Kosten: 0,00 € (Haus-KI + kostenlose KI-Kontingente)</div>
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
      {team && team.totalReal + team.totalPotential > e.totalReal + e.totalPotential && (
        <div style={{ fontSize: 11, color: C.muted }}>
          Team: Monat {eur(team.monthReal)} · Gesamt {eur(team.totalReal)}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={badge(sealColor)}>{sealText}</span>
        <fetcher.Form method="post">
          <input type="hidden" name="type" value="run_agent" />
          <input type="hidden" name="agent" value={agent.number} />
          <button type="submit" style={btnGold} disabled={busy}>
            {busy ? "läuft…" : "Sofort ausführen"}
          </button>
        </fetcher.Form>
      </div>
      {fetcher.data?.message && (
        <div style={{ fontSize: 11, color: fetcher.data.ok ? C.emerald : C.amber }}>{fetcher.data.message}</div>
      )}
    </div>
  );
});
