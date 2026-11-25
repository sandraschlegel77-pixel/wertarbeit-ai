import {
  Background,
  Controls,
  EdgeLabelRenderer,
  EdgeToolbar,
  getSmoothStepPath,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useEdgesStore,
  useEqualSelector,
  useNode,
  type Edge,
  type EdgesStore,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  Bot,
  Brain,
  Bug,
  BookOpen,
  Code2,
  Crown,
  Cpu,
  Database,
  Factory,
  Filter,
  Gauge,
  GitBranch,
  Globe,
  GraduationCap,
  Headset,
  History,
  Landmark,
  LockKeyhole,
  Network,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBasket,
  Truck,
  UserRound,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { DEPARTMENTS } from "../../services/agent-roster";
import type {
  AgentDef,
  AgentPerformanceSnapshot,
  EarningsSummary,
} from "../../services/agent-types";
import type { LiveConnectionTraceDto } from "../../services/live-connection.server";
import { DomainInfoButton } from "./DomainInfoButton";
import "./EnterpriseOsOrganigram.css";

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

/** 6 Leuchtfarben: command = Befehlsfluss, process = Operativer Fluss, infrastructure, feedback = Omega-Fluss, control = Prüffluss, data = Datenfluss. */
type LegendId =
  | "command"
  | "process"
  | "infrastructure"
  | "feedback"
  | "control"
  | "data";

type EntityTone =
  | "obsidian"
  | "sapphire"
  | "violet"
  | "petrol"
  | "antiqueGold"
  | "platinumSlate"
  | "bronze"
  | "burgundy"
  | "emerald"
  | "sandBronze"
  | "champagne"
  | "steelSlate"
  | "sageEmerald"
  | "deepBordeaux"
  | "royalBlue"
  | "processLayer"
  | "whiteCard"
  | "softSlate"
  | "workflowCard"
  | "communicationCard"
  | "integrationCard"
  | "supportCard"
  | "turquoise"
  | "iceBlue"
  | "workflowBlue";

type Entity = {
  id: string;
  title: string;
  description: string;
  group: string;
  legendId: LegendId;
  column?: 1 | 2 | 3 | 4;
  width?: number;
  isColumn?: boolean;
  layout?: "stack" | "row" | "grid" | "split";
  children?: Entity[];
  clickable?: boolean;
  route?: string;
  departmentId?: number;
  depth?: number;
  dark?: boolean;
  tone?: EntityTone;
  metrics?: string[];
  sourceType?: "agent" | "trace" | "law" | "capability" | "binding" | "department";
  sourceId?: string;
  relationKey?: string;
  relationKeys?: string[];
  reportsTo?: number | null;
  agentNumber?: number;
  newlySpawned?: boolean;
  /** Feste Position im 5-Zonen-Blueprint (Flow-Koordinaten); nur auf der Startebene gesetzt. */
  zone?: { x: number; y: number; w: number; h: number };
};

type FlowNodeData = {
  entity: Entity;
  onActivate: (entity: Entity) => void;
  onHover: (entity: Entity | null) => void;
  visibleLegend: Set<LegendId>;
  focusedId: string | null;
  focusedLegend: LegendId | null;
  relatedIds: Set<string>;
  activeColumns: Set<string>;
  onInspect: (entity: Entity) => void;
};
type FlowNode = Node<FlowNodeData, "apex" | "zone">;
type FlowEdgeData = {
  packet: string;
  legendId: LegendId;
  traceId?: string;
  trace?: LiveConnectionTraceDto;
  traceIds?: string[];
  bindingIds?: string[];
  laneOffset: number;
  dimmed?: boolean;
  showLabel?: boolean;
  fast?: boolean;
  relatedIds: string[];
  route: string;
};
type FlowEdge = Edge<FlowEdgeData, "apex">;

interface Props {
  dynamicCount: number;
  ownerShop: boolean;
  roster: AgentDef[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  allowedDepartmentIds: number[];
  legalRules: LegalRule[];
  capabilities: Capability[];
  bindings: Binding[];
  initialTraces: LiveConnectionTraceDto[];
  onPickDept: (id: number) => void;
  onSelectModule: (moduleId: string) => void;
  executivePulse: string[];
}

const LEGEND: { id: LegendId; label: string; color: string }[] = [
  { id: "command", label: "Befehlsfluss", color: "#D4AF37" },
  { id: "process", label: "Operativer Fluss", color: "#38BDF8" },
  { id: "infrastructure", label: "Infrastrukturfluss", color: "#94A3B8" },
  { id: "feedback", label: "Omega-Fluss", color: "#A855F7" },
  { id: "control", label: "Prüffluss / Feedback", color: "#EF4444" },
  { id: "data", label: "Datenfluss", color: "#10B981" },
];

const EDGE_COLORS: Record<LegendId, string> = {
  command: "#D4AF37",
  process: "#38BDF8",
  infrastructure: "#94A3B8",
  feedback: "#A855F7",
  control: "#EF4444",
  data: "#10B981",
};

/** Obsidian-Gold: alle Töne sind dunkle Schiefer-Karten, der Akzent kommt über --node-accent (Leuchtfarbe). */
const TONE_COLORS: Record<EntityTone, string> = {
  obsidian: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  sapphire: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  violet: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  petrol: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  antiqueGold: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  platinumSlate: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  bronze: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  burgundy: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  emerald: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  sandBronze: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  champagne: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  steelSlate: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  sageEmerald: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  deepBordeaux: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  royalBlue: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  processLayer: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  whiteCard: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  softSlate: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  workflowCard: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  communicationCard: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  integrationCard: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  supportCard: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  turquoise: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  iceBlue: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
  workflowBlue: "linear-gradient(160deg, #1A2234 0%, #111622 100%)",
};

const TONE_FOREGROUNDS: Record<EntityTone, string> = {
  obsidian: "#F8FAFC",
  sapphire: "#F8FAFC",
  violet: "#F8FAFC",
  petrol: "#F8FAFC",
  antiqueGold: "#F8FAFC",
  platinumSlate: "#F8FAFC",
  bronze: "#F8FAFC",
  burgundy: "#F8FAFC",
  emerald: "#F8FAFC",
  sandBronze: "#F8FAFC",
  champagne: "#F8FAFC",
  steelSlate: "#F8FAFC",
  sageEmerald: "#F8FAFC",
  deepBordeaux: "#F8FAFC",
  royalBlue: "#F8FAFC",
  processLayer: "#F8FAFC",
  whiteCard: "#F8FAFC",
  softSlate: "#F8FAFC",
  workflowCard: "#F8FAFC",
  communicationCard: "#F8FAFC",
  integrationCard: "#F8FAFC",
  supportCard: "#F8FAFC",
  turquoise: "#F8FAFC",
  iceBlue: "#F8FAFC",
  workflowBlue: "#F8FAFC",
};

const ENTITY_ICONS: Record<string, LucideIcon> = {
  "column-1": GraduationCap,
  "column-2": Crown,
  "column-3": Activity,
  "column-4": ShieldCheck,
  "academic-qualification": GraduationCap,
  "academic-personnel": BookOpen,
  "professor-agents": GraduationCap,
  "lecturer-agents": BookOpen,
  "prompt-alchemist": Brain,
  "distillation-agent": Filter,
  "certification-gateways": ShieldCheck,
  "training-connection": BookOpen,
  "live-testing": Search,
  recertification: History,
  "expert-registration": UserRound,
  "knowledge-management": Brain,
  "vector-database": Database,
  "knowledge-curator": Brain,
  "episodic-memory": History,
  "knowledge-graph": Network,
  "owner-architect": Crown,
  "core-ai": Cpu,
  "llm-kernel": Cpu,
  "rl-optimization": Network,
  "neuro-symbolic": Brain,
  "ethical-ai": Scale,
  "synthetic-data": Database,
  constitutional: Landmark,
  "agent-factory-constitutional": Factory,
  "governance-board": Landmark,
  "consensus-jury": UserRound,
  "devils-advocate": ShieldAlert,
  "meta-hypervisor": Network,
  "process-orchestration": Activity,
  "planning-phases": Workflow,
  "pillar-workflow": Workflow,
  "pillar-communication": BookOpen,
  "pillar-integration": Code2,
  "pillar-support": Headset,
  "world-ecosystem": Boxes,
  "purchasing-agent": ShoppingBasket,
  "logistics-optimizer": Truck,
  "inventory-manager": Boxes,
  "customer-market": UserRound,
  "crm-agent": UserRound,
  "market-trend-watcher": Search,
  "marketing-automation": Activity,
  "event-bus": Activity,
  "data-telemetry": Gauge,
  "integrated-ecosystem": Database,
  "system-performance": Gauge,
  infrastructure: Wrench,
  "tool-registry": Wrench,
  "safety-controls": AlertTriangle,
  "version-control": GitBranch,
  "zero-trust": ShieldCheck,
  "self-healing": Search,
  "quality-verifier": Search,
  "red-team": Bug,
  "code-surgeon": Wrench,
  "finops-watchdog": Gauge,
  "external-ecosystem": Globe,
  ledger: LockKeyhole,
  "transaction-log": LockKeyhole,
};

const PILLAR_DEPARTMENT_IDS: Record<string, number[]> = {
  "pillar-workflow": [1, 2, 3, 4, 8, 10, 13, 24, 26],
  "pillar-communication": [5, 6, 7, 11, 15, 16, 17, 18, 20],
  "pillar-integration": [9, 12, 19, 21, 22, 25],
  "pillar-support": [14, 23],
};

const TITLE_MAP: Record<string, string> = {
  workflow: "Workflow & Automatisierung",
  "event-bus": "Real-Time Event-Bus",
  "integrated-ecosystem": "Integrated Ecosystem",
  "system-performance": "System Performance & Telemetry",
  interfaces: "Schnittstellen-Detail",
  departments: "Fachabteilungen & Module",
  specialists: "Fachcluster #301–#400",
  staff: "KI-Belegschaft",
  laws: "Recht & Steuern",
  traces: "Beobachtete Verbindungen",
  "agent-factory": "KI-Fabrik #401 → ∞",
  "owner-architect": "App-Inhaber / System-Architekt",
  "core-ai": "Core AI R&D & Omni-Sense Layer",
  academy: "Akademische Qualifikation",
  knowledge: "Wissens- & Gedächtnis-Management",
  constitutional: "Constitutional Core",
  "meta-hypervisor": "Meta-KI #000",
  "process-orchestration": "Process Orchestration Layer",
  infrastructure: "Core Technical Infrastructure Backbone",
  "self-healing": "KI-Überwachung & Self-Healing",
  ledger: "Entscheidungs-Ledger",
};

/** Klartext-Erklärung je Strom-Art für den Hover-Tooltip (Legende und Leitung). */
const LEGEND_EXPLANATION: Record<LegendId, string> = {
  command: "Anweisungen vom Inhaber und der Meta-KI nach unten. Die OwnerRule hat immer Vorrang.",
  process: "Operativer Arbeitsfluss: Fachwissen, Planung, Ausführung und Bericht der Teams.",
  infrastructure: "Technische Grundlage: Schnittstellen, Werkzeuge und Quellen, auf die alle Teams zugreifen.",
  feedback: "Omega-Fluss: Rückmeldungen, Lernergebnisse und gemeinsame Entscheidungen von Jury und Governance.",
  control: "Prüf- und Audit-Meldungen: hier greifen 3×-Prüfung, Veto und Freigabe-Warteschlange.",
  data: "Ereignis- und Datenstrom, zum Beispiel gespeicherte Live-Traces.",
};

const noop = () => undefined;
/** 8 Leitungsgruppen × 5 Parallelschienen. */
const LANE_HANDLES = 40;
const COLUMN_HEIGHT = 1180;
/** Ankerpunkte nur unterhalb der Spaltenköpfe verteilen, damit keine Leitung die Überschriften verdeckt. */
const laneTop = (index: number): number => 84 + ((index + 0.5) / LANE_HANDLES) * (COLUMN_HEIGHT - 124);

const nodeTypes = { apex: ApexNode, zone: ZoneNode };
const edgeTypes = { apex: AnimatedDataEdge };

function entityHasVisibleContent(entity: Entity, visibleLegend: Set<LegendId>): boolean {
  return visibleLegend.has(entity.legendId) ||
    Boolean(entity.children?.some((child) => entityHasVisibleContent(child, visibleLegend)));
}

function entityContains(entity: Entity, id: string | null): boolean {
  return Boolean(id && (entity.id === id || entity.children?.some((child) => entityContains(child, id))));
}

function entityContainsLegend(entity: Entity, legendId: LegendId | null): boolean {
  return Boolean(legendId && (entity.legendId === legendId || entity.children?.some((child) => entityContainsLegend(child, legendId))));
}

function flattenEntities(entities: Entity[], result: Entity[] = []): Entity[] {
  for (const entity of entities) {
    result.push(entity);
    if (entity.children?.length) flattenEntities(entity.children, result);
  }
  return result;
}

function getEntityFamily(roots: Entity[], focusedId: string | null): Set<string> {
  const all = flattenEntities(roots);
  const target = all.find((entity) => entity.id === focusedId);
  const result = new Set<string>();
  if (!target || !focusedId) return result;

  if (target.agentNumber === 0 || target.id === "meta-hypervisor") {
    for (const entity of all) {
      if (entity.id !== "owner-architect" && entity.id !== "owner-hidden") result.add(entity.id);
    }
    return result;
  }

  const findPath = (entity: Entity, parents: Entity[]): boolean => {
    if (entity.id === focusedId) {
      for (const parent of parents) result.add(parent.id);
      const addDescendants = (descendant: Entity) => {
        result.add(descendant.id);
        descendant.children?.forEach(addDescendants);
      };
      addDescendants(entity);
      return true;
    }
    return entity.children?.some((child) => findPath(child, [...parents, entity])) ?? false;
  };
  roots.forEach((root) => { findPath(root, []); });

  if (target.agentNumber != null) {
    const agents = new Map(
      all.filter((entity) => entity.agentNumber != null).map((entity) => [entity.agentNumber!, entity])
    );
    const agentNumbers = new Set<number>([target.agentNumber]);
    let parentNumber = target.reportsTo;
    while (parentNumber != null && agents.has(parentNumber) && !agentNumbers.has(parentNumber)) {
      agentNumbers.add(parentNumber);
      parentNumber = agents.get(parentNumber)?.reportsTo ?? null;
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const [number, agent] of agents) {
        if (agent.reportsTo != null && agentNumbers.has(agent.reportsTo) && !agentNumbers.has(number)) {
          agentNumbers.add(number);
          changed = true;
        }
      }
    }
    for (const number of agentNumbers) {
      const agent = agents.get(number);
      if (agent) result.add(agent.id);
    }
  }

  const relatedKeys = new Set(target.relationKeys ?? (target.relationKey ? [target.relationKey] : []));
  let relationsChanged = true;
  while (relationsChanged && relatedKeys.size) {
    relationsChanged = false;
    for (const entity of all) {
      const keys = entity.relationKeys ?? (entity.relationKey ? [entity.relationKey] : []);
      if (keys.some((key) => relatedKeys.has(key))) {
        result.add(entity.id);
        for (const key of keys) {
          if (!relatedKeys.has(key)) {
            relatedKeys.add(key);
            relationsChanged = true;
          }
        }
      }
    }
  }
  return result;
}

function ArchitectureContent({
  entity,
  data,
}: {
  entity: Entity;
  data: FlowNodeData;
}) {
  if (!entityHasVisibleContent(entity, data.visibleLegend)) return null;
  const relevant = (!data.focusedId ||
    data.relatedIds.has(entity.id) ||
    entityContains(entity, data.focusedId)) &&
    (!data.focusedLegend || entityContainsLegend(entity, data.focusedLegend));
  const accent = LEGEND.find((item) => item.id === entity.legendId)?.color ?? "#C5A059";
  const tone = entity.tone ?? "whiteCard";
  const Icon = ENTITY_ICONS[entity.id] ?? (entity.sourceType === "agent" ? Bot : undefined);
  const layoutClass = `eos-entity-layout-${entity.layout ?? "stack"}`;
  const classes = [
    "eos-entity",
    entity.children?.length ? "eos-entity-section" : "eos-entity-card",
    entity.dark ? "eos-node-dark" : "",
    entity.newlySpawned ? "eos-new-interface" : "",
    relevant ? "eos-lit" : "eos-dimmed",
  ].filter(Boolean).join(" ");

  return (
    <section
      className={classes}
      data-entity-id={entity.id}
      data-tone={tone}
      style={{
        "--node-accent": accent,
        "--entity-background": TONE_COLORS[tone],
        "--entity-foreground": TONE_FOREGROUNDS[tone],
      } as CSSProperties}
      onMouseEnter={() => data.onHover(entity)}
      onMouseLeave={() => data.onHover(null)}
      onFocus={() => data.onHover(entity)}
      onBlur={() => data.onHover(null)}
      aria-label={`${entity.title}. ${entity.description}`}
    >
      <div className="eos-entity-topline">
        {entity.clickable === false ? (
          <div className="eos-entity-heading">
            {entity.newlySpawned && <span aria-label="Neue Schnittstelle">✦</span>}
            {Icon && <Icon className="eos-entity-icon" aria-hidden="true" size={15} strokeWidth={2} />}
            <strong>{entity.title}</strong>
          </div>
        ) : (
          <button
            type="button"
            className="eos-entity-heading eos-entity-link"
            title={entity.description}
            onClick={(event) => {
              event.stopPropagation();
              data.onActivate(entity);
            }}
          >
            {entity.newlySpawned && <span aria-label="Neue Schnittstelle">✦</span>}
            {Icon && <Icon className="eos-entity-icon" aria-hidden="true" size={15} strokeWidth={2} />}
            <strong>{entity.title}</strong>
          </button>
        )}
        <button
          type="button"
          className="eos-info-button"
          aria-label={`Informationen zu ${entity.title}`}
          title={`Informationen zu ${entity.title}`}
          onMouseEnter={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            data.onInspect(entity);
          }}
        >ⓘ</button>
      </div>
      {entity.description && <p className="eos-entity-description">{entity.description}</p>}
      {!!entity.metrics?.length && (
        <div className="eos-node-meta">
          {entity.metrics.map((metric) => <span className="eos-chip" key={metric}>{metric}</span>)}
        </div>
      )}
      {!!entity.children?.length && (
        <div className={`eos-entity-children ${layoutClass}`}>
          {entity.children.map((child) => (
            <ArchitectureContent key={child.id} entity={child} data={data} />
          ))}
        </div>
      )}
    </section>
  );
}

