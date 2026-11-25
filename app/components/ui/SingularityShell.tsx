/**
 * SingularityShell â€” unverÃ¤nderlicher Rahmen um die gesamte App.
 * EnthÃ¤lt Top-Bar, linke Navigation, rechte Inspektor-Spalte und untere Debugger-Leiste.
 */
import { useCallback } from "react";
import {
  Breadcrumb,
  FixedOverlay,
  INVESTMENT_LEVELS,
  InvestmentLevel,
  ShellNavigationItem,
  ShellProps,
  SINGULARITY_COLORS,
} from "./SingularityPrimitives";

const SINGULARITY_GRADIENT_GOLD = "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)";

export function SingularityShell(props: ShellProps) {
  const {
    children,
    navItems,
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
  } = props;

  const levelInfo = INVESTMENT_LEVELS[investmentLevel];

  const handleInvestmentCycle = useCallback(() => {
    const order: InvestmentLevel[] = ["STARTER_299", "ENTERPRISE_990", "APEX_OMEGA_PRIME"];
    const currentIdx = order.indexOf(investmentLevel);
    const nextIdx = (currentIdx + 1) % order.length;
    const next = order[nextIdx];
    onInvestmentChange(next);
  }, [investmentLevel, onInvestmentChange]);

  return (
    <div className="sg-root" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "rgba(11, 14, 20, 0.9)",
          borderBottom: `1px solid ${SINGULARITY_COLORS.line}`,
          zIndex: 50,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <WindowDots />
        <TitleBar />
        <CenterControls
          killSwitchActive={killSwitchActive}
          onKillSwitchToggle={onKillSwitchToggle}
          onCommandPaletteToggle={onCommandPaletteToggle}
        />
        <RightControls
          levelInfo={levelInfo}
          investmentLevel={investmentLevel}
          onInvestmentChange={handleInvestmentCycle}
        />
      </header>

      <div
        style={{
          padding: "6px 16px",
          background: "rgba(6, 9, 15, 0.7)",
          borderBottom: `1px solid ${SINGULARITY_COLORS.line}`,
          zIndex: 45,
        }}
      >
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <LeftNav navItems={navItems} />
        <main style={{ flex: 1, overflow: "auto", position: "relative", minWidth: 0 }}>
          {children}
        </main>
        <RightInspector
          inspectorOpen={inspectorOpen}
          onInspectorToggle={onInspectorToggle}
        />
      </div>

      <FooterBar
        liveTracesCount={liveTracesCount}
        latencyMs={latencyMs}
        modelName={modelName}
        autoRollbackArmed={autoRollbackArmed}
      />
    </div>
  );
}
function LeftNav({ navItems }: { navItems: ShellNavigationItem[] }) {
  return (
    <aside
      style={{
        width: 260,
        background: "rgba(11, 14, 20, 0.92)",
        borderRight: `1px solid ${SINGULARITY_COLORS.line}`,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      <nav style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            style={{
              width: "100%",
              textAlign: "left",
              padding: "14px 16px",
              background: item.active
                ? SINGULARITY_GRADIENT_GOLD
                : "rgba(16, 22, 33, 0.6)",
              color: item.active ? SINGULARITY_COLORS.goldText : SINGULARITY_COLORS.champagne,
              border: `1px solid ${SINGULARITY_COLORS.goldRing}`,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)";
                e.currentTarget.style.borderColor = SINGULARITY_COLORS.emerald;
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.currentTarget.style.background = "rgba(16, 22, 33, 0.6)";
                e.currentTarget.style.borderColor = SINGULARITY_COLORS.goldRing;
              }
            }}
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: 16, borderTop: `1px solid ${SINGULARITY_COLORS.line}` }}>
        <button
          type="button"
          style={{
            width: "100%",
            textAlign: "left",
            padding: "12px 14px",
            background: "rgba(45, 212, 191, 0.1)",
            color: SINGULARITY_COLORS.emerald,
            border: `1px solid ${SINGULARITY_COLORS.emerald}`,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            cursor: "pointer",
            marginBottom: 8,
          }}
          onClick={() => {}}
        >
          OPEN-SOURCE MCP TOOLS (0,00 â‚¬)
        </button>
        <div style={{ fontSize: 10, color: SINGULARITY_COLORS.muted, lineHeight: 1.4 }}>
          Aktive MCP-Server werden live gepingt und können im Sektor
          "Infrastruktur & Business" getestet werden.
        </div>
      </div>
    </aside>
  );
}

