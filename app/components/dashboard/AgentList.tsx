import { useDeferredValue, useMemo, useState } from "react";
import type { AgentDef, AgentPerformanceSnapshot, EarningsSummary } from "../../services/agent-types";
import { DEPARTMENTS } from "../../services/agent-roster";
import { AgentCard } from "./AgentCard";
import { C, btn, card, grid, input } from "./theme";

const PAGE = 24;

interface Props {
  roster: AgentDef[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  audits: Record<string, string>;
  dept: number | "all";
  onDept: (d: number | "all") => void;
  fixed?: (a: AgentDef) => boolean;
  title: string;
}

/** Gefilterte, paginierte Mitarbeiter-Liste (Abteilung + Suchfeld). */
export function AgentList({ roster, earnings, performance, audits, dept, onDept, fixed, title }: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const dq = useDeferredValue(q);

  const list = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    return roster.filter((a) => {
      if (fixed && !fixed(a)) return false;
      if (dept !== "all" && a.departmentId !== dept) return false;
      if (!needle) return true;
      return (
        a.name.toLowerCase().includes(needle) ||
        a.mission.toLowerCase().includes(needle) ||
        a.specialistCluster?.toLowerCase().includes(needle) ||
        `#${a.number}` === needle ||
        String(a.number) === needle
      );
    });
  }, [roster, dq, dept, fixed]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const slice = list.slice(cur * PAGE, cur * PAGE + PAGE);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...card, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <strong style={{ color: C.champagne }}>{title}</strong>
        <select
          aria-label="Abteilung filtern"
          style={input}
          value={dept}
          onChange={(e) => {
            setPage(0);
            onDept(e.target.value === "all" ? "all" : Number(e.target.value));
          }}
        >
          <option value="all">Alle 26 Abteilungen</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              Abt. {d.id}: {d.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Mitarbeiter suchen"
          style={{ ...input, minWidth: 200 }}
          placeholder="Suche: Name, Aufgabe oder #Nummer"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
        <span style={{ color: C.muted, fontSize: 12 }}>{list.length} Treffer</span>
      </div>
      {performance.status === "unavailable" && (
        <div role="status" style={{ ...card, color: C.amber, fontSize: 12 }}>{performance.message}</div>
      )}

      <div style={grid(250)}>
        {slice.map((a) => (
          <AgentCard
            key={a.key}
            agent={a}
            earn={earnings.perAgent[a.key]}
            team={earnings.team[a.key]}
            audit={audits[a.key]}
            performance={performance.byAgent[a.key]}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
        <button type="button" style={btn} disabled={cur === 0} onClick={() => setPage(cur - 1)}>← Zurück</button>
        <span style={{ color: C.muted, fontSize: 13 }}>Seite {cur + 1} / {pages}</span>
        <button type="button" style={btn} disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Weiter →</button>
      </div>
    </div>
  );
}
