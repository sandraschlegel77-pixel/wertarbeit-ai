import { useState } from "react";
import type { CSSProperties } from "react";
import { BUILDING_MODULES, calcQuote, formatEur } from "../../services/pricing";
import { C, btn, btnGold } from "./theme";

type ShopType = "jewelry" | "engraving" | "commerce" | "b2b";
type TimeSink = "content" | "finance" | "channels" | "service";
type Strategy = "core" | "team" | "all";

interface Answers {
  shopType: ShopType | null;
  timeSink: TimeSink | null;
  strategy: Strategy | null;
}

interface ModuleFocus {
  departments: string;
  agents: string;
}

interface Recommendation {
  moduleIds: string[];
  teamSize: 3 | 6 | null;
  reason: string;
  weeklyHours: number;
}

const SHOP_TYPES: { id: ShopType; label: string }[] = [
  { id: "jewelry", label: "Schmuck/Handwerk & Unikate" },
  { id: "engraving", label: "Personalisierte Gravuren/Geschenke" },
  { id: "commerce", label: "E-Commerce & Handel" },
  { id: "b2b", label: "B2B & Großhandel" },
];

const TIME_SINKS: { id: TimeSink; label: string }[] = [
  { id: "content", label: "Fotos, Texte & SEO" },
  { id: "finance", label: "ZUGFeRD, DATEV, Steuern & Recht" },
  { id: "channels", label: "eBay, Etsy, Kaufland & Kleinanzeigen" },
  { id: "service", label: "Kundenmails, Retouren & Bewertungen" },
];

const STRATEGIES: { id: Strategy; label: string; detail: string }[] = [
  { id: "core", label: "0,00 € Core-Start", detail: "Nur die kostenlose Basis" },
  {
    id: "team",
    label: "Gezieltes 3er-/6er-Spezialisten-Team",
    detail: "Der Bot wählt den Umfang passend zu Shop-Typ und Zeitfresser",
  },
  { id: "all", label: "All-in-One Komplett-Unternehmen", detail: "Alle sechs Module" },
];

const MODULE_FOCUS: Record<string, ModuleFocus> = {
  m1: {
    departments: "2 Auto-Listing & Katalog · 3 Studio-Medien · 6 Texte, SEO & UCP",
    agents: "#1–#9 · #16–#18",
  },
  m2: {
    departments: "12 Rechnungen · 13 Versand/Zoll/Verpackung · 21 Recht · 22 Finanzen",
    agents: "#34–#38 · #162–#176",
  },
  m3: {
    departments: "14 Kundenservice · 15 E-Mail/Concierge · 17 Upsell · 18 Warenkorb/Bewertungen",
    agents: "#39–#55",
  },
  m4: {
    departments: "7 Multichannel-Sync · 25 Plattform- & API-Armada",
    agents: "#19–#21 · #186–#206",
  },
  m5: {
    departments: "5 Unikate/Ringgrößen · 23 Meisterwerkstatt · 26 Werkstattvorbereitung",
    agents: "#13–#15 · #177–#180 · #210–#212 · #217",
  },
  m6: {
    departments: "11 Nischen/Trends · 20 Markt/Preise · 26 Eventvorbereitung",
    agents: "#31–#33 · #62–#66 · #208 · #219",
  },
};

const PAIN_PRIORITY: Record<TimeSink, string[]> = {
  content: ["m1", "m6"],
  finance: ["m2", "m5"],
  channels: ["m4", "m1"],
  service: ["m3", "m5"],
};

const SHOP_PRIORITY: Record<ShopType, string[]> = {
  jewelry: ["m5", "m1", "m2"],
  engraving: ["m5", "m3", "m1"],
  commerce: ["m4", "m1", "m3"],
  b2b: ["m2", "m3", "m4"],
};

function makeRecommendation(answers: Answers): Recommendation | null {
  const { shopType, timeSink, strategy } = answers;
  if (!shopType || !timeSink || !strategy) return null;

  let moduleIds: string[] = [];
  let teamSize: Recommendation["teamSize"] = null;
  let reason = "";

  if (strategy === "team") {
    const isBroadShop = shopType === "commerce" || shopType === "b2b";
    const isCrossFunctionalNeed = timeSink === "finance" || timeSink === "channels";
    teamSize = isBroadShop && isCrossFunctionalNeed ? 6 : 3;
    const rankedModules = [
      ...PAIN_PRIORITY[timeSink],
      ...SHOP_PRIORITY[shopType],
      ...BUILDING_MODULES.map((module) => module.id),
    ];
    moduleIds = [...new Set(rankedModules)].slice(0, teamSize);
    reason = teamSize === 6
      ? "Die Kombination aus breitem Geschäftsmodell und kanal- oder finanzübergreifendem Engpass spricht für ein vollständiges Team."
      : "Ein fokussiertes Dreier-Team deckt den größten Engpass und die wichtigsten Aufgaben Ihres Shop-Typs ab.";
  } else if (strategy === "all") {
    moduleIds = BUILDING_MODULES.map((module) => module.id);
    reason = "Alle sechs Module bilden das vollständige All-in-One-Team.";
  } else {
    reason = "Der Core bleibt kostenlos. Für nicht ausgewählte Module wird keine zusätzliche Zeitersparnis angesetzt.";
  }

  const selected = BUILDING_MODULES.filter((module) => moduleIds.includes(module.id));
  const monthlyHours = selected.reduce((total, module) => total + module.estimatedHoursPerMonth, 0);
  const weeklyHours = Math.round((monthlyHours / 4.33) * 10) / 10;

  return { moduleIds, teamSize, reason, weeklyHours };
}

