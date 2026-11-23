import { useCallback, useEffect, useRef, useState } from "react";

const CSS = `
@keyframes ap-fall { 0% { transform: translateY(-80px); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(105vh); opacity: .9; } }
@keyframes ap-spin { to { transform: rotateY(360deg); } }
.ap-coin-wrap { position: fixed; top: 0; z-index: 60; pointer-events: none; perspective: 500px; animation: ap-fall linear forwards; }
.ap-coin { width: 100%; height: 100%; border-radius: 50%; transform-style: preserve-3d; animation: ap-spin .9s linear infinite;
  background: radial-gradient(circle at 30% 30%, #FFF3B0, #D4AF37 55%, #8A6D1B); border: 2px solid #F7E7CE;
  box-shadow: inset 0 0 6px rgba(0,0,0,.35), 0 2px 8px rgba(212,175,55,.6); display: grid; place-items: center;
  color: #6B4F0E; font-weight: 800; font-family: serif; }
@media (prefers-reduced-motion: reduce) { .ap-coin-wrap { animation-duration: .01s !important; } .ap-coin { animation: none; } }
`;

interface Coin {
  id: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
}

/** Zwei kurze Sinus-Töne = heller „Münzklang“ (Web Audio, keine Audiodatei, 0 €). */
function playCoin(ctx: AudioContext) {
  const now = ctx.currentTime;
  [1318.5, 1760].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.09 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.09);
    osc.stop(now + i * 0.09 + 0.4);
  });
}

/** Hook: Münzregen + Klang. `sound` wird in localStorage gemerkt. */
export function useCoinRain() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [sound, setSound] = useState(true);
  const [soundPreferenceMessage, setSoundPreferenceMessage] = useState("");
  const ctxRef = useRef<AudioContext | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    try {
      setSound(localStorage.getItem("ap_sound") !== "off");
    } catch {
      setSoundPreferenceMessage("Die Ton-Einstellung kann in diesem Browser nicht gespeichert werden.");
    }
  }, []);

  const toggleSound = useCallback(() => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem("ap_sound", next ? "on" : "off");
      setSoundPreferenceMessage("");
    } catch {
      setSoundPreferenceMessage("Die Ton-Einstellung gilt nur bis zum Schließen dieser Seite.");
    }
  }, [sound]);

  const rain = useCallback(
    (count = 18) => {
      const batch: Coin[] = Array.from({ length: count }, () => ({
        id: ++idRef.current,
        left: Math.random() * 94,
        size: 26 + Math.random() * 22,
        dur: 1.6 + Math.random() * 1.6,
        delay: Math.random() * 0.8,
      }));
      setCoins((c) => [...c, ...batch]);
      window.setTimeout(() => setCoins((c) => c.filter((x) => !batch.includes(x))), 4200);

      if (sound) {
        try {
          const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          ctxRef.current ??= new AC();
          void ctxRef.current.resume();
          const ctx = ctxRef.current;
          for (let i = 0; i < 4; i++) window.setTimeout(() => playCoin(ctx), i * 220);
        } catch {
          /* Audio nicht verfügbar */
        }
      }
    },
    [sound]
  );

  const layer = (
    <>
      <style>{CSS}</style>
      {coins.map((c) => (
        <div
          key={c.id}
          className="ap-coin-wrap"
          aria-hidden="true"
          style={{ left: `${c.left}%`, width: c.size, height: c.size, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        >
          <div className="ap-coin">€</div>
        </div>
      ))}
    </>
  );

  return { rain, layer, sound, toggleSound, soundPreferenceMessage };
}