function WindowDots() {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {["#FF5F56", "#FFBD2E", "#27C93F"].map((color) => (
        <div
          key={color}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: color,
          }}
        />
      ))}
    </div>
  );
}

function TitleBar() {
  return (
    <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
      <span
        style={{
          fontWeight: 800,
          color: SINGULARITY_COLORS.champagne,
          fontSize: 14,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        AETHERION OMEGA // X-18
        Sovereign Enterprise OS Â· Engineered by Wertarbeit AI
      </span>
    </div>
  );
}

function CenterControls({
  killSwitchActive,
  onKillSwitchToggle,
  onCommandPaletteToggle,
}: {
  killSwitchActive: boolean;
  onKillSwitchToggle: () => void;
  onCommandPaletteToggle: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: SINGULARITY_COLORS.muted, textTransform: "uppercase", letterSpacing: 1 }}>
        STANDARD
      </span>
      <button
        type="button"
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          position: "relative",
          cursor: "pointer",
          background: "#334155",
        }}
        onClick={onCommandPaletteToggle}
        title="STANDARD | EXPERTE wechseln"
      />
      <button
        type="button"
        className="sg-kill-switch"
        onClick={onKillSwitchToggle}
        title={killSwitchActive ? "Kill-Switch deaktivieren" : "GLOBALER KILL-SWITCH"}
      >
        {killSwitchActive ? "REACTIVIEREN" : "GLOBAL KILL-SWITCH"}
      </button>
      <button
        type="button"
        style={{
          background: "transparent",
          border: `1px solid ${SINGULARITY_COLORS.goldRing}`,
          color: SINGULARITY_COLORS.goldRing,
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
        onClick={onCommandPaletteToggle}
        title="Cmd + K Meta-KI Kommandozeile"
      >
        Cmd + K KOMMANDOZEILE
      </button>
      <button
        type="button"
        style={{
          background: "transparent",
          border: `1px solid ${SINGULARITY_COLORS.emerald}`,
          color: SINGULARITY_COLORS.emerald,
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
        title="VOICE-CONTROL"
      >
        VOICE-CONTROL
      </button>
    </div>
  );
}

function RightControls({
  levelInfo,
  investmentLevel,
  onInvestmentChange,
}: {
  levelInfo: (typeof INVESTMENT_LEVELS)[InvestmentLevel];
  investmentLevel: InvestmentLevel;
  onInvestmentChange: (next: InvestmentLevel) => void;
}) {
  const handleCycle = () => {
    const order: InvestmentLevel[] = ["STARTER_299", "ENTERPRISE_990", "APEX_OMEGA_PRIME"];
    const currentIdx = order.indexOf(investmentLevel);
    const nextIdx = (currentIdx + 1) % order.length;
    onInvestmentChange(order[nextIdx]);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 260, flexWrap: "wrap" }}>
      <div
        style={{
          background: SINGULARITY_GRADIENT_GOLD,
          color: SINGULARITY_COLORS.goldText,
          padding: "8px 12px",
          borderRadius: 10,
          fontWeight: 800,
          fontSize: 11,
          textAlign: "center",
          boxShadow: `0 0 24px rgba(212, 175, 55, 0.18)`,
          cursor: "pointer",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
          zIndex: 30,
        }}
        onClick={handleCycle}
        title="Investitionsstufe wechseln"
      >
        {levelInfo.label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: SINGULARITY_COLORS.emerald,
          fontWeight: 700,
          textTransform: "uppercase",
          cursor: "pointer",
          padding: "4px 8px",
          border: `1px solid ${SINGULARITY_COLORS.emerald}`,
          borderRadius: 6,
          pointerEvents: "auto",
          zIndex: 30,
        }}
        onClick={() => {}}
        title="LIVE ROI & QUALITÄT umschalten"
      >
        LIVE ROI &amp; QUALITÄT
      </div>
      <button
        type="button"
        style={{
          background: SINGULARITY_GRADIENT_GOLD,
          color: SINGULARITY_COLORS.goldText,
          padding: "8px 12px",
          borderRadius: 10,
          fontWeight: 800,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          border: "none",
          cursor: "pointer",
          pointerEvents: "auto",
          zIndex: 30,
          boxShadow: `0 0 24px rgba(212, 175, 55, 0.18)`,
          whiteSpace: "nowrap",
        }}
        onClick={() => {}}
        title="Showreel, Domain-Scanner, Pricing & Zertifikate"
      >
        VERMARKTUNG &amp; SHOWREEL
      </button>
    </div>
  );
}
function RightInspector({ inspectorOpen, onInspectorToggle }: { inspectorOpen: boolean; onInspectorToggle: () => void }) {
  return (
    <aside
      style={{
        width: 270,
        background: "rgba(11, 14, 20, 0.92)",
        borderLeft: `1px solid ${SINGULARITY_COLORS.line}`,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${SINGULARITY_COLORS.line}`, paddingBottom: 8 }}>
          {["Gehirn/Prompt", "Akademie/Trust", "Forensik", "Sandbox"].map((tab, i) => (
            <button
              key={tab}
              type="button"
              style={{
                flex: 1,
                padding: "6px 4px",
                background: i === 0 ? "rgba(212, 175, 55, 0.2)" : "transparent",
                color: i === 0 ? SINGULARITY_COLORS.champagne : SINGULARITY_COLORS.muted,
                border: `1px solid ${i === 0 ? SINGULARITY_COLORS.goldRing : SINGULARITY_COLORS.line}`,
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
              onClick={() => { onInspectorToggle(); }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          style={{
            background: SINGULARITY_GRADIENT_GOLD,
            color: SINGULARITY_COLORS.goldText,
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
            fontWeight: 800,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            boxShadow: "0 0 24px rgba(212, 175, 55, 0.18)",
            marginBottom: 10,
            cursor: "pointer",
          }}
          onClick={() => { onInspectorToggle(); }}
        >
          CERTIFICATION<br />
          GATEWAY
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: `1px solid ${SINGULARITY_COLORS.line}`,
            borderRadius: 10,
            background: "rgba(6, 9, 15, 0.6)",
            padding: 8,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: 10,
          }}
        >
          <div style={{ color: SINGULARITY_COLORS.muted, marginBottom: 6, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            SHA-256 AUDIT LEDGER
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 6px",
                borderRadius: 4,
                cursor: "pointer",
                background: i % 2 === 0 ? "rgba(212, 175, 55, 0.05)" : "transparent",
                border: `1px solid ${i % 2 === 0 ? SINGULARITY_COLORS.line : "transparent"}`,
                fontSize: 10,
                color: SINGULARITY_COLORS.text,
              }}
              onClick={() => { onInspectorToggle(); }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: SINGULARITY_COLORS.emerald,
                  boxShadow: `0 0 6px ${SINGULARITY_COLORS.emerald}`,
                }}
              />
              <span style={{ color: SINGULARITY_COLORS.champagne, fontWeight: 600 }}>
                SHA-256:6c721e4211f3a1b866fbf72456144ba2e603aad9276add14ffa7c0750b662267
              </span>
              <span style={{ color: SINGULARITY_COLORS.muted, marginLeft: "auto", fontSize: 9 }}>
                {(i + 1) * 14}ms
              </span>
            </div>
          ))}
          <div style={{ marginTop: 8, color: SINGULARITY_COLORS.muted, fontSize: 9 }}>
            Klick auf einen Hash fuer forensische Detailansicht
          </div>
        </div>
      </div>
    </aside>
  );
}
function FooterBar({ liveTracesCount, latencyMs, modelName, autoRollbackArmed }: { liveTracesCount: number | null; latencyMs: number | null; modelName: string | null; autoRollbackArmed: boolean }) {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 16px",
        background: "rgba(11, 14, 20, 0.92)",
        borderTop: `1px solid ${SINGULARITY_COLORS.line}`,
        fontSize: 11,
        color: SINGULARITY_COLORS.muted,
        zIndex: 45,
      }}
    >
      <span>LIVE TRACES: {liveTracesCount !== null ? liveTracesCount : "—"}</span>
      <span>LATENCY: {latencyMs !== null ? latencyMs : "—"}ms</span>
      <span>MODEL: {modelName !== null ? modelName : "—"}</span>
      <span>AUTO-ROLLBACK: {autoRollbackArmed ? "ARMED" : "STANDBY"}</span>
    </footer>
  );
}