function ApexNode({ id, data, selected }: NodeProps<FlowNode>) {
  const liveNode = useNode<FlowNode>(id);
  const nodeData = liveNode?.data ?? data;
  const entity = nodeData.entity;
  const width = entity.width ?? 920;
  const accent = LEGEND.find((item) => item.id === entity.legendId)?.color ?? "#C5A059";
  const Icon = ENTITY_ICONS[entity.id];

  return (
    <article
      className={[
        "eos-column-node",
        selected ? "eos-column-selected" : "",
        nodeData.focusedId && !nodeData.activeColumns.has(entity.id) ? "eos-dimmed" : "",
        nodeData.focusedLegend && !entityContainsLegend(entity, nodeData.focusedLegend) ? "eos-dimmed" : "",
      ].filter(Boolean).join(" ")}
      style={{ width, "--node-accent": accent } as CSSProperties}
      data-column-id={entity.id}
      aria-label={entity.title}
    >
      {/* Verteilte Ankerpunkte: jede der 40 Leitungen hat ihren eigenen Handle -> parallele Schienen statt Klumpen. */}
      {Array.from({ length: LANE_HANDLES }, (_, index) => (
        <Handle
          key={`t${index}`}
          id={`t${index}`}
          type="target"
          position={Position.Left}
          className="eos-lane-handle"
          style={{ top: laneTop(index) }}
        />
      ))}
      <header className="eos-column-heading">
        <div className="eos-column-title">
          <span>{Icon && <Icon aria-hidden="true" size={15} strokeWidth={2} />} {entity.title}</span>
          <button
            type="button"
            className="eos-info-button"
            aria-label={`Informationen zu ${entity.title}`}
            onClick={(event) => {
              event.stopPropagation();
              nodeData.onInspect(entity);
            }}
          >ⓘ</button>
        </div>
        {entity.description && <small>{entity.description}</small>}
      </header>
      <div className="eos-column-content">
        {entity.children?.map((child) => (
          <ArchitectureContent key={child.id} entity={child} data={nodeData} />
        ))}
      </div>
      {Array.from({ length: LANE_HANDLES }, (_, index) => (
        <Handle
          key={`s${index}`}
          id={`s${index}`}
          type="source"
          position={Position.Right}
          className="eos-lane-handle"
          style={{ top: laneTop(index) }}
        />
      ))}
    </article>
  );
}

/** Freistehende Karte des 5-Zonen-Blueprints mit je vier Anker-Paaren (oben/unten/links/rechts). */
function ZoneNode({ id, data, selected }: NodeProps<FlowNode>) {
  const liveNode = useNode<FlowNode>(id);
  const nodeData = liveNode?.data ?? data;
  const entity = nodeData.entity;
  const accent = LEGEND.find((item) => item.id === entity.legendId)?.color ?? "#D4AF37";
  const Icon = ENTITY_ICONS[entity.id];
  const tone = entity.tone ?? "obsidian";
  const dimmed = (nodeData.focusedId && !nodeData.activeColumns.has(entity.id)) ||
    (nodeData.focusedLegend && !entityContainsLegend(entity, nodeData.focusedLegend));
  const sides: Array<[string, Position]> = [
    ["t", Position.Top], ["b", Position.Bottom], ["l", Position.Left], ["r", Position.Right],
  ];
  return (
    <article
      className={[
        "eos-zone-node",
        selected ? "eos-column-selected" : "",
        entity.clickable === false ? "" : "eos-zone-clickable",
        dimmed ? "eos-dimmed" : "",
      ].filter(Boolean).join(" ")}
      style={{
        "--node-accent": accent,
        "--entity-background": TONE_COLORS[tone],
        "--entity-foreground": TONE_FOREGROUNDS[tone],
      } as CSSProperties}
      data-zone-id={entity.id}
      aria-label={`${entity.title}. ${entity.description}`}
    >
      {sides.map(([key, position]) => (
        <Handle key={`t${key}`} id={`t${key}`} type="target" position={position} className="eos-lane-handle" />
      ))}
      {sides.map(([key, position]) => (
        <Handle key={`s${key}`} id={`s${key}`} type="source" position={position} className="eos-lane-handle" />
      ))}
      <div className="eos-entity-topline">
        <div className="eos-entity-heading">
          {Icon && <Icon className="eos-entity-icon" aria-hidden="true" size={15} strokeWidth={2} />}
          <strong>{entity.title}</strong>
        </div>
        <button
          type="button"
          className="eos-info-button"
          aria-label={`Informationen zu ${entity.title}`}
          onClick={(event) => {
            event.stopPropagation();
            nodeData.onInspect(entity);
          }}
        >ⓘ</button>
      </div>
      {entity.description && <p className="eos-entity-description">{entity.description}</p>}
      {entity.id === "zone-legend" && (
        <ul className="eos-zone-legend" aria-label="Legende der 6 Leuchtfarben">
          {LEGEND.map((item) => (
            <li key={item.id}>
              <span className="eos-zone-swatch" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} aria-hidden="true" />
              {item.label} <code>{item.color}</code>
            </li>
          ))}
        </ul>
      )}
      {!!entity.metrics?.length && (
        <div className="eos-node-meta">
          {entity.metrics.map((metric) => <span className="eos-chip" key={metric}>{metric}</span>)}
        </div>
      )}
      {!!entity.children?.length && (
        <div className={`eos-entity-children eos-entity-layout-${entity.layout ?? "row"}`}>
          {entity.children.map((child) => (
            <ArchitectureContent key={child.id} entity={child} data={nodeData} />
          ))}
        </div>
      )}
    </article>
  );
}

function AnimatedDataEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
  source,
  target,
}: EdgeProps<FlowEdge>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    centerY: (sourceY + targetY) / 2 + (data?.laneOffset ?? 0),
  });
  const color = (style?.stroke as string) || "#D4AF37";
  const dimmed = Boolean(data?.dimmed);
  // Leitungen, die eine mittlere Spalte überqueren, werden leicht transparent, damit der Text darunter lesbar bleibt.
  const crossing = (source === "column-1" && target !== "column-2") || (source === "column-2" && target === "column-4");
  const capsuleText = (data?.packet ?? "Prozessfluss").replace(/ · \d$/, "");
  return (
    <>
      <g style={{
        opacity: dimmed ? 0.14 : crossing ? 0.4 : 1,
        filter: dimmed ? "grayscale(100%)" : "none",
        transition: "opacity 0.2s ease",
      }}>
        <path
          id={id}
          d={edgePath}
          fill="none"
          className="eos-edge-path"
          stroke={color}
          strokeWidth={3}
          markerEnd={markerEnd}
          style={{ color, animation: "apexDashFlow 1.2s linear infinite" }}
        />
        {/* Unsichtbare, breite Trefferfläche: Leitungen lassen sich per Maus/Touch zuverlässig treffen. */}
        <path
          className="react-flow__edge-interaction"
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
        />
        <circle className="eos-edge-pulse" r={3.5} fill={color} stroke="#F8FAFC" strokeWidth={1}>
          <animateMotion dur="2.2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      </g>
      {/* Schwebende Datenpaket-Kapsel: wandert entlang der Schiene (nur Schiene 1 je Leitungsgruppe, keine Überlagerung). */}
      {(data?.packet ?? "").endsWith("· 1") && !dimmed && (
        <g aria-hidden="true">
          <animateMotion dur={data?.fast ? "5s" : "8s"} repeatCount="indefinite" path={edgePath} />
          <rect
            x={-((capsuleText.length * 4.1 + 12) / 2)}
            y={-6.5}
            width={capsuleText.length * 4.1 + 12}
            height={13}
            rx={6.5}
            fill="#131C2E"
            stroke={color}
            strokeWidth={1.2}
          />
          <text textAnchor="middle" y={3} fontSize={7.5} fontWeight={700} fill="#F7E7CE">{capsuleText}</text>
        </g>
      )}
      {/* Das feste Etikett erscheint nur bei Hover/Auswahl (sonst wird es am Spaltenrand abgeschnitten). */}
      {(data?.showLabel || selected) && <EdgeLabelRenderer>
        <span
          className="eos-edge-packet nodrag nopan"
          style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          aria-label={`Datenpaket: ${data?.packet ?? "Prozessfluss"}`}
        >
          {(data?.packet ?? "Prozessfluss").replace(/ · 1$/, "")}
        </span>
      </EdgeLabelRenderer>}
      <EdgeToolbar edgeId={id} x={labelX} y={labelY} isVisible={selected}>
        <span className="eos-chip">Leitung · Details im Röntgen-Inspektor</span>
      </EdgeToolbar>
    </>
  );
}

function routeSegmentTitle(
  segment: string,
  roster: AgentDef[],
  legalRules: LegalRule[],
  capabilities: Capability[],
  bindings: Binding[],
  traces: LiveConnectionTraceDto[]
) {
  const agentNumber = /^agent-(\d+)$/.exec(segment)?.[1];
  if (agentNumber) {
    const agent = roster.find((item) => item.number === Number(agentNumber));
    return agent ? `#${agent.number} · ${agent.name}` : `#${agentNumber}`;
  }
  const departmentId = /^department-(\d+)$/.exec(segment)?.[1];
  if (departmentId) return DEPARTMENTS.find((item) => item.id === Number(departmentId))?.name ?? `Abteilung ${departmentId}`;
  const traceId = /^trace-(.+)$/.exec(segment)?.[1];
  if (traceId) {
    const trace = traces.find((item) => item.id === traceId);
    return trace ? `${trace.agentKey ?? "System"} → ${trace.channelKey}` : "Trace";
  }
  const ruleId = /^rule-(.+)$/.exec(segment)?.[1];
  if (ruleId) {
    const rule = legalRules.find((item) => item.id === ruleId);
    return rule ? `${rule.ruleKey} · ${rule.jurisdiction}` : "Rechtsregel";
  }
  const capabilityId = /^capability-(.+)$/.exec(segment)?.[1];
  if (capabilityId) return capabilities.find((item) => item.id === capabilityId)?.displayName ?? "Capability";
  const bindingId = /^binding-(.+)$/.exec(segment)?.[1];
  if (bindingId) return bindings.find((item) => item.id === bindingId)?.interfaceKey ?? "Schnittstelle";
  const cluster = roster.find((agent) => agent.specialistCluster === segment);
  if (cluster) return cluster.specialistCluster === "apex-system-coordinator" ? "#400 · System-Koordinator" : cluster.role;
  return TITLE_MAP[segment] ?? segment;
}

function makeAgentEntity(
  agent: AgentDef,
  performance: AgentPerformanceSnapshot,
  earnings: EarningsSummary
): Entity {
  const result = performance.byAgent[agent.key];
  const revenue = earnings.perAgent[agent.key];
  const legendId: LegendId = agent.number === 221 ? "control" : agent.auditDomain ? "control" : agent.departmentId === 5 || agent.departmentId === 23 ? "process" : "process";
  const trend = result?.trend === "UP" ? "▲" : result?.trend === "DOWN" ? "▼" : result?.trend === "STABLE" ? "►" : "—";
  return {
    id: `agent-${agent.number}`,
    title: `#${agent.number} · ${agent.name}`,
    description: agent.mission,
    group: "staff",
    legendId,
    sourceType: "agent",
    sourceId: agent.key,
    reportsTo: agent.reportsTo,
    agentNumber: agent.number,
    relationKey: agent.key,
    relationKeys: [agent.key],
    metrics: [
      agent.role,
      `Note ${result?.grade == null ? "n.v." : result.grade.toFixed(1).replace(".", ",")}`,
      `${trend} · ${result?.xp ?? 0} XP`,
      `Echt ${eur(revenue?.monthReal ?? 0)}`,
      `Potenzial ${eur(revenue?.monthPotential ?? 0)}`,
    ],
  };
}

function eur(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function entityForTrace(trace: LiveConnectionTraceDto, roster: AgentDef[]): Entity {
  const agent = roster.find((item) => item.key === trace.agentKey);
  const legendId: LegendId = trace.outcome !== "SUCCESS" || agent?.number === 221
    ? "control"
    : agent?.departmentId === 21 || agent?.departmentId === 22
      ? "feedback"
      : "data";
  return {
    id: `trace-${trace.id}`,
    title: `${trace.agentKey ?? "System"} → ${trace.channelKey}`,
    description: `${trace.eventType} · ${trace.outcome} · ${new Date(trace.occurredAt).toLocaleString("de-DE")}`,
    group: "trace",
    legendId,
    sourceType: "trace",
    sourceId: trace.id,
    relationKey: trace.agentKey ?? undefined,
    relationKeys: [trace.agentKey, trace.channelKey].filter((value): value is string => Boolean(value)),
    metrics: [trace.detail ?? "Kein Detail protokolliert", ...(trace.requestHash ? [`Request ${trace.requestHash.slice(0, 12)}…`] : [])],
  };
}

function getAgentScope(
  roster: AgentDef[],
  startNumbers: number[],
  includeDescendants = true
): AgentDef[] {
  const agentsByNumber = new Map(roster.map((agent) => [agent.number, agent]));
  const included = new Set(startNumbers.filter((number) => agentsByNumber.has(number)));
  const pending = [...included];
  while (pending.length) {
    const agent = agentsByNumber.get(pending.pop()!);
    if (agent?.reportsTo != null && agentsByNumber.has(agent.reportsTo) && !included.has(agent.reportsTo)) {
      included.add(agent.reportsTo);
      pending.push(agent.reportsTo);
    }
  }
  if (includeDescendants) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const agent of roster) {
        if (agent.reportsTo != null && included.has(agent.reportsTo) && !included.has(agent.number)) {
          included.add(agent.number);
          changed = true;
        }
      }
    }
  }
  return roster.filter((agent) => included.has(agent.number));
}

