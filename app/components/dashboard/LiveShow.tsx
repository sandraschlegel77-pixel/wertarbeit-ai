import { useEffect, useRef, useState } from "react";
import { C, btn, btnGold, card } from "./theme";

interface Slide {
  title: string;
  detail: string;
}

export function LiveShow({ slides, snapshotAt }: { slides: Slide[]; snapshotAt: string }) {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [slideIndex, setSlideIndex] = useState(0);
  const endsAt = useRef(0);
  const slide = slides[Math.min(slideIndex, Math.max(0, slides.length - 1))];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      setSlideIndex(Math.min(slides.length - 1, Math.floor((60 - remaining) / 15)));
      if (remaining === 0) setRunning(false);
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, slides.length]);

  function start() {
    endsAt.current = Date.now() + 60_000;
    setSecondsLeft(60);
    setSlideIndex(0);
    setRunning(true);
  }

  return (
    <>
      <button type="button" style={btnGold} onClick={start} disabled={running || slides.length === 0}>
        60-Sekunden-Live-Show starten
      </button>
      {running && slide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="live-show-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(8, 12, 22, .88)",
          }}
        >
          <section style={{ ...card, width: "min(680px, 100%)", display: "grid", gap: 14, borderColor: C.gold }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <span style={{ color: C.muted, fontSize: 12 }}>Status-Snapshot · Stand {snapshotAt.slice(0, 16).replace("T", " ")} UTC</span>
              <span style={{ color: C.gold, fontVariantNumeric: "tabular-nums" }}>{secondsLeft}s</span>
            </div>
            <progress aria-label="Fortschritt der 60-Sekunden-Show" max={60} value={60 - secondsLeft} />
            <div aria-live="polite">
              <h2 id="live-show-title" style={{ color: C.champagne, margin: "4px 0 8px" }}>{slide.title}</h2>
              <p style={{ color: C.text, lineHeight: 1.5 }}>{slide.detail}</p>
            </div>
            <small style={{ color: C.muted }}>Die Show führt durch den letzten geladenen Datenstand; sie streamt keine Live-Änderungen.</small>
            <button type="button" style={btn} onClick={() => setRunning(false)}>Show beenden</button>
          </section>
        </div>
      )}
    </>
  );
}
