/**
 * MCP-Tools-Übersicht — zeigt alle MCP-Server mit Status, Latenz und Last.
 */
import { KpiCard, ShellNavigationItem, ShellProps, SingularityShell } from "../../ui/SingularityPrimitives";

interface McpsToolsPageProps {
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

const MCP_TOOLS: { id: string; name: string; domain: string; status: "online" | "offline"; latency: number }[] = [
  { id: "mcp-notion", name: "Notion MCP", domain: "Wissensdatenbank", status: "online", latency: 42 },
  { id: "mcp-slack", name: "Slack MCP", domain: "Kommunikation", status: "online", latency: 38 },
  { id: "mcp-github", name: "GitHub MCP", domain: "Code-Repository", status: "online", latency: 55 },
  { id: "mcp-sql", name: "PostgreSQL MCP", domain: "Primera DB", status: "online", latency: 29 },
  { id: "mcp-shopify", name: "Shopify MCP", domain: "E-Commerce API", status: "online", latency: 67 },
  { id: "mcp-ollama", name: "Ollama MCP", domain: "LLM-Inferenz", status: "online", latency: 140 },
];

export function McpsToolsPage(props: McpsToolsPageProps) {
  const { onBack, investmentLevel, onInvestmentChange, killSwitchActive, onKillSwitchToggle, commandPaletteOpen, onCommandPaletteToggle, onCommand, liveTracesCount, latencyMs, modelName, autoRollbackArmed, inspectorOpen, onInspectorToggle } = props;

  const onlineCount = MCP_TOOLS.filter((t) => t.status === "online").length;
  const avgLatency = Math.round(MCP_TOOLS.reduce((sum, t) => sum + t.latency, 0) / MCP_TOOLS.length);

  const shellProps: ShellProps = {
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#F7E7CE", textTransform: "uppercase", letterSpacing: 0.5 }}>MCP TOOLS</div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Meta-Context-Protokoll · Live-Status</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <KpiCard label="AKTIVE MCP-SERVER" value={onlineCount} variant="emerald" />
          <KpiCard label="Ø LATENZ (ms)" value={avgLatency} variant="gold" />
          <KpiCard label="TRACES (LIVE)" value={liveTracesCount} variant="gold" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {MCP_TOOLS.map((tool) => (
            <div
              key={tool.id}
              style={{
                background: "rgba(16, 22, 33, 0.6)",
                border: `1px solid ${tool.status === "online" ? "#2DD4BF" : "#EF4444"}`,
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#F7E7CE" }}>{tool.name}</div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: tool.status === "online" ? "#2DD4BF" : "#EF4444" }} />
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4 }}>{tool.domain}</div>
              <div style={{ fontSize: 11, color: "#D4AF37", fontWeight: 600 }}>
                Latenz: {tool.latency} ms
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    navItems: [
      { id: "mcp-tools", label: "MCP TOOLS", onClick: onBack, active: true },
      { id: "mcp-status", label: "STATUS", onClick: () => {} },
    ] as ShellNavigationItem[],
    breadcrumbItems: [
      { label: "COCKPIT", onClick: onBack },
      { label: "MCP TOOLS" },
    ],
    investmentLevel: investmentLevel as any,
    onInvestmentChange,
    killSwitchActive,
    onKillSwitchToggle,
    commandPaletteOpen,
    onCommandPaletteToggle,
    onCommand: () => {},
    liveTracesCount,
    latencyMs,
    modelName,
    autoRollbackArmed,
    inspectorOpen,
    onInspectorToggle,
  };

  return <SingularityShell {...shellProps} />;
}