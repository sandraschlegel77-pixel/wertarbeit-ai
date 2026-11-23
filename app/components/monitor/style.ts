import type { CSSProperties } from "react";

export const eur = (n: number): string =>
  `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;

export const wrap: CSSProperties = {
  minHeight: "100vh",
  background: "#0F172A",
  color: "#E2E8F0",
  fontFamily: "system-ui, sans-serif",
  padding: "16px 14px calc(24px + env(safe-area-inset-bottom))",
  maxWidth: 560,
  margin: "0 auto",
  display: "grid",
  gap: 16,
  alignContent: "start",
};

export const card: CSSProperties = {
  background: "#162033",
  border: "1px solid #2B3A55",
  borderRadius: 14,
  padding: 14,
};

export const btn: CSSProperties = {
  background: "transparent",
  color: "#F7E7CE",
  border: "1px solid #D4AF37",
  borderRadius: 10,
  padding: "9px 14px",
  fontSize: 14,
};

export const btnGold: CSSProperties = {
  ...btn,
  background: "#D4AF37",
  color: "#0F172A",
  fontWeight: 700,
};