const shellStyle: CSSProperties = {
  width: 380,
  maxWidth: "calc(100vw - 28px)",
  maxHeight: "calc(100vh - 110px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  color: C.text,
  background: `linear-gradient(160deg, ${C.slate2}, ${C.slate})`,
  border: `1px solid ${C.gold}`,
  borderRadius: 16,
  boxShadow: "0 16px 48px rgba(0,0,0,.42)",
};

const BOT_LAYOUT_CSS = `
.atelierbot-anchor {
  position: fixed;
  right: calc(env(safe-area-inset-right, 0px) + 14px);
  bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
  z-index: 1100;
}
.atelierbot-panel { position: fixed; right: inherit; bottom: inherit; }
@media (min-width: 1200px) {
  .dashboard-content { margin-right: 400px; }
}
@media (max-width: 1199px) {
  .dashboard-content { margin-right: 0; }
  .atelierbot-anchor {
    position: relative;
    right: auto;
    bottom: auto;
    z-index: 1;
    display: flex;
    justify-content: flex-end;
    margin: 8px 14px 14px;
  }
  .atelierbot-panel {
    position: relative !important;
    right: auto !important;
    bottom: auto !important;
    max-height: calc(100vh - 40px) !important;
  }
}
`;

const optionStyle: CSSProperties = {
  ...btn,
  width: "100%",
  textAlign: "left",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
};

