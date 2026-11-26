import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { startTelemetryEngine } from "../services/real-telemetry-engine.server";
import type { InvestmentLevel } from "../components/ui/SingularityPrimitives";
import { loadDashboard } from "../services/dashboard-loader.server";
import { handleDashboardAction } from "../services/dashboard-actions.server";
import { DASH_CSS, C, badge, btn, btnGold, card, eur } from "../components/dashboard/theme";
import { HeaderBar, OwnerRulesPanel } from "../components/dashboard/HeaderBar";
import { PriceConfigurator } from "../components/dashboard/PriceConfigurator";
import { AgentList } from "../components/dashboard/AgentList";
import { AuditPanels, TopEarners } from "../components/dashboard/Panels";
import { ApprovalsVault, BrandCustomizer, EvolutionFactory, VaultDownloads } from "../components/dashboard/Panels2";
import { JudicialWorkspace } from "../components/dashboard/JudicialWorkspace";
import { OverviewExtras } from "../components/dashboard/OverviewExtras";
import { QrModal } from "../components/dashboard/QrModal";
import { ExecutivePulse } from "../components/dashboard/ExecutivePulse";
import { MerchantOnboarding } from "../components/dashboard/MerchantOnboarding";
import { PlatformConnectorsPanel } from "../components/dashboard/PlatformConnectorsPanel";
import { PreparationDesk } from "../components/dashboard/PreparationDesk";
import { AtelierBot } from "../components/dashboard/AtelierBot";
import { RewardVault } from "../components/dashboard/RewardVault";
import { LiveShow } from "../components/dashboard/LiveShow";
import { OwnerDirectiveBar } from "../components/dashboard/OwnerDirectiveBar";
import { DomainInfoButton } from "../components/dashboard/DomainInfoButton";
import { GlobalQuickJump } from "../components/dashboard/GlobalQuickJump";
import { ExecutiveCommandWheel } from "../components/dashboard/ExecutiveCommandWheel";
import { SingularityCockpitLayout } from "../components/dashboard/SingularityCockpitLayout";
import { useCoinRain } from "../components/monitor/CoinRain";
import { DEPARTMENTS } from "../services/agent-roster";
import { LEGAL_RULE_PROFILES } from "../services/legal-tax-core";

const EnterpriseOsOrganigram = lazy(() =>
  import("../components/dashboard/EnterpriseOsOrganigram").then((module) => ({
    default: module.EnterpriseOsOrganigram,
  }))
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  // Telemetry Engine initialisieren (idempotent, nur erster Aufruf startet Worker)
  startTelemetryEngine(session.shop, "APEX_OMEGA_PRIME" as const);
  return loadDashboard(session.shop, admin);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const form = await request.formData();
  return handleDashboardAction({ shop: session.shop, admin, form });
};

