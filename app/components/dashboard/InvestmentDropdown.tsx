/**
 * InvestmentDropdown — Öffnet ein Auswahl-Menü zum Umschalten zwischen
 * Autopilot (299 € / 2 Threads), Enterprise (990 € / 8 Threads) und
 * Apex Sovereign (3.500 €+ / 64 Threads). Ändert sofort Thread-Zahl & Impuls-Geschwindigkeit.
 */
import { useState } from "react";
import { C } from "./theme";

const LEVELS: Array<{
  id: string;
  label: string;
  price: string;
  threads: number;
  pulse: string;
}> = [
  { id: "STARTER_299", label: "Autopilot", price: "299 €", threads: 2, pulse: "lento" },
  { id: "ENTERPRISE_990", label: "Enterprise", price: "990 €", threads: 8, pulse: "moderato" },
  { id: "APEX_OMEGA_PRIME", label: "Apex Sovereign", price: "3.500 €+", threads: 64, pulse: "presto" },
];

interface InvestmentDropdownProps {
  currentId: string;
  onChange: (nextId: string) => void;
}

export function InvestmentDropdown({ currentId, onChange }: InvestmentDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = LEVELS.find((l) => l.id === currentId) ?? LEVELS[2];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: SINGULARITY_GRADIENT_GOLD,
          color: C.slate,
          padding: "8px 14px",
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
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{current.label}</span>
        <span style={{ fontSize: 9, opacity: 0.8 }}>{current.threads} Threads</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(11, 14, 20, 0.98)",
            border: `1px solid ${C.gold}`,
            borderRadius: 10,
            boxShadow: "0 0 32px rgba(212, 175, 55, 0.25)",
            zIndex: 1000,
            marginTop: 6,
            overflow: "hidden",
          }}
        >
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => {
                onChange(lvl.id);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: lvl.id === currentId ? "rgba(212, 175, 55, 0.15)" : "transparent",
                border: "none",
                borderBottom: lvl.id !== LEVELS[LEVELS.length - 1].id ? `1px solid ${C.line}` : "none",
                color: lvl.id === currentId ? C.champagne : C.muted,
                fontWeight: lvl.id === currentId ? 800 : 600,
                fontSize: 11,
                textAlign: "left",
                cursor: "pointer",
                pointerEvents: "auto",
                zIndex: 30,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: C.gold }}>{lvl.label}</div>
                <div style={{ fontSize: 9, color: C.muted }}>{lvl.price} · {lvl.threads} Threads · Impuls: {lvl.pulse}</div>
              </div>
              {lvl.id === currentId && <span style={{ color: C.emerald }}>● AKTIV</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SINGULARITY_GRADIENT_GOLD = "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)";