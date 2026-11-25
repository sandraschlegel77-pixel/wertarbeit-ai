/**
 * VoiceControl — Sprachsteuerung-Schaltfläche mit visueller Aktivitätsanzeige.
 */
import { useState } from "react";
import { C } from "./theme";

export function VoiceControl({
  active,
  onToggle,
}: {
  active?: boolean;
  onToggle: () => void;
}) {
  const [listening, setListening] = useState(active ?? false);

  return (
    <button
      type="button"
      onClick={() => {
        setListening(!listening);
        onToggle();
      }}
      title="VOICE-CONTROL — Sprachsteuerung ein-/ausschalten"
      style={{
        width: 44,
        height: 34,
        borderRadius: 10,
        border: `1px solid ${listening ? C.emerald : C.gold}`,
        background: listening ? "rgba(16, 185, 129, 0.15)" : "transparent",
        color: listening ? C.emerald : C.champagne,
        fontWeight: 800,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "all 0.2s ease",
        animation: listening ? "aetherion-breathe 2s ease-in-out infinite" : "none",
      }}
    >
      {listening ? (
        <>
          <span style={{ color: C.emerald, fontSize: 12 }}>MIC</span>
          <span>SPACHE</span>
        </>
      ) : (
        <>
          <span style={{ color: C.gold, fontSize: 12 }}>MIC</span>
          <span>VOICE</span>
        </>
      )}
    </button>
  );
}