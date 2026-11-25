import { useState, useRef, useCallback, lazy, Suspense, type CSSProperties } from "react"
import { useFetcher } from "react-router"
import { C, btn, card } from "./theme"
import type { LiveConnectionTraceDto } from "../../services/live-connection.server"
import type { AgentDef, AgentPerformanceSnapshot, EarningsSummary } from "../../services/agent-types"
import { ExecutivePulse } from "./ExecutivePulse"
import { DEPARTMENTS } from "../../services/agent-roster"

type LegalRule = {
  id: string
  ruleKey: string
  jurisdiction: string
  sourceUrl: string
  sourceTitle: string
  sourceHash: string
  verifiedAt: string
  reviewStatus: string
}
type Capability = {
  id: string
  domainKey: string
  displayName: string
  feasibility: string
  sourceUrl: string | null
  sourceTitle: string | null
  evidenceSummary: string
  verifiedAt: string | null
  expiresAt: string | null
  estimatedCostEur: number | null
  riskLevel: string
  isVerified: boolean
}
type Binding = {
  id: string
  agentKey: string
  interfaceKey: string
  status: string
  lastVerifiedAt: string | null
  createdAt: string
  isNewlySpawnedInterface: boolean
}

const EnterpriseOsOrganigram = lazy(() =>
  import("./EnterpriseOsOrganigram").then((module) => ({ default: module.EnterpriseOsOrganigram }))
)

type InvestmentStage = "autopilot" | "enterprise" | "apex"

const STAGES: Record<InvestmentStage, { label: string; short: string; threads: number; price: string }> = {
  autopilot: { label: "Autopilot 299 €", short: "Autopilot", threads: 2, price: "299 €" },
  enterprise: { label: "Enterprise 990 €", short: "Enterprise", threads: 8, price: "990 €" },
  apex: { label: "Apex Sovereign 3.500 €+", short: "Apex Sovereign", threads: 24, price: "3.500 €+" },
}

const STAGE_ORDER: InvestmentStage[] = ["autopilot", "enterprise", "apex"]

interface WheelProps {
  initialTraces: LiveConnectionTraceDto[]
  executivePulse: string[]
  dynamicCount?: number
  ownerShop?: boolean
  roster?: AgentDef[]
  earnings?: EarningsSummary
  performance?: AgentPerformanceSnapshot
  allowedDepartmentIds?: number[]
  legalRules?: LegalRule[]
  capabilities?: Capability[]
  bindings?: Binding[]
  onPickDept?: (id: number) => void
  onSelectModule?: (moduleId: string) => void
}

