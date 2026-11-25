/**
 * ShowreelModal — Interaktives Obsidian-Gold-Modal mit Tabs.
 */
import { useState, useRef, useEffect } from "react";
import { C } from "./theme";

const TABS = [
  { id: "tour", label: "15s LIVE-TOUR" },
  { id: "scanner", label: "60s DOMAIN-SCANNER" },
  { id: "chameleon", label: "BRANCHEN-CHAMÄLEON" },
  { id: "pricing", label: "4-STUFEN-PRICING" },
  { id: "cert", label: "DSGVO / EU-AI-ACT" },
] as const;

const PRICING_TIERS = [
  { name: "Autopilot", price: "299 €", threads: 2, features: ["2 Threads", "Basis-Automatisierung", "Community-Support", "DSGVO-ready"] },
  { name: "Enterprise", price: "990 €", threads: 8, features: ["8 Threads", "Prioritäts-Support", "Custom Integrations", "SLA 99,9 %"] },
  { name: "Apex Sovereign", price: "3.500 €+", threads: 64, features: ["64 Threads", "Dedicated Infrastructure", "White-Glove Onboarding", "Custom Compliance"] },
  { name: "Sovereign Enterprise OS", price: "25.000 €+", threads: "Unbegrenzt", features: ["Unbegrenzte Threads", "Sovereign Data Centers", "Full Source Access", "Government-Grade"] },
];

const CHAMELEON_INDUSTRIES = [
  { name: "E-Commerce", icon: "🛍", desc: "Produkttexte, SEO, Preise, Retouren, Loyalty" },
  { name: "Kanzlei", icon: "⚖", desc: "Mandanten-Kommunikation, Fristen, Akten, Compliance" },
  { name: "Agentur", icon: "🎨", desc: "Kampagnen, Content-Planung, Reporting, Pitches" },
  { name: "Mittelstand", icon: "🏭", desc: "Produktion, Vertrieb, After-Sales, Wartung" },
];

