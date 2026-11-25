import type { CSSProperties } from "react";

export const C = {
  slate: "#0B0E14",
  slate2: "#1A2234",
  slate3: "#111622",
  line: "rgba(212, 175, 55, 0.35)",
  gold: "#D4AF37",
  champagne: "#F7E7CE",
  emerald: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  text: "#E2E8F0",
  muted: "#94A3B8",
} as const;

export const card: CSSProperties = {
  background: `linear-gradient(160deg, ${C.slate2} 0%, ${C.slate3} 100%)`,
  border: `1px solid ${C.gold}`,
  boxShadow: "0 0 24px rgba(212, 175, 55, 0.12)",
  borderRadius: 14,
  padding: 16,
  color: "#F8FAFC",
};

export const btn: CSSProperties = {
  background: "transparent",
  color: C.champagne,
  border: `1px solid ${C.gold}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 13,
  cursor: "pointer",
};

export const btnGold: CSSProperties = {
  ...btn,
  background: `linear-gradient(135deg, ${C.gold}, #B8942B)`,
  color: C.slate,
  fontWeight: 700,
  border: "none",
};

export const input: CSSProperties = {
  background: C.slate,
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 13,
};

export const badge = (color: string): CSSProperties => ({
  display: "inline-block",
  border: `1px solid ${color}`,
  color,
  borderRadius: 999,
  padding: "2px 10px",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
});

export const grid = (min: number): CSSProperties => ({
  display: "grid",
  gap: 14,
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
});

export const eur = (n: number): string =>
  `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;

export const DASH_CSS = `
@keyframes ap-flow { to { stroke-dashoffset: -24; } }
@keyframes ap-glow { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
.ap-trace { stroke-dasharray: 8 6; animation: ap-flow 1.6s linear infinite; }
.ap-pulse { animation: ap-glow 2.4s ease-in-out infinite; }
.ap-hit { cursor: pointer; }
.ap-hit:hover { filter: brightness(1.25); }
@media (prefers-reduced-motion: reduce) { .ap-trace, .ap-pulse { animation: none; } }
`;
