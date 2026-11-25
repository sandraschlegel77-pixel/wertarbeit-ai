import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { AgentDef, AgentPerformanceSnapshot, EarningsSummary } from "../../services/agent-types";
import type { JudicialLedgerSnapshot } from "../../services/judicial-system.server";
import { AgentList } from "./AgentList";
import { C, badge, btnGold, card, input } from "./theme";

const STAGES = [
  { value: 0, agent: 221, label: "#221 · Gegenspieler / Devil's Advocate" },
  { value: 1, agent: 222, label: "#222 · Amtsrichter-Stufe (intern, kein Gericht)" },
  { value: 2, agent: 223, label: "#223 · Landrichter-Stufe (intern, kein Gericht)" },
  { value: 3, agent: 224, label: "#224 · OLG-Stufe (intern, kein Gericht)" },
  { value: 4, agent: 225, label: "#225 · Bundesrichter-Stufe (intern, kein Gericht)" },
];

const DECISIONS = {
  PROCEED: "Weiterreichen",
  ESCALATE: "Zusätzliche menschliche Prüfung",
  HOLD: "Anhalten",
} as const;

export function JudicialWorkspace({
  roster,
  performance,
  earnings,
  audits,
  ledger,
}: {
  roster: AgentDef[];
  performance: AgentPerformanceSnapshot;
  earnings: EarningsSummary;
  audits: Record<string, string>;
  ledger: JudicialLedgerSnapshot;
}) {
  const fetcher = useFetcher<{
    ok?: boolean;
    message?: string;
    caseId?: string;
    stage?: number;
    decision?: string;
  }>();
  const [department, setDepartment] = useState<number | "all">("all");
  const [caseId, setCaseId] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [stage, setStage] = useState(0);
  const [decision, setDecision] = useState<keyof typeof DECISIONS>("PROCEED");
  const [rationale, setRationale] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");

  useEffect(() => {
    const result = fetcher.data;
    if (!result?.ok || !result.caseId || result.stage === undefined) return;
    if (result.decision === "HOLD" || result.stage === 4) {
      setCaseId("");
      setCaseTitle("");
      setStage(0);
    } else {
      setCaseId(result.caseId);
      setStage(result.stage + 1);
    }
    setRationale("");
    setEvidenceReference("");
  }, [fetcher.data]);

  const busy = fetcher.state !== "idle";

  return (
    <section style={{ display: "grid", gap: 12 }} aria-label="Interne Prüf- und Ledger-Ansicht">
      <div style={{ ...card, borderColor: C.amber, color: C.text, fontSize: 13 }}>
        Ausschließlich manuell dokumentierte interne Prüfschritte. Es gibt keine automatische Rechtsbewertung, kein Gericht und keine Rechts- oder Steuerberatung.
        Die Hash-Kette prüft vorhandene Einträge auf Änderungen/Reihenfolge; sie ist kein extern verankerter, unveränderlicher Beweis und erkennt keine entfernte Schluss-Sequenz.
      </div>

      <div style={{ ...card, display: "grid", gap: 8 }}>
        <strong style={{ color: C.champagne }}>Interne Prüffolge #221–#225</strong>
        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
          Die Rollenprofile bleiben aus Sicherheitsgründen nicht ausführbar. Eine Person trägt den jeweiligen internen Prüfschritt ein; Stufen müssen der Reihe nach durchlaufen werden.
        </p>
        <AgentList
          title="Gegenspieler und vier interne Prüfstufen"
          roster={roster}
          earnings={earnings}
          performance={performance}
          audits={audits}
          dept={department}
          onDept={setDepartment}
          fixed={(agent) => agent.number >= 221 && agent.number <= 225}
        />
      </div>

      <div style={{ ...card, display: "grid", gap: 9 }}>
        <strong style={{ color: C.champagne }}>Manuellen Ledger-Eintrag anfügen</strong>
        <small style={{ color: C.muted }}>
          Keine Namen, E-Mail-Adressen, Telefonnummern, Zahlungsdaten oder vollständigen Kundendokumente in Begründung/Belegverweis eintragen. Der Belegverweis wird nur als SHA-256-Hash gespeichert.
        </small>
        <fetcher.Form method="post" style={{ display: "grid", gap: 8 }}>
          <input type="hidden" name="type" value="judicial_record" />
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="stage" value={stage} />
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Falltitel (intern)
            <input
              name="caseTitle"
              value={caseTitle}
              onChange={(event) => setCaseTitle(event.target.value)}
              minLength={5}
              maxLength={160}
              required
              style={input}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <label style={{ display: "grid", flex: "1 1 260px", gap: 4, fontSize: 12 }}>
              Nächste Prüfstufe
              <select value={stage} style={input} disabled>
                {STAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", flex: "1 1 220px", gap: 4, fontSize: 12 }}>
              Interner Schritt
              <select name="decision" value={decision} onChange={(event) => setDecision(event.target.value as keyof typeof DECISIONS)} style={input}>
                {Object.entries(DECISIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          {caseId && <div style={{ fontSize: 12, color: C.muted }}>Fortsetzung des Falls {caseId} · Prüfstufe {stage}</div>}
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Begründung für die interne Akte
            <textarea
              name="rationale"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              minLength={10}
              maxLength={2000}
              required
              rows={4}
              style={{ ...input, fontFamily: "inherit" }}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Optionaler neutraler Belegverweis (max. 200 Zeichen; wird nicht im Klartext gespeichert)
            <input
              name="evidenceReference"
              value={evidenceReference}
              onChange={(event) => setEvidenceReference(event.target.value)}
              maxLength={200}
              style={input}
            />
          </label>
          {fetcher.data?.message && <div role="status" style={{ color: fetcher.data.ok ? C.emerald : C.amber }}>{fetcher.data.message}</div>}
          <button type="submit" style={btnGold} disabled={busy || ledger.status === "unavailable"}>
            {busy ? "Eintrag wird verkettet…" : "Internen Prüfschritt anfügen"}
          </button>
        </fetcher.Form>
      </div>

      <div style={{ ...card, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <strong style={{ color: C.champagne }}>JudicialDecisionLedger · {ledger.entries.length} zuletzt angezeigte Einträge</strong>
          {ledger.status === "available" && (
            <span style={badge(ledger.verified ? C.emerald : C.red)}>
              {ledger.verified ? "Hash-Kette intern konsistent" : "Hash-Kette fehlerhaft"}
            </span>
          )}
        </div>
        {ledger.message && <div role="status" style={{ color: ledger.verified === false ? C.red : C.amber, fontSize: 12 }}>{ledger.message}</div>}
        {ledger.status === "available" && ledger.entries.length === 0 && <span style={{ color: C.muted, fontSize: 12 }}>Noch keine manuellen Review-Einträge vorhanden.</span>}
        <ol style={{ display: "grid", gap: 8, margin: 0, paddingLeft: 22 }}>
          {ledger.entries.map((entry) => (
            <li key={entry.id} style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 8, fontSize: 12 }}>
              <strong>#{entry.sequence} · {STAGES[entry.stage]?.label ?? `Prüfstufe ${entry.stage}`} · {DECISIONS[entry.decision as keyof typeof DECISIONS] ?? entry.decision}</strong>
              <div>{entry.caseTitle} · Fall {entry.caseId}</div>
              <div style={{ color: C.muted, whiteSpace: "pre-wrap" }}>{entry.rationale}</div>
              <small style={{ color: C.muted }}>
                {new Date(entry.createdAt).toLocaleString("de-DE")} · SHA-256 {entry.entryHash}
              </small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
