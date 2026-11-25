import { useEffect, useMemo, useState } from "react";
import { useFetcher, useSearchParams } from "react-router";
import type {
  AgentDef,
  AgentPerformanceSnapshot,
  DepartmentDef,
  EarningsSummary,
} from "../../services/agent-types";
import type { LiveConnectionTraceDto } from "../../services/live-connection.server";
import { DomainInfoButton } from "./DomainInfoButton";
import { C, badge, btn, card, eur } from "./theme";

type Capability = {
  id: string;
  domainKey: string;
  displayName: string;
  feasibility: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  evidenceSummary: string;
  verifiedAt: string | null;
  expiresAt: string | null;
  estimatedCostEur: number | null;
  riskLevel: string;
  isVerified: boolean;
};

type Binding = {
  id: string;
  agentKey: string;
  interfaceKey: string;
  status: string;
  lastVerifiedAt: string | null;
  createdAt: string;
  isNewlySpawnedInterface: boolean;
};

type LegalRule = {
  id: string;
  ruleKey: string;
  jurisdiction: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceHash: string;
  verifiedAt: string;
  reviewStatus: string;
};

type ChildNode = { id: string; title: string; detail: string; kind: string };
type LegendId = "gold" | "green" | "blue" | "amber" | "violet" | "red";

const LEGEND: { id: LegendId; label: string; color: string }[] = [
  { id: "gold", label: "Meta / Schnittstellen", color: C.gold },
  { id: "green", label: "Recht / Steuer / Gericht", color: C.emerald },
  { id: "blue", label: "Manufaktur / xTool", color: "#60A5FA" },
  { id: "amber", label: "Vorteile / Finanzen", color: C.amber },
  { id: "violet", label: "Marktplätze / KI-Suche", color: "#A78BFA" },
  { id: "red", label: "Devil's Advocate / Warnung", color: C.red },
];