export function ExecutiveCommandWheel({
  initialTraces,
  executivePulse,
  dynamicCount = 0,
  ownerShop = true,
  roster = [],
  earnings,
  performance,
  allowedDepartmentIds,
  legalRules = [],
  capabilities = [],
  bindings = [],
  onPickDept,
  onSelectModule,
}: WheelProps) {
  const [view, setView] = useState<"cockpit" | "organigram">("cockpit")
  const [stage, setStage] = useState<InvestmentStage>("autopilot")
  const [showInfo, setShowInfo] = useState<{ departmentId: number } | null>(null)
  const stageConf = STAGES[stage]
  const { threads: threadCount } = stageConf
  const tenDepartments = DEPARTMENTS.slice(0, 10)
  const fetcher = useFetcher<{ traces: LiveConnectionTraceDto[]; snapshotAt: string }>()
  const latestTraces = fetcher.data?.traces ?? initialTraces
  const centerX = 500
  const centerY = 400
  const ringRadius = 200
  const handleStageChange = useCallback((nextStage: InvestmentStage) => { setStage(nextStage) }, [])
  const handleViewToggle = () => { setView((prev) => (prev === "cockpit" ? "organigram" : "cockpit")) }
  const handleDeptClick = useCallback((deptId: number) => { setShowInfo({ departmentId: deptId }) }, [])
  const positionOnCircle = (index: number, total: number, radius: number) => {
    const angle = (index / total) * (2 * Math.PI) - Math.PI / 2
    return { angle, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }
  }
  const deptWheelLabel = (name: string) => (name.length > 14 ? `${name.slice(0, 14)}…` : name)

  const orgAllowed = allowedDepartmentIds ?? DEPARTMENTS.map((department) => department.id)
  const orgEarnings: EarningsSummary = earnings ?? {
    perAgent: {},
    team: {},
    army: { monthReal: 0, totalReal: 0, monthPotential: 0, totalPotential: 0 },
  }
  const orgPerformance: AgentPerformanceSnapshot = performance ?? {
    status: "unavailable",
    message: "Keine Leistungsdaten für diese Ansicht.",
    byAgent: {},
  }

  // Umschalter: 1:1 Gesamt-Organigramm (18 Ebenen)
  if (view === "organigram") {
    return (
      <section style={{ background: C.slate, minHeight: "100vh", color: C.text }}>
        <header style={{ padding: 24, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <strong style={{ color: C.champagne }}>1:1 Gesamt-Organigramm (18 Ebenen)</strong>
            <button type="button" style={btn} onClick={handleViewToggle}>
              Command-Rad (Live Cockpit)
            </button>
          </div>
        </header>
        <Suspense fallback={<div style={{ padding: 24, color: C.muted }}>Organigramm wird geladen…</div>}>
          <EnterpriseOsOrganigram
            dynamicCount={dynamicCount}
            ownerShop={ownerShop}
            roster={roster}
            earnings={orgEarnings}
            performance={orgPerformance}
            allowedDepartmentIds={orgAllowed}
            legalRules={legalRules}
            capabilities={capabilities}
            bindings={bindings}
            initialTraces={initialTraces}
            onPickDept={onPickDept ?? (() => {})}
            onSelectModule={onSelectModule ?? (() => {})}
            executivePulse={executivePulse}
          />
        </Suspense>
      </section>
    )
  }

  return (
    <section
      style={{
        background: C.slate,
        minHeight: "100vh",
        color: C.text,
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Executive Live Cockpit – Runde Command-Rad-Ansicht"
    >
      <header style={{ padding: 24, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ color: C.champagne }}>
              Executive Live Cockpit • Runde Command-Rad-Ansicht
            </strong>
            <span style={{ color: C.muted, fontSize: 11 }}>0,00 € Core-Stack</span>
          </div>
          <button
            type="button"
            style={btn}
            onClick={handleViewToggle}
            aria-label="Zur anderer Ansicht wechseln"
          >
            {view === "cockpit"
              ? "Zuransicht 1:1 Gesamt-Organigramm (18 Ebenen)"
              : "Command-Rad (Live Cockpit)"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", gap: 16, padding: 24 }}>
        <div style={{ flex: 1, minHeight: 740, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(17, 22, 34, 0.6)", borderRadius: 24, border: `1px solid ${C.line}`, overflow: "visible" }}>
          <svg width="1000" height="800" viewBox="0 0 1000 800" role="group" aria-label="Executive Command Wheel – pulsierende Konfiguration">
            <defs>
              <linearGradient id="wheelGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F3D77A" />
                <stop offset="1" stopColor={C.gold} />
              </linearGradient>
              <radialGradient id="wheelEmerald" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#34D399" />
                <stop offset="1" stopColor={C.emerald} />
              </radialGradient>
            </defs>

            <circle cx={500} cy={400} r={280} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.15} />
            <circle cx={500} cy={400} r={200} fill="none" stroke={C.emerald} strokeWidth={2} opacity={0.25} />
            <circle cx={500} cy={400} r={120} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.3} />

            {tenDepartments.map((dept, i) => {
              const pos = positionOnCircle(i, tenDepartments.length, 200)
              const deptKindColor = dept.kind === "armada" ? C.gold : C.emerald
              const x = pos.x - 28
              const y = pos.y - 28
              return (
                <g key={dept.id} transform={`translate(${x},${y}) rotate(${pos.angle * (180 / Math.PI)})`} style={{ cursor: "pointer" }} onClick={() => handleDeptClick(dept.id)}>
                  <title>{`Abt. ${dept.id}: ${dept.name} – ${dept.mechanism}`}</title>
                  <rect x={0} y={0} width={56} height={56} rx={12} fill={C.slate3} stroke={deptKindColor} strokeWidth={2} />
                  <text x={28} y={22} textAnchor="middle" fontSize={10} fontWeight={700} fill={deptKindColor}>
                    Abt.{dept.id}
                  </text>
                  <text x={28} y={40} textAnchor="middle" fontSize={8} fill={C.muted}>
                    {deptWheelLabel(dept.name)}
                  </text>
                </g>
              )
            })}

            <g transform="translate(500,400)">
              <circle cx={0} cy={0} r={44} fill={C.slate3} stroke={C.gold} strokeWidth={3} />
              <circle cx={0} cy={0} r={34} fill="url(#wheelEmerald)" opacity={0.9} />
              <circle cx={0} cy={0} r={24} fill="#111622" opacity={0.95} />
              <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={800} fill={C.champagne}>
                Meta-KI
              </text>
              <text x={0} y={-10} textAnchor="middle" fontSize={8} fill={C.muted}>
                Constitutional
              </text>
              <polygon points="0,-28 18,14 -18,14" fill={C.slate3} stroke={C.gold} strokeWidth={2} />
              <text x={0} y={8} textAnchor="middle" fontSize={11} fontWeight={800} fill={C.champagne}>
                Master-Orchestrator
              </text>
              <text x={0} y={-10} textAnchor="middle" fontSize={8} fill={C.muted}>
                CEO · Orchestrierung
              </text>
              <circle cx={0} cy={0} r={60} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.4} />
            </g>

            {latestTraces.slice(0, threadCount).map((trace, i) => {
              const angle = (i / Math.max(threadCount, 1)) * (2 * Math.PI) + 0.3
              const d = 130 + ((i * 37) % 40)
              const x = centerX + d * Math.cos(angle - Math.PI / 2)
              const y = centerY + d * Math.sin(angle - Math.PI / 2)
              const pulseColor = trace.outcome === "SUCCESS" ? C.emerald : C.amber
              const duration = 900 + ((i * 113) % 600)
              const delay = (i * 150) % 1000
              return (
                <g key={trace.id} className="ap-pulse" style={{ animation: `pulse-wave ${duration}ms ease-in-out ${delay / 1000}s infinite`, transformOrigin: `${x}px ${y}px` }}>
                  <circle cx={x} cy={y} r={5} fill={pulseColor} />
                  <title>{`${trace.channelKey ?? "System"} → ${trace.outcome} · Signal ➔ Wirkung`}</title>
                </g>
              )
            })}

            {latestTraces.slice(0, threadCount).map((trace, i) => {
              const angle = (i / Math.max(threadCount, 1)) * (2 * Math.PI) + 0.3
              const d = 130 + ((i * 37) % 40)
              const x = centerX + d * Math.cos(angle - Math.PI / 2)
              const y = centerY + d * Math.sin(angle - Math.PI / 2)
              const duration = 1500 + ((i * 211) % 1000)
              return (
                <g key={`ripple-${trace.id}-${i}`} className="ap-ripple" style={{ animation: `${duration}ms ease-out infinite` }}>
                  <circle cx={x} cy={y} r={12} fill={C.amber} opacity={0.3} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize={8} fill={C.text}>
                    Wirkung
                  </text>
                  <title>{`Impact on ${trace.channelKey ?? "target"} · ${trace.outcome}`}</title>
                </g>
              )
            })}
          </svg>

          {showInfo && (
            <section style={{ ...card, overflowY: "auto", maxHeight: 260 }} aria-label="Fachbereich-Detail">
              <header style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}>
                <strong style={{ color: C.champagne }}>Fachbereich {showInfo.departmentId}</strong>
                <button type="button" style={{ background: "none", border: 0, color: C.gold, cursor: "pointer", fontSize: 10 }} onClick={() => setShowInfo(null)}>
                  ✕
                </button>
              </header>
              <div style={{ padding: 12 }}>
                <p style={{ color: C.text, fontSize: 13 }}>
                  Abteilung {showInfo.departmentId} – Live-Anbindung an Command-Rad
                </p>
                <small style={{ color: C.muted }}>
                  Klicken Sie auf einen Fachbereich im Rad, um Details anzuzeigen. Echte Verbindungs-Traces
                  erscheinen im Comms-Feed rechts.
                </small>
              </div>
            </section>
          )}
        </div>

        <div style={{ width: "min(420px, 100%)", minHeight: 740, display: "flex", flexDirection: "column", gap: 14 }}>
          <section style={{ ...card, display: "grid", gap: 10, overflowY: "auto", maxHeight: 420 }} aria-label="Inter-Agent-Communications-Feed">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}>
              <strong style={{ color: C.champagne }}>Inter-Agent Comms Feed</strong>
              <span style={{ color: C.muted, fontSize: 10 }}>{latestTraces.length} aktiv</span>
            </header>
            <div style={{ display: "grid", gap: 8 }}>
              {latestTraces.slice(0, threadCount * 2).map((trace, i) => {
                const agentNumber = trace.agentKey ? trace.agentKey.replace(/^A/, "") : "—"
                const agentName = trace.agentKey ?? "System"
                const isNew = i % 3 === 0
                const bubbleColor = isNew ? C.gold : C.emerald
                const bg = `rgba(${bubbleColor === C.gold ? "212,175,55" : "16,185,129"}, 0.15)`
                return (
                  <div key={trace.id} style={{
                    ...card,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: 8,
                    borderColor: bubbleColor,
                    background: bg,
                    cursor: "pointer",
                    fontSize: 12,
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: bubbleColor, color: C.slate3, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10 }}>
                      #{agentNumber}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {agentName} → {trace.channelKey}
                      </div>
                      <div style={{ color: C.muted, fontSize: 10 }}>
                        {trace.outcome === "SUCCESS" ? "✓ Erfolgreich" : "⚠ Nicht erfolgreich"} · {trace.eventType ?? "—"}
                      </div>
                    </div>
                    <span style={{ color: bubbleColor, fontWeight: 700, fontSize: 11 }}>
                      {trace.outcome === "SUCCESS" ? "●" : "○"}
                    </span>
                  </div>
                )
              })}
              {latestTraces.length === 0 && (
                <p style={{ color: C.muted, fontSize: 11, padding: 16 }}>
                  Noch keine Live-Datenströme. Signale erscheinen nach tatsächlichen Sidekick-Tool-Aufrufen.
                </p>
              )}
            </div>
          </section>
        </div>

        <ExecutivePulse sentences={executivePulse} />
      </div>

      <style>{`
        @keyframes pulse-wave {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes ap-ripple {
          0% { opacity: 0.5; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.8); }
        }
      `}</style>
    </section>
  )
}