function makeAgentForest(
  roster: AgentDef[],
  performance: AgentPerformanceSnapshot,
  earnings: EarningsSummary
): Entity[] {
  const agentsByNumber = new Map(roster.map((agent) => [agent.number, agent]));
  const childrenByNumber = new Map<number, AgentDef[]>();
  const roots: AgentDef[] = [];
  for (const agent of roster) {
    if (agent.reportsTo != null && agentsByNumber.has(agent.reportsTo) && agent.reportsTo !== agent.number) {
      const children = childrenByNumber.get(agent.reportsTo) ?? [];
      children.push(agent);
      childrenByNumber.set(agent.reportsTo, children);
    } else {
      roots.push(agent);
    }
  }

  const visited = new Set<number>();
  const buildTree = (agent: AgentDef, depth: number): Entity => {
    visited.add(agent.number);
    const children = (childrenByNumber.get(agent.number) ?? [])
      .filter((child) => !visited.has(child.number))
      .sort((left, right) => left.number - right.number)
      .map((child) => buildTree(child, depth + 1));
    const entity = makeAgentEntity(agent, performance, earnings);
    return { ...entity, depth, ...(children.length ? { children, layout: "stack" as const } : {}) };
  };
  const result = roots
    .sort((left, right) => left.number - right.number)
    .map((agent) => buildTree(agent, 0));
  for (const agent of roster) {
    if (!visited.has(agent.number)) result.push(buildTree(agent, 0));
  }
  return result;
}

function makeEntity(
  id: string,
  title: string,
  description: string,
  legendId: LegendId,
  options: Partial<Entity> = {}
): Entity {
  const toneByLegend: Record<LegendId, EntityTone> = {
    command: "obsidian",
    control: "burgundy",
    process: "sapphire",
    infrastructure: "steelSlate",
    feedback: "violet",
    data: "petrol",
  };
  return {
    id,
    title,
    description,
    legendId,
    group: options.group ?? "detail",
    route: options.route ?? id,
    tone: options.tone ?? toneByLegend[legendId],
    ...options,
  };
}

function makeSection(
  id: string,
  title: string,
  children: Entity[],
  options: Partial<Entity> = {}
): Entity {
  const defaultRoutes: Record<string, string> = {
    "academic-qualification": "academy",
    "knowledge-management": "knowledge",
    "synthetic-data": "core-ai",
    "pillar-workflow": "departments",
    "pillar-communication": "departments",
    "pillar-integration": "interfaces",
    "pillar-support": "departments",
    "world-ecosystem": "interfaces",
    "data-telemetry": "traces",
    "org-directory": "staff",
  };
  return makeEntity(id, title, options.description ?? "", options.legendId ?? "infrastructure", {
    ...options,
    route: options.route ?? defaultRoutes[id] ?? id,
    children,
    layout: options.layout ?? "stack",
  });
}

function makeDepartmentEntity(
  department: (typeof DEPARTMENTS)[number],
  roster: AgentDef[],
  performance: AgentPerformanceSnapshot,
  earnings: EarningsSummary,
  tone: EntityTone
): Entity {
  const head = roster.find((agent) => agent.number === department.headNumber);
  const count = roster.filter((agent) => agent.departmentId === department.id).length;
  return makeSection(
    `department-${department.id}`,
    `Abt. ${department.id} · ${department.name}`,
    [
      head
        ? makeAgentEntity(head, performance, earnings)
        : makeEntity(`department-head-${department.id}`, "Abteilungsleitung", "Profil nicht in den sichtbaren Roster-Daten.", "process", { clickable: false }),
      makeEntity(`department-roster-${department.id}`, "Hierarchischen Bereich öffnen", `${count} Profile · Leitung #${department.headNumber ?? "—"}`, "process", {
        route: `department-${department.id}`,
        metrics: ["Team-Drilldown"],
      }),
    ],
    {
      description: department.mechanism,
      legendId: "process",
      route: `department-${department.id}`,
      tone,
      sourceType: "department",
      sourceId: String(department.id),
    }
  );
}


function makeColumn(
  id: string,
  title: string,
  width: number,
  children: Entity[],
  description: string
): Entity {
  return makeEntity(id, title, description, "infrastructure", {
    column: Number(id.slice(-1)) as 1 | 2 | 3 | 4,
    width,
    isColumn: true,
    children,
    clickable: false,
    layout: "stack",
  });
}

/** 10 Fachbereiche des Blueprints -> reale DEPARTMENTS-IDs (Anzeige-Label, Abteilungs-ID). */
const ZONE_DEPARTMENTS: Array<[string, number]> = [
  ["Workflow", 24], ["Content", 6], ["Code", 25], ["Support", 14], ["Legal/IP", 21],
  ["Finance", 12], ["Growth", 16], ["BI", 20], ["Product", 2], ["Procurement", 10],
];

const ZONE_GROUPS = [
  "ZONE 1 · EBENE 1–3 · Souveräne Spitze & Meta-Führung",
  "ZONE 2 · EBENE 4–5 · Operative Orchestrierung & 10 Fachbereiche",
  "ZONE 3 · EBENE 6–8 · KI-Akademie, Überwachung & Forensik",
  "ZONE 4 · EBENE 9–14 · Infrastruktur, Mandanten & Cockpit",
  "ZONE 5 · EBENE 15–18 · Frontier & Omega-Erweiterungen",
] as const;

function zoneEntity(
  id: string, title: string, description: string, legendId: LegendId,
  x: number, y: number, w: number, h: number, group: string, options: Partial<Entity> = {}
): Entity {
  return makeEntity(id, title, description, legendId, { group, zone: { x, y, w, h }, tone: "obsidian", ...options });
}

/** Zone 1 (Ebene 1–3) und Zone 2 (Ebene 4–5) des Blueprints. */
function buildZoneTop(props: Props): Entity[] {
  const owner = props.ownerShop;
  const ownerOnly = "Owner-only; für Subscriber ausgeblendet.";
  const meta = owner ? props.roster.find((agent) => agent.number === 0) : undefined;
  const [z1, z2] = ZONE_GROUPS;
  const metaEntity: Entity = meta
    ? {
      ...makeAgentEntity(meta, props.performance, props.earnings),
      id: "meta-hypervisor",
      title: "Übergeordnete Meta-KI (Hypervisor)",
      description: "#000 System-Guardian · Hypervisor-Instanz",
      route: "meta-hypervisor",
      legendId: "command",
      tone: "obsidian",
      group: z1,
      metrics: ["#000"],
      zone: { x: 590, y: 60, w: 620, h: 80 },
    }
    : zoneEntity("meta-hypervisor", "Übergeordnete Meta-KI (Hypervisor)", ownerOnly, "command", 590, 60, 620, 80, z1, { clickable: false });
  const departments = ZONE_DEPARTMENTS.map(([label, departmentId], index) => {
    const department = DEPARTMENTS.find((item) => item.id === departmentId);
    const allowed = props.allowedDepartmentIds.includes(departmentId);
    return zoneEntity(
      `department-${departmentId}`,
      `${index + 1}. ${label}`,
      allowed ? (department?.name ?? `Abteilung ${departmentId}`) : "Nicht gebucht",
      "process",
      74 + index * 166, 350, 158, 64, z2,
      { clickable: allowed, route: `department-${departmentId}`, sourceType: "department", sourceId: String(departmentId), departmentId }
    );
  });
  return [
    zoneEntity("owner-architect", "App-Inhaber (Mensch)", owner ? "Command & Alignment Control · OwnerRule & Veto" : ownerOnly, "command", 20, 20, 420, 90, z1, { clickable: owner, metrics: owner ? ["OWNER VETO", "DRY_RUN_MODE"] : undefined }),
    zoneEntity("constitutional", "Constitutional Core [Unantastbare Verfassung]", owner ? "Ethik-Kern & unveränderliche Schutzregeln" : ownerOnly, "control", 1360, 20, 420, 90, z1, { clickable: owner }),
    metaEntity,
    zoneEntity("agent-factory-constitutional", "Agenten-Fabrik (Spawner)", `#401 → ∞ · ${props.dynamicCount} dynamische Profile geladen`, "process", 350, 150, 500, 90, z1, { route: "agent-factory", clickable: owner, metrics: ["OWNER ONLY"] }),
    zoneEntity("consensus-jury", "Consensus-Jury & Devil's Advocate", "Prüfprofile #222–#225 · Kritiker-Agent #221", "control", 950, 150, 500, 90, z1, { route: "staff", metrics: ["#221", "#222–#225"] }),
    zoneEntity("process-orchestration", "Master-Orchestrator (CEO-Agent)", "Planung · Ausführung · Reporting über alle Fachbereiche", "command", 640, 270, 520, 50, z2),
    ...departments,
    zoneEntity("external-ecosystem", "Externes A2A- & MCP-Gateway", `${props.bindings.length} Interface-Bindings`, "infrastructure", 640, 430, 520, 40, z2, { route: "interfaces" }),
  ];
}

/** Zone 3 (Ebene 6–8), Zone 4 (Ebene 9–14) und Zone 5 (Ebene 15–18 + Legende). */
function buildZoneBottom(props: Props, traces: LiveConnectionTraceDto[]): Entity[] {
  const [, , z3, z4, z5] = ZONE_GROUPS;
  const card = (id: string, title: string, legendId: LegendId = "infrastructure") =>
    makeEntity(id, title, "Architekturkarte", legendId, { clickable: false, tone: "obsidian" });
  return [
    zoneEntity("academic-qualification", "KI-Akademie", "Professoren-, Dozenten-Agenten & Prompt-Alchemist", "process", 20, 500, 400, 150, z3, { route: "academy" }),
    zoneEntity("certification-gateways", "Certification Gateway", "Zertifizierung aus vorhandenen Profilwerten", "control", 450, 500, 260, 150, z3, { route: "academy" }),
    zoneEntity("self-healing", "Überwachung & Forensik", `KI-QM, Watchdog, Chaos-Monkey, Live-Code-Chirurg · ${props.legalRules.length} Rechtsregeln`, "control", 740, 500, 540, 150, z3, { route: "self-healing" }),
    zoneEntity("ledger", "Unveränderliches Krypto-Audit-Ledger (SHA-256)", `${traces.length} Live-Traces · Quell- und Trace-Hashes`, "data", 1310, 500, 470, 150, z3, { route: "ledger" }),
    zoneEntity("infrastructure", "Infrastruktur", `Vektordatenbank RAG, Knowledge-Graph, Tool-Registry & Sandbox · ${props.capabilities.length} Capabilities`, "infrastructure", 20, 680, 560, 150, z4),
    zoneEntity("tenant-billing", "Mandanten & Monetarisierung", "Billing & Multi-Tenant-Isolation (Architekturkarte)", "infrastructure", 620, 680, 560, 150, z4, { clickable: false }),
    zoneEntity("cockpit-failover", "Cockpit & Failover", "Human-Experience Live-Cockpit XAI & Multi-Provider-Failover", "data", 1220, 680, 560, 150, z4, { route: "traces", metrics: [`${traces.length} Traces`] }),
    zoneEntity("frontier-group", "Frontier Ebenen 15–17", "", "infrastructure", 20, 860, 840, 170, z5, {
      clickable: false,
      layout: "grid",
      children: [
        card("mcp-a2a-dual-stack", "MCP & A2A Dual-Stack"),
        card("business-ontology", "Unternehmens-Business-Ontologie"),
        card("anti-pathology-guard", "Anti-Pathologie-Wächter", "control"),
        card("ephemeral-compute", "Ephemeral Compute"),
        card("formal-verification", "Formal Verification Circuit-Breaker", "control"),
      ],
    }),
    zoneEntity("omega-group", "Omega Ebene 18", "", "feedback", 890, 860, 470, 170, z5, {
      clickable: false,
      layout: "row",
      children: [
        card("smart-contract-escrow", "Smart-Contract-Treuhand", "feedback"),
        card("post-quantum-security", "Post-Quantum-Security", "feedback"),
        card("time-travel-debugger", "Time-Travel-Debugger", "feedback"),
      ],
    }),
    zoneEntity("zone-legend", "LEGENDE", "", "command", 1390, 860, 390, 170, z5, { clickable: false }),
  ];
}

function buildZoneEntities(props: Props, traces: LiveConnectionTraceDto[]): Entity[] {
  return [...buildZoneTop(props), ...buildZoneBottom(props, traces)];
}

