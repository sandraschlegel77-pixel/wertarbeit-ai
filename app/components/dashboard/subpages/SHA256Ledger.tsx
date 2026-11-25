/**
 * SHA256Ledger — Ebene 3 forensische SHA-256-Hash-Verfolgung.
 */
import { KpiCard, ShellNavigationItem, ShellProps, SingularityShell } from "../../ui/SingularityPrimitives";

interface SHA256LedgerProps {
  hash: string; // SHA-256 hex digest
  status: "pending" | "verified" | "sealed";
  onBack: () => void;
  onInspectorToggle: () => void;
}

export function SHA256Ledger({ hash, status = "pending", onBack, onInspectorToggle }: SHA256LedgerProps) {
  const shellProps: ShellProps = {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(180deg, #E2BE68 0%, #B68A2C 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#141006" }}>{hash.slice(0, 8)}...</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#F7E7CE", textTransform: "uppercase", letterSpacing: 0.5 }}>HASH-SIGEL</div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Verifiziert: {status}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          <KpiCard label="HASH-STATUS" value={status} variant="emerald" />
          <KpiCard label="RETRIEVEN" value="0" variant="gold" />
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
    navItems: [{ id: "ledger", label: "SHA-256 LEDGER", onClick: () => {} }, { id: "trace", label: "Live Traces", onClick: () => {} }],
    breadcrumbItems: [
      { label: "COCKPIT", onClick: () => {} },
      { label: "LEDGER", onClick: () => {} },
    ],
    investmentLevel: "STARTER_299",
    onInvestmentChange: () => {},
    killSwitchActive: false,
    onKillSwitchToggle: () => {},
    commandPaletteOpen: false,
    onCommandPaletteToggle: () => {},
    onCommand: () => {},
    liveTracesCount: 42,
    latencyMs: null,
    modelName: "",
    autoRollbackArmed: false,
    inspectorOpen: true,
    onInspectorToggle: () => {},
  };

  return <SingularityShell {...shellProps} />;
}