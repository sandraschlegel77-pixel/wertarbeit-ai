import { ShellNavigationItem, ShellProps } from "../../ui/SingularityPrimitives";
import { SingularityShell } from "../../ui/SingularityShell";

interface InspectorTabsProps {
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

export function InspectorTabs(props: InspectorTabsProps) {
  const shellProps: ShellProps = {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#F7E7CE" }}>INSPECTOR (4 Tabs)</div>
      </div>
    ),
    navItems: [] as ShellNavigationItem[],
    breadcrumbItems: [{ label: "COCKPIT", onClick: props.onBack }, { label: "INSPECTOR" }],
    investmentLevel: props.investmentLevel as any,
    onInvestmentChange: props.onInvestmentChange,
    killSwitchActive: props.killSwitchActive,
    onKillSwitchToggle: props.onKillSwitchToggle,
    commandPaletteOpen: props.commandPaletteOpen,
    onCommandPaletteToggle: props.onCommandPaletteToggle,
    onCommand: props.onCommand,
    liveTracesCount: props.liveTracesCount,
    latencyMs: props.latencyMs,
    modelName: props.modelName,
    autoRollbackArmed: props.autoRollbackArmed,
    inspectorOpen: props.inspectorOpen,
    onInspectorToggle: props.onInspectorToggle,
  };
  return <SingularityShell {...shellProps} />;
}