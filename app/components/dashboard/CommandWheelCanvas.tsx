/**
 * CommandWheelCanvas — Pixelgenaues Command-Rad (SVG viewBox="0 0 1200 900").
 * Innerer Kern + 10 emerald-gold Kreise im 36°-Winkel (horizontal 0°) mit animierten Lichtimpulsen.
 */
import { useEffect, useRef, useState } from "react";
import type { AgentDef } from "../../services/agent-types";
import type { EarningsSummary } from "../../services/agent-types";
import type { AgentPerformanceSnapshot } from "../../services/agent-types";

const DEPARTMENTS = [
  { number: 1, name: "Workflow", label: "1. Workflow", key: "dept1" },
  { number: 2, name: "Content", label: "2. Content", key: "dept2" },
  { number: 3, name: "Code", label: "3. Code", key: "dept3" },
  { number: 4, name: "Support", label: "4. Support", key: "dept4" },
  { number: 5, name: "Legal/IP", label: "5. Legal/IP", key: "dept5" },
  { number: 6, name: "Finance", label: "6. Finance", key: "dept6" },
  { number: 7, name: "Growth", label: "7. Growth", key: "dept7" },
  { number: 8, name: "BI", label: "8. BI", key: "dept8" },
  { number: 9, name: "Product", label: "9. Product", key: "dept9" },
  { number: 10, name: "Procurement", label: "10. Procurement", key: "dept10" },
] as const;

const CENTER_X = 600;
const CENTER_Y = 450;
const INNER_R = 140;
const DEPT_R = 320;
const DEPT_CIRCLE_R = 52;

interface CommandWheelCanvasProps {
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
  onSwitchView: (mode: "command" | "organigramm") => void;
  activeView: "command" | "organigramm";
}