function buildChildren(
  path: string[],
  props: Props,
  traces: LiveConnectionTraceDto[]
): Entity[] {
  const leaf = path[path.length - 1];
  const departments = DEPARTMENTS.filter((department) => props.allowedDepartmentIds.includes(department.id));
  const roster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
  const toAgent = (agent: AgentDef) => makeAgentEntity(agent, props.performance, props.earnings);

  if (!leaf) return buildZoneEntities(props, traces);
  if (!props.ownerShop && ["owner-architect", "constitutional", "meta-hypervisor", "agent-factory"].includes(leaf)) return [];
  const pillarId = Object.prototype.hasOwnProperty.call(PILLAR_DEPARTMENT_IDS, leaf) ? leaf : undefined;
  if (pillarId) {
    const toneByPillar: Record<string, EntityTone> = {
      "pillar-workflow": "workflowBlue",
      "pillar-communication": "bronze",
      "pillar-integration": "burgundy",
      "pillar-support": "emerald",
    };
    return DEPARTMENTS
      .filter((department) =>
        props.allowedDepartmentIds.includes(department.id) &&
        PILLAR_DEPARTMENT_IDS[pillarId].includes(department.id)
      )
      .map((department) => makeDepartmentEntity(
        department,
        roster,
        props.performance,
        props.earnings,
        toneByPillar[pillarId]
      ));
  }
  if (["workflow", "process-orchestration"].includes(leaf)) {
    return [
      { id: "event-bus", title: "Real-Time Event-Bus", description: `${traces.length} gespeicherte Traces`, group: "center", legendId: "data", metrics: ["Live-Ereignisse"] },
      { id: "traces", title: "Beobachtete Verbindungen", description: "Nur protokollierte Ereignisse", group: "center", legendId: "data" },
      { id: "departments", title: "Fachabteilungen", description: `${departments.length} sichtbare Abteilungen`, group: "center", legendId: "process" },
    ];
  }
  if (leaf === "event-bus") {
    return [
      { id: "integrated-ecosystem", title: "Integrated Ecosystem", description: "Capabilities, Schnittstellen und Datenflüsse.", group: "center", legendId: "data" },
      { id: "traces", title: "Beobachtete Verbindungen", description: `${traces.length} tatsächlich gespeicherte Ereignisse`, group: "center", legendId: "data" },
    ];
  }
  if (leaf === "integrated-ecosystem") {
    return [
      { id: "interfaces", title: "Schnittstellen-Detail", description: `${props.capabilities.length} Capabilities · ${props.bindings.length} Bindings`, group: "center", legendId: "infrastructure" },
      { id: "system-performance", title: "System Performance & Telemetry", description: "Vorhandene Pulse-/Trace-Daten; kein erfundener A/B-Teststatus.", group: "center", legendId: "feedback" },
    ];
  }
  if (leaf === "owner-architect") {
    return [
      { id: "constitutional", title: "Owner-Veto & Constitutional Core", description: "Owner-Regeln und bestehende Schutzebenen.", group: "center", legendId: "command", metrics: ["Owner-only"] },
      { id: "agent-0", title: "#000 · System-Guardian", description: "Personalakte aus den vorhandenen Roster-Daten.", group: "center", legendId: "command" },
    ];
  }
  if (leaf === "core-ai") {
    return [
      { id: "specialists", title: "Fachcluster", description: "Vorhandene Mitarbeitercluster.", group: "center", legendId: "process" },
      { id: "interfaces", title: "Capabilities & Schnittstellen", description: "Gespeicherte Quellen und Bindings.", group: "center", legendId: "infrastructure" },
    ];
  }
  if (leaf === "academy") return makeAgentForest(roster, props.performance, props.earnings);
  if (leaf === "constitutional") {
    const constitutionalAgents = roster.filter((agent) => [0, 221, 222, 223, 224, 225, 400].includes(agent.number));
    return makeAgentForest(
      getAgentScope(roster, constitutionalAgents.map((agent) => agent.number)),
      props.performance,
      props.earnings
    );
  }
  if (leaf === "meta-hypervisor") {
    const metaAgent = roster.find((agent) => agent.number === 0);
    if (!metaAgent) return [];
    const systemGuardian = {
      ...toAgent(metaAgent),
      id: "agent-0",
      title: "#000 · System-Guardian",
      route: "agent-0",
      tone: "obsidian" as const,
      children: makeAgentForest(
        roster.filter((agent) => agent.number !== 0),
        props.performance,
        props.earnings
      ),
    };
    return [systemGuardian];
  }
  if (leaf === "infrastructure" || leaf === "self-healing") {
    return [
      { id: "interfaces", title: "Capability-Quellen & Bindings", description: `${props.capabilities.length} Capabilities · ${props.bindings.length} Schnittstellen`, group: "center", legendId: "infrastructure" },
      { id: "traces", title: "Live-Traces", description: `${traces.length} tatsächlich gespeicherte Ereignisse`, group: "center", legendId: "data" },
      { id: "laws", title: "Rechts- & Steuerquellen", description: `${props.legalRules.length} Ledger-Einträge`, group: "center", legendId: "control" },
    ];
  }
  if (leaf === "traces") return traces.map((trace) => entityForTrace(trace, roster));
  if (leaf === "system-performance") return traces.map((trace) => entityForTrace(trace, roster));
  if (leaf === "interfaces" || leaf === "knowledge") {
    return [
      ...props.capabilities.map((item) => ({
        id: `capability-${item.id}`,
        title: item.displayName,
        description: `${item.feasibility} · ${item.isVerified ? "Quelle geprüft" : "nicht verifiziert"}${item.verifiedAt ? ` · ${new Date(item.verifiedAt).toLocaleDateString("de-DE")}` : ""}`,
        group: "interface",
        legendId: "infrastructure" as LegendId,
        sourceType: "capability" as const,
        sourceId: item.id,
        relationKey: item.domainKey,
        relationKeys: [item.domainKey],
        metrics: [item.riskLevel, item.estimatedCostEur == null ? "Kosten nicht angegeben" : eur(item.estimatedCostEur)],
      })),
      ...props.bindings.map((item) => ({
        id: `binding-${item.id}`,
        title: item.interfaceKey,
        description: `${item.agentKey} · ${item.status}${item.isNewlySpawnedInterface ? " · neu erzeugt" : ""}`,
        group: "interface",
        legendId: item.isNewlySpawnedInterface ? "command" as LegendId : "data" as LegendId,
        sourceType: "binding" as const,
        sourceId: item.id,
        relationKey: props.capabilities.find((capability) =>
          item.interfaceKey === capability.domainKey || item.interfaceKey.startsWith(`${capability.domainKey}:`)
        )?.domainKey,
        relationKeys: [item.agentKey, item.interfaceKey],
        newlySpawned: item.isNewlySpawnedInterface,
        metrics: [item.lastVerifiedAt ? `Geprüft ${new Date(item.lastVerifiedAt).toLocaleDateString("de-DE")}` : "Noch nicht geprüft"],
      })),
    ];
  }
  if (leaf === "departments") {
    return departments.map((department) => makeDepartmentEntity(
      department,
      roster,
      props.performance,
      props.earnings,
      department.kind === "panel" ? "deepBordeaux" : department.kind === "harmony" ? "sageEmerald" : "steelSlate"
    ));
  }
  const departmentMatch = /^department-(\d+)$/.exec(leaf);
  if (departmentMatch) {
    const departmentId = Number(departmentMatch[1]);
    const departmentAgents = roster.filter((agent) => agent.departmentId === departmentId);
    return makeAgentForest(
      getAgentScope(roster, departmentAgents.map((agent) => agent.number)),
      props.performance,
      props.earnings
    );
  }
  if (leaf === "staff") return makeAgentForest(roster, props.performance, props.earnings);
  if (leaf === "specialists") {
    const clusters = new Map<string, AgentDef[]>();
    for (const agent of roster) {
      if (!agent.specialistCluster) continue;
      const current = clusters.get(agent.specialistCluster) ?? [];
      current.push(agent);
      clusters.set(agent.specialistCluster, current);
    }
    return [...clusters.entries()].map(([cluster, agents]) => ({
      id: cluster,
      title: cluster === "apex-system-coordinator" ? "#400 · System-Koordinator" : agents[0]?.role ?? cluster,
      description: `${agents.length} Profile im Cluster`,
      group: "specialists",
      legendId: "process",
      metrics: [`#${Math.min(...agents.map((agent) => agent.number))}–#${Math.max(...agents.map((agent) => agent.number))}`],
    }));
  }
  if (leaf === "agent-factory") {
    const dynamicAgents = roster.filter((agent) => agent.dynamic);
    return makeAgentForest(
      getAgentScope(roster, dynamicAgents.map((agent) => agent.number), false),
      props.performance,
      props.earnings
    );
  }
  if (leaf === "laws" || leaf === "ledger") {
    return props.legalRules.map((rule) => ({
      id: `rule-${rule.id}`,
      title: `${rule.ruleKey} · ${rule.jurisdiction}`,
      description: `${rule.reviewStatus} · ${rule.sourceTitle}`,
      group: "law",
      legendId: "control",
      sourceType: "law",
      sourceId: rule.id,
      metrics: [`Geprüft ${new Date(rule.verifiedAt).toLocaleDateString("de-DE")}`, `SHA-256 ${rule.sourceHash.slice(0, 12)}…`],
    }));
  }
  const agentMatch = /^agent-(\d+)$/.exec(leaf);
  if (agentMatch) {
    const agent = roster.find((item) => item.number === Number(agentMatch[1]));
    if (!agent) return [];
    const hierarchy = makeAgentForest(
      getAgentScope(roster, [agent.number]),
      props.performance,
      props.earnings
    );
    return [
      ...hierarchy,
      ...traces.filter((trace) => trace.agentKey === agent.key).map((trace) => entityForTrace(trace, roster)),
    ];
  }
  const capabilityMatch = /^capability-(.+)$/.exec(leaf);
  if (capabilityMatch) {
    const capability = props.capabilities.find((item) => item.id === capabilityMatch[1]);
    return capability ? props.bindings.filter((binding) =>
      binding.interfaceKey === capability.domainKey || binding.interfaceKey.startsWith(`${capability.domainKey}:`)
    ).map((binding) => ({
      id: `binding-${binding.id}`,
      title: binding.interfaceKey,
      description: `${binding.agentKey} · ${binding.status}`,
      group: "interface",
      legendId: "data",
      sourceType: "binding",
      sourceId: binding.id,
      relationKeys: [binding.agentKey, binding.interfaceKey],
    })) : [];
  }
  if (leaf.startsWith("trace-")) return [];
  if (leaf.startsWith("rule-") || leaf.startsWith("binding-")) return [];
  const clusterAgents = roster.filter((agent) => agent.specialistCluster === leaf);
  if (clusterAgents.length) return makeAgentForest(clusterAgents, props.performance, props.earnings);
  return [];
}

function buildSubpageColumns(
  path: string[],
  props: Props,
  pageEntities: Entity[],
  traces: LiveConnectionTraceDto[]
): Entity[] {
  const visibleRoster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
  const departmentSegment = [...path].reverse().find((segment) => /^department-\d+$/.test(segment));
  const departmentId = departmentSegment ? Number(departmentSegment.slice("department-".length)) : undefined;
  const department = DEPARTMENTS.find((item) => item.id === departmentId);
  const agents = pageEntities.filter((entity) => entity.sourceType === "agent");
  const records = pageEntities.filter((entity) => entity.sourceType !== "agent");
  const director = department?.directorNumber == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === department.directorNumber);
  const leader = department?.headNumber == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === department.headNumber);
  const rules = props.legalRules.map((rule) => makeEntity(
    `rule-${rule.id}`,
    `${rule.ruleKey} · ${rule.jurisdiction}`,
    `${rule.reviewStatus} · ${rule.sourceTitle}`,
    "control",
    { sourceType: "law", sourceId: rule.id, metrics: [`SHA-256 ${rule.sourceHash.slice(0, 12)}…`] }
  ));
  const capabilities = props.capabilities.map((item) => makeEntity(
    `capability-${item.id}`,
    item.displayName,
    `${item.feasibility} · ${item.isVerified ? "Quelle geprüft" : "nicht verifiziert"}`,
    "infrastructure",
    { sourceType: "capability", sourceId: item.id, relationKey: item.domainKey, relationKeys: [item.domainKey] }
  ));
  const visibleTraces = traces.map((trace) => entityForTrace(trace, visibleRoster));

  const columnOne = [
    makeSection("subpage-knowledge-rules", "SCHULUNGS-ZERTIFIKATE & WISSENS-REGELN", [
      ...rules,
      ...capabilities,
      makeEntity("subpage-path-record", "Aktueller Breadcrumb-Pfad", path.join(" › "), "command", { clickable: false }),
    ], { legendId: "control" }),
  ];
  const columnTwo = [
    makeSection("subpage-leadership", "BEREICHSLEITUNG VP / DIREKTOR", [
      ...(director ? [makeAgentEntity(director, props.performance, props.earnings)] : []),
      ...(leader && leader.number !== director?.number ? [makeAgentEntity(leader, props.performance, props.earnings)] : []),
      ...(!director && !leader
        ? [makeEntity("subpage-no-leadership", department ? `Leitung · Abt. ${department.id}` : "Zuständige Bereichsleitung", "Kein sichtbares Leitungsprofil im Roster.", "process", { clickable: false })]
        : []),
    ], { layout: "stack", legendId: "process", tone: "platinumSlate" }),
    makeSection("subpage-core-models", "KI-KERNMODELLE & ZUSTÄNDIGKEIT", [
      makeEntity("subpage-model-policy", "Modell-Routing", "Im bestehenden Roster-/Dashboard-Datensatz nicht je Bereich ausgewiesen.", "infrastructure", { clickable: false }),
      makeEntity("subpage-reversible", "Reversible Aufgaben", "Ausführung bleibt den vorhandenen Autopilot-/Owner-Regeln unterstellt.", "control", { clickable: false }),
      makeEntity("subpage-irreversible", "Irreversible Aufgaben", "Die Karte löst keine Freigabe und keine Aktion aus.", "control", { route: "approval-queue" }),
    ], { legendId: "process" }),
  ];
  const columnThree = [
    makeSection("subpage-governance", "ABTEILUNGS-GOVERNANCE", [
      ...(department ? [makeEntity(
        `department-${department.id}`,
        `Abt. ${department.id} · ${department.name}`,
        department.mechanism,
        "control",
        { sourceType: "department", sourceId: String(department.id) }
      )] : []),
      ...(leader ? [makeAgentEntity(leader, props.performance, props.earnings)] : []),
      ...(records.length ? records : [makeEntity("subpage-no-records", "Keine Detaildatensätze", "Für diesen Unterpfad liegen keine weiteren Datensätze vor.", "infrastructure", { clickable: false })]),
    ], { legendId: "control" }),
    makeSection("subpage-specialists", `TEAM & MITARBEITER · ${agents.length} PROFILE`, [
      ...agents,
      ...(props.ownerShop && props.dynamicCount > 0
        ? [makeEntity("subpage-dynamic-cluster", "Dynamische KI-Hilfs-Bots #401 → ∞", `${props.dynamicCount} dynamische Profile insgesamt; geladene Profile erscheinen hier einzeln.`, "feedback", { route: "agent-factory" })]
        : []),
    ], { legendId: "process" }),
    makeEntity("event-bus", "BEREICHS-EVENT-BUS", `${traces.length} tatsächlich gespeicherte Ereignisse; keine Trace-Endpunkte angenommen.`, "data", { metrics: ["Event-Sourcing"] }),
    makeSection("subpage-bindings", "AKTIVE SCHNITTSTELLEN & BINDINGS", [
      ...capabilities,
      ...props.bindings.map((binding) => makeEntity(
        `binding-${binding.id}`,
        binding.interfaceKey,
        `${binding.agentKey} · ${binding.status}`,
        binding.isNewlySpawnedInterface ? "command" : "data",
        { sourceType: "binding", sourceId: binding.id, relationKeys: [binding.agentKey, binding.interfaceKey], newlySpawned: binding.isNewlySpawnedInterface }
      )),
    ], { legendId: "infrastructure" }),
    makeSection("infrastructure", "CORE TECHNICAL BACKBONE", [
      makeEntity("subpage-sandbox", "Tool-Registry & Sandbox", "Backbone-Architektur", "infrastructure", { clickable: false }),
      makeEntity("subpage-rollback", "Versionierung & 1-Klick-Rollback", "Backbone-Architektur", "feedback", { clickable: false }),
      makeEntity("subpage-zero-trust", "Zero-Trust & Security", "Backbone-Architektur", "control", { clickable: false }),
    ], { legendId: "infrastructure", dark: true, tone: "steelSlate" }),
  ];
  const columnFour = [
    makeSection("subpage-quality", "BEREICHS-QM & PRÜFUNG", [
      makeEntity("subpage-quality-rules", "Quellen- & Rechtsprüfung", `${props.legalRules.length} Regeln verfügbar`, "control", { route: "laws" }),
      makeEntity("subpage-quality-capabilities", "Capability-Prüfung", `${props.capabilities.length} Quellen · ${props.bindings.length} Bindings`, "infrastructure", { route: "interfaces" }),
      makeEntity("subpage-quality-owner", "Owner-Regeln / Dry-Run", "Vorhandene Schutzregeln bleiben maßgeblich; kein Override hier.", "command", { clickable: false }),
    ], { legendId: "control" }),
    makeSection("ledger", `LEDGER-BELEGE · ${visibleTraces.length} TRACES`, [
      ...visibleTraces,
      ...rules,
    ], { legendId: "data", dark: true, tone: "deepBordeaux" }),
  ];

  return [
    makeColumn("column-1", "SPALTE 1 · ZERTIFIKATE & WISSEN", 310, columnOne, "Regeln · Fähigkeiten · Pfad"),
    makeColumn("column-2", "SPALTE 2 · LEITUNG & MODELLE", 250, columnTwo, "Verantwortung · Kern"),
    makeColumn("column-3", "SPALTE 3 · BEREICHS-MATRIX", 920, columnThree, "Governance · Team · Events · Bindings"),
    makeColumn("column-4", "SPALTE 4 · QM & LEDGER", 310, columnFour, "Prüfung · Traces · Nachweise"),
  ];
}

/** Verbindungen des 5-Zonen-Blueprints: [Quelle, Ziel, Leuchtfarbe, Paketname, Quell-Seite, Ziel-Seite]. */
type Side = "t" | "b" | "l" | "r";
type ZoneLink = [string, string, LegendId, string, Side, Side];

