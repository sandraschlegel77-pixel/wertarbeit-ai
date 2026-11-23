import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { loadDashboard } from "../services/dashboard-loader.server";
import { handleDashboardAction } from "../services/dashboard-actions.server";
import { DASH_CSS, C, btn, btnGold, card } from "../components/dashboard/theme";
import { HeaderBar } from "../components/dashboard/HeaderBar";
import { CircuitBoard } from "../components/dashboard/CircuitBoard";
import { PriceConfigurator } from "../components/dashboard/PriceConfigurator";
import { AgentList } from "../components/dashboard/AgentList";
import { AuditPanels, TopEarners } from "../components/dashboard/Panels";
import { ApprovalsVault, EvolutionFactory } from "../components/dashboard/Panels2";
import { OverviewExtras } from "../components/dashboard/OverviewExtras";
import { QrModal } from "../components/dashboard/QrModal";
import { ExecutivePulse } from "../components/dashboard/ExecutivePulse";
import { MerchantOnboarding } from "../components/dashboard/MerchantOnboarding";
import { PlatformConnectorsPanel } from "../components/dashboard/PlatformConnectorsPanel";
import { PreparationDesk } from "../components/dashboard/PreparationDesk";
import { AtelierBot } from "../components/dashboard/AtelierBot";
import { RewardVault } from "../components/dashboard/RewardVault";
import { useCoinRain } from "../components/monitor/CoinRain";
import { DEPARTMENTS } from "../services/agent-roster";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  return loadDashboard(session.shop, admin);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const form = await request.formData();
  return handleDashboardAction({ shop: session.shop, admin, form });
};

const TABS = [
  { id: "overview", label: "Firmen-Platine & Baukasten-Rechner" },
  { id: "agents", label: "Alle 26 Abteilungen & 220 Mitarbeiter" },
  { id: "earners", label: "Top-Verdiener & Hintergrund-Armada" },
  { id: "audits", label: "3×-Prüfgremien & Harmonie" },
  { id: "factory", label: "KI-Selbst-Evolution & Agenten-Fabrik" },
  { id: "vault", label: "Freigabe-Warteschlange & Tresor" },
  { id: "platforms", label: "Plattform-Konnektoren" },
  { id: "rewards", label: "Guthaben-, Bonus- & Gratisprodukt-Tresor" },
] as const;