export function CommandWheelCanvas(props: CommandWheelCanvasProps) {
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
    onSwitchView,
    activeView,
  } = props;

  const [activeTraceAgents, setActiveTraceAgents] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const keys = new Set(initialTraces.map((t) => t.agentKey).filter((k): k is string => Boolean(k)));
    setActiveTraceAgents(keys);
  }, [initialTraces]);

  const getDeptAngle = (index: number) => index * 36;

  const getDeptPosition = (index: number) => {
    const angle = getDeptAngle(index);
    const rad = (angle * Math.PI) / 180;
    return { x: CENTER_X + DEPT_R * Math.cos(rad), y: CENTER_Y + DEPT_R * Math.sin(rad) };
  };

  const isAgentActive = (agentKey: string | undefined) => {
    if (!agentKey) return false;
    return activeTraceAgents.has(agentKey);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(540px, 100%)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "transparent",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 4 }}>
        <button
          type="button"
          style={{
            padding: "6px 14px",
            background: activeView === "command" ? "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)" : "rgba(212, 175, 55, 0.12)",
            color: "#D4AF37",
            border: "1px solid #D4AF37",
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 11,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
          onClick={() => onSwitchView("command")}
        >
          COMMAND-RAD (LIVE)
        </button>
        <button
          type="button"
          style={{
            padding: "6px 14px",
            background: activeView === "organigramm" ? "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)" : "rgba(248, 250, 252, 0.08)",
            color: "#F8FAFC",
            border: "1px solid #F8FAFC",
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 11,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
          onClick={() => onSwitchView("organigramm")}
        >
          1:1 ORGANIGRAMM (18 EBENEN)
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1200 900"
          width="100%"
          height="100%"
          style={{ maxWidth: "1100px", maxHeight: "750px", display: "block" }}
        >
          <defs>
            <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Verbindungs-Linien */}
          {DEPARTMENTS.map((dept, i) => {
            const pos = getDeptPosition(i);
            return (
              <line
                key={dept.key}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={pos.x}
                y2={pos.y}
                stroke="#D4AF37"
                strokeOpacity="0.35"
                strokeWidth="2"
                className={isAgentActive(roster.find((a) => a.departmentId === dept.number)?.key) ? "sg-pulse-emerald" : ""}
              />
            );
          })}

          {/* Innerer Kern */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={INNER_R + 8}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            opacity="0.6"
          />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={INNER_R}
            fill="none"
            stroke="linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)"
            strokeWidth="5"
            filter="url(#glow)"
          />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={INNER_R - 4}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Kern-Text */}
          <text
            x={CENTER_X}
            y={CENTER_Y - 38}
            textAnchor="middle"
            fill="#D4AF37"
            fontWeight="800"
            fontSize="14"
            letterSpacing="0.5"
          >
            AETHERION OMEGA // X-18
          </text>
          <text
            x={CENTER_X}
            y={CENTER_Y - 18}
            textAnchor="middle"
            fill="#E2E8F0"
            fontWeight="700"
            fontSize="13"
            letterSpacing="0.2"
          >
            (Meta-KI)
          </text>
          <text
            x={CENTER_X}
            y={CENTER_Y + 6}
            textAnchor="middle"
            fill="#D4AF37"
            fontWeight="800"
            fontSize="18"
            letterSpacing="0.2"
          >
            Master-Orchestrator
          </text>
          <text
            x={CENTER_X}
            y={CENTER_Y + 30}
            textAnchor="middle"
            fill="#E2E8F0"
            fontWeight="600"
            fontSize="12"
            letterSpacing="0.2"
          >
            (CEO-Agent)
          </text>
          <text
            x={CENTER_X}
            y={CENTER_Y + 54}
            textAnchor="middle"
            fill="#2DD4BF"
            fontWeight="700"
            fontSize="13"
            letterSpacing="0.3"
          >
            CONSTITUTIONAL CORE (0,00 €)
          </text>

          {/* Department-Kreise (10x im 36°-Winkel) */}
          {DEPARTMENTS.map((dept, i) => {
            const pos = getDeptPosition(i);
            const agentsInDept = roster.filter((a) => a.departmentId === dept.number);
            const activeCount = agentsInDept.filter((a) => activeTraceAgents.has(a.key)).length;
            const isActive = activeCount > 0;

            return (
              <g key={dept.key} onClick={() => onPickDept(dept.number)} style={{ cursor: "pointer" }}>
                {isActive && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={DEPT_CIRCLE_R + 6}
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="2"
                    opacity="0.5"
                    className="sg-pulse-emerald"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={DEPT_CIRCLE_R}
                  fill="rgba(16, 22, 33, 0.9)"
                  stroke={isActive ? "#2DD4BF" : "#D4AF37"}
                  strokeWidth={isActive ? 3 : 2}
                  filter={isActive ? "url(#glow)" : undefined}
                />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={DEPT_CIRCLE_R - 3}
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={pos.x}
                  y={pos.y - 10}
                  textAnchor="middle"
                  fill="#D4AF37"
                  fontWeight="800"
                  fontSize="12"
                >
                  {dept.number}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 6}
                  textAnchor="middle"
                  fill={isActive ? "#2DD4BF" : "#E2E8F0"}
                  fontWeight="700"
                  fontSize="10"
                  letterSpacing="0.3"
                >
                  {dept.name}
                </text>
                {isActive && (
                  <text
                    x={pos.x}
                    y={pos.y + 20}
                    textAnchor="middle"
                    fill="#2DD4BF"
                    fontWeight="800"
                    fontSize="9"
                  >
                    ● {activeCount}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Rechte Seite: Zwei Rauchglas-Karten */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "rgba(16, 22, 33, 0.88)",
              border: "1px solid rgba(45, 212, 191, 0.5)",
              borderRadius: 14,
              padding: 16,
              boxShadow: "0 0 24px rgba(45, 212, 191, 0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#2DD4BF",
                  boxShadow: "0 0 8px #2DD4BF",
                }}
              />
              <span style={{ fontWeight: 800, fontSize: 12, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: 0.5 }}>
                LIVE SWARM DEBATE
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5, marginBottom: 12 }}>
              Real-time consensus zwischen Legal, Growth und Devil's Advocate.
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["Legal", "Growth", "Devil's Advocate"].map((label) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    background: "rgba(6, 9, 15, 0.6)",
                    border: `1px solid #2DD4BF`,
                    borderRadius: 6,
                    color: "#2DD4BF",
                    fontSize: 10,
                    fontWeight: 700,
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ height: 60, overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94A3B8" }}>
                    <span style={{ color: "#2DD4BF" }}>Jury #{i + 1}</span>
                    <span>{i % 2 === 0 ? "PASS" : "REVIEW"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)",
              color: "#141006",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 0 24px rgba(212, 175, 55, 0.18)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              ONE-SWIPE AUTO-REINVEST<br />
              &amp; APPROVAL
            </div>
            <div style={{ fontSize: 10, color: "#141006", opacity: 0.8, marginBottom: 14, lineHeight: 1.4 }}>
              Ein Klick freigibt alle pending Consensus-Jury-Verdikte und reinvestiert automatisch.
            </div>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "8px 14px",
                background: "#141006",
                color: "#D4AF37",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 11,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              AUTO-REINVEST AUSFÜHREN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}