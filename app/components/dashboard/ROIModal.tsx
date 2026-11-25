/**
 * ROIModal — Detaillierte ROI- & Ersparnis-Bilanz-Karte.
 * Öffnet bei Klick auf "LIVE ROI & QUALITÄT".
 */
import { useState } from "react";
import { C } from "./theme";

const ROI_STATS = [
  { label: "Eingesparte Stunden / Monat", value: "186 h", icon: "⏱" },
  { label: "Euro-Gegenwert / Monat", value: "12.840 €", icon: "💰" },
  { label: "Qualitäts-Score", value: "99,8 %", icon: "★" },
  { label: "Aktive Agenten", value: "24 / 32", icon: "⚡" },
  { label: "Automation-Rate", value: "94,2 %", icon: "⚙" },
  { label: "Kostenersparnis / Jahr", value: "154.080 €", icon: "📈" },
];

const ROI_DETAILS = [
  { dept: "Content", hours: 42, euro: 2.940, quality: "99,9 %" },
  { dept: "Support", hours: 38, euro: 2.660, quality: "99,7 %" },
  { dept: "Code", hours: 36, euro: 2.520, quality: "99,8 %" },
  { dept: "Finance", hours: 28, euro: 1.960, quality: "99,9 %" },
  { dept: "Legal/IP", hours: 24, euro: 1.680, quality: "99,6 %" },
  { dept: "Growth", hours: 18, euro: 1.080, quality: "99,8 %" },
];

export function ROIModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(6, 9, 15, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(11, 14, 20, 0.98)",
          border: `1px solid ${C.gold}`,
          borderRadius: 16,
          width: "min(820px, 92vw)",
          maxHeight: "85vh",
          overflow: "auto",
          padding: 24,
          color: C.champagne,
          boxShadow: "0 0 48px rgba(212, 175, 55, 0.25)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          pointerEvents: "auto",
          zIndex: 40,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, color: C.gold, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
            LIVE ROI &amp; QUALITÄT — BILANZ
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${C.gold}`,
              color: C.gold,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              pointerEvents: "auto",
              zIndex: 40,
            }}
          >
            Schließen
          </button>
        </div>

        {/* Top Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {ROI_STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(16, 22, 33, 0.8)",
                border: `1px solid ${C.gold}`,
                borderRadius: 12,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 20, color: C.gold, fontWeight: 800, letterSpacing: 0.3 }}>
                {s.icon} {s.value}
              </div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Detail Table */}
        <div
          style={{
            background: "rgba(6, 9, 15, 0.6)",
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 800, color: C.emerald, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Detail-Aufschlüsselung nach Abteilung
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ROI_DETAILS.map((d) => (
              <div
                key={d.dept}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "rgba(16, 22, 33, 0.6)",
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                }}
              >
                <span style={{ fontWeight: 700, color: C.champagne, fontSize: 12 }}>{d.dept}</span>
                <span style={{ color: C.muted, fontSize: 11, marginLeft: "auto" }}>{d.hours} h</span>
                <span style={{ color: C.gold, fontSize: 11, marginLeft: 16 }}>{d.euro.toLocaleString("de-DE")} €</span>
                <span style={{ color: C.emerald, fontSize: 11, marginLeft: 16 }}>{d.quality}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            background: SINGULARITY_GRADIENT_GOLD,
            color: C.slate,
            borderRadius: 12,
            padding: 14,
            textAlign: "center",
            fontWeight: 800,
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            boxShadow: "0 0 24px rgba(212, 175, 55, 0.18)",
          }}
        >
          Gesamtersparnis: 154.080 € / Jahr bei 99,8 % Qualität
        </div>
      </div>
    </div>
  );
}

const SINGULARITY_GRADIENT_GOLD = "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)";