export const shouldRevalidate = ({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) => {
  const withoutTab = (url: URL) => {
    const params = new URLSearchParams(url.search);
    params.delete("tab");
    return params.toString();
  };
  const onlyTabChanged =
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.searchParams.get("tab") !== nextUrl.searchParams.get("tab") &&
    withoutTab(currentUrl) === withoutTab(nextUrl);
  return onlyTabChanged && !formMethod ? false : defaultShouldRevalidate;
};

export default function AppIndex() {
  const d = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab = Math.max(0, TABS.findIndex((entry) => entry.id === requestedTab));
  const changeTab = useCallback((index: number) => {
    const nextTab = TABS[index];
    if (!nextTab) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", nextTab.id);
      return next;
    }, { replace: true, preventScrollReset: true });
  }, [setSearchParams]);
  const [dept, setDept] = useState<number | "all">("all");
  const [qr, setQr] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>(d.activeModules);
  const [scrollToBuilder, setScrollToBuilder] = useState(false);
  const { rain, layer, sound, toggleSound, soundPreferenceMessage } = useCoinRain();

  const roster = d.roster;
  const dynamic = useMemo(() => roster.filter((a) => a.dynamic), [roster]);
  const topInternal = useMemo(() => roster
    .map((agent) => {
      const earned = d.earnings.perAgent[agent.key];
      return {
        agent,
        real: earned?.monthReal ?? 0,
        potential: earned?.monthPotential ?? 0,
      };
    })
    .sort((a, b) => b.real + b.potential - a.real - a.potential)
    .slice(0, 3), [roster, d.earnings]);
  const departmentTasks = useMemo(() => {
    const departmentByAgent = new Map(roster.map((agent) => [agent.key, agent.departmentId]));
    const counts = new Map<number, number>();
    for (const item of d.preparationDesk.items) {
      const departmentId = departmentByAgent.get(item.sourceAgentKey);
      if (departmentId) counts.set(departmentId, (counts.get(departmentId) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [roster, d.preparationDesk.items]);
  const jumpCounts = [
    selectedModules.length,
    roster.length,
    Object.keys(d.earnings.perAgent).length,
    d.audits.length,
    dynamic.length,
    d.approvals.length,
    Number(d.platformConnectors.googleSheetsConfigured) +
      Number(d.platformConnectors.whatsAppConfigured) +
      Object.values(d.platformConnectors.feedUrls).filter(Boolean).length,
    d.rewardVault.items.length,
  ];

  const pickDept = useCallback((id: number) => {
    setDept(id);
    changeTab(1);
  }, [changeTab]);
  const selectModuleFromBoard = useCallback((moduleId: string) => {
    setSelectedModules((current) => current.includes(moduleId) ? current : [...current, moduleId]);
    changeTab(0);
    setScrollToBuilder(true);
  }, [changeTab]);
  const harmonyText = `Harmonie ${d.harmony.harmony} % · Speed ${d.harmony.speed} % · ${d.harmony.pending} offene Freigaben · ${d.harmony.conflicts} aktive Entity-Locks`;

  useEffect(() => {
    if (!scrollToBuilder || tab !== 0) return;
    document.getElementById("price-configurator")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setScrollToBuilder(false);
  }, [scrollToBuilder, tab]);

  if (!d.owner && !d.onboardingComplete) {
    return (
      <s-page heading="AtelierPilot AI · Schnellstart">
        <style>{DASH_CSS}</style>
        <MerchantOnboarding owner={false} inventory={d.inventory} inventoryIsLive={!d.demoInventory} />
      </s-page>
    );
  }

  return (
    <s-page heading="AtelierPilot AI">
      <style>{DASH_CSS}</style>
      {layer}
      <div className="dashboard-content" style={{ display: "grid", gap: 14, background: C.slate, padding: 14, borderRadius: 16 }}>
        <ExecutivePulse sentences={d.executivePulse} />
        <HeaderBar
          isOwner={d.owner}
          dryRun={d.dryRun}
          paused={d.paused}
          harmony={d.harmony}
          army={d.earnings.army}
          extraAgents={d.extraAgents}
          inventory={d.inventory}
          apiKeysMissing={d.apiKeysMissing}
          inventorySource={d.demoInventory ? "DEMO" : "LIVE"}
          snapshotAt={d.snapshotAt}
          databaseHealth={d.databaseHealth}
          serverUptimeSeconds={d.serverUptimeSeconds}
          rules={d.rules}
          onQr={() => setQr(true)}
          onCoinRain={() => rain(22)}
          coinSound={sound}
          onToggleCoinSound={toggleSound}
          soundPreferenceMessage={soundPreferenceMessage}
        />
        <section style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }} aria-label="Kommandozentralen-Übersicht">
          <div style={{ ...card, display: "grid", gap: 6 }}>
            <strong style={{ color: C.champagne }}>Top-Zuordnungen dieses Monats</strong>
            <small style={{ color: C.muted }}>Interne Agentenwerte, getrennt nach Echt und Potenzial</small>
            {topInternal.map(({ agent, real, potential }) => (
              <div key={agent.key} style={{ fontSize: 12 }}>
                <strong>#{agent.number} {agent.name}</strong>
                <div>Echt {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(real)}
                  {" · "}Potenzial {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(potential)}</div>
              </div>
            ))}
            {topInternal.length === 0 && <span style={{ color: C.muted, fontSize: 12 }}>Noch keine Agentenwerte.</span>}
          </div>
          <div style={{ ...card, display: "grid", gap: 6 }}>
            <strong style={{ color: C.champagne }}>Offene Aufgaben nach Abteilung</strong>
            {departmentTasks.slice(0, 4).map(([id, count]) => (
              <button key={id} type="button" style={{ ...btn, textAlign: "left" }} onClick={() => pickDept(id)}>
                Abt. {id} · {DEPARTMENTS.find((department) => department.id === id)?.name} <span style={{ color: C.gold }}>({count})</span>
              </button>
            ))}
            {departmentTasks.length === 0 && <span style={{ color: C.muted, fontSize: 12 }}>Keine offenen Vorbereitungen.</span>}
          </div>
          <div style={{ ...card, display: "grid", gap: 6 }}>
            <strong style={{ color: C.champagne }}>Direkt zu den Bereichen</strong>
            {TABS.map((entry, index) => (
              <button key={entry.id} type="button" style={{ ...btn, textAlign: "left", borderColor: tab === index ? C.champagne : C.gold }} onClick={() => changeTab(index)}>
                {entry.label} <span style={{ color: C.gold }}>· {jumpCounts[index]}</span>
              </button>
            ))}
          </div>
        </section>
        <PreparationDesk {...d.preparationDesk} canPrepareListing roster={roster} />

        {d.owner && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" style={btn} onClick={() => setOnboardingOpen((open) => !open)}>
              {onboardingOpen ? "Neukunden-Wizard schließen" : "Neukunden-Wizard testen"}
            </button>
          </div>
        )}
        {d.owner && onboardingOpen && (
          <MerchantOnboarding owner inventory={d.inventory} inventoryIsLive={!d.demoInventory} onClose={() => setOnboardingOpen(false)} />
        )}

        <CircuitBoard
          dynamicCount={d.extraAgents}
          ownerShop={d.owner}
          onPickDept={pickDept}
          onSelectModule={selectModuleFromBoard}
          executivePulse={d.executivePulse}
        />

        <div role="tablist" aria-label="Kommandozentrale" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === i}
              type="button"
              style={tab === i ? btnGold : btn}
              onClick={() => changeTab(i)}
            >
              {i + 1}. {t.label} · {jumpCounts[i]}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            <PriceConfigurator
              isOwner={d.owner}
              selectedModules={selectedModules}
              onSelectedModulesChange={setSelectedModules}
            />
            <OverviewExtras
              demoInventory={d.demoInventory}
              taxMode={d.taxMode}
              logs={d.recentLogs}
              onboardingDone={!d.apiKeysMissing}
            />
          </div>
        )}
        {tab === 1 && (
          <AgentList
            title="Alle 26 Abteilungen & 220 KI-Mitarbeiter"
            roster={roster}
            earnings={d.earnings}
            audits={d.auditByAgent}
            dept={dept}
            onDept={setDept}
          />
        )}
        {tab === 2 && <TopEarners roster={roster} earnings={d.earnings} />}
        {tab === 3 && <AuditPanels audits={d.audits} harmonyText={harmonyText} />}
        {tab === 4 && <EvolutionFactory evolution={d.evolution} dynamic={dynamic} />}
        {tab === 5 && <ApprovalsVault approvals={d.approvals} vault={d.vault} />}
        {tab === 6 && (
          <PlatformConnectorsPanel
            shop={d.shop}
            feeds={d.platformConnectors.feedUrls}
            googleSheetsConfigured={d.platformConnectors.googleSheetsConfigured}
            whatsAppConfigured={d.platformConnectors.whatsAppConfigured}
            whatsAppOptIns={d.platformConnectors.whatsAppOptIns}
            pendingWorkshopJobs={d.platformConnectors.pendingWorkshopJobs}
            paymentLedgerEntries={d.platformConnectors.paymentLedgerEntries}
            ossOriginCountry={d.platformConnectors.ossOriginCountry}
            dryRun={d.dryRun}
            paused={d.paused}
          />
        )}
        {tab === 7 && <RewardVault {...d.rewardVault} />}
      </div>
      <QrModal open={qr} onClose={() => setQr(false)} monitorPath={d.monitorPath} />
      <AtelierBot
        isOwner={d.owner}
        onApplyRecommendation={(modules) => {
          setSelectedModules(modules);
          changeTab(0);
          setScrollToBuilder(true);
        }}
      />
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