export function ShowreelModal({ open, onClose, onStartTour }: { open: boolean; onClose: () => void; onStartTour: () => void }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("tour");
  const [scanProgress, setScanProgress] = useState(0);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeTab === "scanner" && scanProgress === 0) {
      scanTimerRef.current = window.setInterval(() => {
        setScanProgress((p) => (p >= 100 ? 100 : p + 2));
      }, 1200);
    }
    return () => { if (scanTimerRef.current) window.clearInterval(scanTimerRef.current); };
  }, [activeTab, scanProgress]);

  const handleStartTour = () => { onClose(); onStartTour(); };
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(6, 9, 15, 0.92)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "rgba(11, 14, 20, 0.98)", border: `1px solid ${C.gold}`, borderRadius: 16, width: "min(900px, 94vw)", maxHeight: "88vh", overflow: "auto", color: C.champagne, boxShadow: "0 0 64px rgba(212, 175, 55, 0.3)", display: "flex", flexDirection: "column", pointerEvents: "auto", zIndex: 40 }}
      >
        {/* Header Tabs */}
        <div style={{ display: "flex", background: "rgba(16, 22, 33, 0.8)", borderBottom: `1px solid ${C.gold}`, overflowX: "auto" }}>
          {TABS.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{ padding: "10px 16px", background: activeTab === tab.id ? "rgba(212, 175, 55, 0.18)" : "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${C.gold}` : "none", color: activeTab === tab.id ? C.gold : C.muted, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, cursor: "pointer", pointerEvents: "auto", zIndex: 30, whiteSpace: "nowrap" }}>{tab.label}</button>
          ))}
        </div>

        {/* Content */}
          {activeTab === "tour" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "center", maxWidth: 560 }}>
                <div style={{ fontWeight: 800, color: C.gold, fontSize: 18, marginBottom: 8 }}>15s LIVE-TOUR DURCH DAS COMMAND-RAD</div>
                <div style={{ color: C.champagne, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                  Starte eine automatische Kamera-Fokus-Tour: Innerer Kern → 10 Abteilungen → AgentComms-Bubbles → Bottom-Cards → TIME-TRAVEL-DEBUGGER.
                  Die Tour dauert exakt 15 Sekunden und hebt alle interaktiven Elemente visuell hervor.
                </div>
              </div>
              <button type="button" onClick={handleStartTour} style={{ background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)", color: C.slate, padding: "14px 32px", borderRadius: 12, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, border: "none", cursor: "pointer", pointerEvents: "auto", zIndex: 30, boxShadow: "0 0 24px rgba(212, 175, 55, 0.18)" }}>🎬 TOUR STARTEN (15s)</button>
              <div style={{ color: C.muted, fontSize: 10, textAlign: "center" }}>Tipp: Die Tour kann jederzeit durch Klick ins Rad unterbrochen werden.</div>
            </div>
          )}
        <div style={{ padding: 24, overflow: "auto", flex: 1 }}>
          {activeTab === "scanner" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontWeight: 800, color: C.emerald, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>60s DOMAIN-SCANNER</div>
              <div style={{ color: C.champagne, fontSize: 13, lineHeight: 1.6 }}>Sofortige Verfügbarkeitsprüfung Ihrer Wunsch-Domain mit TLD-Vorschlägen, Whois-Check und Brand-Protection-Status.</div>
              <div style={{ background: "rgba(6, 9, 15, 0.6)", border: `1px solid ${C.emerald}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: C.emerald }}>{scanProgress} %</div>
                <div style={{ height: 8, background: "rgba(0,0,0,0.3)", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
                  <div style={{ width: `${scanProgress}%`, height: "100%", background: "linear-gradient(90deg, #2DD4BF 0%, #D4AF37 100%)", borderRadius: 4, transition: "width 0.3s ease" }} />
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: C.champagne }}>{scanProgress < 100 ? `Scanning TLDs… (${scanProgress} %)` : "✅ Scan abgeschlossen — 12 TLDs verfügbar, 3 registriert, 7 frei"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {[".com", ".de", ".ai", ".io", ".app", ".tech", ".shop", ".agency", ".law", ".studio"].map((tld) => (
                  <div key={tld} style={{ padding: "8px 12px", background: "rgba(16, 22, 33, 0.6)", border: `1px solid ${C.line}`, borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
                    <div style={{ color: C.gold }}>{tld}</div>
                    <div style={{ color: C.emerald, fontSize: 10 }}>FREI</div>
                  </div>
                ))}
              </div>
            </div>
          )}
{activeTab === "chameleon" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontWeight: 800, color: C.gold, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>BRANCHEN-CHAMÄLEON — AUTOMATISCHE ANPASSUNG</div>
              <div style={{ color: C.champagne, fontSize: 13, lineHeight: 1.6 }}>Das System erkennt Ihre Branche und konfiguriert Agenten, Templates, Compliance-Regeln & Workflows vollautomatisch.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {CHAMELEON_INDUSTRIES.map((ind) => (
                  <div key={ind.name} style={{ background: "rgba(16, 22, 33, 0.8)", border: `1px solid ${C.gold}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 28 }}>{ind.icon}</div>
                    <div style={{ fontWeight: 800, color: C.gold, fontSize: 13, textTransform: "uppercase" }}>{ind.name}</div>
                    <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{ind.desc}</div>
                    <button type="button" style={{ marginTop: "auto", background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, padding: "6px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", cursor: "pointer", pointerEvents: "auto", zIndex: 30 }}>KONFIGURIEREN</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        {activeTab === "pricing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontWeight: 800, color: C.gold, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>4-STUFEN-PRICING — 299 € – 25.000 €+</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {PRICING_TIERS.map((tier) => (
                  <div key={tier.name} style={{ background: "rgba(16, 22, 33, 0.8)", border: `1px solid ${C.gold}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontWeight: 800, color: C.gold, fontSize: 14, textTransform: "uppercase" }}>{tier.name}</div>
                    <div style={{ fontWeight: 800, color: C.champagne, fontSize: 24 }}>{tier.price}</div>
                    <div style={{ color: C.emerald, fontWeight: 700, fontSize: 12 }}>{tier.threads} Threads</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      {tier.features.map((f) => (
                        <div key={f} style={{ color: C.champagne, fontSize: 11, display: "flex", gap: 6, alignItems: "center" }}><span style={{ color: C.emerald }}>✓</span> {f}</div>
                      ))}
                    </div>
                    <button type="button" style={{ marginTop: "auto", background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)", color: C.slate, border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", cursor: "pointer", pointerEvents: "auto", zIndex: 30 }}>AUSWÄHLEN</button>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(45, 212, 191, 0.1)", border: `1px solid ${C.emerald}`, borderRadius: 12, padding: 14, fontSize: 11, color: C.champagne, textAlign: "center" }}><strong style={{ color: C.emerald }}>0,00 € Open-Source Core</strong> — Keine Backend-Logik überschrieben. Enterprise-Features auf Anfrage.</div>
            </div>
          )}
{activeTab === "cert" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontWeight: 800, color: C.emerald, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>DSGVO- & EU-AI-ACT-ZERTIFIKAT</div>
              <div style={{ color: C.champagne, fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>Vollständige Konformitätsdokumentation für den produktiven Einsatz in der EU.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "rgba(16, 22, 33, 0.8)", border: `1px solid ${C.emerald}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontWeight: 800, color: C.emerald, fontSize: 12, textTransform: "uppercase" }}>DSGVO (Art. 25, 32)</div>
                  <div style={{ color: C.champagne, fontSize: 11, lineHeight: 1.5 }}>
                    <div>✅ Privacy by Design / by Default</div>
                    <div>✅ Verschlüsselung at Rest & in Transit (AES-256 / TLS 1.3)</div>
                    <div>✅ Keine personenbezogenen Daten an Dritte</div>
                    <div>✅ Datenlöschung auf Knopfdruck</div>
                    <div>✅ Auftragsverarbeitungsvertrag (AVV) verfügbar</div>
                  </div>
                </div>
                <div style={{ background: "rgba(16, 22, 33, 0.8)", border: `1px solid ${C.gold}`, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontWeight: 800, color: C.gold, fontSize: 12, textTransform: "uppercase" }}>EU AI ACT (Risikoklasse)</div>
                  <div style={{ color: C.champagne, fontSize: 11, lineHeight: 1.5 }}>
                    <div>✅ Kein High-Risk AI (keine biometrische ID, kein Scoring)</div>
                    <div>✅ Transparenzpflicht erfüllt (Art. 50)</div>
                    <div>✅ Menschliche Aufsicht (Human-in-the-Loop)</div>
                    <div>✅ Risikomanagement-System dokumentiert</div>
                    <div>✅ Konformitätserklärung & CE-Kennzeichnung</div>
                  </div>
                </div>
              </div>
              <div style={{ background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)", color: C.slate, borderRadius: 12, padding: 14, textAlign: "center", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Zertifikat herunterladen (PDF) · Gültig bis 2027-12-31</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.line}`, background: "rgba(16, 22, 33, 0.5)", borderRadius: "0 0 16px 16px", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.gold}`, color: C.gold, padding: "8px 18px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", pointerEvents: "auto", zIndex: 30 }}>Schließen</button>
        </div>
      </div>
    </div>
  );
}