interface Props {
  owner: boolean;
  roster: AgentDef[];
  departments: DepartmentDef[];
  allowedDepartmentIds: number[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  legalRules: LegalRule[];
  capabilities: Capability[];
  bindings: Binding[];
  initialTraces: LiveConnectionTraceDto[];
}

function agentNumber(agentKey: string | null) {
  const match = agentKey ? /^A(\d+)$/.exec(agentKey) : null;
  return match ? Number(match[1]) : null;
}

function traceLegend(trace: LiveConnectionTraceDto, roster: AgentDef[]): LegendId {
  const number = agentNumber(trace.agentKey);
  const agent = roster.find((item) => item.key === trace.agentKey);
  if (trace.outcome !== "SUCCESS" || number === 221) return "red";
  if (number === 0 || number === 400 || agent?.departmentId === 24) return "gold";
  if (agent?.departmentId === 21 || agent?.departmentId === 22) return "green";
  if (agent?.departmentId === 5 || agent?.departmentId === 23) return "blue";
  if (agent?.departmentId === 19) return "amber";
  return "violet";
}

function gradeLabel(agent: AgentDef, performance: AgentPerformanceSnapshot) {
  const value = performance.byAgent[agent.key]?.grade;
  return value == null ? "nicht verfügbar" : value.toFixed(1).replace(".", ",");
}

function titleForSegment(
  segment: string,
  roster: AgentDef[],
  departments: DepartmentDef[],
  capabilities: Capability[],
  bindings: Binding[],
  legalRules: LegalRule[],
  traces: LiveConnectionTraceDto[]
) {
  const agentMatch = /^agent-(\d+)$/.exec(segment);
  if (agentMatch) {
    const number = Number(agentMatch[1]);
    if (number === 0) return "#000 · Sovereign Meta-Supervisor";
    return roster.find((agent) => agent.number === number)?.name ?? `#${number}`;
  }
  const deptMatch = /^department-(\d+)$/.exec(segment);
  if (deptMatch) {
    const id = Number(deptMatch[1]);
    return departments.find((department) => department.id === id)?.name ?? `Abteilung ${id}`;
  }
  const cluster = roster.find((agent) => agent.specialistCluster === segment);
  if (cluster) return cluster.specialistCluster === "apex-system-coordinator"
    ? "#400 · System-Koordinator"
    : cluster.role;
  const capability = capabilities.find((item) => `capability-${item.id}` === segment);
  if (capability) return capability.displayName;
  const binding = bindings.find((item) => `binding-${item.id}` === segment);
  if (binding) return `${binding.interfaceKey} · ${binding.agentKey}`;
  const rule = legalRules.find((item) => `rule-${item.id}` === segment);
  if (rule) return `${rule.ruleKey} · ${rule.jurisdiction}`;
  const trace = traces.find((item) => `trace-${item.id}` === segment);
  if (trace) return `${trace.agentKey ?? "System"} → ${trace.channelKey}`;
  const titles: Record<string, string> = {
    workflow: "Workflow & Automatisierung",
    "event-bus": "Real-Time Event-Bus",
    "integrated-ecosystem": "Integrated Ecosystem",
    interfaces: "Schnittstellen-Detail",
    departments: "Gebuchte Fachbereiche",
    specialists: "Fachcluster #301–#400",
    staff: "KI-Belegschaft",
    laws: "Rechts- & Steuerquellen",
    traces: "Beobachtete Verbindungen",
    "agent-factory": "KI-Fabrik #401 → ∞",
    "system-heartbeat": "System-Herzschlag",
  };
  return titles[segment] ?? segment;
}

export function LiveOrganization(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<{ traces: LiveConnectionTraceDto[]; snapshotAt: string }>();
  const [heartbeat, setHeartbeat] = useState(Date.now());
  const [focusedTrace, setFocusedTrace] = useState<string | null>(null);
  const [inspectedTrace, setInspectedTrace] = useState<string | null>(null);
  const [visibleKinds, setVisibleKinds] = useState<Set<LegendId>>(
    () => new Set(LEGEND.map((entry) => entry.id))
  );
  const [staffLimit, setStaffLimit] = useState(50);
  const path = (searchParams.get("orgPath") ?? "").split("/").filter(Boolean);
  const traces = fetcher.data?.traces ?? props.initialTraces;

  useEffect(() => {
    fetcher.load("/api/live-traces");
    const refresh = window.setInterval(() => fetcher.load("/api/live-traces"), 15_000);
    const pulse = window.setInterval(() => setHeartbeat(Date.now()), 1_000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(pulse);
    };
  }, [fetcher.load]);

  useEffect(() => setStaffLimit(50), [path.join("/")]);

  const departments = props.departments.filter((department) =>
    props.allowedDepartmentIds.includes(department.id)
  );
  const agentByNumber = useMemo(() => new Map(props.roster.map((agent) => [agent.number, agent])), [props.roster]);
  const capabilityById = useMemo(() => new Map(props.capabilities.map((item) => [item.id, item])), [props.capabilities]);
  const bindingById = useMemo(() => new Map(props.bindings.map((item) => [item.id, item])), [props.bindings]);
  const ruleById = useMemo(() => new Map(props.legalRules.map((item) => [item.id, item])), [props.legalRules]);
  const traceById = useMemo(() => new Map(traces.map((item) => [item.id, item])), [traces]);

  const leafAgent = path.map((segment) => /^agent-(\d+)$/.exec(segment)?.[1]).filter(Boolean).map(Number).pop();
  const leafTraceId = path.map((segment) => /^trace-(.+)$/.exec(segment)?.[1]).filter(Boolean).pop() ?? null;
  const currentTrace = leafTraceId ? traceById.get(leafTraceId) : undefined;
  const selectedAgent = leafAgent === 0
    ? undefined
    : leafAgent === undefined
      ? undefined
      : agentByNumber.get(leafAgent);
  const currentTitle = path.length
    ? titleForSegment(path[path.length - 1], props.roster, departments, props.capabilities, props.bindings, props.legalRules, traces)
    : "Lebendes Firmen-Organigramm & Event-Bus";

  function navigate(nextPath: string[]) {
    const next = new URLSearchParams(searchParams);
    next.set("view", "board");
    if (nextPath.length) next.set("orgPath", nextPath.join("/"));
    else next.delete("orgPath");
    setSearchParams(next, { preventScrollReset: true });
    setInspectedTrace(null);
  }

  function node(id: string, title: string, detail: string, kind: string): ChildNode {
    return { id, title, detail, kind };
  }

  function childNodes(): ChildNode[] {
    if (!path.length) {
      const base = [
        node("workflow", "Workflow & Automatisierung", "Tatsächlich protokollierte Tool-Aufrufe und Schnittstellen", "gold"),
        node("departments", "Gebuchte Fachbereiche", `${departments.length} für diesen Shop sichtbare Abteilungen`, "blue"),
        node("specialists", "Fachcluster #301–#400", "Spezialistenprofile mit vorhandenen Sidekick-Tools", "violet"),
        node("staff", "KI-Belegschaft", `${props.roster.length} für diesen Shop freigegebene Profile`, "blue"),
        node("traces", "Beobachtete Verbindungen", `${traces.length} gespeicherte Event-Traces`, "violet"),
      ];
      if (props.owner || props.allowedDepartmentIds.includes(25)) {
        base.push(node("interfaces", "Schnittstellen-Detail", `${props.capabilities.length} Capability-Einträge · ${props.bindings.length} Bindings`, "gold"));
      }
      if (props.owner || props.legalRules.length > 0) {
        base.push(node("laws", "Rechts- & Steuerquellen", `${props.legalRules.length} shopbezogene Ledger-Einträge`, "green"));
      }
      if (props.owner) {
        base.unshift(node("agent-0", "#000 · Sovereign Meta-Supervisor", "Nur im Owner-Shop sichtbar", "gold"));
        base.push(node("agent-factory", "KI-Fabrik #401 → ∞", "Owner-only · dynamische Profile", "gold"));
      }
      return base;
    }

    const leaf = path[path.length - 1];
    if (leaf === "workflow") return [node("event-bus", "Real-Time Event-Bus", "Reale Agentenaufrufe und Resultate", "gold")];
    if (leaf === "event-bus") return [node("integrated-ecosystem", "Integrated Ecosystem", "Verbindungen zwischen Fachbereichen und Tools", "gold")];
    if (leaf === "integrated-ecosystem") return [node("interfaces", "Schnittstellen-Detail", "Capability-Nachweise und Interface-Bindings", "gold")];
    if (leaf === "departments") {
      return departments.map((department) =>
        node(`department-${department.id}`, `Abt. ${department.id} · ${department.name}`, department.mechanism, department.kind)
      );
    }
    if (leaf === "specialists") {
      const clusters = new Map<string, AgentDef>();
      for (const agent of props.roster) {
        if (agent.specialistCluster) clusters.set(agent.specialistCluster, agent);
      }
      return [...clusters.entries()].map(([id, agent]) =>
        node(id, agent.specialistCluster === "apex-system-coordinator" ? "#400 · System-Koordinator" : agent.role,
          `${props.roster.filter((item) => item.specialistCluster === id).length} Profile`, "violet")
      );
    }
    if (leaf === "staff") {
      return props.roster.slice(0, staffLimit).map((agent) =>
        node(`agent-${agent.number}`, `#${agent.number} · ${agent.name}`, agent.mission, "blue")
      );
    }
    if (leaf === "agent-0" && props.owner) {
      return [
        node("meta-owner-veto", "Inhaber-Veto & DRY_RUN_MODE", "Höchste Priorität; tatsächliche Kontrolle bleibt in den serverseitigen Owner-Regeln.", "gold"),
        node("meta-traces", "Nachvollziehbare Systemereignisse", `${traces.length} reale Traces verfügbar`, "gold"),
      ];
    }
    const departmentMatch = /^department-(\d+)$/.exec(leaf);
    if (departmentMatch) {
      const id = Number(departmentMatch[1]);
      return props.roster.filter((agent) => agent.departmentId === id).slice(0, staffLimit).map((agent) =>
        node(`agent-${agent.number}`, `#${agent.number} · ${agent.name}`, agent.mission, "blue")
      );
    }
    if (props.roster.some((agent) => agent.specialistCluster === leaf)) {
      return props.roster.filter((agent) => agent.specialistCluster === leaf).map((agent) =>
        node(`agent-${agent.number}`, `#${agent.number} · ${agent.name}`, agent.mission, "violet")
      );
    }
    if (leaf === "agent-factory") {
      return props.roster.filter((agent) => agent.dynamic).slice(0, staffLimit).map((agent) =>
        node(`agent-${agent.number}`, `#${agent.number} · ${agent.name}`, agent.mission, "gold")
      );
    }
    if (leaf === "interfaces") {
      return [
        ...props.capabilities.map((item) => node(
          `capability-${item.id}`,
          item.displayName,
          `${item.feasibility} · ${item.isVerified ? "Quelle verifiziert" : "nicht verifiziert"}`,
          "gold"
        )),
        ...props.bindings.map((item) => node(
          `binding-${item.id}`,
          item.interfaceKey,
          `${item.agentKey} · ${item.status}${item.isNewlySpawnedInterface ? " · NEU" : ""}`,
          item.isNewlySpawnedInterface ? "new" : "gold"
        )),
      ];
    }
    if (leaf === "laws") {
      return props.legalRules.map((rule) =>
        node(`rule-${rule.id}`, `${rule.ruleKey} · ${rule.jurisdiction}`, `${rule.reviewStatus} · ${rule.sourceTitle}`, "green")
      );
    }
    if (leaf === "traces") {
      return traces.map((trace) =>
        node(`trace-${trace.id}`, `${trace.agentKey ?? "System"} → ${trace.channelKey}`, `${trace.outcome} · ${trace.occurredAt}`, traceLegend(trace, props.roster))
      );
    }
    if (selectedAgent) {
      return traces
        .filter((trace) => trace.agentKey === selectedAgent.key)
        .map((trace) => node(`trace-${trace.id}`, `${trace.agentKey} → ${trace.channelKey}`, `${trace.outcome} · ${trace.occurredAt}`, traceLegend(trace, props.roster)));
    }
    const cap = capabilityById.get(leaf.replace(/^capability-/, ""));
    if (cap) {
      return props.bindings.filter((binding) =>
        binding.interfaceKey === cap.domainKey || binding.interfaceKey.startsWith(`${cap.domainKey}:`)
      ).map((binding) => node(`binding-${binding.id}`, binding.interfaceKey, `${binding.agentKey} · ${binding.status}`, "gold"));
    }
    return [];
  }

  const children = childNodes();
  const filteredTraces = traces.filter((trace) =>
    visibleKinds.has(traceLegend(trace, props.roster)) &&
    (selectedAgent ? trace.agentKey === selectedAgent.key : true)
  );
  const inspected = inspectedTrace ? traceById.get(inspectedTrace) : currentTrace;
  const inspectedAgent = inspected?.agentKey ? props.roster.find((agent) => agent.key === inspected.agentKey) : undefined;
  const spotlight = focusedTrace ? traceById.get(focusedTrace) : undefined;
  const spotlightAgent = spotlight?.agentKey ? props.roster.find((agent) => agent.key === spotlight.agentKey) : undefined;
  const spotlightPerformance = spotlightAgent ? props.performance.byAgent[spotlightAgent.key] : undefined;
  const spotlightEarnings = spotlightAgent ? props.earnings.perAgent[spotlightAgent.key] : undefined;

  function nodeColor(kind: string) {
    if (kind === "new") return C.gold;
    if (kind === "core" || kind === "green" || kind === "panel") return C.emerald;
    if (kind === "blue") return "#60A5FA";
    if (kind === "amber") return C.amber;
    if (kind === "violet" || kind === "armada") return "#A78BFA";
    if (kind === "harmony") return C.gold;
    if (kind === "red") return C.red;
    return C.gold;
  }

  return (
    <section style={{ ...card, display: "grid", gap: 12 }} aria-label="Lebendes Organigramm und Event-Bus">
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <strong style={{ color: C.champagne }}>{currentTitle}</strong>
          <div style={{ color: C.muted, fontSize: 12 }}>
            UI-Herzschlag {new Date(heartbeat).toLocaleTimeString()} · Datenabfrage alle 15 Sekunden · {fetcher.state === "loading" ? "aktualisiert…" : `${traces.length} gespeicherte Traces`}
          </div>
        </div>
        <DomainInfoButton domain={path.length ? path.join(" / ") : "live-organization"} />
      </header>

      <nav aria-label="Organigramm-Breadcrumb" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        <button type="button" style={btn} onClick={() => navigate([])}>Kommandozentrale</button>
        {path.map((segment, index) => (
          <span key={`${segment}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true" style={{ color: C.muted }}>›</span>
            <button type="button" style={btn} onClick={() => navigate(path.slice(0, index + 1))}>
              {titleForSegment(segment, props.roster, departments, props.capabilities, props.bindings, props.legalRules, traces)}
            </button>
          </span>
        ))}
      </nav>

      <div role="group" aria-label="Event-Bus-Ströme filtern" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {LEGEND.map((entry) => {
          const selected = visibleKinds.has(entry.id);
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setVisibleKinds((current) => {
                const next = new Set(current);
                if (next.has(entry.id)) next.delete(entry.id);
                else next.add(entry.id);
                return next;
              })}
              style={{ ...btn, borderColor: entry.color, opacity: selected ? 1 : 0.45 }}
            >
              <span style={{ color: entry.color }}>●</span> {entry.label}
            </button>
          );
        })}
      </div>

      {children.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8 }}>
          {children.slice(0, staffLimit).map((child) => {
            const agentMatch = /^agent-(\d+)$/.exec(child.id);
            const agent = agentMatch ? agentByNumber.get(Number(agentMatch[1])) : undefined;
            const performance = agent ? props.performance.byAgent[agent.key] : undefined;
            const earnings = agent ? props.earnings.perAgent[agent.key] : undefined;
            const newInterface = child.kind === "new";
            return (
              <button
                type="button"
                key={child.id}
                onClick={() => navigate([...path, child.id])}
                onMouseEnter={() => agent && setFocusedTrace(traces.find((trace) => trace.agentKey === agent.key)?.id ?? null)}
                onMouseLeave={() => setFocusedTrace(null)}
                style={{
                  ...card,
                  textAlign: "left",
                  display: "grid",
                  gap: 5,
                  borderColor: newInterface ? C.gold : nodeColor(child.kind),
                  animation: newInterface ? "ap-glow 1.1s ease-in-out infinite" : undefined,
                }}
              >
                <strong style={{ color: nodeColor(child.kind) }}>{child.title}</strong>
                <span style={{ color: C.muted, fontSize: 12 }}>{child.detail}</span>
                {agent && (
                  <small style={{ color: C.text }}>
                    Note {gradeLabel(agent, props.performance)} · {performance?.trend === "UP" ? "▲" : performance?.trend === "DOWN" ? "▼" : performance?.trend === "STABLE" ? "►" : "—"}
                    {" · "}{performance?.xp ?? "—"} XP · Echt {eur(earnings?.monthReal ?? 0)} / Potenzial {eur(earnings?.monthPotential ?? 0)}
                  </small>
                )}
              </button>
            );
          })}
          {children.length > staffLimit && (
            <button type="button" style={btn} onClick={() => setStaffLimit((current) => current + 50)}>
              Weitere {Math.min(50, children.length - staffLimit)} laden ({children.length - staffLimit} verbleibend)
            </button>
          )}
        </div>
      ) : (
        <p style={{ color: C.muted, margin: 0 }}>Für diese Ebene liegen keine weiteren Datensätze vor.</p>
      )}

      {selectedAgent && (
        <section style={{ ...card, display: "grid", gap: 5, borderColor: C.gold }} aria-label="Mitarbeiter-Personalakte">
          <strong style={{ color: C.champagne }}>#{selectedAgent.number} {selectedAgent.name}</strong>
          <span>{selectedAgent.mission}</span>
          <small style={{ color: C.muted }}>
            {selectedAgent.role} · Abt. {selectedAgent.departmentId} · {selectedAgent.tool.category}/{selectedAgent.tool.action}
            {" · "}Note {gradeLabel(selectedAgent, props.performance)}
            {" · "}{props.performance.byAgent[selectedAgent.key]?.xp ?? "—"} XP
            {selectedAgent.dynamic ? ` · ${selectedAgent.status ?? "Status unbekannt"}` : ""}
          </small>
        </section>
      )}

      {filteredTraces.length > 0 ? (
        <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 10 }}>
          <svg
            viewBox={`0 0 820 ${Math.max(120, filteredTraces.length * 52)}`}
            role="group"
            aria-label="SVG-Datenverbindungen aus gespeicherten LiveConnectionTrace-Ereignissen"
            style={{ width: "100%", minWidth: 620, display: "block", background: C.slate }}
          >
            {filteredTraces.map((trace, index) => {
              const y = 30 + index * 52;
              const colorId = traceLegend(trace, props.roster);
              const color = LEGEND.find((item) => item.id === colorId)?.color ?? C.gold;
              const dimmed = focusedTrace !== null && focusedTrace !== trace.id;
              const agent = props.roster.find((item) => item.key === trace.agentKey);
              return (
                <g
                  key={trace.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Trace ${trace.agentKey ?? "System"} zu ${trace.channelKey}, ${trace.outcome}`}
                  opacity={dimmed ? 0.18 : 1}
                  onMouseEnter={() => setFocusedTrace(trace.id)}
                  onMouseLeave={() => setFocusedTrace(null)}
                  onFocus={() => setFocusedTrace(trace.id)}
                  onBlur={() => setFocusedTrace(null)}
                  onClick={() => {
                    setInspectedTrace(trace.id);
                    navigate([...path, `trace-${trace.id}`]);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setInspectedTrace(trace.id);
                      navigate([...path, `trace-${trace.id}`]);
                    }
                  }}
                  style={{ cursor: "pointer", filter: dimmed ? "grayscale(1)" : undefined }}
                >
                  <path
                    d={`M190 ${y} C330 ${y - 24}, 480 ${y + 24}, 630 ${y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    className="ap-trace"
                  />
                  <circle cx="190" cy={y} r="7" fill={color} />
                  <circle cx="630" cy={y} r="7" fill={color} />
                  <text x="20" y={y + 4} fill={C.text} fontSize="12">#{agent?.number ?? "?"} {agent?.name ?? trace.agentKey ?? "System"}</text>
                  <text x="650" y={y + 4} fill={C.champagne} fontSize="12">{trace.channelKey}</text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <p style={{ ...card, color: C.muted, margin: 0 }}>
          Noch keine realen Verbindungen protokolliert. Datenimpulse erscheinen nach tatsächlichen Sidekick-Tool-Aufrufen; es werden keine Beispiel-Events erzeugt.
        </p>
      )}

      {spotlight && (
        <aside role="status" style={{ ...card, borderColor: C.gold, display: "grid", gap: 4 }}>
          <strong style={{ color: C.champagne }}>Spotlight · {spotlightAgent ? `#${spotlightAgent.number} ${spotlightAgent.name}` : spotlight.agentKey}</strong>
          <span>Was macht er gerade? {spotlight.eventType} · {spotlight.outcome}</span>
          <span>Gesprächspartner: {spotlight.channelKey}</span>
          <span>
            Note {spotlightAgent ? gradeLabel(spotlightAgent, props.performance) : "nicht verfügbar"} ·
            {" "}{spotlightPerformance?.trend === "UP" ? "▲" : spotlightPerformance?.trend === "DOWN" ? "▼" : spotlightPerformance?.trend === "STABLE" ? "►" : "—"}
            {" · "}{spotlightPerformance?.xp ?? "—"} XP · Echt {eur(spotlightEarnings?.monthReal ?? 0)} · Potenzial {eur(spotlightEarnings?.monthPotential ?? 0)}
          </span>
        </aside>
      )}

      {inspected && (
        <aside role="dialog" aria-label="Verbindungsnachvollziehbarkeit" style={{ ...card, borderColor: C.champagne, display: "grid", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <strong style={{ color: C.champagne }}>Trace-Inspektor · {inspected.agentKey ?? "System"} → {inspected.channelKey}</strong>
            <button type="button" style={btn} onClick={() => { setInspectedTrace(null); navigate(path.slice(0, -1)); }}>Schließen</button>
          </div>
          <span>Auslöser: {inspected.detail?.match(/(?:^|;)trigger=([^;]+)/)?.[1] ?? "nicht protokolliert"}</span>
          <span>Ergebnis: {inspected.outcome} · Ereignis: {inspected.eventType}</span>
          <span>Rechtsregel: nicht mit diesem Trace verknüpft</span>
          <span>Urteil #221–#225: nicht mit diesem Trace verknüpft</span>
          <span>Euro-Effekt: nicht gemessen; kein Umsatz aus einem Tool-Aufruf abgeleitet</span>
          <small style={{ color: C.muted }}>
            {inspected.occurredAt} · Request-Hash {inspected.requestHash ?? "—"} · Response-Hash {inspected.responseHash ?? "—"}
            {inspectedAgent ? ` · Mitarbeiter #${inspectedAgent.number}` : ""}
          </small>
        </aside>
      )}

      {path.length === 0 && props.owner && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={badge(C.gold)}>Owner-only #000</span>
          <span style={badge(C.gold)}>Factory #401 → ∞</span>
        </div>
      )}
    </section>
  );
}
