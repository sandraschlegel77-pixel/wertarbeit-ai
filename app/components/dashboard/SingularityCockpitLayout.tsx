/**
 * SingularityCockpitLayout — Client-Layout-Komponente, die den SingularityShell
 * um das Cockpit-Inhalt wickelt und clientseitigen State + SSE-Stream verwaltet.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
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
import { AmbientCoreReactor } from "./AmbientCoreReactor";
import { CommandWheelBottomCards } from "./CommandWheelCanvas";
import { InstitutionsPanel } from "./InstitutionsPanel";
import { RDLab } from "./RDLab";
import { OwnerSecretVault } from "./OwnerSecretVault";
import { btn, card } from "./theme";
import type { AgentDef } from "../../services/agent-types";
import type { EarningsSummary } from "../../services/agent-types";
import type { AgentPerformanceSnapshot } from "../../services/agent-types";

const SECTORS = [
  { id: "sector1", label: "1. KOMMANDO & GOVERNANCE" },
  { id: "sector2", label: "2. OPERATIVE ABTEILUNGEN" },
  { id: "sector3", label: "3. AKADEMIE & SICHERHEIT" },
  { id: "sector4", label: "4. INFRASTRUKTUR & BUSINESS" },
  { id: "sector5", label: "5. FRONTIER & OMEGA-LAB" },
] as const;
type SectorId = (typeof SECTORS)[number]["id"];

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
  canAccessSecretVault: boolean;
  modulePanel: ReactNode;
  onOpenTeam: () => void;
  onOpenPlatforms: () => void;
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
    canAccessSecretVault,
    modulePanel,
    onOpenTeam,
    onOpenPlatforms,
  } = props;

  const [sector, setSector] = useState<SectorId>("sector1");
  const [searchParams, setSearchParams] = useSearchParams();
  const [investmentLevel, setInvestmentLevel] = useState<InvestmentLevel>("APEX_OMEGA_PRIME");
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [activeView, setActiveView] = useState<"command" | "organigramm">("command");

  const [liveTracesCount, setLiveTracesCount] = useState(12);
  const [latencyMs, setLatencyMs] = useState<number | null>(84);
  const [modelName, setModelName] = useState<string>("OLLAMA LOCAL");
  const [autoRollbackArmed, setAutoRollbackArmed] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);

  const breadcrumbItems = useMemo<{ label: string; onClick?: () => void }[]>(() => [
    { label: "COCKPIT", onClick: () => setSector("sector1") },
    { label: SECTORS.find((item) => item.id === sector)?.label ?? "" },
  ], [sector]);
  const navItems: ShellNavigationItem[] = SECTORS.map((item) => ({
    ...item, active: item.id === sector, onClick: () => setSector(item.id),
  }));

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
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {sector === "sector1" && <AmbientCoreReactor
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
          killSwitchActive={killSwitchActive}
          onKillSwitchToggle={handleKillSwitchToggle}
        />}
        {sector === "sector1" && <CommandWheelBottomCards />}
        {sector === "sector2" && modulePanel}
        {sector === "sector3" && <>
          <section style={card}>
            <button type="button" style={btn} onClick={onOpenTeam}>Belegschaft &amp; Akademie öffnen</button>
          </section>
          {canAccessSecretVault && <OwnerSecretVault />}
        </>}
        {sector === "sector4" && <>
          <section style={card}>
            <button type="button" style={btn} onClick={onOpenPlatforms}>Marktplätze &amp; Sicherheit öffnen</button>
          </section>
          <InstitutionsPanel />
        </>}
        {sector === "sector5" && <RDLab ownerShop={ownerShop} onApplySnapshot={() => {}} />}
      </div>
    ),
    navItems,
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