import { useState, type ReactNode } from "react";
import { C } from "./theme";

/** Klickbares "i"-Symbol mit Detail-Popover (Funktion, Ersparnis, Preis). */
export function InfoPop({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        aria-label={`Info: ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `1px solid ${C.gold}`,
          background: open ? C.gold : "transparent",
          color: open ? C.slate : C.gold,
          fontSize: 12,
          fontWeight: 700,
          fontStyle: "italic",
          cursor: "pointer",
          lineHeight: "18px",
          padding: 0,
        }}
      >
        i
      </button>
      {open && (
        <span
          role="dialog"
          style={{
            position: "absolute",
            zIndex: 20,
            top: 26,
            left: 0,
            width: 280,
            background: C.slate3,
            border: `1px solid ${C.gold}`,
            borderRadius: 10,
            padding: 12,
            color: C.text,
            fontSize: 12,
            lineHeight: 1.5,
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
            textAlign: "left",
          }}
        >
          <strong style={{ color: C.champagne, display: "block", marginBottom: 4 }}>{title}</strong>
          {children}
        </span>
      )}
    </span>
  );
}
