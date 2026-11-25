import { useEffect, useRef, useState } from "react";
import { C, btn, btnGold, card } from "./theme";

export function ExecutivePulse({ sentences }: { sentences: string[] }) {
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function toggleBriefing() {
    if (!("speechSynthesis" in window)) {
      setMessage("Sprachausgabe wird von diesem Browser nicht unterstützt.");
      return;
    }
    if (speaking) {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current = null;
      }
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setMessage("Audio-Briefing gestoppt.");
      return;
    }
    const text = sentences.slice(0, 3).join(" ").trim().slice(0, 420);
    if (!text) {
      setMessage("Für das Audio-Briefing liegen keine Statussätze vor.");
      return;
    }
    setMessage("Lokale Browser-Sprachausgabe; Länge und Stimme hängen vom Gerät ab.");
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.lang = "de-DE";
    utterance.rate = 0.95;
    utterance.onend = () => {
      utteranceRef.current = null;
      setSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setSpeaking(false);
      setMessage("Die Browser-Sprachausgabe konnte nicht gestartet werden.");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <section style={{ ...card, borderColor: C.gold, display: "grid", gap: 6 }} aria-label="Inhaber-Puls">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <strong style={{ color: C.champagne }}>#000 · 30-Sekunden-Morgen-Briefing</strong>
        <button type="button" style={speaking ? btn : btnGold} onClick={toggleBriefing} aria-pressed={speaking}>
          {speaking ? "Audio stoppen · #232" : "Audio abspielen · #232"}
        </button>
      </div>
      <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.5 }}>
        {sentences.slice(0, 3).map((sentence) => <li key={sentence}>{sentence}</li>)}
      </ol>
      {message && <small role="status" style={{ color: C.muted }}>{message}</small>}
    </section>
  );
}