function BotMark() {
  return (
    <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4v4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="3" r="2" fill={C.champagne} />
      <rect x="5" y="9" width="22" height="17" rx="6" fill={C.slate3} stroke={C.gold} />
      <circle cx="12" cy="16" r="2" fill={C.champagne} />
      <circle cx="20" cy="16" r="2" fill={C.champagne} />
      <path d="M12 21h8" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OptionButton({
  label,
  detail,
  onClick,
}: {
  label: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" style={optionStyle} onClick={onClick}>
      <span style={{ display: "grid", gap: 3 }}>
        <strong>{label}</strong>
        {detail && <span style={{ color: C.muted, fontSize: 12 }}>{detail}</span>}
      </span>
      <span aria-hidden="true" style={{ color: C.gold }}>›</span>
    </button>
  );
}

export function AtelierBot({
  isOwner,
  onApplyRecommendation,
}: {
  isOwner: boolean;
  onApplyRecommendation: (modules: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ shopType: null, timeSink: null, strategy: null });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [applied, setApplied] = useState(false);

  const chooseShopType = (shopType: ShopType) => {
    setAnswers((current) => ({ ...current, shopType }));
    setStep(1);
  };
  const chooseTimeSink = (timeSink: TimeSink) => {
    setAnswers((current) => ({ ...current, timeSink }));
    setStep(2);
  };
  const chooseStrategy = (strategy: Strategy) => {
    const nextAnswers = { ...answers, strategy };
    setAnswers(nextAnswers);
    setRecommendation(makeRecommendation(nextAnswers));
    setApplied(false);
    setStep(3);
  };
  const restart = () => {
    setAnswers({ shopType: null, timeSink: null, strategy: null });
    setRecommendation(null);
    setApplied(false);
    setStep(0);
  };

  const selected = BUILDING_MODULES.filter((module) =>
    recommendation?.moduleIds.includes(module.id)
  );
  const quote = calcQuote(recommendation?.moduleIds ?? [], false, isOwner);

  return (
    <>
    <style>{BOT_LAYOUT_CSS}</style>
    <div className="atelierbot-anchor" style={{ zIndex: open ? 1100 : 1099 }}>
      {open ? (
        <section id="atelierbot-panel" className="atelierbot-panel" role="dialog" aria-label="AtelierBot – Dein Baukasten-Assistent" style={shellStyle}>
          <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.line}` }}>
            <BotMark />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: "block", color: C.champagne }}>AtelierBot</strong>
              <span style={{ color: C.muted, fontSize: 12 }}>Dein regelbasierter Baukasten-Assistent</span>
            </div>
            <button type="button" style={btn} aria-label="AtelierBot einklappen" onClick={() => setOpen(false)}>
              −
            </button>
          </header>

          <div style={{ overflowY: "auto", padding: 14, display: "grid", gap: 12 }}>
            {step < 3 ? (
              <>
                <div style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>FRAGE {step + 1} VON 3</div>
                {step > 0 && (
                  <div style={{ color: C.muted, fontSize: 12, display: "grid", gap: 3 }}>
                    <span>Shop: {SHOP_TYPES.find((option) => option.id === answers.shopType)?.label}</span>
                    {step > 1 && <span>Zeitfresser: {TIME_SINKS.find((option) => option.id === answers.timeSink)?.label}</span>}
                  </div>
                )}
                <h3 style={{ margin: 0, color: C.champagne, fontSize: 17 }}>
                  {step === 0 && "Welcher Shop-Typ passt am besten?"}
                  {step === 1 && "Was kostet Sie aktuell am meisten Zeit?"}
                  {step === 2 && "Wie möchten Sie starten?"}
                </h3>
                <div style={{ display: "grid", gap: 8 }}>
                  {step === 0 && SHOP_TYPES.map((option) => (
                    <OptionButton key={option.id} label={option.label} onClick={() => chooseShopType(option.id)} />
                  ))}
                  {step === 1 && TIME_SINKS.map((option) => (
                    <OptionButton key={option.id} label={option.label} onClick={() => chooseTimeSink(option.id)} />
                  ))}
                  {step === 2 && STRATEGIES.map((option) => (
                    <OptionButton
                      key={option.id}
                      label={option.label}
                      detail={option.detail}
                      onClick={() => chooseStrategy(option.id)}
                    />
                  ))}
                </div>
                {step > 0 && (
                  <button type="button" style={{ ...btn, justifySelf: "start" }} onClick={() => setStep(step - 1)}>
                    Zurück
                  </button>
                )}
              </>
            ) : recommendation ? (
              <>
                <div style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>DEINE EMPFEHLUNG</div>
                <h3 style={{ margin: 0, color: C.champagne, fontSize: 17 }}>
                  {recommendation.teamSize
                    ? `${recommendation.teamSize}er-Spezialisten-Team`
                    : answers.strategy === "all"
                      ? "All-in-One Komplett-Unternehmen"
                      : "Core-Start"}
                </h3>
                <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{recommendation.reason}</p>
                <div style={{ padding: 11, border: `1px solid ${C.line}`, borderRadius: 10, display: "grid", gap: 5 }}>
                  <strong style={{ color: C.champagne }}>
                    {isOwner ? "OWNER UNLIMITED – 0,00 €" : `${formatEur(quote.monthly)} / Monat`}
                  </strong>
                  {quote.discountPercent > 0 && (
                    <span style={{ color: C.emerald, fontSize: 12 }}>Bündelrabatt {quote.discountPercent} % bereits berücksichtigt</span>
                  )}
                  {quote.allInOne && !isOwner && (
                    <span style={{ color: C.emerald, fontSize: 12 }}>All-in-One-Preis für alle sechs Module</span>
                  )}
                  {selected.length > 0 ? (
                    <span style={{ color: C.text, fontSize: 13 }}>
                      Grobe Schätzung: ca. {recommendation.weeklyHours.toFixed(1).replace(".", ",")} Std./Woche
                    </span>
                  ) : (
                    <span style={{ color: C.text, fontSize: 13 }}>
                      Für den Core allein wird keine zusätzliche Zeitersparnis angesetzt.
                    </span>
                  )}
                </div>
                {selected.length > 0 ? (
                  <div style={{ display: "grid", gap: 7 }}>
                    <strong style={{ color: C.champagne, fontSize: 13 }}>Passende Abteilungen & Mitarbeiter</strong>
                    {selected.map((module) => {
                      const focus = MODULE_FOCUS[module.id];
                      return (
                        <div key={module.id} style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 9, display: "grid", gap: 2 }}>
                          <strong style={{ fontSize: 12 }}>{module.short}</strong>
                          <span style={{ color: C.muted, fontSize: 11 }}>{focus.departments}</span>
                          <span style={{ color: C.champagne, fontSize: 11 }}>{focus.agents}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: C.muted, fontSize: 12 }}>Core: kostenlose Basis ohne ausgewählte Zusatzmodule.</div>
                )}
                <div style={{ color: C.muted, fontSize: 11 }}>
                  Zeitwerte sind grobe Planungs-Schätzungen aus den Modulangaben, keine gemessene oder garantierte Ersparnis.
                </div>
                <button
                  type="button"
                  style={btnGold}
                  onClick={() => {
                    onApplyRecommendation(recommendation.moduleIds);
                    setApplied(true);
                  }}
                >
                  Empfehlung direkt in den Baukasten übernehmen
                </button>
                {applied && (
                  <div role="status" style={{ color: C.emerald, fontSize: 12 }}>
                    Übernommen. Es wurde noch kein Modul aktiviert und nichts abgerechnet.
                  </div>
                )}
                <button type="button" style={{ ...btn, justifySelf: "start" }} onClick={restart}>
                  Neu beraten lassen
                </button>
              </>
            ) : null}
          </div>
        </section>
      ) : (
        <button
          type="button"
          aria-label="AtelierBot öffnen"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          style={{ ...btnGold, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 999, boxShadow: "0 8px 26px rgba(0,0,0,.35)" }}
        >
          <BotMark />
          <span>AtelierBot</span>
        </button>
      )}
    </div>
    </>
  );
}