function zoneLinks(): ZoneLink[] {
  const links: ZoneLink[] = [
    ["owner-architect", "meta-hypervisor", "command", "Owner-Direktive", "r", "l"],
    ["constitutional", "meta-hypervisor", "control", "Verfassungs-Prüfung", "l", "r"],
    ["meta-hypervisor", "agent-factory-constitutional", "command", "Spawn-Auftrag", "b", "t"],
    ["meta-hypervisor", "consensus-jury", "control", "Jury-Vorlage", "b", "t"],
    ["meta-hypervisor", "process-orchestration", "command", "Master-Plan", "b", "t"],
    ["agent-factory-constitutional", "process-orchestration", "process", "Neue Agenten", "b", "l"],
    ["consensus-jury", "process-orchestration", "control", "Konsens-Urteil", "b", "r"],
  ];
  for (const [, departmentId] of ZONE_DEPARTMENTS) {
    links.push(["process-orchestration", `department-${departmentId}`, "process", "Fachauftrag", "b", "t"]);
    links.push([`department-${departmentId}`, "external-ecosystem", "infrastructure", "Tool-Zugriff", "b", "t"]);
  }
  links.push(
    ["external-ecosystem", "academic-qualification", "infrastructure", "Wissens-Zugang", "b", "t"],
    ["external-ecosystem", "self-healing", "control", "Prüf-Telemetrie", "b", "t"],
    ["external-ecosystem", "ledger", "data", "Audit-Ereignisse", "b", "t"],
    ["academic-qualification", "certification-gateways", "process", "Zertifizierung", "r", "l"],
    ["certification-gateways", "self-healing", "control", "Freigabe-Prüfung", "r", "l"],
    ["self-healing", "ledger", "data", "Forensik-Hashes", "r", "l"],
    ["academic-qualification", "infrastructure", "infrastructure", "Wissensbasis", "b", "t"],
    ["self-healing", "tenant-billing", "infrastructure", "Isolations-Check", "b", "t"],
    ["ledger", "cockpit-failover", "data", "Live-Traces", "b", "t"],
    ["infrastructure", "tenant-billing", "infrastructure", "Mandanten-Daten", "r", "l"],
    ["tenant-billing", "cockpit-failover", "data", "XAI-Status", "r", "l"],
    ["infrastructure", "frontier-group", "infrastructure", "Frontier-Stack", "b", "t"],
    ["tenant-billing", "omega-group", "feedback", "Omega-Treuhand", "b", "t"],
    ["cockpit-failover", "zone-legend", "data", "Cockpit-Signale", "b", "t"],
  );
  return links;
}

function layoutZoneGraph(
  entities: Entity[],
  focusedId: string | null,
  focusedLegend: LegendId | null,
  visibleLegend: Set<LegendId>,
  onActivate: (entity: Entity) => void,
  onHover: (entity: Entity | null) => void,
  onInspect: (entity: Entity) => void
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const ids = new Set(entities.map((entity) => entity.id));
  const links = zoneLinks().filter(([source, target]) => ids.has(source) && ids.has(target));
  const edgeId = (index: number) => `zone-edge-${index}`;
  const focusedEdgeId = focusedId?.startsWith("edge-") ? focusedId.slice(5) : null;
  const active = new Set<string>();
  if (focusedEdgeId) {
    links.forEach(([source, target], index) => {
      if (edgeId(index) === focusedEdgeId) { active.add(source); active.add(target); }
    });
  } else if (focusedId) {
    active.add(focusedId);
    for (const [source, target] of links) {
      if (source === focusedId) active.add(target);
      if (target === focusedId) active.add(source);
    }
  }
  const nodes: FlowNode[] = entities.filter((entity) => entity.zone).map((entity) => ({
    id: entity.id,
    type: "zone" as const,
    position: { x: entity.zone!.x, y: entity.zone!.y },
    width: entity.zone!.w,
    height: entity.zone!.h,
    data: {
      entity, onActivate, onHover, onInspect, visibleLegend, focusedId, focusedLegend,
      relatedIds: new Set(active), activeColumns: active,
    },
    ariaLabel: entity.title,
    draggable: false,
  }));
  const allRecords = flattenEntities(entities);
  const traceIds = allRecords.filter((entity) => entity.sourceType === "trace" && entity.sourceId).map((entity) => entity.sourceId!);
  const bindingIds = allRecords.filter((entity) => entity.sourceType === "binding" && entity.sourceId).map((entity) => entity.sourceId!);
  const ownerAccess = ids.has("owner-architect");
  const routeFor = (legendId: LegendId): string =>
    legendId === "command" ? (ownerAccess ? "owner-architect" : "departments")
      : legendId === "control" ? "laws"
        : legendId === "data" ? "traces"
          : legendId === "infrastructure" ? "interfaces"
            : legendId === "feedback" ? "self-healing"
              : "departments";
  const edges: FlowEdge[] = links.map(([source, target, legendId, packet, from, to], index) => {
    const related = active.has(source) && active.has(target);
    const dimmed = Boolean(
      (focusedId && !(focusedEdgeId ? focusedEdgeId === edgeId(index) : related)) ||
      (focusedLegend && focusedLegend !== legendId) ||
      !visibleLegend.has(legendId)
    );
    return {
      id: edgeId(index),
      source,
      target,
      sourceHandle: `s${from}`,
      targetHandle: `t${to}`,
      type: "apex" as const,
      selectable: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS[legendId] },
      style: { stroke: EDGE_COLORS[legendId] },
      data: {
        legendId,
        packet: `${packet} · 1`,
        laneOffset: 0,
        dimmed,
        showLabel: focusedEdgeId === edgeId(index) || (focusedLegend === legendId && index % 6 === 0),
        fast: legendId === "command" || legendId === "data",
        relatedIds: [source, target],
        traceIds: legendId === "data" || legendId === "control" ? traceIds : [],
        bindingIds: legendId === "infrastructure" ? bindingIds : [],
        route: routeFor(legendId),
      },
    };
  });
  return { nodes, edges };
}

function layoutGraph(
  entities: Entity[],
  focusedId: string | null,
  focusedLegend: LegendId | null,
  visibleLegend: Set<LegendId>,
  onActivate: (entity: Entity) => void,
  onHover: (entity: Entity | null) => void,
  onInspect: (entity: Entity) => void
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  if (entities.some((entity) => entity.zone)) {
    return layoutZoneGraph(entities, focusedId, focusedLegend, visibleLegend, onActivate, onHover, onInspect);
  }
  const positions = new Map([
    ["column-1", { x: 20, width: 310 }],
    ["column-2", { x: 370, width: 250 }],
    ["column-3", { x: 680, width: 920 }],
    ["column-4", { x: 1680, width: 310 }],
  ]);
  const ownerAccess = entities.some((entity) => entityContains(entity, "owner-architect"));
  const baseLanes: Array<[string, string, LegendId, string]> = [
    ["column-1", "column-3", "process", "Akademie / Wissen"],
    ["column-1", "column-3", "data", "Wissensfluss"],
    ["column-2", "column-3", "command", "Command & Alignment"],
    ["column-2", "column-3", "feedback", "Meta Feedback Loop"],
    ["column-3", "column-4", "control", "Control / Audit"],
    ["column-3", "column-4", "data", "Event- & Datenfluss"],
    ["column-1", "column-4", "infrastructure", "Quellen / Prüfung"],
    ["column-2", "column-4", "feedback", "Governance / Konsens"],
  ];
  const laneSpecs = baseLanes.flatMap(([source, target, legendId, packet], laneIndex) => {
    const siblings = baseLanes.filter((lane) => lane[0] === source && lane[1] === target);
    const siblingIndex = siblings.findIndex((lane) => lane[2] === legendId && lane[3] === packet);
    return Array.from({ length: 5 }, (_, replica) => ({
      source,
      target,
      legendId,
      packet: `${packet} · ${replica + 1}`,
      replica,
      id: `lane-${source}-${target}-${legendId}-${laneIndex}-${replica}`,
      laneOffset: (siblingIndex * 5 + replica - (siblings.length * 5 - 1) / 2) * 8,
    }));
  });
  const columns = entities.filter((entity) => entity.isColumn);
  const relatedIds = getEntityFamily(entities, focusedId);
  const focusedLane = laneSpecs.find((lane) => focusedId === `edge-${lane.id}`);
  if (focusedLane) {
    for (const columnId of [focusedLane.source, focusedLane.target]) {
      const column = columns.find((entity) => entity.id === columnId);
      if (column) flattenEntities([column]).forEach((entity) => relatedIds.add(entity.id));
    }
  }
  const directColumns = new Set<string>();
  for (const column of columns) {
    if (relatedIds.has(column.id) || flattenEntities(column.children ?? []).some((entity) => relatedIds.has(entity.id))) {
      directColumns.add(column.id);
    }
  }
  const activeColumns = focusedLane
    ? new Set([focusedLane.source, focusedLane.target])
    : new Set(directColumns);
  if (!focusedLane) {
    for (const lane of baseLanes) {
      if (directColumns.has(lane[0]) || directColumns.has(lane[1])) {
        activeColumns.add(lane[0]);
        activeColumns.add(lane[1]);
      }
    }
  }
  const allRecords = flattenEntities(entities);
  const traceIds = allRecords
    .filter((entity) => entity.sourceType === "trace" && entity.sourceId)
    .map((entity) => entity.sourceId!);
  const bindingIds = allRecords
    .filter((entity) => entity.sourceType === "binding" && entity.sourceId)
    .map((entity) => entity.sourceId!);
  const nodes: FlowNode[] = columns.map((entity) => {
    const position = positions.get(entity.id) ?? { x: 0, width: entity.width ?? 310 };
    // Gleiche Höhe für alle 4 Spalten -> sauberes 16:9-Breitbild statt unterschiedlich hoher Türme.
    const height = COLUMN_HEIGHT;
    return {
      id: entity.id,
      type: "apex",
      position: { x: position.x, y: 0 },
      width: position.width,
      height,
      data: { entity, onActivate, onHover, onInspect, visibleLegend, focusedId, focusedLegend, relatedIds, activeColumns },
      className: (focusedId && !activeColumns.has(entity.id)) ||
        (focusedLegend && !entityContainsLegend(entity, focusedLegend)) ? "eos-dimmed" : "eos-lit",
      ariaLabel: entity.title,
      draggable: false,
    };
  });
  const edges: FlowEdge[] = laneSpecs.map(({ source, target, legendId, packet, id, laneOffset }, laneIndex) => {
    const related = activeColumns.has(source) && activeColumns.has(target);
    const dimmed = Boolean(
      (focusedId && !(focusedLane ? focusedLane.id === id : related)) ||
      (focusedLegend && focusedLegend !== legendId)
    );
    return {
      id,
      source,
      target,
      sourceHandle: `s${laneIndex}`,
      targetHandle: `t${laneIndex}`,
      type: "apex",
      selectable: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLORS[legendId] },
      style: { stroke: EDGE_COLORS[legendId] },
      data: {
        legendId,
        packet,
        laneOffset,
        dimmed,
        showLabel: focusedLane ? focusedLane.id === id : focusedLegend === legendId && packet.endsWith("· 1"),
        fast: legendId === "command" || legendId === "data",
        relatedIds: [source, target],
        traceIds: legendId === "data" || legendId === "control" ? traceIds : [],
        bindingIds: legendId === "infrastructure" || legendId === "process" ? bindingIds : [],
        route: legendId === "command"
          ? ownerAccess ? "owner-architect" : "departments"
          : legendId === "process"
            ? "academy"
            : legendId === "control"
              ? "laws"
              : legendId === "data"
                ? "traces"
                : legendId === "infrastructure"
                  ? "interfaces"
                  : legendId === "feedback" && entities.some((entity) =>
                    entity.children?.some((child) => child.id === "self-healing")
                  )
                    ? "self-healing"
                    : "departments",
      },
    };
  });
  return { nodes, edges };
}

function FlowCanvas({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  onHoverNode,
  onHoverEdge,
  onRegisterFitView,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodeClick: (entity: Entity) => void;
  onEdgeClick: (edge: FlowEdge) => void;
  onHoverNode: (entity: Entity | null) => void;
  onHoverEdge: (id: string | null) => void;
  onRegisterFitView: (fitView: () => void) => void;
}) {
  useEffect(() => () => onRegisterFitView(() => {}), [onRegisterFitView]);
  return (
    <div className="eos-flow">
      <ReactFlow<FlowNode, FlowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.04 }}
          onlyRenderVisibleElements
          autoPanOnSelection
          elevateEdgesOnSelect
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.22}
          maxZoom={2.5}
          onNodeClick={(_event, node) => {
            if (node.data.entity.clickable !== false) onNodeClick(node.data.entity);
          }}
          onNodeMouseEnter={(_event, node) => onHoverNode(node.data.entity)}
          onNodeMouseLeave={() => onHoverNode(null)}
          onEdgeClick={(_event, edge) => onEdgeClick(edge)}
          onEdgeMouseEnter={(event, edge) => {
            if (event.currentTarget) onHoverEdge(edge.id);
          }}
          onEdgeMouseLeave={(event) => {
            if (event.currentTarget) onHoverEdge(null);
          }}
          onInit={(instance) => {
            const fitView = () => instance.fitView({ padding: 0.04, duration: 250 });
            onRegisterFitView(fitView);
            fitView();
          }}
          aria-label="Interaktive Organigramm-Platine"
        >
          <Background color="rgba(212, 175, 55, 0.18)" gap={24} />
          <Controls />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => LEGEND.find((entry) => entry.id === (node.data as { entity?: Entity }).entity?.legendId)?.color ?? "#C5A059"}
          />
          <FlowEdgeCount />
      </ReactFlow>
    </div>
  );
}

function FlowEdgeCount() {
  const edgeCount = useEdgesStore(useEqualSelector(
    (state: EdgesStore) => state.edges.length,
    (left, right) => left === right
  ));
  return <Panel position="bottom-left" style={{ marginBottom: 118 }}><span className="eos-chip">Leitungen: {edgeCount}</span></Panel>;
}

/* ===================================================================================================
 * 3-in-1-Ergänzung: Lebender Hierarchie-Baum (d3-org-chart, nur im Browser) + Glasplatten-Schichtenblick
 * Datenquelle ist ausschließlich das übergebene Roster (#0, #1–#232, #301–#400, dynamisch #401 → ∞).
 * ================================================================================================= */

type TreeRow = {
  id: string;
  parentId: string | null;
  label: string;
  sub: string;
  level: number;
  agent?: AgentDef;
  dynamic?: boolean;
};

const LEVEL_COLORS = ["#B5944B", "#234E8E", "#2B4C7E", "#135D66", "#2E6699", "#334E68"];
const LEVEL_TITLES = [
  "Ebene 0 · Inhaber & Meta-KI #000",
  "Ebene 1 · KI-Vorstand",
  "Ebene 2 · Bereichs-Direktoren",
  "Ebene 3 · Abteilungsleiter",
  "Ebene 4 · Teamleiter & Fachprüfer",
  "Ebene 5 · Co-Agenten, Fachcluster & Hilfs-Bots (#401 → ∞)",
];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

/** Baut die flache Eltern-Kind-Liste. Schutz gegen Zyklen: ein Zyklus hängt den Knoten unter die Wurzel. */
function buildTreeRows(roster: AgentDef[], ownerShop: boolean, dynamicCount: number): TreeRow[] {
  const byNumber = new Map(roster.map((agent) => [agent.number, agent]));
  const hasMeta = ownerShop && byNumber.has(0);
  const rootParent = hasMeta ? "agent-0" : "owner";
  const rows: TreeRow[] = [
    { id: "owner", parentId: null, label: "App-Inhaber (Mensch)", sub: "Ebene 0 · OwnerRule & DRY_RUN_MODE", level: 0 },
  ];
  const parentOf = (agent: AgentDef): string => {
    if (agent.number === 0) return "owner";
    const next = agent.reportsTo;
    if (next == null || next === agent.number || !byNumber.has(next)) return rootParent;
    const seen = new Set<number>([agent.number]);
    let cursor: number | null | undefined = next;
    while (cursor != null && byNumber.has(cursor)) {
      if (seen.has(cursor)) return rootParent;
      seen.add(cursor);
      cursor = byNumber.get(cursor)?.reportsTo;
    }
    return `agent-${next}`;
  };
  for (const agent of roster) {
    rows.push({
      id: `agent-${agent.number}`,
      parentId: parentOf(agent),
      label: `#${agent.number} · ${agent.name}`,
      sub: agent.role,
      level: agent.number === 0 ? 0 : agent.level,
      agent,
      dynamic: Boolean(agent.dynamic),
    });
  }
  if (ownerShop) {
    rows.push({
      id: "auto-expansion",
      parentId: byNumber.has(161) ? "agent-161" : rootParent,
      label: "✨ KI-Auto-Ausbau #401 → ∞",
      sub: `${dynamicCount} dynamische Hilfs-Bots · wächst automatisch`,
      level: 5,
      dynamic: true,
    });
  }
  return rows;
}