const VIEWS = [
  { id: "cockpit", label: "Executive Cockpit" },
  { id: "command", label: "Kommandozentrale" },
  { id: "board", label: "Lebendes Organigramm" },
  { id: "desk", label: "1-Klick-Tisch #220" },
  { id: "team", label: "KI-Belegschaft & Akademie (#000–#400+)" },
  { id: "review", label: "Recht & Steuern" },
  { id: "vault", label: "Manufaktur & Tresor" },
  { id: "platforms", label: "Marktplätze & Sicherheit" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];
type TeamSection = "roster" | "earners" | "evolution";

type LegalRuleRow = {
  ruleKey: string;
  jurisdiction: string;
  sourceUrl: string;
  sourceTitle: string;
  verifiedAt: string;
  reviewStatus: string;
};

function LegalTaxRegister({ rules }: { rules: LegalRuleRow[] }) {
  const fetcher = useFetcher<{
    fetched?: number;
    unavailable?: number;
    results?: { ruleKey: string; status: string }[];
    error?: string;
  }>();
  const savedRules = new Map(rules.map((rule) => [rule.ruleKey, rule]));
  const result = fetcher.data;

  return (
    <section style={{ ...card, display: "grid", gap: 8 }} aria-label="Rechtsquellenregister">
      <strong style={{ color: C.champagne }}>Rechts- &amp; Steuerquellen · Quellenabruf, keine Rechtsfreigabe</strong>
      <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
        Es werden nur die fest hinterlegten amtlichen Quellen abgerufen. Erreichbarkeit und Hash belegen keine rechtliche Auslegung.
      </p>
      {result && (
        <div role="status" style={{ color: result.error ? C.red : C.amber, fontSize: 12 }}>
          {result.error ?? `${result.fetched ?? 0} Quelle(n) abgerufen · ${result.unavailable ?? 0} nicht erreichbar. Erneut laden, um den gespeicherten Stand zu sehen.`}
        </div>
      )}
      <div style={{ display: "grid", gap: 6 }}>
        {LEGAL_RULE_PROFILES.map((profile) => {
          const saved = savedRules.get(profile.ruleKey);
          const checkResult = result?.results?.find((item) => item.ruleKey === profile.ruleKey);
          return (
            <div key={profile.ruleKey} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
              <div style={{ display: "grid", gap: 2, minWidth: 220 }}>
                <strong style={{ fontSize: 12 }}>{profile.sourceTitle}</strong>
                <small style={{ color: C.muted }}>
                  {profile.jurisdiction} · {saved
                    ? `${saved.reviewStatus} · geprüft ${new Date(saved.verifiedAt).toLocaleString("de-DE")}`
                    : checkResult?.status ?? "Noch nicht im Ledger"}
                </small>
                <a href={profile.sourceUrl} target="_blank" rel="noreferrer" style={{ color: C.gold, fontSize: 11 }}>Amtliche Quelle öffnen</a>
              </div>
              <fetcher.Form
                method="post"
                action="/api/legal-tax"
                onSubmit={(event) => {
                  event.preventDefault();
                  fetcher.submit({ ruleKeys: [profile.ruleKey] }, { method: "post", action: "/api/legal-tax", encType: "application/json" });
                }}
              >
                <button type="submit" style={btn} disabled={fetcher.state !== "idle"}>
                  {fetcher.state !== "idle" ? "Quelle wird geprüft…" : "Quelle prüfen"}
                </button>
              </fetcher.Form>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const LEGACY_TAB_VIEW: Record<string, ViewId> = {
  overview: "command",
  agents: "team",
  earners: "team",
  audits: "review",
  factory: "team",
  vault: "vault",
  platforms: "platforms",
  rewards: "vault",
};

const VIEW_ALIASES: Record<string, ViewId> = {
  organigramm: "board",
  circuit: "board",
  "live-circuit-board": "board",
};

function viewsForShop(owner: boolean, modules: string[], departmentCount: number): typeof VIEWS[number][] {
  if (owner) return [...VIEWS];
  const visible = new Set<ViewId>(["command", "platforms"]);
  if (departmentCount > 0) {
    visible.add("board");
    visible.add("team");
    visible.add("desk");
  }
  if (modules.some((moduleId) => moduleId === "m2" || moduleId === "m5")) {
    visible.add("vault");
  }
  return VIEWS.filter((entry) => visible.has(entry.id));
}

export const shouldRevalidate = ({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) => {
  const withoutView = (url: URL) => {
    const params = new URLSearchParams(url.search);
    params.delete("view");
    params.delete("tab");
    params.delete("teamSection");
    return params.toString();
  };
  const onlyViewChanged =
    currentUrl.pathname === nextUrl.pathname &&
    (currentUrl.searchParams.get("view") !== nextUrl.searchParams.get("view") ||
      currentUrl.searchParams.get("tab") !== nextUrl.searchParams.get("tab") ||
      currentUrl.searchParams.get("teamSection") !== nextUrl.searchParams.get("teamSection")) &&
    withoutView(currentUrl) === withoutView(nextUrl);
  return onlyViewChanged && !formMethod ? false : defaultShouldRevalidate;
};

export default function AppIndex() {
  const d = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const visibleViews = useMemo(
    () => viewsForShop(d.owner, d.activeModules, d.allowedDepartmentIds.length),
    [d.owner, d.activeModules, d.allowedDepartmentIds.length]
  );
  const requestedView = searchParams.get("view");
  const requestedViewAlias = VIEW_ALIASES[requestedView?.toLowerCase() ?? ""];
  const legacyView = LEGACY_TAB_VIEW[searchParams.get("tab") ?? ""];
  const view: ViewId = visibleViews.find((entry) => entry.id === requestedView)?.id
    ?? visibleViews.find((entry) => entry.id === requestedViewAlias)?.id
    ?? visibleViews.find((entry) => entry.id === legacyView)?.id
    ?? "cockpit";
  const requestedTeamSection = searchParams.get("teamSection");
  const teamSection: TeamSection = d.owner && (requestedTeamSection === "earners" || requestedTeamSection === "evolution")
    ? requestedTeamSection
    : "roster";
  const changeView = useCallback((nextView: ViewId) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("view", nextView);
      next.delete("tab");
      if (nextView !== "team") next.delete("teamSection");
      return next;
    }, { preventScrollReset: true });
  }, [setSearchParams]);
  const changeTeamSection = useCallback((section: TeamSection) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("view", "team");
      next.delete("tab");
      next.set("teamSection", section);
      return next;
    }, { preventScrollReset: true });
  }, [setSearchParams]);
  const [dept, setDept] = useState<number | "all">("all");
  const [qr, setQr] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>(d.activeModules);
  const [scrollToBuilder, setScrollToBuilder] = useState(false);
  const pauseFetcher = useFetcher<{ ok?: boolean; paused?: boolean; message?: string }>();
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
  const connectorCount = Number(d.platformConnectors.googleSheetsConfigured) +
    Number(d.platformConnectors.whatsAppConfigured) +
    Object.values(d.platformConnectors.feedUrls).filter(Boolean).length;
  const jumpCounts: Record<ViewId, number> = {
    cockpit: d.liveTraces.length,
    command: d.preparationDesk.pendingCount,
    board: d.allowedDepartmentIds.length,
    desk: d.preparationDesk.pendingCount,
    team: roster.length,
    review: d.audits.length,
    vault: d.approvals.length + (d.owner ? d.rewardVault.items.length : 0),
    platforms: connectorCount + selectedModules.length,
  };

  const pickDept = useCallback((id: number) => {
    setDept(id);
    changeView("team");
  }, [changeView]);
  const selectModuleFromBoard = useCallback((moduleId: string) => {
    setSelectedModules((current) => current.includes(moduleId) ? current : [...current, moduleId]);
    changeView("platforms");
    setScrollToBuilder(true);
  }, [changeView]);
  const harmonyText = `Harmonie ${d.harmony.harmony} % · Speed ${d.harmony.speed} % · ${d.harmony.pending} offene Freigaben · ${d.harmony.conflicts} aktive Entity-Locks`;

  useEffect(() => {
    if (!scrollToBuilder || view !== "platforms") return;
    document.getElementById("price-configurator")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setScrollToBuilder(false);
  }, [scrollToBuilder, view]);

  const isPaused = pauseFetcher.state !== "idle" && pauseFetcher.formData
    ? pauseFetcher.formData.get("value") === "true"
    : d.paused;
  const pauseValue = isPaused ? "false" : "true";
  const activeView = visibleViews.find((entry) => entry.id === view)!;
  const armyEarnings = {

    monthReal: "monthReal" in d.earnings.army ? d.earnings.army.monthReal : 0,
    totalReal: d.earnings.army.totalReal,
    monthPotential: "monthPotential" in d.earnings.army ? d.earnings.army.monthPotential : 0,
    totalPotential: d.earnings.army.totalPotential,
  };
  const liveShowSlides = useMemo(() => [
    { title: "Shop-Status", detail: `${d.demoInventory ? "Demo-Daten" : "Live-Daten"} · ${d.inventory.items} Bestandseinheiten · Datenstand ${d.snapshotAt.slice(0, 16).replace("T", " ")} UTC` },
    { title: "Interne Zuordnung", detail: `${eur(armyEarnings.monthReal)} echt diesen Monat · ${eur(armyEarnings.monthPotential)} Potenzial (Dry-Run)` },
    { title: "Vorbereitungen", detail: `${d.preparationDesk.pendingCount} offene Fertig-Tisch-Einträge · ${d.approvals.length} Freigaben · ${d.rewardVault.items.length} Vorteilsfälle` },
    { title: "Schutzstatus", detail: `${d.paused ? "KI-Pause aktiv" : d.dryRun ? "Dry-Run aktiv" : "Live-Modus"} · Datenbank ${d.databaseHealth.status === "online" ? `${d.databaseHealth.latencyMs ?? "?"} ms` : "nicht erreichbar"}` },
  ], [d]);

  if (!d.owner && !d.onboardingComplete) {
    return (
      <s-page heading="AtelierPilot AI · Schnellstart">
        <style>{DASH_CSS}</style>
        <MerchantOnboarding owner={false} inventory={d.inventory} inventoryIsLive={!d.demoInventory} />
      </s-page>
    );
  }

  return (
    <s-page heading={`AETHERION OMEGA // X-18 · Sovereign Enterprise OS · Engineered by Wertarbeit AI · ${activeView.label}`}>
      <style>{DASH_CSS}</style>
      {layer}
      <div className="dashboard-content" style={{ display: "grid", gap: 14, background: C.slate, padding: 14, borderRadius: 16 }}>
        {d.owner && view !== "command" && (
          <section style={{ ...card, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 10 }} aria-label="Shop-Schutzsteuerung">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <strong>{activeView.label}</strong>
              {d.owner && <span style={badge(C.gold)}>OWNER UNLIMITED</span>}
              <span style={badge(d.dryRun ? C.amber : C.emerald)}>DRY_RUN_MODE {d.dryRun ? "AN" : "AUS"}</span>
            </div>
            <pauseFetcher.Form method="post">
              <input type="hidden" name="type" value="set_global_pause" />
              <input type="hidden" name="value" value={pauseValue} />
              <button type="submit" style={{ ...btn, borderColor: isPaused ? C.emerald : "#EF4444", color: isPaused ? C.emerald : "#FCA5A5" }} disabled={pauseFetcher.state !== "idle"}>
                {isPaused ? "KI fortsetzen" : "Alle KI-Aktionen pausieren"}
              </button>
            </pauseFetcher.Form>
          </section>
        )}

        <nav aria-label="AtelierPilot-Unterseiten" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {visibleViews.map((entry) => (
            <button
              key={entry.id}
              aria-current={view === entry.id ? "page" : undefined}
              type="button"
              style={view === entry.id ? btnGold : btn}
              onClick={() => changeView(entry.id)}
            >
              {entry.label} <span style={{ color: view === entry.id ? C.slate : C.gold }}>· {jumpCounts[entry.id]}</span>
            </button>
          ))}
        </nav>

        {d.owner && (
          <OwnerDirectiveBar
            directives={d.ownerDirectives}
            subscriberWishes={d.platformConnectors.featureWishes}
            recentLogs={d.recentLogs}
          />
        )}

        <section aria-label={activeView.label} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <DomainInfoButton domain={view} />
          </div>
          {view === "command" && (
            <>
              <HeaderBar
                shop={d.shop}
                isOwner={d.owner}
                dryRun={d.dryRun}
                paused={d.paused}
                harmony={d.harmony}
                army={armyEarnings}
                extraAgents={d.extraAgents}
                inventory={d.inventory}
                activeModules={d.activeModules}
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
              {d.owner ? (
                <>
                  <div style={{ ...card, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderColor: C.gold }}>
                    <div>
                      <strong style={{ color: C.champagne }}>Lebendes Firmen-Organigramm &amp; Event-Bus</strong>
                      <div style={{ color: C.muted, fontSize: 12 }}>Drill-down, echte Verbindungs-Traces und nachvollziehbare Schnittstellen.</div>
                    </div>
                    <button type="button" style={btnGold} onClick={() => changeView("board")}>
                      Lebendes Firmen-Organigramm &amp; Event-Bus öffnen
                    </button>
                  </div>
                  <section style={{ ...card, display: "grid", gap: 6, borderColor: d.preparationDesk.pendingCount ? C.amber : C.line }} aria-label="Exception-Only-Status">
                    <strong style={{ color: C.champagne }}>#220 · Exception-Only-Status</strong>
                    {d.preparationDesk.pendingCount === 0
                      ? <span style={{ color: C.muted }}>Keine offenen Ausnahmefälle.</span>
                      : <>
                        <span>{d.preparationDesk.pendingCount} echte Ausnahme(n) · ausgewiesene Wirkung {eur(d.approvals.reduce((sum, item) => sum + item.financialImpactEur, 0))}</span>
                        <small style={{ color: C.muted }}>Der Fertig-Tisch enthält ausschließlich positive Auswirkung, hohe Risiken, Schwellenwert-/Vorher-Nachher-Hinweise oder Einsprüche der Eskalationsprofile.</small>
                      </>}
                  </section>
                  <ExecutivePulse sentences={d.executivePulse.slice(0, 3)} />
                  <section style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }} aria-label="Kommandozentralen-Übersicht">
                <div style={{ ...card, display: "grid", gap: 6 }}>
                  <strong style={{ color: C.champagne }}>Top-Zuordnungen dieses Monats</strong>
                  <small style={{ color: C.muted }}>Interne Agentenwerte, getrennt nach Echt und Potenzial</small>
                  {topInternal.map(({ agent, real, potential }) => (
                    <div key={agent.key} style={{ fontSize: 12 }}>
                      <strong>#{agent.number} {agent.name}</strong>
                      <div>Echt {eur(real)} · Potenzial {eur(potential)}</div>
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
                  {visibleViews.map((entry) => (
                    <button key={entry.id} type="button" style={{ ...btn, textAlign: "left", borderColor: view === entry.id ? C.champagne : C.gold }} onClick={() => changeView(entry.id)}>
                    {entry.label} <span style={{ color: C.gold }}>· {jumpCounts[entry.id]}</span>
                    </button>
                  ))}
                </div>
                  </section>
              <LiveShow slides={liveShowSlides} snapshotAt={d.snapshotAt} />
                </>
              ) : (
                <>
                  <section style={{ ...card, display: "grid", gap: 6 }}>
                  <strong style={{ color: C.champagne }}>Shop-Übersicht · gebuchte Fachbereiche</strong>
                  <span>{d.activeModules.length} aktive Modul(e) · {d.allowedDepartmentIds.length} zugehörige Fachbereiche</span>
                  <span style={{ color: C.muted }}>Bestand: {d.inventory.items} Einheiten · Quelle {d.demoInventory ? "Demo" : "Shopify live"}.</span>
                  {d.allowedDepartmentIds.length > 0 && (
                    <button type="button" style={btnGold} onClick={() => changeView("board")}>
                      Gebuchte Fachbereiche öffnen
                    </button>
                  )}
                  </section>
                </>
              )}
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
            </>
          )}
          {view === "cockpit" && (
            <SingularityCockpitLayout
              initialTraces={d.liveTraces}
              executivePulse={d.executivePulse}
              dynamicCount={d.extraAgents}
              ownerShop={d.owner}
              roster={d.roster}
              earnings={d.earnings}
              performance={d.performance}
              allowedDepartmentIds={d.allowedDepartmentIds}
              onPickDept={pickDept}
              onSelectModule={selectModuleFromBoard}
            />
          )}
          {view === "board" && (
            <Suspense fallback={<div role="status">Die interaktive Firmen-Platine wird geladen…</div>}>
              <EnterpriseOsOrganigram
                dynamicCount={d.extraAgents}
                ownerShop={d.owner}
                roster={d.roster}
                earnings={d.earnings}
                performance={d.performance}
                allowedDepartmentIds={d.allowedDepartmentIds}
                legalRules={d.legalTaxRules}
                capabilities={d.capabilities}
                bindings={d.interfaceBindings}
                initialTraces={d.liveTraces}
                onPickDept={pickDept}
                onSelectModule={selectModuleFromBoard}
                executivePulse={d.executivePulse}
              />
            </Suspense>
          )}
          {view === "desk" && <PreparationDesk {...d.preparationDesk} isOwner={d.owner} canPrepareListing={d.owner || d.activeModules.includes("m4")} roster={roster} />}
          {view === "team" && (
            <>
              {d.owner && <div role="tablist" aria-label="Belegschafts-Unterbereiche" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {([
                  ["roster", "Rollenprofile"],
                  ["earners", "Verdienst-Zuordnungen"],
                  ["evolution", "Akademie & Evolution"],
                ] as const).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={teamSection === id} style={teamSection === id ? btnGold : btn} onClick={() => changeTeamSection(id)}>
                    {label}
                  </button>
                ))}
              </div>}
              <div style={{ ...card, color: C.muted, fontSize: 12 }}>
                Transparente Heuristik: bestätigte/abgelehnte Freigaben, Evolutions-Scores und echte Verdienstbuchungen. Fehlende Evidenz bleibt unbewertet; keine Personal- oder Fachzertifizierung.
              </div>
              {teamSection === "roster" && (
                <AgentList
                  title={d.owner
                    ? "332 Stammprofile (#1–#232 und #301–#400) · Agenten-Fabrik ab #401"
                    : `Mitarbeiter Ihrer gebuchten Fachbereiche (${roster.length})`}
                  roster={roster}
                  earnings={d.earnings}
                  performance={d.performance}
                  audits={d.auditByAgent}
                  dept={dept}
                  onDept={setDept}
                />
              )}
              {d.owner && teamSection === "earners" && <TopEarners roster={roster} earnings={d.earnings} />}
              {d.owner && teamSection === "evolution" && <EvolutionFactory evolution={d.evolution} dynamic={dynamic} />}
            </>
          )}
          {view === "review" && (
            <>
              {d.owner && <LegalTaxRegister rules={d.legalTaxRules} />}
              <JudicialWorkspace
                roster={roster}
                performance={d.performance}
                earnings={d.earnings}
                audits={d.auditByAgent}
                ledger={d.judicialLedger}
              />
              <AuditPanels audits={d.audits} harmonyText={harmonyText} />
              <OwnerRulesPanel rules={d.rules} />
            </>
          )}
          {view === "vault" && (
            <>
              <ApprovalsVault approvals={d.approvals} vault={d.vault} />
              {d.owner && <RewardVault {...d.rewardVault} />}
              {(d.owner || d.activeModules.includes("m2") || d.activeModules.includes("m5")) && (
                <>
                  <VaultDownloads documents={d.vaultDocuments} />
                  <BrandCustomizer settings={d.brandSettings} />
                </>
              )}
            </>
          )}
          {view === "platforms" && (
            <>
              <PlatformConnectorsPanel
                shop={d.shop}
                isOwner={d.owner}
                subscriptionActive={d.platformConnectors.subscriberActive}
                feeds={d.platformConnectors.feedUrls}
                channelConfigs={d.platformConnectors.channelConfigs}
                featureWishes={d.platformConnectors.featureWishes}
                googleSheetsConfigured={d.platformConnectors.googleSheetsConfigured}
                whatsAppConfigured={d.platformConnectors.whatsAppConfigured}
                whatsAppOptIns={d.platformConnectors.whatsAppOptIns}
                pendingWorkshopJobs={d.platformConnectors.pendingWorkshopJobs}
                paymentLedgerEntries={d.platformConnectors.paymentLedgerEntries}
                ossOriginCountry={d.platformConnectors.ossOriginCountry}
                dryRun={d.dryRun}
                paused={d.paused}
              />
              <PriceConfigurator
                isOwner={d.owner}
                canRunModuleWorkflows={d.canRunModuleWorkflows}
                activeModules={d.activeModules}
                selectedModules={selectedModules}
                onSelectedModulesChange={setSelectedModules}
              />
              <OverviewExtras
                demoInventory={d.demoInventory}
                taxMode={d.taxMode}
                logs={d.recentLogs}
                onboardingDone={!d.apiKeysMissing}
              />
              <div style={{ ...card, color: C.muted, fontSize: 12 }}>
                0,00 € bezeichnet nur den ausgewiesenen Core-/Inhaberpreis. Hosting, Datenbank, KI-Modelle und externe Plattformen können eigene Kosten oder Kontingentgrenzen haben.
              </div>
            </>
          )}
        </section>
      </div>
      <QrModal open={qr} onClose={() => setQr(false)} monitorPath={d.monitorPath} />
      <AtelierBot
        isOwner={d.owner}
        onApplyRecommendation={(modules) => {
          setSelectedModules(modules);
          changeView("platforms");
          setScrollToBuilder(true);
        }}
      />
      <GlobalQuickJump
        owner={d.owner}
        roster={roster}
        departments={DEPARTMENTS.filter((department) => d.allowedDepartmentIds.includes(department.id))}
        legalRules={d.legalTaxRules}
        capabilities={d.capabilities}
      />
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};


