import { useEffect, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, redirect, useFetcher, useLoaderData, useRevalidator } from "react-router";
import { authenticateMonitor, monitorEnabled } from "../services/monitor-auth.server";
import { loadMonitorData, routeCommand } from "../services/monitor-data.server";
import { resolveApproval } from "../services/triple-audit-gate.server";
import { runAgent } from "../services/ai-agents.server";
import { setShopPaused, undoAutopilotAction } from "../services/autopilot-control.server";
import { useCoinRain } from "../components/monitor/CoinRain";
import { VoiceCommand } from "../components/monitor/VoiceCommand";
import { Overview } from "../components/monitor/Overview";
import { PreparationDesk } from "../components/dashboard/PreparationDesk";
import { btn, btnGold, card, wrap } from "../components/monitor/style";

export const meta: MetaFunction = () => [
  { title: "AtelierPilot – Kontrollmonitor" },
  { name: "theme-color", content: "#0F172A" },
  { name: "robots", content: "noindex,nofollow" },
];

export const links = () => [{ rel: "manifest", href: "/manifest.json" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = authenticateMonitor(request);
  if (auth.redirectTo && auth.setCookie) {
    throw redirect(auth.redirectTo, { headers: { "Set-Cookie": auth.setCookie } });
  }
  if (!auth.shop) {
    return data(
      { locked: true as const, enabled: monitorEnabled() },
      { status: monitorEnabled() ? 401 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  const monitor = await loadMonitorData(auth.shop);
  return data({ locked: false as const, monitor }, { headers: { "Cache-Control": "no-store" } });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = authenticateMonitor(request);
  if (!auth.shop) return data({ ok: false, message: "Nicht angemeldet." }, { status: 401 });
  const shop = auth.shop;
  const form = await request.formData();
  const type = String(form.get("type") ?? "");

  if (type === "set_global_pause") {
    const paused = String(form.get("value") ?? "") === "true";
    await setShopPaused(shop, paused);
    return { ok: true, message: paused ? "Alle KI-Aktionen pausiert." : "KI-Aktionen fortgesetzt." };
  }

  if (type === "undo_action") {
    return undoAutopilotAction(shop, String(form.get("id") ?? ""));
  }

  if (type === "approve" || type === "reject") {
    const r = await resolveApproval(shop, String(form.get("id") ?? ""), type === "approve" ? "APPROVED" : "REJECTED");
    return { ok: r.ok, message: r.message };
  }

  if (type === "command") {
    const text = String(form.get("text") ?? "").slice(0, 300);
    if (!text.trim()) return { ok: false, message: "Leerer Befehl." };
    const { agent, label } = routeCommand(text);
    const r = await runAgent(shop, agent, { origin: "manual", body: { text } });
    return { ok: r.ok, message: `${label}: ${r.message}` };
  }

  return { ok: false, message: "Unbekannte Aktion." };
};

function Locked({ enabled }: { enabled: boolean }) {
  return (
    <main style={{ ...wrap, placeItems: "center", textAlign: "center", alignContent: "center" }}>
      <h1 style={{ color: "#F7E7CE", fontSize: 22 }}>AtelierPilot Kontrollmonitor</h1>
      <p style={{ color: "#94A3B8", lineHeight: 1.6 }}>
        {enabled
          ? "Bitte öffnen Sie diese Seite über den QR-Code im AtelierPilot-Dashboard."
          : "Der Monitor ist noch nicht freigeschaltet. Setzen Sie MOBILE_MONITOR_TOKEN (mind. 16 Zeichen) in der .env."}
      </p>
    </main>
  );
}

export default function MobileMonitor() {
  const d = useLoaderData<typeof loader>();
  const control = useFetcher();
  const { rain, layer, sound, toggleSound, soundPreferenceMessage } = useCoinRain();
  const revalidator = useRevalidator();
  const lastSales = useRef<number | null>(null);
  const sales = d.locked ? 0 : d.monitor.sales24h;

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  // Live-Aktualisierung alle 30 s
  useEffect(() => {
    if (d.locked) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible" && revalidator.state === "idle") revalidator.revalidate();
    }, 30_000);
    return () => window.clearInterval(t);
  }, [d.locked, revalidator]);

  // Neue echte Verkäufe lösen den Münzregen aus
  useEffect(() => {
    if (d.locked) return;
    if (lastSales.current !== null && sales > lastSales.current) rain(24);
    lastSales.current = sales;
  }, [sales, d.locked, rain]);

  if (d.locked) return <Locked enabled={d.enabled} />;

  return (
    <main style={wrap}>
      {layer}
      <Overview m={d.monitor} />
      <section style={{ ...card, display: "grid", gap: 8 }} aria-label="Inhaber-Puls">
        <strong style={{ color: "#F7E7CE" }}>#000 Sovereign Meta-Supervisor · Inhaber-Puls</strong>
        <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.5 }}>
          {d.monitor.executivePulse.map((sentence) => <li key={sentence}>{sentence}</li>)}
        </ol>
        <control.Form method="post">
          <input type="hidden" name="type" value="set_global_pause" />
          <input type="hidden" name="value" value={d.monitor.paused ? "false" : "true"} />
          <button type="submit" style={d.monitor.paused ? btnGold : { ...btn, borderColor: "#EF4444", color: "#FCA5A5" }}>
            {d.monitor.paused ? "KI-Aktionen dieses Shops fortsetzen" : "ALLE KI-AKTIONEN DIESES SHOPS SOFORT PAUSIEREN"}
          </button>
        </control.Form>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>
          DRY_RUN_MODE: {d.monitor.dryRun ? "AN" : "AUS"} · Pause und Dry-Run sind getrennte Schutzschalter.
        </div>
      </section>
      <section style={{ ...card, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }} aria-label="Münzregen">
        <button type="button" style={btnGold} onClick={() => rain(22)}>Test-Münzregen</button>
        <button type="button" style={btn} onClick={toggleSound} aria-pressed={sound}>Ton: {sound ? "AN" : "AUS"}</button>
        <button type="button" style={btn} onClick={() => revalidator.revalidate()}>Aktualisieren</button>
        {soundPreferenceMessage && <span role="status" style={{ color: "#F59E0B", fontSize: 12 }}>{soundPreferenceMessage}</span>}
      </section>
      <PreparationDesk {...d.monitor.preparationDesk} />
      <section style={{ ...card, display: "grid", gap: 8 }} aria-label="Letzte KI-Aktionen">
        <strong style={{ color: "#F7E7CE" }}>Letzte 20 KI-Aktionen</strong>
        {d.monitor.actionHistory.length === 0 && <span style={{ color: "#94A3B8" }}>Noch keine protokollierten Aktionen.</span>}
        {d.monitor.actionHistory.map((entry) => (
          <div key={entry.id} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #2B3A55", paddingTop: 8 }}>
            <span>{entry.action} · {entry.status}{entry.detail ? ` · ${entry.detail}` : ""}</span>
            {entry.canUndo && (
              <control.Form method="post">
                <input type="hidden" name="type" value="undo_action" />
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" style={btn}>Rückgängig</button>
              </control.Form>
            )}
          </div>
        ))}
        <small style={{ color: "#94A3B8" }}>Undo ist derzeit nur für interne, protokollierte Bestell-Sync-Schritte freigegeben; externe Shopify-Änderungen werden nicht automatisch zurückgesetzt.</small>
      </section>
      <VoiceCommand />
    </main>
  );
}
