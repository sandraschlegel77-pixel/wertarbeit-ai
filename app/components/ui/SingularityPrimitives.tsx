/**
 * Singularity Primitives — wiederverwendbare Bausteine für alle 3 Ebenen des Cockpits.
 * Design: Obsidian (#06090F) & Brushed Gold.
 */
import { useEffect, useRef, useState } from "react";

export const SINGULARITY_COLORS = {
  bg: "#06090F",
  panel: "rgba(16, 22, 33, 0.88)",
  panelStrong: "rgba(11, 14, 20, 0.96)",
  goldStart: "#E2BE68",
  goldEnd: "#B68A2C",
  goldText: "#141006",
  emerald: "#2DD4BF",
  emeraldGlow: "rgba(45, 212, 191, 0.6)",
  goldRing: "#D4AF37",
  champagne: "#F7E7CE",
  text: "#E2E8F0",
  muted: "#94A3B8",
  line: "rgba(212, 175, 55, 0.35)",
} as const;

export const SINGULARITY_GRADIENT_GOLD = "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)";

export type InvestmentLevel = "STARTER_299" | "ENTERPRISE_990" | "APEX_OMEGA_PRIME";

export const INVESTMENT_LEVELS: Record<InvestmentLevel, { label: string; threads: number; price: string }> = {
  STARTER_299: { label: "STARTER (2 Threads)", threads: 2, price: "299,00 €" },
  ENTERPRISE_990: { label: "ENTERPRISE (8 Threads)", threads: 8, price: "990,00 €" },
  APEX_OMEGA_PRIME: { label: "APEX OMEGA PRIME (64 Threads)", threads: 64, price: "APEX OMEGA PRIME" },
};

export const INVESTMENT_ORDER: InvestmentLevel[] = ["STARTER_299", "ENTERPRISE_990", "APEX_OMEGA_PRIME"];

export interface BreadcrumbItem { label: string; onClick?: () => void; }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="sg-breadcrumb" aria-label="Cockpit-Navigation">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span className="sg-breadcrumb-sep">›</span>}
            {item.onClick && !isLast ? (
              <button type="button" onClick={item.onClick} style={{ padding: "2px 8px", fontSize: "10px", textTransform: "none", background: "transparent", color: SINGULARITY_COLORS.goldRing, border: `1px solid ${SINGULARITY_COLORS.goldRing}`, borderRadius: 6, cursor: "pointer" }}>
                {item.label}
              </button>
            ) : (
              <span className="sg-breadcrumb-current">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function LiveDot({ label }: { label?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: SINGULARITY_COLORS.emerald }}>
      <span className="sg-live-dot" />
      {label && <span style={{ fontSize: 11 }}>{label}</span>}
    </span>
  );
}

export function KpiCard({ label, value, variant = "default" }: { label: string; value: string | number; variant?: "default" | "emerald" | "gold" }) {
  return (
    <div className="sg-kpi-card">
      <span className="sg-kpi-label">{label}</span>
      <span className={`sg-kpi-value ${variant}`}>{value}</span>
    </div>
  );
}

export function ScrollablePanel({ children, title, className }: { children: React.ReactNode; title?: string; className?: string }) {
  return (
    <div className={`sg-panel sg-scrollbar ${className ?? ""}`} style={{ overflowY: "auto", maxHeight: "100%" }}>
      {title && <div className="sg-section-header"><span className="sg-section-title">{title}</span></div>}
      <div className="sg-p-4">{children}</div>
    </div>
  );
}

export function CommandPalette({ open, onClose, onCommand }: { open: boolean; onClose: () => void; onCommand: (command: string) => void }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (input.trim()) { onCommand(input.trim()); setInput(""); onClose(); } };
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(6, 9, 15, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="sg-panel-strong" style={{ width: "min(700px, 90vw)", maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="sg-section-header"><span className="sg-section-title">META-KI KOMMANDOZEILE</span><button type="button" style={{ padding: "4px 10px", fontSize: "11px", background: "transparent", color: SINGULARITY_COLORS.goldRing, border: `1px solid ${SINGULARITY_COLORS.goldRing}`, borderRadius: 6, cursor: "pointer", fontWeight: 600 }} onClick={onClose}>ESC · Schließen</button></div>
        <form onSubmit={handleSubmit} className="sg-p-4">
          <label className="sg-label">Cmd + K · Befehl eingeben</label>
          <input ref={inputRef} className="sg-input sg-w-full" autoFocus placeholder="z. B. /status, /kill-all-workers, /audit-all, /reinvest" value={input} onChange={(e) => setInput(e.target.value)} />
          <div className="sg-mt-4 sg-text-muted" style={{ fontSize: 11 }}>Verfügbare Befehle: /status · /kill-all-workers · /audit-all · /reinvest · /scale-up · /scale-down · /reset-ledger</div>
        </form>
      </div>
    </div>
  );
}
export function FixedOverlay({ children, onClose, className, style }: { children: React.ReactNode; onClose: () => void; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(6, 9, 15, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", ...style }} onClick={onClose}>
      <div className="sg-panel-strong" style={{ maxWidth: "95vw", maxHeight: "95vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export interface ShellNavigationItem { id: string; label: string; onClick: () => void; active?: boolean; }

export interface ShellProps {
  children: React.ReactNode;
  navItems: ShellNavigationItem[];
  breadcrumbItems: BreadcrumbItem[];
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

export { SingularityShell } from "./SingularityShell";
export { useTelemetryStream } from "./useTelemetryStream";