import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

const QUICK = [
  "Wie ist mein Umsatz heute?",
  "Gibt es Rechts- oder Datenschutz-Risiken?",
  "Welche neuen Nischen gibt es?",
  "Tagesbriefing bitte",
];

interface Rec {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const btn: React.CSSProperties = {
  background: "transparent",
  color: "#F7E7CE",
  border: "1px solid #D4AF37",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  textAlign: "left",
};

/** Sprachbefehl (Web Speech API) + Schnellbefehle an den KI-Vorstand. */
export function VoiceCommand() {
  const f = useFetcher<{ ok?: boolean; message?: string }>();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<Rec | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = "de-DE";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const said = e.results[0]?.[0]?.transcript ?? "";
      setText(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
  }, []);

  const send = (command: string) => {
    if (!command.trim()) return;
    f.submit({ type: "command", text: command }, { method: "post" });
    setText("");
  };

  const toggleMic = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      return;
    }
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: 10 }} aria-label="Befehle an den KI-Vorstand">
      <h2 style={{ margin: 0, fontSize: 16, color: "#F7E7CE" }}>Befehl an den KI-Vorstand</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Befehl tippen oder sprechen…"
          aria-label="Befehl"
          style={{ flex: 1, background: "#0F172A", color: "#E2E8F0", border: "1px solid #2B3A55", borderRadius: 10, padding: 10, fontSize: 15 }}
        />
        <button
          type="button"
          onClick={toggleMic}
          disabled={!supported}
          aria-pressed={listening}
          aria-label={listening ? "Aufnahme beenden" : "Sprachbefehl starten"}
          style={{ ...btn, background: listening ? "#D4AF37" : "transparent", color: listening ? "#0F172A" : "#F7E7CE" }}
        >
          🎤
        </button>
        <button type="button" onClick={() => send(text)} style={{ ...btn, background: "#D4AF37", color: "#0F172A", fontWeight: 700 }}>
          Senden
        </button>
      </div>
      {!supported && <small style={{ color: "#F59E0B" }}>Dieser Browser unterstützt keine Spracheingabe – bitte tippen.</small>}
      <div style={{ display: "grid", gap: 6 }}>
        {QUICK.map((q) => (
          <button key={q} type="button" style={btn} onClick={() => send(q)} disabled={f.state !== "idle"}>
            {q}
          </button>
        ))}
      </div>
      {f.state !== "idle" && <small style={{ color: "#94A3B8" }}>Wird ausgeführt…</small>}
      {f.data?.message && <small style={{ color: f.data.ok ? "#10B981" : "#F59E0B" }}>{f.data.message}</small>}
    </section>
  );
}
