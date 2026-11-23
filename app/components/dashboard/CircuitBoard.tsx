import { useState } from "react";
import { C } from "./theme";
import { DEPARTMENTS } from "../../services/agent-roster";
import { BoardChips, CoreProcessor, DirectorChips, ExpansionSector, MetaSupervisorChip, OwnerBridge } from "./CircuitParts";

interface Props {
  dynamicCount: number;
  ownerShop: boolean;
  onPickDept: (id: number) => void;
  onSelectModule: (moduleId: string) => void;
  executivePulse: string[];
}

const W = 1440;
const H = 790;
const DEPT_MODULES: Record<number, string[]> = {
  1: ["m1"],
  2: ["m1"],
  3: ["m1"],
  4: ["m1"],
  5: ["m5"],
  6: ["m1"],
  7: ["m4"],
  9: ["m2"],
  11: ["m6"],
  12: ["m2"],
  13: ["m2"],
  14: ["m3"],
  15: ["m3"],
  17: ["m3", "m5"],
  18: ["m3"],
  19: ["m2"],
  20: ["m6"],
  21: ["m2"],
  22: ["m2"],
  23: ["m5"],
  25: ["m4"],
  26: ["m5", "m6"],
};

/** Position der 26 Abteilungs-Chips: Abt. 1–20 in Gruppen, Abt. 21–26 als Gremien- und Armadareihe. */
function deptPos(id: number): { x: number; y: number } {
  if (id <= 20) {
    const g = Math.floor((id - 1) / 4);
    const k = (id - 1) % 4;
    return { x: 70 + g * 232 + (k % 2) * 100, y: 330 + Math.floor(k / 2) * 62 };
  }
  return { x: 30 + (id - 21) * 235, y: 520 };
}