/** Alle Vorgesetzten und Untergebenen eines Knotens. */
function treeFamily(rows: TreeRow[], id: string): Set<string> {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const kids = new Map<string, string[]>();
  for (const row of rows) {
    if (row.parentId) kids.set(row.parentId, [...(kids.get(row.parentId) ?? []), row.id]);
  }
  const family = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    for (const child of kids.get(stack.pop()!) ?? []) {
      if (!family.has(child)) {
        family.add(child);
        stack.push(child);
      }
    }
  }
  let cursor = byId.get(id)?.parentId ?? null;
  while (cursor && !family.has(cursor)) {
    family.add(cursor);
    cursor = byId.get(cursor)?.parentId ?? null;
  }
  return family;
}

function treeCardHtml(row: TreeRow, width: number, height: number, direct: number): string {
  const color = LEVEL_COLORS[Math.min(Math.max(row.level, 0), 5)];
  const label = escapeHtml(row.label);
  const badge = row.dynamic ? '<span class="eos-tree-badge">✨ KI-Auto-Ausbau</span>' : "";
  return `<div class="eos-tree-card" data-nid="${escapeHtml(row.id)}" tabindex="0" role="button" aria-label="${label}" style="--lvl:${color};width:${width}px;height:${height}px">` +
    `<div class="eos-tree-top"><strong>${label}</strong>` +
    `<button type="button" class="eos-info-button" data-info="${escapeHtml(row.id)}" aria-label="Informationen zu ${label}" title="Informationen">ⓘ</button></div>` +
    `<small>${escapeHtml(row.sub)}</small>${badge}<em>${direct ? `${direct} direkt unterstellt` : "operativ"}</em></div>`;
}

type OrgChartLike = {
  container: (selector: HTMLElement) => OrgChartLike;
  data: (rows: unknown[]) => OrgChartLike;
  nodeWidth: (fn: () => number) => OrgChartLike;
  nodeHeight: (fn: () => number) => OrgChartLike;
  childrenMargin: (fn: () => number) => OrgChartLike;
  compactMarginBetween: (fn: () => number) => OrgChartLike;
  nodeContent: (fn: (node: { data: TreeRow }) => string) => OrgChartLike;
  buttonContent: (fn: (node: { node: { children?: unknown[]; _children?: unknown[] } }) => string) => OrgChartLike;
  linkUpdate: (fn: (this: SVGPathElement, node: { data: { _upToTheRootHighlighted?: boolean } }) => void) => OrgChartLike;
  svgHeight: (height: number) => OrgChartLike;
  initialExpandLevel: (level: number) => OrgChartLike;
  setUpToTheRootHighlighted: (id: string) => OrgChartLike;
  clearHighlighting: () => OrgChartLike;
  setExpanded: (id: string, flag?: boolean) => OrgChartLike;
  fit: () => OrgChartLike;
  render: () => OrgChartLike;
  exportImg: (options?: { full?: boolean; scale?: number; save?: boolean }) => void;
  clear: () => void;
};

type TreeProps = {
  rows: TreeRow[];
  startId: string | null;
  onInspect: (row: TreeRow) => void;
  onBack: () => void;
  exportRef: { current: (() => void) | null };
  sound: () => void;
};

/** Konfiguriert den d3-org-chart-Baum (Ebene 0 → Hilfs-Bots). */
function configureChart(chart: OrgChartLike, host: HTMLElement, rows: TreeRow[], startId: string | null, counts: Map<string, number>) {
  chart
    .container(host)
    .svgHeight(720)
    .nodeWidth(() => 232)
    .nodeHeight(() => 92)
    .childrenMargin(() => 46)
    .compactMarginBetween(() => 18)
    .initialExpandLevel(startId ? 2 : 3)
    .buttonContent(({ node }) => {
      const count = node.children?.length ?? node._children?.length ?? 0;
      return `<div class="eos-tree-toggle" aria-hidden="true">${node.children?.length ? "▾" : "▸"} ${count}</div>`;
    })
    .nodeContent((node) => treeCardHtml(node.data, 232, 92, counts.get(node.data.id) ?? 0))
    .linkUpdate(function (node) {
      const hot = Boolean(node.data._upToTheRootHighlighted);
      this.setAttribute("stroke", hot ? "#D4AF37" : "#64748B");
      this.setAttribute("stroke-width", hot ? "4" : "1.5");
      this.classList.toggle("eos-tree-link-hot", hot);
    })
    .data(rows);
  if (startId && rows.some((row) => row.id === startId)) chart.setUpToTheRootHighlighted(startId);
  chart.render().fit();
}

/** Lebender Hierarchie-Baum. d3-org-chart wird erst im Browser geladen (SSR-sicher). */
function HierarchyTree({ rows, startId, onInspect, onBack, exportRef, sound }: TreeProps) {
  const host = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChartLike | null>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) if (row.parentId) map.set(row.parentId, (map.get(row.parentId) ?? 0) + 1);
    return map;
  }, [rows]);

  useEffect(() => {
    let cancelled = false;
    // d3-org-chart liefert keine Typdeklaration (Schutzregel: keine zusätzliche .d.ts-Datei). Der Import
    // bleibt ein statisch analysierbares import(), damit Vite das Paket korrekt bündelt.
    // @ts-expect-error TS7016: Modul ohne Typen
    void (import("d3-org-chart") as Promise<{ OrgChart: unknown }>)
      .then(({ OrgChart }) => {
        if (cancelled || !host.current) return;
        const chart = new (OrgChart as new () => OrgChartLike)();
        chartRef.current = chart;
        configureChart(chart, host.current, rows, startId, counts);
        setError(null);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Hierarchie-Baum konnte nicht geladen werden."));
    return () => {
      cancelled = true;
      try { chartRef.current?.clear(); } catch { /* bereits entfernt */ }
      chartRef.current = null;
    };
  }, [rows, startId, counts]);

  useEffect(() => {
    exportRef.current = () => chartRef.current?.exportImg({ full: true, scale: 2, save: true });
    return () => { exportRef.current = null; };
  }, [exportRef]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const idOf = (target: EventTarget | null) => (target as HTMLElement | null)?.closest<HTMLElement>("[data-nid]")?.dataset.nid ?? null;
    const apply = (id: string | null) => {
      setFocus(id);
      const family = id ? treeFamily(rowsRef.current, id) : null;
      element.querySelectorAll<HTMLElement>("[data-nid]").forEach((card) => {
        card.classList.toggle("eos-dimmed", Boolean(family && !family.has(card.dataset.nid ?? "")));
      });
    };
    const over = (event: Event) => { const id = idOf(event.target); if (id) apply(id); };
    const out = (event: MouseEvent) => { if (!(event.relatedTarget instanceof globalThis.Node && element.contains(event.relatedTarget))) apply(null); };
    const click = (event: Event) => {
      const info = (event.target as HTMLElement).closest<HTMLElement>("[data-info]");
      if (!info?.dataset.info) return;
      event.stopPropagation();
      const row = rowsRef.current.find((item) => item.id === info.dataset.info);
      if (row) { sound(); onInspect(row); }
    };
    const key = (event: KeyboardEvent) => {
      const id = idOf(event.target);
      if (event.key === "Enter" && id) {
        const row = rowsRef.current.find((item) => item.id === id);
        chartRef.current?.setExpanded(id, true).render();
        if (row) onInspect(row);
      }
      if (event.key === "Escape") onBack();
    };
    element.addEventListener("mouseover", over);
    element.addEventListener("mouseout", out);
    element.addEventListener("click", click, true);
    element.addEventListener("keydown", key);
    return () => {
      element.removeEventListener("mouseover", over);
      element.removeEventListener("mouseout", out);
      element.removeEventListener("click", click, true);
      element.removeEventListener("keydown", key);
    };
  }, [onInspect, onBack, sound]);

  return (
    <div className="eos-tree-wrap">
      {error && <p role="alert" className="eos-tree-error">Hierarchie-Baum: {error}</p>}
      <div ref={host} className="eos-tree-host" aria-label="Lebender Hierarchie-Baum" />
      <small className="eos-tree-hint">
        {focus ? `Fokus: ${rows.find((row) => row.id === focus)?.label ?? focus}` : "Maus über eine Karte: Vorgesetzte und Untergebene leuchten, der Rest wird ausgegraut."}
        {" "}· Enter = tiefer · Esc = zurück
      </small>
    </div>
  );
}

