import { C } from "./theme";
import { BUILDING_MODULES } from "../../services/pricing";

/** Ebene 0: Inhaber-Brücke. */
export function OwnerBridge({ ownerShop }: { ownerShop: boolean }) {
  return (
    <g>
      <rect x="440" y="18" width="320" height="52" rx="10" fill="url(#apGold)" />
      <text x="600" y="40" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.slate}>INHABER (Ebene 0)</text>
      <text x="600" y="58" textAnchor="middle" fontSize="11" fill={C.slate}>
        {ownerShop ? "wertarbeitmanufaktur · OWNER UNLIMITED 0,00 €" : "OwnerRule · DRY_RUN_MODE"}
      </text>
    </g>
  );
}

/** Ebene -0.5: unabhängige Meta-Aufsicht zwischen Inhaber und Vorstand. */
export function MetaSupervisorChip() {
  return (
    <g>
      <rect x="410" y="82" width="380" height="45" rx="9" fill="url(#apGold)" stroke={C.champagne} strokeWidth="2" />
      <text x="600" y="101" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.slate}>#000 SOVEREIGN META-SUPERVISOR</text>
      <text x="600" y="117" textAnchor="middle" fontSize="10" fill={C.slate}>OpenRouter Free oder lokale Regeln · OwnerRule & DRY_RUN geschützt</text>
    </g>
  );
}

const BOARD_LABELS = ["KI-CEO", "KI-CFO & CRO", "KI-COO & CCO", "AI Evolution", "General Counsel"];

/** Ebene 1: KI-Vorstand #158–#161 und #171. */
export function BoardChips() {
  return (
    <>
      {[158, 159, 160, 161, 171].map((n, i) => (
        <g key={n}>
          <rect x={250 + i * 180} y="140" width="160" height="58" rx="8" fill={C.slate3} stroke={C.gold} />
          <text x={330 + i * 180} y="165" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.champagne}>#{n}</text>
          <text x={330 + i * 180} y="183" textAnchor="middle" fontSize="10.5" fill={C.text}>{BOARD_LABELS[i]}</text>
        </g>
      ))}
    </>
  );
}

/** Ebene 2: 5 Bereichs-Direktoren #153–#157. */
export function DirectorChips() {
  return (
    <>
      {[153, 154, 155, 156, 157].map((n, i) => (
        <g key={n}>
          <rect x={36 + i * 232} y="255" width="160" height="40" rx="8" fill={C.slate3} stroke={C.emerald} />
          <text x={116 + i * 232} y="272" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.emerald}>Direktor #{n}</text>
          <text x={116 + i * 232} y="287" textAnchor="middle" fontSize="10" fill={C.muted}>4 Abteilungen</text>
        </g>
      ))}
    </>
  );
}

/** Goldener Core-Prozessor (Rückseite mit Goldkontakten) + Modul-Pins. */
export function CoreProcessor() {
  return (
    <g>
      <rect x="470" y="600" width="260" height="84" rx="10" fill="url(#apGold)" stroke={C.champagne} strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i}>
          <rect x={482 + i * 21} y="592" width="8" height="8" fill={C.gold} />
          <rect x={482 + i * 21} y="684" width="8" height="8" fill={C.gold} />
        </g>
      ))}
      <text x="600" y="635" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.slate}>AtelierPilot AI Core – 0,00 €</text>
      <text x="600" y="656" textAnchor="middle" fontSize="11" fill={C.slate}>232 Rollenprofile · 26 Abteilungen · 66 Tandems</text>
      <text x="600" y="672" textAnchor="middle" fontSize="10" fill={C.slate}>
        Modul-Pins: {BUILDING_MODULES.map((m) => m.id.toUpperCase()).join(" · ")}
      </text>
    </g>
  );
}

/** Expansions-Sektor für neue dynamische Agenten ab #401. */
export function ExpansionSector({ count }: { count: number }) {
  return (
    <g>
      <rect x="860" y="600" width="300" height="84" rx="10" fill={C.slate2} stroke={C.gold} strokeDasharray="6 4" />
      <text x="1010" y="632" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.gold}>Expansions-Sektor #401 → ∞</text>
      <text x="1010" y="653" textAnchor="middle" fontSize="11" fill={C.text}>{count} dynamische KI-Mitarbeiter</text>
      <text x="1010" y="670" textAnchor="middle" fontSize="10" fill={C.muted}>Kandidaten nach Prüfung und Freigabe</text>
    </g>
  );
}