/** Interaktive Dark-Slate- & Champagner-Gold-Platine der gesamten Firma. */
export function CircuitBoard({ dynamicCount, ownerShop, onPickDept, onSelectModule, executivePulse }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [compact, setCompact] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedInfo, setSelectedInfo] = useState<{
    title: string;
    description: string;
    x: number;
    y: number;
    modules: string[];
  } | null>(null);

  return (
    <section style={{ ...cardStyle, position: "relative" }} aria-label="Firmen-Platine">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <strong style={{ color: C.champagne }}>Interaktive Firmen-Platine</strong>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button type="button" style={controlStyle} onClick={() => setCompact((value) => !value)}>
            {compact ? "Zoom-/Scroll-Ansicht" : "Kompaktansicht"}
          </button>
          <button type="button" style={controlStyle} disabled={compact || zoom <= 0.7} onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} aria-label="Platine verkleinern">−</button>
          <span style={{ color: C.muted, fontSize: 12 }}>{compact ? "kompakt" : `${Math.round(zoom * 100)} %`}</span>
          <button type="button" style={controlStyle} disabled={compact || zoom >= 1.5} onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} aria-label="Platine vergrößern">+</button>
        </div>
      </div>
      <div style={{ position: "relative", overflow: "auto", maxHeight: compact ? "62vh" : "76vh", borderRadius: 14 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label="Firmen-Platine: Inhaber, Meta-Supervisor, fünf Vorstände, Direktoren, 26 Abteilungen und Expansions-Sektor ab Nummer 221"
          style={{ width: compact ? "100%" : `${W * zoom}px`, height: "auto", display: "block", borderRadius: 14 }}
        >
          <defs>
            <linearGradient id="apGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F3D77A" />
              <stop offset="1" stopColor={C.gold} />
            </linearGradient>
            <pattern id="apGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="#1B2740" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill={C.slate} />
          <rect width={W} height={H} fill="url(#apGrid)" />

          <g fill="none" strokeWidth="2.2" strokeLinecap="round">
            <path className="ap-trace" stroke={C.gold} d="M600 70 V82 M600 127 V132" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} className="ap-trace" stroke={C.gold} d={`M600 132 H${330 + i * 180} V140`} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} className="ap-trace" stroke={C.emerald} d={`M600 200 V225 H${116 + i * 232} V255`} />
            ))}
            {DEPARTMENTS.filter((d) => d.id <= 20).map((d) => {
              const p = deptPos(d.id);
              const gx = 116 + Math.floor((d.id - 1) / 4) * 232;
              return <path key={d.id} className="ap-trace" stroke={C.emerald} opacity="0.7" d={`M${gx} 295 V${p.y} H${p.x + 46}`} />;
            })}
            {DEPARTMENTS.filter((d) => d.id > 20).map(({ id }) => {
              const p = deptPos(id);
              return <path key={id} className="ap-trace" stroke={C.gold} opacity="0.6" d={`M600 225 V490 H${p.x + 110} V${p.y}`} />;
            })}
            <path className="ap-trace" stroke={C.gold} d="M730 642 H860" />
            <path className="ap-trace" stroke={C.emerald} d="M600 592 V572" />
          </g>

          <OwnerBridge ownerShop={ownerShop} />
          <MetaSupervisorChip />
          <BoardChips />
          <DirectorChips />

          {DEPARTMENTS.map((d) => {
            const p = deptPos(d.id);
            const gold = d.kind === "armada" || d.kind === "panel" || d.kind === "harmony";
            const wide = d.id > 20;
            const label = d.name.length > 20 ? `${d.name.slice(0, 19)}…` : d.name;
            const cx = p.x + (wide ? 110 : 46);
            const infoX = p.x + (wide ? 205 : 78);
            const modules = DEPT_MODULES[d.id] ?? [];
            return (
              <g
                key={d.id}
                className="ap-hit"
                role="button"
                tabIndex={0}
                aria-label={`Abteilung ${d.id}: ${d.name}. Öffnet die Mitarbeiterliste.`}
                onClick={() => onPickDept(d.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onPickDept(d.id);
                  }
                }}
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`Abt. ${d.id}: ${d.name} – ${d.mechanism}`}</title>
                <rect x={p.x} y={p.y} width={wide ? 220 : 92} height="52" rx="6" fill={C.slate2} stroke={hover === d.id ? C.champagne : gold ? C.gold : C.emerald} />
                <text x={cx} y={p.y + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill={gold ? C.gold : C.emerald}>Abt. {d.id}</text>
                <text x={cx} y={p.y + 36} textAnchor="middle" fontSize={wide ? 10 : 8} fill={C.text}>{label}</text>
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Info zu Abteilung ${d.id}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedInfo({ title: `Abt. ${d.id} · ${d.name}`, description: d.mechanism, x: cx, y: p.y, modules });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedInfo({ title: `Abt. ${d.id} · ${d.name}`, description: d.mechanism, x: cx, y: p.y, modules });
                    }
                  }}
                >
                  <circle cx={infoX} cy={p.y + 11} r="7" fill={C.gold} />
                  <text x={infoX} y={p.y + 14} textAnchor="middle" fontSize="9" fontWeight="800" fill={C.slate}>i</text>
                </g>
              </g>
            );
          })}

          <CoreProcessor />
          <ExpansionSector count={dynamicCount} />
          <rect x="36" y="704" width="1368" height="76" rx="8" fill={C.slate2} stroke={C.gold} />
          <text x="54" y="722" fontSize="10" fontWeight="700" fill={C.gold}>#000 INHABER-PUL</text>
          {executivePulse.slice(0, 3).map((sentence, index) => (
            <text key={index} x="54" y={740 + index * 13} fontSize="9" fill={C.text}>{sentence}</text>
          ))}
        </svg>
        {selectedInfo && (
          <aside
            role="dialog"
            aria-label={selectedInfo.title}
            style={{
              position: "absolute",
              left: selectedInfo.x > W / 2 ? "auto" : 10,
              right: selectedInfo.x > W / 2 ? 10 : "auto",
              top: selectedInfo.y > H * 0.72 ? "auto" : `${Math.max(2, (selectedInfo.y / H) * 100)}%`,
              bottom: selectedInfo.y > H * 0.72 ? 10 : "auto",
              width: "min(300px, calc(100% - 20px))",
              padding: 12,
              border: `1px solid ${C.gold}`,
              borderRadius: 10,
              background: C.slate2,
              color: C.text,
              boxShadow: "0 10px 28px rgba(0,0,0,.4)",
              zIndex: 2,
            }}
          >
            <button type="button" style={{ float: "right", color: C.gold, background: "transparent", border: 0, cursor: "pointer" }} onClick={() => setSelectedInfo(null)} aria-label="Info schließen">×</button>
            <strong style={{ color: C.champagne }}>{selectedInfo.title}</strong>
            <p style={{ margin: "6px 0", fontSize: 12, color: C.muted }}>{selectedInfo.description}</p>
            {selectedInfo.modules.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedInfo.modules.map((moduleId) => (
                  <button key={moduleId} type="button" style={controlStyle} onClick={() => onSelectModule(moduleId)}>
                    Modul {moduleId.toUpperCase()} im Baukasten wählen
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}

const cardStyle = { background: C.slate, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12 };
const controlStyle = { background: "transparent", color: C.champagne, border: `1px solid ${C.gold}`, borderRadius: 8, padding: "5px 9px", fontSize: 12, cursor: "pointer" };
