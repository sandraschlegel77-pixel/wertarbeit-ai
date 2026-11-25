import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import type { AgentDef } from "../../services/agent-types";
import { DomainInfoButton } from "./DomainInfoButton";
import { C, btn, card, input } from "./theme";

interface SearchItem {
  label: string;
  detail: string;
  path: string[];
  haystack: string;
}

interface Props {
  owner: boolean;
  roster: AgentDef[];
  departments: { id: number; name: string }[];
  legalRules: { id: string; ruleKey: string; jurisdiction: string; sourceTitle: string }[];
  capabilities: { id: string; displayName: string; domainKey: string }[];
}

export function GlobalQuickJump({ owner, roster, departments, legalRules, capabilities }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const items = useMemo<SearchItem[]>(() => {
    const results: SearchItem[] = [
      ...departments.map((department) => ({
        label: `Abt. ${department.id} · ${department.name}`,
        detail: "Gebuchter Fachbereich",
        path: ["departments", `department-${department.id}`],
        haystack: `${department.id} ${department.name} fachbereich abteilung`,
      })),
      ...roster.map((agent) => ({
        label: `#${agent.number} · ${agent.name}`,
        detail: `${agent.specialistCluster ?? agent.role} · ${agent.mission}`,
        path: ["staff", `agent-${agent.number}`],
        haystack: `${agent.number} ${agent.name} ${agent.role} ${agent.mission} ${agent.specialistCluster ?? ""}`,
      })),
      ...legalRules.map((rule) => ({
        label: `${rule.ruleKey} · ${rule.jurisdiction}`,
        detail: rule.sourceTitle,
        path: ["laws", `rule-${rule.id}`],
        haystack: `${rule.ruleKey} ${rule.jurisdiction} ${rule.sourceTitle} gesetz recht steuer`,
      })),
      ...capabilities.map((capability) => ({
        label: capability.displayName,
        detail: `Schnittstelle · ${capability.domainKey}`,
        path: ["workflow", "event-bus", "integrated-ecosystem", "interfaces", `capability-${capability.id}`],
        haystack: `${capability.displayName} ${capability.domainKey} schnittstelle api`,
      })),
    ];
    if (owner) {
      results.unshift({
        label: "#000 · Sovereign Meta-Supervisor",
        detail: "Interne Owner-Governance",
        path: ["agent-0"],
        haystack: "000 sovereign meta supervisor governance",
      });
      results.push({
        label: "KI-Fabrik #401 → ∞",
        detail: "Owner-only · dynamische Mitarbeiter",
        path: ["agent-factory"],
        haystack: "401 dynamische ki fabrik klonen",
      });
    }
    return results;
  }, [capabilities, departments, legalRules, owner, roster]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return items
      .filter((item) => !needle || item.haystack.toLocaleLowerCase().includes(needle))
      .slice(0, 15);
  }, [items, query]);

  const navigate = useCallback((path: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.set("view", "board");
    next.set("orgPath", path.join("/"));
    next.delete("tab");
    next.delete("teamSection");
    setSearchParams(next, { preventScrollReset: true });
    setOpen(false);
    setQuery("");
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Escape") {
        setOpen(false);
      } else if (open && event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((value) => filtered.length ? (value + 1) % filtered.length : 0);
      } else if (open && event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((value) => filtered.length ? (value + filtered.length - 1) % filtered.length : 0);
      } else if (open && event.key === "Enter" && filtered[selected]) {
        event.preventDefault();
        navigate(filtered[selected].path);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered, navigate, open, selected]);

  useEffect(() => setSelected(0), [query]);

  return (
    <>
      <button type="button" style={btn} onClick={() => setOpen(true)} aria-keyshortcuts="Control+K Meta+K">
        Blitz-Sprung <kbd>Ctrl K</kbd>
      </button>
      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            display: "grid",
            alignItems: "start",
            justifyItems: "center",
            padding: "12vh 16px 16px",
            background: "rgba(8, 12, 22, .78)",
          }}
        >
          <section role="dialog" aria-modal="true" aria-label="Blitz-Sprung-Suche" style={{ ...card, width: "min(760px, 100%)", display: "grid", gap: 10, borderColor: C.gold }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <strong style={{ color: C.champagne }}>Blitz-Sprung · Bereiche, Mitarbeiter, Gesetze, Schnittstellen</strong>
              <DomainInfoButton domain="global-quick-jump" />
            </header>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, Aufgabe, #Nummer, Gesetz oder Schnittstelle suchen…"
              aria-label="Global suchen"
              style={{ ...input, width: "100%", boxSizing: "border-box" }}
            />
            <div role="listbox" aria-label="Suchergebnisse" style={{ display: "grid", gap: 5, maxHeight: "55vh", overflowY: "auto" }}>
              {filtered.map((item, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected === index}
                  key={`${item.path.join("/")}-${item.label}`}
                  onMouseEnter={() => setSelected(index)}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...btn,
                    textAlign: "left",
                    display: "grid",
                    gap: 3,
                    borderColor: selected === index ? C.champagne : C.line,
                    background: selected === index ? C.slate3 : "transparent",
                  }}
                >
                  <strong>{item.label}</strong>
                  <small style={{ color: C.muted }}>{item.detail}</small>
                </button>
              ))}
              {filtered.length === 0 && <p style={{ color: C.muted }}>Keine Treffer in den für diesen Shop sichtbaren Daten.</p>}
            </div>
            <small style={{ color: C.muted }}>Esc schließt · ↑/↓ navigiert · Enter öffnet</small>
          </section>
        </div>
      )}
    </>
  );
}
