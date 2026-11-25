/**
 * SwarmDebate — Ebene 3 forensischer Swarm-Debatte-Stream (Meta-KI vs. CEO).
 */
import { ShellNavigationItem, ShellProps, SingularityShell } from "../../ui/SingularityPrimitives";

interface SwarmDebateProps {
  onBack: () => void;
  investmentLevel: any;
  onInvestmentChange: () => void;
  killSwitchActive: boolean;
  onKillSwitchToggle: () => void;
  commandPaletteOpen: boolean;
  onCommandPaletteToggle: () => void;
  onCommand: () => void;
  liveTracesCount: number;
  latencyMs: number | null;
  modelName: string;
  autoRollbackArmed: boolean;
  inspectorOpen: boolean;
  onInspectorToggle: () => void;
}

const SWARM_DEBATE_MESSAGES: { speaker: "Meta-KI" | "CEO" | "Constitution"; text: string; stance: "pro" | "con" | "neutral"; }[] = [
  { speaker: "Meta-KI", text: "Empfehlung: Skalierung auf 8 Threads freigeben, Vorherige Schwellenwerte wurden übertroffen.", stance: "pro" },
  { speaker: "CEO", text: "Veto. Keine Freigabe ohne Kosten-Transparenz. ROI wird geprüft.", stance: "con" },
  { speaker: "Constitution", text: "Konfliktregel: Kosten-Nutzen-Analyse erforderlich vor Skalierung.", stance: "neutral" },
  { speaker: "Meta-KI", text: "Neuer Vorschlag: Kostenbasierte Skalierung mit Break-Even nach 30 Tagen.", stance: "pro" },
  { speaker: "CEO", text: "Bedingt genehmigt, unter Vorbehalt des monatlichen Budgets.", stance: "pro" },
];

export function SwarmDebate(props: SwarmDebateProps) {
  const { onBack, investmentLevel, onInvestmentChange, killSwitchActive, onKillSwitchToggle, commandPaletteOpen, onCommandPaletteToggle, onCommand, liveTracesCount, latencyMs, modelName, autoRollbackArmed, inspectorOpen, onInspectorToggle } = props;

  const shellProps: ShellProps = {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#141006" }}>SW</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#F7E7CE", textTransform: "uppercase", letterSpacing: 0.5 }}>LIVE-SWARM DEBATTE</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Konstitutionaler Diskurs zwischen Agenten, CEO und Meta-KI</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {SWARM_DEBATE_MESSAGES.map((msg, i) => (
            <div key={i} style={{ background: "rgba(16, 22, 33, 0.6)", border: `1px solid ${msg.stance === "pro" ? "#2DD4BF" : msg.stance === "con" ? "#EF4444" : "#D4AF37"}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: msg.stance === "pro" ? "#2DD4BF" : msg.stance === "con" ? "#EF4444" : "#D4AF37" }}>{msg.speaker}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{i + 1}</div>
              </div>
              <div style={{ fontSize: 10, color: "#F7E7CE", marginTop: 4 }}>{msg.text}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => onBack()}>
            HISTORIE ANSEEN
          </button>
          <button type="button" onClick={() => onInspectorToggle()}>
            INSPEKTION
          </button>
        </div>
      </div>
    ),
    navItems: [] as ShellNavigationItem[],
    breadcrumbItems: [
      { label: "COCKPIT", onClick: onBack },
      { label: "SWARM DEBATE" },
    ],
    investmentLevel: investmentLevel as any,
    onInvestmentChange,
    killSwitchActive,
    onKillSwitchToggle,
    commandPaletteOpen,
    onCommandPaletteToggle,
    onCommand,
    liveTracesCount,
    latencyMs,
    modelName,
    autoRollbackArmed,
    inspectorOpen,
    onInspectorToggle,
  };

  return <SingularityShell {...shellProps} />;
}