/** Glasplatten-Schichtenblick Ebene 0–5: jede Ebene eine Glasplatte, Hover blendet die anderen aus. */
function GlassLayers({ roster, ownerShop, dynamicCount, onInspect }: {
  roster: AgentDef[];
  ownerShop: boolean;
  dynamicCount: number;
  onInspect: (agent: AgentDef) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const layers = useMemo(() => {
    const result: AgentDef[][] = [[], [], [], [], [], []];
    for (const agent of roster) result[agent.number === 0 ? 0 : Math.min(Math.max(agent.level, 0), 5)].push(agent);
    return result;
  }, [roster]);
  return (
    <div className="eos-glass-stack" aria-label="Glasplatten-Schichtenblick Ebene 0–5">
      {layers.map((agents, level) => {
        const expanded = open === level;
        const shown = expanded ? agents : agents.slice(0, 8);
        return (
          <section
            key={level}
            className={`eos-glass-plate${hover != null && hover !== level ? " eos-dimmed" : ""}`}
            style={{ "--lvl": LEVEL_COLORS[level], marginLeft: level * 14 } as CSSProperties}
            onMouseEnter={() => setHover(level)}
            onMouseLeave={() => setHover(null)}
          >
            <header>
              <strong>{LEVEL_TITLES[level]}</strong>
              <span className="eos-chip">{agents.length + (level === 0 ? 1 : 0)} Profile</span>
              {level === 5 && ownerShop && <span className="eos-chip">✨ {dynamicCount} dynamisch</span>}
              <button type="button" className="eos-button" onClick={() => setOpen(expanded ? null : level)}>
                {expanded ? "Einklappen" : "Alle zeigen"}
              </button>
            </header>
            <div className="eos-glass-items">
              {level === 0 && <span className="eos-glass-item eos-glass-human">👑 App-Inhaber (Mensch)</span>}
              {shown.map((agent) => (
                <button type="button" key={agent.key} className="eos-glass-item" onClick={() => onInspect(agent)} title={agent.mission}>
                  #{agent.number} {agent.name}
                </button>
              ))}
              {!expanded && agents.length > shown.length && <span className="eos-glass-item">+ {agents.length - shown.length} weitere</span>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function EnterpriseOsOrganigram(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher<{ traces: LiveConnectionTraceDto[]; snapshotAt: string }>();
  const loadFetcher = fetcher.load;
  const [browserReady, setBrowserReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchDialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fitViewRef = useRef<(() => void) | null>(null);
  const fullscreenRef = useRef<HTMLElement | null>(null);
  const [mode, setMode] = useState<"flow" | "tree" | "glass" | "touch">("flow");
  const treeExportRef = useRef<(() => void) | null>(null);
  const [treeStart, setTreeStart] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusedLegend, setFocusedLegend] = useState<LegendId | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<FlowEdge | null>(null);
  const [hoveredLegend, setHoveredLegend] = useState<LegendId | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null);
  const [visibleLegend, setVisibleLegend] = useState<Set<LegendId>>(() => new Set(LEGEND.map((item) => item.id)));
  const [moneyView, setMoneyView] = useState(false);
  const [cameraFollow, setCameraFollow] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [speakerError, setSpeakerError] = useState<string | null>(null);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const path = (searchParams.get("orgPath") ?? "").split("/").filter(Boolean);
  const pathKey = path.join("/");
  const traces = fetcher.data?.traces ?? props.initialTraces;
  const visibleRoster = props.ownerShop
    ? props.roster
    : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));

  useEffect(() => {
    setBrowserReady(true);
  }, []);

  useEffect(() => {
    if (!browserReady) return;
    const loadTraces = () => {
      if (document.visibilityState === "visible") loadFetcher("/api/live-traces");
    };
    loadTraces();
    const interval = window.setInterval(loadTraces, 5_000);
    document.addEventListener("visibilitychange", loadTraces);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", loadTraces);
    };
  }, [browserReady, loadFetcher]);

  useEffect(() => {
    if (!browserReady) return;
    try {
      const stored = window.localStorage.getItem("atelierpilot-organigram-bookmarks");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) setBookmarks(parsed);
      }
    } catch (error) {
      setBookmarkError(error instanceof Error ? error.message : "Lesezeichen konnten nicht geladen werden.");
    }
  }, [browserReady]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "0" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target;
        if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
        event.preventDefault();
        fitViewRef.current?.();
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    const dialog = searchDialogRef.current;
    if (!dialog) return;
    if (searchOpen) {
      if (!dialog.open) dialog.showModal();
      searchInputRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [searchOpen]);

  const navigate = useCallback((nextPath: string[]) => {
    const update = () => {
      const next = new URLSearchParams(searchParams);
      next.set("view", "board");
      if (nextPath.length) next.set("orgPath", nextPath.join("/"));
      else next.delete("orgPath");
      setSearchParams(next, { preventScrollReset: true });
    };
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(update);
    } else {
      update();
    }
    setSelectedEdge(null);
    setSelectedEntity(null);
  }, [searchParams, setSearchParams]);

  const activateEntity = useCallback((entity: Entity) => {
    // Klick auf #000 Meta-KI oder einen einzelnen Mitarbeiter öffnet den Hierarchie-Baum an dieser Stelle.
    if (entity.id === "meta-hypervisor" || entity.agentNumber === 0) {
      setMode("tree");
      setTreeStart("agent-0");
      setSelectedEntity(entity);
      return;
    }
    // Die 10 Fachbereichs-Kacheln der Zone 2 öffnen direkt die Mitarbeiterliste der verknüpften Abteilung.
    if (entity.sourceType === "department" && entity.departmentId != null) {
      props.onPickDept(entity.departmentId);
      setSelectedEntity(entity);
      return;
    }
    const activePath = pathKey ? pathKey.split("/") : [];
    navigate([...activePath, entity.route ?? entity.id]);
    setSelectedEntity(entity);
    setSelectedEdge(null);
  }, [navigate, pathKey, props]);
  const hoverEntity = useCallback((entity: Entity | null) => {
    setHoveredEntity(entity);
    setHoveredEdge(null);
    setHoveredLegend(null);
    setFocusedId(entity?.id ?? null);
    setFocusedLegend(null);
  }, []);
  const inspectEntity = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
    setSelectedEdge(null);
    setHoveredEntity(null);
    setHoveredEdge(null);
  }, []);
  const registerFitView = useCallback((fitView: () => void) => {
    fitViewRef.current = fitView;
  }, []);

  const treeRows = useMemo(
    () => buildTreeRows(visibleRoster, props.ownerShop, props.dynamicCount),
    [visibleRoster, props.ownerShop, props.dynamicCount]
  );
  const inspectTreeRow = useCallback((row: TreeRow) => {
    if (row.agent) {
      setSelectedEntity(makeAgentEntity(row.agent, props.performance, props.earnings));
    } else {
      setSelectedEntity({ id: row.id, title: row.label, description: row.sub, group: "tree", legendId: "command" });
    }
    setSelectedEdge(null);
  }, [props.performance, props.earnings]);
  const treeBack = useCallback(() => {
    if (treeStart) setTreeStart(null);
    else setMode("flow");
  }, [treeStart]);
  const switchMode = useCallback((next: "flow" | "tree" | "glass" | "touch", startId: string | null = null) => {
    const apply = () => {
      setMode(next);
      setTreeStart(startId);
    };
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(apply);
    } else {
      apply();
    }
  }, []);

  const pageEntities = useMemo(() => buildChildren(path, props, traces), [
    pathKey, props, traces,
  ]);
  const entities = useMemo(
    () => path.length ? buildSubpageColumns(path, props, pageEntities, traces) : pageEntities,
    [pathKey, props, pageEntities, traces]
  );
  const visibleEntities = entities;
  const graph = useMemo(() => layoutGraph(
    visibleEntities,
    focusedId,
    focusedLegend,
    visibleLegend,
    activateEntity,
    hoverEntity,
    inspectEntity
  ), [visibleEntities, focusedId, focusedLegend, visibleLegend, activateEntity, hoverEntity, inspectEntity]);

  const searchItems = useMemo(() => {
    const items: { id: string; title: string; subtitle: string; path: string[]; entity?: Entity }[] = [];
    const searchableRoster = props.ownerShop
      ? props.roster
      : props.roster.filter((agent) => agent.number !== 0 && props.allowedDepartmentIds.includes(agent.departmentId));
    const rootItems = buildZoneEntities(props, traces);
    const collectRootSearchItems = (entities: Entity[]) => {
      for (const entity of entities) {
        if (entity.isColumn) {
          collectRootSearchItems(entity.children ?? []);
          continue;
        }
        if (entity.clickable !== false) {
          items.push({
            id: entity.id,
            title: entity.title,
            subtitle: entity.description,
            path: [entity.route ?? entity.id],
            entity,
          });
        }
        if (entity.children?.length) collectRootSearchItems(entity.children);
      }
    };
    collectRootSearchItems(rootItems);
    for (const department of DEPARTMENTS.filter((item) => props.allowedDepartmentIds.includes(item.id))) {
      const entity: Entity = {
        id: `department-${department.id}`,
        title: `Abt. ${department.id} · ${department.name}`,
        description: department.mechanism,
        group: "department",
        legendId: department.kind === "panel" ? "control" : department.kind === "harmony" ? "feedback" : "process",
        sourceType: "department",
        sourceId: String(department.id),
      };
      items.push({ id: entity.id, title: entity.title, subtitle: entity.description, path: ["departments", entity.id], entity });
    }
    const clusters = new Map<string, AgentDef>();
    for (const agent of searchableRoster) if (agent.specialistCluster) clusters.set(agent.specialistCluster, agent);
    for (const [cluster, agent] of clusters) {
      items.push({
        id: cluster,
        title: agent.specialistCluster === "apex-system-coordinator" ? "#400 · System-Koordinator" : agent.role,
        subtitle: `Fachcluster · ${agent.specialistCluster}`,
        path: ["specialists", cluster],
      });
    }
    for (const agent of searchableRoster) items.push({
      id: `agent-${agent.number}`,
      title: `#${agent.number} · ${agent.name}`,
      subtitle: `${agent.role} · ${agent.mission}`,
      path: [agent.dynamic ? "agent-factory" : "staff", `agent-${agent.number}`],
      entity: makeAgentEntity(agent, props.performance, props.earnings),
    });
    for (const rule of props.legalRules) items.push({
      id: `rule-${rule.id}`,
      title: `${rule.ruleKey} · ${rule.jurisdiction}`,
      subtitle: rule.sourceTitle,
      path: ["laws", `rule-${rule.id}`],
    });
    for (const capability of props.capabilities) items.push({
      id: `capability-${capability.id}`,
      title: capability.displayName,
      subtitle: `${capability.feasibility} · ${capability.evidenceSummary}`,
      path: ["interfaces", `capability-${capability.id}`],
    });
    for (const binding of props.bindings) items.push({
      id: `binding-${binding.id}`,
      title: binding.interfaceKey,
      subtitle: `${binding.agentKey} · ${binding.status}`,
      path: ["interfaces", `binding-${binding.id}`],
    });
    for (const trace of traces) items.push({
      id: `trace-${trace.id}`,
      title: `${trace.agentKey ?? "System"} → ${trace.channelKey}`,
      subtitle: `${trace.eventType} · ${trace.outcome}`,
      path: ["traces", `trace-${trace.id}`],
    });
    for (const bookmark of bookmarks) {
      const segments = bookmark.split("/").filter(Boolean);
      items.push({
        id: `bookmark-${bookmark || "home"}`,
        title: `★ ${segments.map((segment) => routeSegmentTitle(segment, visibleRoster, props.legalRules, props.capabilities, props.bindings, traces)).join(" › ") || "Kommandozentrale"}`,
        subtitle: "Gespeicherter Lesezeichen-Pfad",
        path: segments,
      });
    }
    // Eindeutige Einträge: derselbe Datensatz kann über Wurzel- und Detail-Durchlauf doppelt auftauchen.
    const unique = new Map<string, (typeof items)[number]>();
    for (const item of items) if (!unique.has(item.id)) unique.set(item.id, item);
    return [...unique.values()];
  }, [props, traces, bookmarks, visibleRoster]);
  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("de-DE");
    if (!query) return searchItems;
    return searchItems.filter((item) =>
      `${item.title} ${item.subtitle} ${item.entity?.metrics?.join(" ") ?? ""}`.toLocaleLowerCase("de-DE").includes(query)
    );
  }, [searchItems, searchQuery]);

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchQuery, searchOpen, filteredSearchItems.length]);

  const currentTitle = path.length
    ? routeSegmentTitle(path[path.length - 1], visibleRoster, props.legalRules, props.capabilities, props.bindings, traces)
    : "Lebendes Firmen-Organigramm & Event-Bus";
  const currentPath = path.join("/");
  const isBookmarked = bookmarks.includes(currentPath);
  const selectedTrace = selectedEntity?.sourceType === "trace"
    ? traces.find((trace) => trace.id === selectedEntity.sourceId)
    : selectedEdge?.data?.trace;
  const selectedAgent = selectedEntity?.sourceType === "agent"
    ? visibleRoster.find((agent) => agent.key === selectedEntity.sourceId)
    : selectedTrace?.agentKey
      ? visibleRoster.find((agent) => agent.key === selectedTrace.agentKey)
      : undefined;
  const hierarchyAgent = selectedAgent ?? (selectedEntity?.agentNumber == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === selectedEntity.agentNumber));
  const selectedParent = hierarchyAgent?.reportsTo == null
    ? undefined
    : visibleRoster.find((agent) => agent.number === hierarchyAgent.reportsTo);
  const selectedDirectReports = hierarchyAgent == null
    ? []
    : visibleRoster.filter((agent) => agent.reportsTo === hierarchyAgent.number);
  const selectedRelationKeys = new Set(selectedEntity?.relationKeys ?? (selectedEntity?.relationKey ? [selectedEntity.relationKey] : []));
  const linkedTraceCount = selectedEntity
    ? traces.filter((trace) => selectedRelationKeys.has(trace.agentKey ?? "") || selectedRelationKeys.has(trace.channelKey)).length
    : 0;
  const linkedBindingCount = selectedEntity
    ? props.bindings.filter((binding) =>
      selectedRelationKeys.has(binding.agentKey) || selectedRelationKeys.has(binding.interfaceKey)
    ).length
    : 0;
  const selectedCapability = selectedEntity?.sourceType === "capability"
    ? props.capabilities.find((item) => item.id === selectedEntity.sourceId)
    : undefined;
  const selectedRule = selectedEntity?.sourceType === "law"
    ? props.legalRules.find((item) => item.id === selectedEntity.sourceId)
    : undefined;
  const performance = selectedAgent ? props.performance.byAgent[selectedAgent.key] : undefined;
  const earnings = selectedAgent ? props.earnings.perAgent[selectedAgent.key] : undefined;

  function persistBookmarks(next: string[]) {
    setBookmarks(next);
    try {
      window.localStorage.setItem("atelierpilot-organigram-bookmarks", JSON.stringify(next));
      setBookmarkError(null);
    } catch (error) {
      setBookmarkError(error instanceof Error ? error.message : "Lesezeichen konnten nicht gespeichert werden.");
    }
  }

  function toggleBookmark() {
    const next = isBookmarked
      ? bookmarks.filter((item) => item !== currentPath)
      : [...bookmarks, currentPath];
    persistBookmarks(next);
  }

  function playSound() {
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) {
        setSpeakerError("Web Audio API ist in diesem Browser nicht verfügbar.");
        return;
      }
      const context = new AudioContextConstructor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.06, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.16);
      oscillator.onended = () => { void context.close(); };
      setSpeakerError(null);
    } catch (error) {
      setSpeakerError(error instanceof Error ? error.message : "Der Studio-Klang konnte nicht abgespielt werden.");
    }
  }

  function exportBlueprint() {
    const payload = {
      exportedAt: new Date().toISOString(),
      title: currentTitle,
      path,
      disclaimer: "Diagrammexport aus sichtbaren Daten; kein signierter GoBD-Nachweis.",
      nodes: visibleEntities,
      edges: graph.edges.map(({ id, source, target, data }) => ({ id, source, target, packet: data?.packet, traceId: data?.traceId })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atelierpilot-organigram-export.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function pickSearchResult(item: { id: string; path: string[]; entity?: Entity }) {
    navigate(item.path);
    const result = item.entity ?? buildChildren(item.path.slice(0, -1), props, traces)
      .find((entity) => entity.id === item.id) ?? null;
    setSelectedEntity(result);
    setSearchOpen(false);
  }

  const pathTitle = (segment: string) => routeSegmentTitle(segment, visibleRoster, props.legalRules, props.capabilities, props.bindings, traces);
  const departmentCount = DEPARTMENTS.filter((department) => props.allowedDepartmentIds.includes(department.id)).length;
  const glassColumns = visibleEntities.map((column) => ({
    label: column.title,
    entities: column.children ?? [],
  }));

  return (
    <section ref={fullscreenRef} className={`eos-shell${isFullscreen ? " eos-fullscreen" : ""}`} aria-label="Lebendes Firmen-Organigramm">
      <header className="eos-header">
        <div className="eos-toolbar">
          <div>
            <strong style={{ color: "#C5A059", fontSize: 16 }}>{currentTitle}</strong>
            <div style={{ color: "#cbd5e1", fontSize: 11, marginTop: 4 }}>
              {props.ownerShop ? "OWNER UNLIMITED" : `${departmentCount} gebuchte/sichtbare Fachabteilungen`}
              {" · "}UI-Herzschlag {new Date(fetcher.data?.snapshotAt ?? Date.now()).toLocaleTimeString("de-DE")}
              {" · "}{fetcher.state === "loading" ? "Traces werden aktualisiert…" : `${traces.length} gespeicherte Traces`}
            </div>
          </div>
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" aria-pressed={mode === "flow"} onClick={() => switchMode("flow")}>🏛️ 5-Zonen-Blueprint · Ebene 1–18</button>
            <button type="button" className="eos-button" aria-pressed={mode === "tree"} onClick={() => switchMode("tree")}>🌳 Lebender Hierarchie-Baum</button>
            <button type="button" className="eos-button" aria-pressed={mode === "glass"} onClick={() => switchMode("glass")}>📚 Glasplatten-Schichtenblick Ebene 0–5</button>
            <button type="button" className="eos-button" aria-pressed={mode === "touch"} onClick={() => setMode("touch")}>Touch-Kartenansicht</button>
            <a className="eos-button" href="/mobile-monitor">Mobile Monitor / PWA</a>
            <button
              type="button"
              className="eos-button"
              onClick={async () => {
                try {
                  if (document.fullscreenElement) await document.exitFullscreen();
                  else await fullscreenRef.current?.requestFullscreen();
                  setFullscreenError(null);
                } catch (error) {
                  setFullscreenError(error instanceof Error ? error.message : "Vollbild konnte nicht aktiviert werden.");
                }
              }}
            >{isFullscreen ? "Vollbild schließen" : "Vollbild"}</button>
            <button type="button" className="eos-button" onClick={() => fitViewRef.current?.()} title="Gesamtansicht einpassen">0 · Gesamtansicht</button>
          </div>
        </div>
        <div className="eos-toolbar">
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" aria-pressed={cameraFollow} title="Kein Kamerazugriff; folgt nur der aktiven Auswahl." onClick={() => setCameraFollow((value) => !value)}>
              🎥 Live-Kamera-Verfolgung {cameraFollow ? "AN · Auswahl-Fokus" : "AUS"}
            </button>
            <button type="button" className="eos-button" aria-pressed={moneyView} onClick={() => setMoneyView((value) => !value)}>💶 Geld- & Zeit-Röntgenblick</button>
            <button
              type="button"
              className="eos-button"
              aria-pressed={soundEnabled}
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playSound();
              }}
            >
              🔊 Studio-Klang {soundEnabled ? "AN · abspielen" : "AUS"}
            </button>
            <button
              type="button"
              className="eos-button"
              title="Exportiert den Bauplan als JSON; im Baum-Modus zusätzlich den Baum als Bild."
              onClick={() => {
                exportBlueprint();
                if (mode === "tree") treeExportRef.current?.();
              }}
            >📸 1-Klick-Export (Bauplan & Audit-Nachweis)</button>
            <button type="button" className="eos-button" onClick={() => setSearchOpen(true)}>⌕ Blitz-Sprung · Ctrl/Cmd+K</button>
          </div>
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" aria-pressed={isBookmarked} onClick={toggleBookmark}>{isBookmarked ? "★ Lesezeichen" : "☆ Pfad merken"}</button>
            <DomainInfoButton domain={path.length ? path.join(" / ") : "live-organization"} />
          </div>
        </div>
        <nav className="eos-breadcrumb" aria-label="Organigramm-Pfad">
          {path.length > 0 && (
            <button type="button" className="eos-button" onClick={() => navigate(path.slice(0, -1))}>
              ← Zurück
            </button>
          )}
          <button type="button" className="eos-button" onClick={() => navigate([])}>Kommandozentrale</button>
          <span aria-hidden="true">›</span>
          <button type="button" className="eos-button" onClick={() => navigate([])}>Lebendes Organigramm</button>
          {path.map((segment, index) => (
            <span className="eos-breadcrumb" key={`${segment}-${index}`}>
              <span aria-hidden="true">›</span>
              <button type="button" className="eos-button" onClick={() => navigate(path.slice(0, index + 1))}>{pathTitle(segment)}</button>
            </span>
          ))}
          {bookmarks.filter((item) => item && item !== currentPath).map((bookmark) => (
            <button type="button" className="eos-button" key={bookmark} onClick={() => navigate(bookmark.split("/").filter(Boolean))}>★ {bookmark.split("/").map(pathTitle).join(" › ") || "Kommandozentrale"}</button>
          ))}
        </nav>
        <div className="eos-toolbar">
          <div className="eos-toolbar-group" aria-label="Ausführungs- und Capability-Status">
            <span className="eos-chip">SANDBOX · Status nicht ausgewiesen</span>
            <span className="eos-chip">SHADOW / CANARY · nicht angebunden</span>
            <span className="eos-chip">VERIFIED LIVE · nur gespeicherte Nachweise</span>
            <span className="eos-chip">0,00 € · keine Laufzeitkosten in Diagramm-Aktionen</span>
          </div>
          <div className="eos-toolbar-group">
            <button type="button" className="eos-button" disabled title="Es gibt in den vorhandenen Services keinen Shadow-Canary-Steuerendpunkt.">Shadow-Canary-Steuerung nicht angebunden</button>
            <button type="button" className="eos-button" disabled title="Die vorhandene Ansicht bietet keine per Leitung ausführbare Suspend/Resume-Aktion.">Leitungssteuerung nur lesend</button>
          </div>
        </div>
        <div className="eos-legend" role="group" aria-label="Interaktive 8-Farben-Legende">
          {LEGEND.map((entry) => {
            const enabled = visibleLegend.has(entry.id);
            return (
              <button
                type="button"
                key={entry.id}
                className="eos-button"
                aria-pressed={enabled}
                onMouseEnter={() => setFocusedLegend(entry.id)}
                onMouseLeave={() => setFocusedLegend(null)}
                onFocus={() => setFocusedLegend(entry.id)}
                onBlur={() => setFocusedLegend(null)}
                onClick={() => setVisibleLegend((current) => {
                  const next = new Set(current);
                  if (next.has(entry.id)) next.delete(entry.id);
                  else next.add(entry.id);
                  return next;
                })}
                style={{ borderColor: entry.color, opacity: enabled ? 1 : .45 }}
              >
                <span aria-hidden="true" style={{ color: entry.color }}>●</span> {entry.label}
              </button>
            );
          })}
        </div>
        {cameraFollow && <small role="status">Die Verfolgung folgt ausschließlich der ausgewählten Platinen-Entität. Es wird keine Kamera aktiviert.</small>}
        {bookmarkError && <small role="alert">Lesezeichen: {bookmarkError}</small>}
        {speakerError && <small role="alert">Studio-Klang: {speakerError}</small>}
        {fullscreenError && <small role="alert">Vollbild: {fullscreenError}</small>}
      </header>

      <div className="eos-main-grid">
        <main className="eos-panel" data-mode={mode} data-zones={path.length === 0}>
          {mode === "flow" && browserReady ? (
            <FlowCanvas
              nodes={graph.nodes}
              edges={graph.edges}
              onNodeClick={activateEntity}
              onEdgeClick={(edge) => {
                if (edge.data?.route) navigate([...path, edge.data.route]);
                setSelectedEdge(edge);
                setHoveredEdge(edge);
                setSelectedEntity(null);
              }}
              onHoverNode={hoverEntity}
              onHoverEdge={(id) => {
                setHoveredEdge(id ? graph.edges.find((edge) => edge.id === id) ?? null : null);
                setHoveredEntity(null);
                setHoveredLegend(null);
                setFocusedId(id ? `edge-${id}` : null);
                setFocusedLegend(null);
              }}
              onRegisterFitView={registerFitView}
            />
          ) : mode === "flow" ? (
            <div className="eos-flow" role="status">Die interaktive Platine wird clientseitig geladen…</div>
          ) : mode === "tree" && browserReady ? (
            <HierarchyTree
              rows={treeRows}
              startId={treeStart}
              onInspect={inspectTreeRow}
              onBack={treeBack}
              exportRef={treeExportRef}
              sound={soundEnabled ? playSound : noop}
            />
          ) : mode === "tree" ? (
            <div className="eos-flow" role="status">Der Hierarchie-Baum wird clientseitig geladen…</div>
          ) : mode === "glass" ? (
            <GlassLayers
              roster={visibleRoster}
              ownerShop={props.ownerShop}
              dynamicCount={props.dynamicCount}
              onInspect={(agent) => inspectTreeRow({ id: `agent-${agent.number}`, parentId: null, label: agent.name, sub: agent.role, level: agent.level, agent })}
            />
          ) : (
            <div className="eos-glass-layers" aria-label="Touch-Kartenansicht">
              {glassColumns.map((column) => (
                <section className="eos-glass-layer" key={column.label}>
                  <strong>{column.label}</strong>
                  <div style={{ display: "grid", gap: 7, marginTop: 8 }}>
                    {column.entities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        className="eos-button"
                        style={{ justifyContent: "flex-start", whiteSpace: "normal" }}
                        onClick={() => activateEntity(entity)}
                        onMouseEnter={() => { setFocusedId(entity.id); setFocusedLegend(null); }}
                        onMouseLeave={() => setFocusedId(null)}
                      >
                        <span style={{ color: LEGEND.find((entry) => entry.id === entity.legendId)?.color }}>●</span>
                        <span><strong>{entity.title}</strong><br /><small>{entity.description}</small></span>
                      </button>
                    ))}
                    {!column.entities.length && <small>Keine Einträge in dieser Ebene.</small>}
                  </div>
                </section>
              ))}
            </div>
          )}
          {(hoveredEntity || hoveredEdge) && (
            <div className="eos-hover-tooltip" role="status" aria-live="polite">
              <strong>Was bedeutet dieser Strom?</strong>
              <span>
                {hoveredEntity
                  ? `${hoveredEntity.title}: ${hoveredEntity.description}`
                  : `${(hoveredEdge?.data?.packet ?? "Systemfluss").replace(/ · \d$/, "")} · ${LEGEND.find((item) => item.id === hoveredEdge?.data?.legendId)?.label ?? "Verbindung"}. ${hoveredEdge?.data?.legendId ? LEGEND_EXPLANATION[hoveredEdge.data.legendId] : ""}`}
              </span>
              {hoveredEdge && <small>Die Leitung zeigt einen Architekturpfad; Trace-Datensätze enthalten hier keine Quell-/Ziel-IDs.</small>}
            </div>
          )}
          {hoveredLegend && (
            <div className="eos-hover-tooltip" role="status" aria-live="polite">
              <strong>Was bedeutet dieser Strom?</strong>
              <span>{LEGEND.find((entry) => entry.id === hoveredLegend)?.label}: {LEGEND_EXPLANATION[hoveredLegend]} Alle Leitungen dieses Stroms leuchten, der Rest wird ausgegraut.</span>
            </div>
          )}
          <div className="eos-canvas-legend" role="group" aria-label="Feste 8-Farben-Legende">
            <strong>LEGENDE</strong>
            {LEGEND.map((entry) => {
              const enabled = visibleLegend.has(entry.id);
              return (
                <button
                  type="button"
                  key={entry.id}
                  aria-pressed={enabled}
                  onMouseEnter={() => { setFocusedId(null); setFocusedLegend(entry.id); setHoveredLegend(entry.id); }}
                  onMouseLeave={() => { setFocusedLegend(null); setHoveredLegend(null); }}
                  onFocus={() => { setFocusedId(null); setFocusedLegend(entry.id); setHoveredLegend(entry.id); }}
                  onBlur={() => { setFocusedLegend(null); setHoveredLegend(null); }}
                  onClick={() => setVisibleLegend((current) => {
                    const next = new Set(current);
                    if (next.has(entry.id)) next.delete(entry.id);
                    else next.add(entry.id);
                    return next;
                  })}
                >
                  <span style={{ color: entry.color }}>●</span> {entry.label}
                </button>
              );
            })}
          </div>
          {path.length > 0 && pageEntities.length === 0 && <p>Für diese Ebene liegen keine weiteren Datensätze vor.</p>}
          <div className="eos-legend" style={{ marginTop: 10 }}>
            <span className="eos-chip">Live-Traces: {traces.length}</span>
            <span className="eos-chip">Latenz: {traces[0]?.detail?.match(/duration_ms=(\d+)/)?.[1] ?? "nicht verfügbar"} ms</span>
            <span className="eos-chip">W3C Trace-ID: nicht im Schema verfügbar</span>
            <span className="eos-chip">Ollama/Free-Modell: nicht im Trace enthalten</span>
            {moneyView && <span className="eos-chip">Geld- & Zeitwerte: nur gespeicherte Echt-/Potenzialbuchungen</span>}
          </div>
        </main>

        {(selectedEntity || selectedEdge) && <aside className="eos-inspector" aria-label="Röntgen-Inspektor">
          <div className="eos-toolbar">
            <strong style={{ color: "#C5A059" }}>Röntgen-Inspektor</strong>
            <button className="eos-button" type="button" onClick={() => { setSelectedEntity(null); setSelectedEdge(null); }}>Schließen</button>
          </div>
          {hoveredEntity && (
            <div className="eos-inspector-section" role="status">
              <strong>Hover-Spotlight · {hoveredEntity.title}</strong>
              <span>Was macht der Mitarbeiter / Bereich gerade? {hoveredEntity.description}</span>
              {hoveredEntity.metrics?.map((metric) => <span key={metric}>{metric}</span>)}
            </div>
          )}
          {selectedEntity && (
            <>
              <div className="eos-inspector-section">
                <strong>{selectedEntity.title}</strong>
                <span>{selectedEntity.description}</span>
                <span>Was bedeutet dieser Strom? {LEGEND.find((item) => item.id === selectedEntity.legendId)?.label ?? "Systemdaten"}</span>
                {hierarchyAgent && (
                  <>
                    <span>Hierarchie oben: {selectedParent ? `#${selectedParent.number} · ${selectedParent.role}` : "keine übergeordnete Roster-Person"}.</span>
                    <span>Direkte Unterstellte: {selectedDirectReports.length ? selectedDirectReports.map((agent) => `#${agent.number} ${agent.role}`).join(" · ") : "keine geladenen Profile"}.</span>
                  </>
                )}
                <span>Verknüpfte Live-Traces: {linkedTraceCount} · Interface-Bindings: {linkedBindingCount}.</span>
                <span>Prüfregeln: {props.legalRules.length} verfügbare Rechtsquellen; maßgeblich bleiben Owner-Regeln und bestehende Freigaben.</span>
                {selectedEntity.metrics?.map((metric) => <span key={metric}>{metric}</span>)}
              </div>
              {selectedAgent && (
                <div className="eos-inspector-section">
                  <strong>Personalakte · #{selectedAgent.number}</strong>
                  <span>{selectedAgent.role} · Abteilung {selectedAgent.departmentId}</span>
                  <span>Was macht er gerade? {selectedAgent.mission}</span>
                  <span>Note {performance?.grade == null ? "nicht verfügbar" : performance.grade.toFixed(1).replace(".", ",")} · {performance?.trend === "UP" ? "▲" : performance?.trend === "DOWN" ? "▼" : performance?.trend === "STABLE" ? "►" : "—"} · {performance?.xp ?? "—"} XP</span>
                  <span>Echt: {eur(earnings?.monthReal ?? 0)} / Potenzial: {eur(earnings?.monthPotential ?? 0)}</span>
                  {props.ownerShop && <span>Arbeitsanweisung: Backend-Zertifikatsfunktion nicht angebunden; kein Zertifikat wurde erstellt.</span>}
                </div>
              )}
              {selectedCapability && (
                <div className="eos-inspector-section">
                  <strong>Capability-Nachweis</strong>
                  <span>{selectedCapability.evidenceSummary}</span>
                  <span>{selectedCapability.sourceTitle ?? "Keine Quellentitel-Angabe"} · {selectedCapability.verifiedAt ? new Date(selectedCapability.verifiedAt).toLocaleString("de-DE") : "Prüfdatum fehlt"}</span>
                  {selectedCapability.sourceUrl && <a href={selectedCapability.sourceUrl} target="_blank" rel="noreferrer">Quelle öffnen</a>}
                  <span>Risiko {selectedCapability.riskLevel} · {selectedCapability.estimatedCostEur == null ? "Kosten nicht angegeben" : eur(selectedCapability.estimatedCostEur)}</span>
                </div>
              )}
              {selectedRule && (
                <div className="eos-inspector-section">
                  <strong>Rechtsquellen-Ledger</strong>
                  <span>{selectedRule.reviewStatus} · geprüft {new Date(selectedRule.verifiedAt).toLocaleString("de-DE")}</span>
                  <a href={selectedRule.sourceUrl} target="_blank" rel="noreferrer">{selectedRule.sourceTitle}</a>
                  <span>SHA-256: {selectedRule.sourceHash}</span>
                </div>
              )}
              {selectedTrace && (
                <div className="eos-inspector-section">
                  <strong>Live-Trace · {selectedTrace.outcome}</strong>
                  <span>{selectedTrace.agentKey ?? "System"} → {selectedTrace.channelKey} · {selectedTrace.eventType}</span>
                  <span>Auslöser / Dauer: {selectedTrace.detail ?? "nicht protokolliert"}</span>
                  <span>Request-Hash: {selectedTrace.requestHash ?? "nicht vorhanden"}</span>
                  <span>Response-Hash: {selectedTrace.responseHash ?? "nicht vorhanden"}</span>
                  <span>W3C Trace-ID / verknüpfte Rechtsregel / Urteil: nicht in diesem Trace-Datensatz verknüpft.</span>
                  <label>
                    Replay-Regler
                    <input type="range" min="0" max={Math.max(traces.length - 1, 0)} defaultValue={Math.max(traces.findIndex((trace) => trace.id === selectedTrace.id), 0)} aria-label="Trace-Zeitleiste" />
                  </label>
                </div>
              )}
              {moneyView && selectedEntity.metrics && (
                <div className="eos-inspector-section"><strong>Geld- & Zeit-Röntgenblick</strong>{selectedEntity.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
              )}
            </>
          )}
          {selectedEdge && (
            <>
              <div className="eos-inspector-section">
                <strong>Leitungs-Inspektor</strong>
                <span>{selectedEdge.source} → {selectedEdge.target}</span>
                <span>Datenpaket: {selectedEdge.data?.packet ?? "nicht verfügbar"}</span>
                <span>Auslöser, Rechtsregel, Urteil #221–#225 und Euro-Effekt sind nur sichtbar, sofern im gespeicherten Trace enthalten.</span>
              </div>
              {selectedEdge.data?.trace && (
                <div className="eos-inspector-section">
                  <strong>Trace-Nachweis</strong>
                  <span>{selectedEdge.data.trace.detail ?? "Kein Detail"}</span>
                  <span>SHA-256 Request: {selectedEdge.data.trace.requestHash ?? "nicht vorhanden"}</span>
                  <span>SHA-256 Response: {selectedEdge.data.trace.responseHash ?? "nicht vorhanden"}</span>
                </div>
              )}
              <div className="eos-inspector-section">
                <strong>Steuerung (nur lesend)</strong>
                <span>Autopilot, Shadow-Canary, Chef-Stopp und Suspend/Resume sind mangels vorhandener serverseitiger Steuerendpunkte nicht aktivierbar.</span>
              </div>
            </>
          )}
          <div className="eos-inspector-section">
            <strong>Systemstatus</strong>
            <span>Failover-Pfad: keine verifizierte Provider-Reihenfolge in den übergebenen Daten.</span>
            <span>Governance bleibt bei bestehenden Owner-Regeln und Freigabe-Warteschlange.</span>
            <span>{props.executivePulse.slice(0, 3).join(" · ") || "Kein Executive-Pulse-Eintrag vorhanden."}</span>
          </div>
          {props.ownerShop && selectedAgent && (
            <div className="eos-inspector-actions">
              <button type="button" className="eos-button" disabled title="Zertifikate können nicht über die vorhandenen UI-Props erstellt werden.">Arbeitsanweisung / Zertifikat nicht angebunden</button>
            </div>
          )}
        </aside>}
      </div>

      <dialog
        ref={searchDialogRef}
        className="eos-search-dialog"
        aria-labelledby="eos-search-title"
        aria-describedby="eos-search-description"
        onCancel={(event) => {
          event.preventDefault();
          setSearchOpen(false);
        }}
      >
        <div className="eos-search-heading">
          <div>
            <h2 id="eos-search-title">Blitz-Sprung</h2>
            <p id="eos-search-description">Mitarbeiter, Bereiche, Unterseiten, Gesetze, Schnittstellen und Lesezeichen durchsuchen.</p>
          </div>
          <button type="button" className="eos-button" aria-label="Suche schließen" onClick={() => setSearchOpen(false)}>Schließen</button>
        </div>
        <input
          ref={searchInputRef}
          className="eos-search-input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={searchOpen}
          aria-controls="eos-search-results"
          aria-activedescendant={filteredSearchItems.length ? `eos-search-option-${activeSearchIndex}` : undefined}
          placeholder="Mitarbeiter, Bereich, Gesetz, Capability oder Trace suchen…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex((index) => (index + 1) % filteredSearchItems.length);
            } else if (event.key === "ArrowUp" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex((index) => (index - 1 + filteredSearchItems.length) % filteredSearchItems.length);
            } else if (event.key === "Home" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex(0);
            } else if (event.key === "End" && filteredSearchItems.length) {
              event.preventDefault();
              setActiveSearchIndex(filteredSearchItems.length - 1);
            } else if (event.key === "Enter" && filteredSearchItems[activeSearchIndex]) {
              event.preventDefault();
              pickSearchResult(filteredSearchItems[activeSearchIndex]);
            } else if (event.key === "Escape") {
              setSearchOpen(false);
            }
          }}
        />
        <div className="eos-search-results" id="eos-search-results" role="listbox" aria-label="Suchergebnisse">
          {filteredSearchItems.length ? filteredSearchItems.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={activeSearchIndex === index}
              id={`eos-search-option-${index}`}
              className="eos-search-option"
              key={item.id}
              onMouseEnter={() => setActiveSearchIndex(index)}
              onClick={() => pickSearchResult(item)}
            >
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </button>
          )) : <p className="eos-search-empty" role="status">Keine passenden Einträge gefunden.</p>}
        </div>
        <footer className="eos-search-footer">↑ ↓ navigieren · Enter öffnen · Esc schließen</footer>
      </dialog>
    </section>
  );
}
