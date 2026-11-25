/**
 * KillSwitchControl — Funktionierender GLOBAL KILL-SWITCH.
 * Friert bei Klick alle laufenden Worker-Threads ein (SYSTEM HALTED — SAFE MODE)
 * und gibt sie erst nach Bestätigung wieder frei.
 */
import { useState } from "react";
import { C } from "./theme";

export function KillSwitchControl({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (active && !confirming) {
      setConfirming(true);
      return;
    }
    onToggle();
    if (active && confirming) setConfirming(false);
  };

  return (
    <button
      type="button"
      className={active ? "sg-kill-switch aetherion-kill-switch-active" : "sg-kill-switch"}
      onClick={handleClick}
      title={active ? "Kill-Switch deaktivieren & System fortsetzen" : "GLOBALER KILL-SWITCH — Alle Worker einfrieren"}
      style={{
        width: active ? 200 : 150,
        height: 34,
        borderRadius: 10,
        border: `1px solid ${active ? C.red : C.gold}`,
        background: active ? "rgba(239, 68, 68, 0.15)" : "transparent",
        color: active ? "#FCA5A5" : C.champagne,
        fontWeight: 800,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "all 0.2s ease",
      }}
    >
      {active ? (
        confirming ? (
          <>
            <span style={{ color: "#FCA5A5" }}>⚠</span>
            <span>WIRKLICH REAKTIVIEREN?</span>
          </>
        ) : (
          <>
            <span style={{ color: "#FCA5A5" }}>❚❚</span>
            <span>SYSTEM HALTED — SAFE MODE</span>
          </>
        )
      ) : (
        <>
          <span style={{ color: C.gold }}>🛑</span>
          <span>GLOBAL KILL-SWITCH</span>
        </>
      )}
    </button>
  );
}