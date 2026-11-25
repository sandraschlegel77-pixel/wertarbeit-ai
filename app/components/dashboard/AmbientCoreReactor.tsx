/**
 * AmbientCoreReactor — Vollflächiges, interaktives Command-Rad (Luxus-Edition).
 * - Radialer goldener Lichthof
 * - 3D-Maus-Parallaxe
 * - Mausrad-Zoom (+ / - / Reset)
 * - Hover-Zoom auf Abteilungs-Knoten (scale(1.16))
 * - Klick-Drilldown öffnet Inspektor-Detail
 * - Atmender Kern, wandernde Lichtimpulse, Watchdog-Schild
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandWheelCanvas } from "./CommandWheelCanvas";

interface AmbientCoreReactorProps {
  initialTraces: Array<{ channelKey: string; agentKey: string | null; eventType: string; outcome: string }>;
  executivePulse: string[];
  dynamicCount: number;
  ownerShop: boolean;
  roster: any[];
  earnings: any;
  performance: any;
  allowedDepartmentIds: number[];
  onPickDept: (id: number) => void;
  onSelectModule: (moduleId: string) => void;
  onSwitchView: (mode: "command" | "organigramm") => void;
  activeView: "command" | "organigramm";
  killSwitchActive: boolean;
  onKillSwitchToggle: () => void;
}

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

export function AmbientCoreReactor(props: AmbientCoreReactorProps) {
  const {
    initialTraces, executivePulse, dynamicCount, ownerShop, roster, earnings, performance,
    allowedDepartmentIds, onPickDept, onSelectModule, onSwitchView, activeView,
    killSwitchActive, onKillSwitchToggle,
  } = props;

  const [zoom, setZoom] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverDept, setHoverDept] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    },
    []
  );

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);

  useEffect(() => {
    const animate = () => {
      if (containerRef.current) {
        const rx = mousePos.x * 8;
        const ry = mousePos.y * 8;
        containerRef.current.style.transform = `perspective(1200px) rotateX(${-ry}deg) rotateY(${rx}deg) scale(${zoom})`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mousePos, zoom]);

  const deptNames: Record<number, string> = {
    1: "Workflow", 2: "Content", 3: "Code", 4: "Support", 5: "Legal/IP",
    6: "Finance", 7: "Growth", 8: "BI", 9: "Product", 10: "Procurement",
  };

  const deptTasks: Record<number, string> = {
    1: "Strategische Planung & Governance",
    2: "Content-Erstellung & Medien",
    3: "Software-Entwicklung & Qualität",
    4: "Kunden-Support & Erfolg",
    5: "Recht, IP & Compliance",
    6: "Finanzen & Buchhaltung",
    7: "Wachstum & Marketing",
    8: "Business Intelligence & Daten",
    9: "Produktmanagement & Roadmap",
    10: "Einkauf & Beschaffung",
  };

  const deptTrust: Record<number, number> = {
    1: 98, 2: 94, 3: 91, 4: 88, 5: 96, 6: 93, 7: 89, 8: 86, 9: 92, 10: 87,
  };

  const wheelScale = killSwitchActive ? 0.5 : 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      style={{
        width: "100%",
        minHeight: "620px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at center, rgba(212, 175, 55, 0.12) 0%, rgba(11, 14, 20, 0.95) 70%, #0B0E14 100%)`,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.1s ease-out",
      }}
    >
      {killSwitchActive && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            height: 420,
            border: "2px solid #EF4444",
            borderRadius: "50%",
            opacity: 0.6,
            animation: "aetherion-pulse-red 2s infinite",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom +"
          style={{
            width: 32,
            height: 32,
            background: "rgba(16, 22, 33, 0.8)",
            border: "1px solid #D4AF37",
            color: "#D4AF37",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom -"
          style={{
            width: 32,
            height: 32,
            background: "rgba(16, 22, 33, 0.8)",
            border: "1px solid #D4AF37",
            color: "#D4AF37",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          −
        </button>
        <button
          type="button"
          onClick={handleZoomReset}
          title="Reset"
          style={{
            width: 32,
            height: 32,
            background: "rgba(16, 22, 33, 0.8)",
            border: "1px solid #D4AF37",
            color: "#D4AF37",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          Reset
        </button>
      </div>

      <div
        style={{
          transform: `scale(${wheelScale})`,
          transition: "transform 0.3s ease",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CommandWheelCanvas
          initialTraces={initialTraces}
          executivePulse={executivePulse}
          dynamicCount={dynamicCount}
          ownerShop={ownerShop}
          roster={roster}
          earnings={earnings}
          performance={performance}
          allowedDepartmentIds={allowedDepartmentIds}
          onPickDept={(id) => {
            setHoverDept(id);
            onPickDept(id);
          }}
          onSelectModule={onSelectModule}
          onSwitchView={onSwitchView}
          activeView={activeView}
        />
      </div>

      {hoverDept && !killSwitchActive && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(11, 14, 20, 0.95)",
            border: "1px solid #D4AF37",
            borderRadius: 10,
            padding: "12px 18px",
            color: "#F7E7CE",
            fontSize: 12,
            zIndex: 100,
            pointerEvents: "none",
            boxShadow: "0 0 24px rgba(212, 175, 55, 0.18)",
          }}
        >
          <div style={{ color: "#D4AF37", fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>
            Abteilung {hoverDept} · {deptNames[hoverDept]}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
            <span style={{ color: "#F7E7CE" }}><strong>Task:</strong> {deptTasks[hoverDept]}</span>
            <span style={{ color: "#10B981" }}><strong>Trust:</strong> {deptTrust[hoverDept]}%</span>
            <span style={{ color: "#D4AF37" }}><strong>Signal → Wirkung:</strong> Aktiv</span>
          </div>
        </div>
      )}

      {killSwitchActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(6, 9, 15, 0.95)",
            zIndex: 50,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, color: "#EF4444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            SYSTEM HALTED — SAFE MODE
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", maxWidth: 400, lineHeight: 1.5 }}>
            Alle Worker-Threads sind eingefroren. Klicken Sie «GLOBAL KILL-SWITCH» zum Reaktivieren.
          </div>
        </div>
      )}
    </div>
  );
}