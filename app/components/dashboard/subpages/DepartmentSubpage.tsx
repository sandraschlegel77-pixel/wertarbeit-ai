/**
 * DepartmentSubpage — Ebene 2 Abteilungs-Zentrale mit Agenten-Karten, Queue, KPIs und Live-Steuerung.
 */
import { useMemo } from "react";
import type { AgentDef, EarningsSummary, AgentPerformanceSnapshot } from "../../../services/agent-types";
import {
  KpiCard,
  ShellNavigationItem,
  ShellProps,
  SingularityShell,
} from "../../ui/SingularityPrimitives";

interface DepartmentSubpageProps {
  departmentId: number;
  departmentName: string;
  roster: AgentDef[];
  earnings: EarningsSummary;
  performance: AgentPerformanceSnapshot;
  onBack: () => void;
  investmentLevel: any;
  onInvestmentChange: () => void;
  killSwitchActive: boolean;
  onKillSwitchToggle: () => void;
  commandPaletteOpen: boolean;
  onCommandPaletteToggle: () => void;
  onCommand: () => void;
  liveTracesCount: number;
  latencyMs: number | null;
  modelName: string;
  autoRollbackArmed: boolean;
  inspectorOpen: boolean;
  onInspectorToggle: () => void;
}

const DEPARTMENT_NAV_ITEMS: ShellNavigationItem[] = [
  { id: "dept1", label: "WORKFLOW", onClick: () => {}, active: true },
  { id: "dept2", label: "RESEARCH", onClick: () => {} },
  { id: "dept3", label: "MARKETING", onClick: () => {} },
  { id: "dept4", label: "SALES", onClick: () => {} },
  { id: "dept5", label: "SUPPORT", onClick: () => {} },
  { id: "dept6", label: "COMPLIANCE", onClick: () => {} },
  { id: "dept7", label: "FINANCE", onClick: () => {} },
  { id: "dept8", label: "HR", onClick: () => {} },
  { id: "dept9", label: "R&D", onClick: () => {} },
  { id: "dept10", label: "PROCUREMENT", onClick: () => {} },
];

export function DepartmentSubpage(props: DepartmentSubpageProps) {
  const {
    departmentId,
    departmentName,
    roster,
    earnings,
    performance,
    onBack,
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

  const deptAgents = useMemo(
    () => roster.filter((a) => a.departmentId === departmentId),
    [roster, departmentId]
  );

  const totalMonthReal = useMemo(
    () => deptAgents.reduce((sum, a) => sum + (earnings.perAgent[a.key]?.monthReal || 0), 0),
    [deptAgents, earnings]
  );

  const shellProps: ShellProps = {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              color: "#141006",
            }}
          >
            {departmentId}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#F7E7CE", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {departmentName}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              Agenten-Queue · KPIs · Live-Steuerung
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#2DD4BF", fontWeight: 700 }}>
            {deptAgents.length} Agenten
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <KpiCard label="AKTIVE AGENTEN" value={deptAgents.length} variant="gold" />
          <KpiCard label="MONATS-REAL (€)" value={Math.round(totalMonthReal)} variant="emerald" />
          <KpiCard label="LATENZ (ms)" value={latencyMs ?? "-"} variant="gold" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, flex: 1 }}>
          {deptAgents.map((agent) => {
            const perf = performance.byAgent[agent.key];
            const earningsData = earnings.perAgent[agent.key];
            return (
              <div
                key={agent.key}
                style={{
                  background: "rgba(16, 22, 33, 0.6)",
                  border: `1px solid rgba(212, 175, 55, 0.3)`,
                  borderRadius: 10,
                  padding: 14,
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
                <div style={{ display: "flex", gap: 16, fontSize: 10 }}>
                  <div style={{ color: "#2DD4BF" }}>Score: {perf?.grade ?? "n/a"}</div>
                  <div style={{ color: "#D4AF37" }}>
                    Monat: {Math.round(earningsData?.monthReal || 0)}€
                  </div>
                  <div style={{ color: "#D4AF37" }}>
                    Pot.: {Math.round(earningsData?.monthPotential || 0)}€
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
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
                    AUFTRAG
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "6px 10px",
                      background: "rgba(16, 22, 33, 0.6)",
                      color: "#F7E7CE",
                      border: `1px solid #D4AF37`,
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 10,
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    INSPEKTION
                  </button>
                </div>
              </div>
            );
          })}
          {deptAgents.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 12 }}>
              Keine Agenten in dieser Abteilung verfügbar.
            </div>
          )}
        </div>
      </div>
    ),
    navItems: DEPARTMENT_NAV_ITEMS,
    breadcrumbItems: [
      { label: "COCKPIT", onClick: onBack },
      { label: "ABTEILUNGEN", onClick: onBack },
      { label: departmentName },
    ],
    investmentLevel: investmentLevel as any,
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