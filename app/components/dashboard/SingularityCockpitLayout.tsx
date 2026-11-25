/**
 * SingularityCockpitLayout — Client-Layout-Komponente, die den SingularityShell
 * um das Cockpit-Inhalt wickelt und clientseitigen State + SSE-Stream verwaltet.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import {
  Breadcrumb,
  FixedOverlay,
  InvestmentLevel,
  INVESTMENT_LEVELS,
  ShellNavigationItem,
  ShellProps,
} from "../ui/SingularityPrimitives";
import { SingularityShell } from "../ui/SingularityShell";
import { useTelemetryStream } from "../ui/useTelemetryStream";
import { CommandWheelCanvas } from "./CommandWheelCanvas";
import type { AgentDef } from "../../services/agent-types";
import type { EarningsSummary } from "../../services/agent-types";
import type { AgentPerformanceSnapshot } from "../../services/agent-types";

const NAV_ITEMS: ShellNavigationItem[] = [
  { id: "sector1", label: "1. KOMMANDO & GOVERNANCE", onClick: () => {}, active: true },
  { id: "sector2", label: "2. OPERATIVE ABTEILUNGEN", onClick: () => {} },
  { id: "sector3", label: "3. AKADEMIE & SICHERHEIT", onClick: () => {} },
  { id: "sector4", label: "4. INFRASTRUKTUR & BUSINESS", onClick: () => {} },
  { id: "sector5", label: "5. FRONTIER & OMEGA-LAB", onClick: () => {} },
];

interface SingularityCockpitLayoutProps {
  initialTraces: Array<{ channelKey: string; agentKey: string | null; eventType: string; outcome: string }>;
  executivePulse: string[];
  dynamicCount: number;
  ownerShop: boolean;
  roster: AgentDef[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  allowedDepartmentIds: number[];
  onPickDept: (id: number) => void;
  onSelectModule: (moduleId: string) => void;
}

export function SingularityCockpitLayout(props: SingularityCockpitLayoutProps) {
  const {
    initialTraces,
    executivePulse,
    dynamicCount,
    ownerShop,
    roster,
    earnings,
    performance,
    allowedDepartmentIds,
    onPickDept,
    onSelectModule,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const [investmentLevel, setInvestmentLevel] = useState<InvestmentLevel>("APEX_OMEGA_PRIME");
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [activeView, setActiveView] = useState<"command" | "organigramm">("command");

  const [liveTracesCount, setLiveTracesCount] = useState(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [modelName, setModelName] = useState<string>("OLLAMA LOCAL");
  const [autoRollbackArmed, setAutoRollbackArmed] = useState(true);

  // Breadcrumb basierend auf aktiver Ansicht
  const breadcrumbItems = useMemo<{ label: string; onClick?: () => void }[]>(() => [
    { label: "COCKPIT", onClick: () => {} },
    { label: activeView === "command" ? "SEKTOR" : "ORGANIGRAMM" },
    { label: activeView === "command" ? "COMMAND-RAD" : "18 EBENEN", onClick: () => {} },
    { label: "DETAIL", onClick: () => {} },
  ], [activeView]);

  // Telemetry Stream verbinden
  const handleTelemetryEvent = useCallback((event: any) => {
    switch (event.type) {
      case "WORKER_START":
        setLiveTracesCount((c) => c + 1);
        break;
      case "OLLAMA_CHECK":
        setLatencyMs(event.latencyMs);
        setModelName(event.model);
        break;
      case "HEARTBEAT":
        setLiveTracesCount(event.activeWorkers);
        break;
      case "TRACE":
        setLiveTracesCount((c) => c + 1);
        break;
      default:
        break;
    }
  }, []);

  useTelemetryStream(handleTelemetryEvent, true);

  // Investment-Level aus URL oder Default
  useEffect(() => {
    const urlLevel = searchParams.get("investment") as InvestmentLevel | null;
    if (urlLevel && urlLevel in INVESTMENT_LEVELS) {
      setInvestmentLevel(urlLevel);
    }
  }, [searchParams]);

  const handleInvestmentChange = useCallback((next: InvestmentLevel) => {
    setInvestmentLevel(next);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("investment", next);
      return p;
    }, { preventScrollReset: true });
  }, [setSearchParams]);

  const handleKillSwitchToggle = useCallback(() => {
    setKillSwitchActive((prev) => !prev);
  }, []);

  const handleCommandPaletteToggle = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev);
  }, []);

  const handleInspectorToggle = useCallback(() => {
    setInspectorOpen((prev) => !prev);
  }, []);

  const handleSwitchView = useCallback((mode: "command" | "organigramm") => {
    setActiveView(mode);
  }, []);

  const shellProps: ShellProps = {
    children: (
      <CommandWheelCanvas
        initialTraces={initialTraces}
        executivePulse={executivePulse}
        dynamicCount={dynamicCount}
        ownerShop={ownerShop}
        roster={roster}
        earnings={earnings}
        performance={performance}
        allowedDepartmentIds={allowedDepartmentIds}
        onPickDept={onPickDept}
        onSelectModule={onSelectModule}
        onSwitchView={handleSwitchView}
        activeView={activeView}
      />
    ),
    navItems: NAV_ITEMS,
    breadcrumbItems,
    investmentLevel,
    onInvestmentChange: handleInvestmentChange,
    killSwitchActive,
    onKillSwitchToggle: handleKillSwitchToggle,
    commandPaletteOpen,
    onCommandPaletteToggle: handleCommandPaletteToggle,
    onCommand: (cmd) => {
      console.log("Meta-KI Kommando:", cmd);
      setCommandPaletteOpen(false);
    },
    liveTracesCount,
    latencyMs,
    modelName,
    autoRollbackArmed,
    inspectorOpen,
    onInspectorToggle: handleInspectorToggle,
  };

  return <SingularityShell {...shellProps} />;
}