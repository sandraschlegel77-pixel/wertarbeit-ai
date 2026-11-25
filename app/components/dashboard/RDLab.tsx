/**
 * RDLab — R&D Nischen- & Beta-Labor für Sektor 5.
 * Automatische „Neu erfunden — Verkaufsargument für Ihre Branche“-Karten
 * und Auto-Snapshot-Schutz.
 */
import { useState } from "react";
import { C } from "./theme";

const NICHE_CARDS = [
  { title: "KI-gestützte Schmuck-Beratung", tag: "Nische · Schmuck", value: "+34 % Conversion" },
  { title: "Automatisierte Gravur-Vorschau", tag: "Beta · Gravur", value: "⚡ Echtzeit-Render" },
  { title: "Dynamische Preis-Optimierung", tag: "Nische · E-Commerce", value: "+22 % Marge" },
  { title: "Blockchain-Echtheitszertifikat", tag: "Beta · Sicherheit", value: "DSGVO-konform" },
] as const;

export function RDLab({
  ownerShop,
  onApplySnapshot,
}: {
  ownerShop?: boolean;
  onApplySnapshot?: () => void;
}) {
  const [snapshots, setSnapshots] = useState<number>(0);

  return (
    <div style={{ padding: 16, color: C.champagne }}>
      <div
        style={{
          fontWeight: 800,
          color: C.emerald,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
          borderBottom: `1px solid ${C.line}`,
          paddingBottom: 8,
        }}
      >
        R&D NICHEN- & BETA-LABOR · SEKTOR 5
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        {NICHE_CARDS.map((card) => (
          <div
            key={card.title}
            style={{
              background: "linear-gradient(135deg, rgba(16, 22, 33, 0.9) 0%, rgba(26, 34, 52, 0.9) 100%)",
              border: `1px solid ${C.emerald}`,
              borderRadius: 12,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.4 }}>{card.tag}</div>
            <div style={{ fontWeight: 700, color: C.champagne, fontSize: 13 }}>{card.title}</div>
            <div style={{ color: C.emerald, fontWeight: 800, fontSize: 11 }}>{card.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(16, 185, 129, 0.1)", border: `1px solid ${C.emerald}`, borderRadius: 10, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.emerald, boxShadow: `0 0 6px ${C.emerald}` }} />
        <div style={{ fontSize: 11, color: C.champagne }}>
          <strong>Auto-Snapshot-Schutz aktiv</strong>
          <br />
          {snapshots} automatische Snapshots gesichert
        </div>
        <button
          type="button"
          onClick={() => {
            setSnapshots((s) => s + 1);
            onApplySnapshot?.();
          }}
          style={{
            background: C.emerald,
            color: C.slate,
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          SNAPSHOT
        </button>
      </div>
    </div>
  );
}