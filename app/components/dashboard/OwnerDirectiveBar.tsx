import { useFetcher } from "react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { C, btnGold, card, input } from "./theme";
import { DomainInfoButton } from "./DomainInfoButton";

interface DirectiveItem {
  id: string;
  requestText: string;
  feasibility: string;
  executionStatus: string;
  resultSummary: string | null;
  credentialsRedacted: boolean;
  createdAt: string | Date;
}

interface SubscriberWish {
  title: string;
  voteCount: number;
  preflightStatus: string;
}

interface ActivityLog {
  id: string;
  action: string;
  status: string;
  detail: string | null;
}

interface ActionResult {
  ok?: boolean;
  feasibility?: string;
  message?: string;
  credentialsRedacted?: boolean;
}

export function OwnerDirectiveBar({
  directives,
  subscriberWishes,
  recentLogs,
}: {
  directives: DirectiveItem[];
  subscriberWishes: SubscriberWish[];
  recentLogs: ActivityLog[];
}) {
  const fetcher = useFetcher<ActionResult>();
  const submitting = fetcher.state !== "idle";
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const localHour = now === null ? null : new Date(now).getHours();
  const weekend = now !== null && [0, 6].includes(new Date(now).getDay());
  const quietProfile = localHour === null
    ? "Zeitprofil wird geladen."
    : weekend || localHour < 8 || localHour >= 18
      ? "Feierabend-/Wochenend-Ruheprofil"
      : "Tagesprofil";

  function clearAfterSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitting) event.preventDefault();
  }

  return (
    <section style={{ ...card, borderColor: C.gold, display: "grid", gap: 10 }} aria-label="Inhaber-Direktiven">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <h2 style={{ color: C.champagne, margin: 0 }}>OWNER · Hier möchte ich…</h2>
          <small style={{ color: C.muted }}>Nenne das Ziel in Alltagssprache. Niemals Schlüssel, Passwörter oder Kundendaten einfügen.</small>
        </div>
        <DomainInfoButton domain="owner-directive" />
      </div>
      <fetcher.Form method="post" onSubmit={clearAfterSubmit} style={{ display: "grid", gap: 8 }}>
        <input type="hidden" name="type" value="owner_directive" />
        <textarea
          name="directive"
          minLength={5}
          maxLength={1000}
          required
          placeholder={'z. B. „Ich möchte nebenan.de als Marktplatz prüfen lassen.“ oder „Kanal ausblenden: Etsy“'}
          style={{ ...input, minHeight: 76, resize: "vertical" }}
        />
        <button type="submit" style={btnGold} disabled={submitting}>
          {submitting ? "Wunsch wird geprüft…" : "Wunsch einreichen"}
        </button>
      </fetcher.Form>
      {fetcher.data?.message && (
        <p role={fetcher.data.ok ? "status" : "alert"} style={{ margin: 0, color: fetcher.data.ok ? C.emerald : C.amber }}>
          {fetcher.data.message}
          {fetcher.data.credentialsRedacted ? " Erkannte Zugangsdaten wurden vor Speicherung entfernt." : ""}
        </p>
      )}
      <div style={{ display: "grid", gap: 6, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
        <strong style={{ color: C.champagne }}>Autopilot-Ticker · protokollierte Aktivitäten</strong>
        <small style={{ color: C.muted }}>
          {quietProfile} · Anzeigehinweis in lokaler Zeit; keine zusätzliche Zeitsteuerung.
          DRY_RUN_MODE, Pause und OwnerRules bleiben maßgeblich.
        </small>
        {recentLogs.slice(0, 4).map((log) => (
          <small key={log.id} style={{ color: log.status === "success" ? C.emerald : C.amber }}>
            {log.status === "success" ? "✓" : "!"} {log.action} · {log.detail || "Keine Details gespeichert."}
          </small>
        ))}
        {directives.length === 0 && <small style={{ color: C.muted }}>Noch keine Direktiven gespeichert.</small>}
        {directives.slice(0, 4).map((directive) => (
          <div key={directive.id} style={{ display: "grid", gap: 2, fontSize: 12 }}>
            <span><strong>{directive.executionStatus}</strong> · {directive.feasibility} · {directive.requestText}</span>
            {directive.resultSummary && <small style={{ color: C.muted }}>{directive.resultSummary}</small>}
            {directive.credentialsRedacted && <small style={{ color: C.amber }}>Zugangsdaten wurden vor Speicherung entfernt.</small>}
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 8, display: "grid", gap: 5 }}>
        <strong style={{ color: C.champagne }}>Gebündelte Subscriber-Marktplatzwünsche</strong>
        {subscriberWishes.length === 0
          ? <small style={{ color: C.muted }}>Noch keine Vorschläge eingegangen.</small>
          : subscriberWishes.slice(0, 4).map((wish) => (
            <small key={wish.title} style={{ color: C.muted }}>
              {wish.title} · {wish.voteCount} Shop-Stimme(n) · {wish.preflightStatus}
            </small>
          ))}
      </div>
    </section>
  );
}
