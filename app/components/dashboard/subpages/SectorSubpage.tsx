/**
 * SectorSubpage — Ebene 2 Sektor-Zentrale mit Live-KPIs, Agenten-Roster und Steuerungs-Aktionen.
 */
import { useCallback, useMemo, useState } from "react";
import type { AgentDef } from "../../../services/agent-types";
import type { EarningsSummary } from "../../../services/agent-types";
import type { AgentPerformanceSnapshot } from "../../../services/agent-types";
import {
  Breadcrumb,
  FixedOverlay,
  InvestmentLevel,
  INVESTMENT_LEVELS,
  KpiCard,
  ShellNavigationItem,
  ShellProps,
  SingularityShell,
  useTelemetryStream,
} from "../../ui/SingularityPrimitives";

const SECTOR_NAV_ITEMS: ShellNavigationItem[] = [
  { id: "sector1", label: "1. KOMMANDO & GOVERNANCE", onClick: () => {}, active: true },
  { id: "sector2", label: "2. OPERATIVE ABTEILUNGEN", onClick: () => {} },
  { id: "sector3", label: "3. AKADEMIE & SICHERHEIT", onClick: () => {} },
  { id: "sector4", label: "4. INFRASTRUKTUR & BUSINESS", onClick: () => {} },
  { id: "sector5", label: "5. FRONTIER & OMEGA-LAB", onClick: () => {} },
];

interface SectorSubpageProps {
  sectorId: number;
  sectorName: string;
  roster: AgentDef[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  allowedDepartmentIds: number[];
  onBack: () => void;
  onPickDept: (id: number) => void;
  investmentLevel: InvestmentLevel;
  onInvestmentChange: (next: InvestmentLevel) => void;
  killSwitchActive: boolean;
  onKillSwitchToggle: () => void;
  commandPaletteOpen: boolean;
  onCommandPaletteToggle: () => void;
  onCommand: (cmd: string) => void;
  liveTracesCount: number;
  latencyMs: number | null;
  modelName: string;
  autoRollbackArmed: boolean;
  inspectorOpen: boolean;
  onInspectorToggle: () => void;
}

export function SectorSubpage(props: SectorSubpageProps) {
  const {
    sectorId,
    sectorName,
    roster,
    earnings,
    performance,
    allowedDepartmentIds,
    onBack,
    onPickDept,
    investmentLevel,
    onInvestmentChange,
    killSwitchActive,
    onKillSwitchToggle,
    commandPaletteOpen,
    onCommandPaletteToggle,
    onCommand,
    liveTracesCount,
    latencyMs,
    modelName,
    autoRollbackArmed,
    inspectorOpen,
    onInspectorToggle,
  } = props;

  const [activeTab, setActiveTab] = useState<"kpi" | "roster" | "actions">("kpi");

  const sectorAgents = useMemo(
    () => roster.filter((a) => allowedDepartmentIds.includes(a.departmentId)),
    [roster, allowedDepartmentIds]
  );

  const breadcrumbItems = [
    { label: "COCKPIT", onClick: onBack },
    { label: "SEKTOR", onClick: onBack },
    { label: sectorName },
  ];

  const handleTelemetryEvent = useCallback((event: any) => {}, []);

  useTelemetryStream(handleTelemetryEvent, true);

  const shellProps: ShellProps = {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <div
          style={{
            background: "rgba(16, 22, 33, 0.6)",
            border: `1px solid rgba(212, 175, 55, 0.5)`,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              color: "#141006",
            }}
          >
            {sectorId}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#F7E7CE", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {sectorName}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              Live-KPIs · Agenten-Roster · Steuerungs-Aktionen
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#2DD4BF", fontWeight: 700 }}>
            {sectorAgents.length} Agenten aktiv
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, borderBottom: `1px solid rgba(212, 175, 55, 0.3)`, paddingBottom: 8 }}>
          {["kpi", "roster", "actions"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: activeTab === tab ? "rgba(212, 175, 55, 0.2)" : "transparent",
                color: activeTab === tab ? "#F7E7CE" : "#94A3B8",
                border: `1px solid ${activeTab === tab ? "#D4AF37" : "rgba(212, 175, 55, 0.3)"}`,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {tab === "kpi" ? "LIVE KPIs" : tab === "roster" ? "AGENTEN-ROSTER" : "STEUERUNG"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {activeTab === "kpi" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <KpiCard label="AKTIVE AGENTEN" value={sectorAgents.length} variant="gold" />
              <KpiCard label="MONATS-REAL (€)" value={Math.round(Object.values(earnings.perAgent).reduce((sum, e) => sum + e.monthReal, 0))} variant="emerald" />
              <KpiCard label="MONATS-POTENZIAL (€)" value={Math.round(Object.values(earnings.perAgent).reduce((sum, e) => sum + e.monthPotential, 0))} variant="gold" />
              <KpiCard label="LATENZ (ms)" value={latencyMs ?? "-"} variant="emerald" />
            </div>
          )}
          {activeTab === "roster" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {sectorAgents.map((agent) => {
                const perf = performance.byAgent[agent.key];
                return (
                  <div
                    key={agent.key}
                    style={{
                      background: "rgba(16, 22, 33, 0.6)",
                      border: `1px solid rgba(212, 175, 55, 0.3)`,
                      borderRadius: 10,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#F7E7CE" }}>{agent.name}</div>
                      <div style={{ fontSize: 10, color: "#D4AF37", fontWeight: 700 }}>#{agent.number}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{agent.role}</div>
                    <div style={{ fontSize: 11, color: "#2DD4BF", fontWeight: 600 }}>
                      {perf?.grade != null ? `Score: ${perf.grade}` : "Score: n/a"}
                    </div>
                    <button
                      type="button"
                      onClick={() => onPickDept(agent.departmentId)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)",
                        color: "#141006",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 10,
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      ZUORDNUNG ÖFFNEN
                    </button>
                  </div>
                );
              })}
              {sectorAgents.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 12 }}>
                  Keine Agenten in diesem Sektor verfügbar.
                </div>
              )}
            </div>
          )}
          {activeTab === "actions" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              <button
                type="button"
                onClick={() => onPickDept(sectorAgents[0]?.departmentId || sectorId)}
                style={{
                  background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)",
                  color: "#141006",
                  border: "none",
                  borderRadius: 10,
                  padding: 16,
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                DIREKT-AUFTRAG STARTEN
              </button>
              <button
                type="button"
                onClick={() => onCommandPaletteToggle()}
                style={{
                  background: "rgba(16, 22, 33, 0.6)",
                  color: "#F7E7CE",
                  border: `1px solid #D4AF37`,
                  borderRadius: 10,
                  padding: 16,
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                META-KI BEFEHL
              </button>
              <button
                type="button"
                onClick={onKillSwitchToggle}
                style={{
                  background: killSwitchActive ? "rgba(45, 212, 191, 0.2)" : "linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)",
                  color: killSwitchActive ? "#2DD4BF" : "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  padding: 16,
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {killSwitchActive ? "REAKTIVIEREN" : "KILL-SWITCH"}
              </button>
            </div>
          )}
        </div>
      </div>
    ),
    navItems: SECTOR_NAV_ITEMS,
    breadcrumbItems,
    investmentLevel,
    onInvestmentChange,
    killSwitchActive,
    onKillSwitchToggle,
    commandPaletteOpen,
    onCommandPaletteToggle,
    onCommand,
    liveTracesCount,
    latencyMs,
    modelName,
    autoRollbackArmed,
    inspectorOpen,
    onInspectorToggle,
  };

  return <SingularityShell {...shellProps} />;
}