import { useFetcher } from "react-router";
import type { AgentDef, ApprovalDto, EvolutionDto } from "../../services/agent-types";
import { DEPARTMENTS } from "../../services/agent-roster";
import { C, badge, btn, btnGold, card, eur, input } from "./theme";
import { GiftForm } from "./GiftForm";

type Msg = { message?: string };

/** Tab 5: KI-Selbst-Evolution & Agenten-Fabrik (#221 → ∞). */
export function EvolutionFactory({ evolution, dynamic }: { evolution: EvolutionDto[]; dynamic: AgentDef[] }) {
  const f = useFetcher<Msg>();
  const busy = f.state !== "idle";
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...card, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <f.Form method="post">
          <input type="hidden" name="type" value="evolve_week" />
          <button type="submit" style={btnGold} disabled={busy}>Wöchentliche Evolution jetzt starten</button>
        </f.Form>
        <f.Form method="post">
          <input type="hidden" name="type" value="scan_niches" />
          <button type="submit" style={btnGold} disabled={busy}>Nischen scannen & Agenten erschaffen</button>
        </f.Form>
        {f.data?.message && <span style={{ fontSize: 13 }}>{f.data.message}</span>}
      </div>

      <div style={card}>
        <strong style={{ color: C.champagne }}>Agenten-Fabrik #221 → ∞ ({dynamic.length})</strong>
        <p style={{ color: C.muted, fontSize: 12, margin: "6px 0" }}>
          Neue Fachgebiete werden als Kandidat angelegt und nicht automatisch gestartet.
        </p>
        <f.Form method="post" style={{ display: "grid", gap: 8, maxWidth: 720 }}>
          <input type="hidden" name="type" value="spawn_custom_agent" />
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Fachgebiet / Name
            <input name="name" minLength={3} maxLength={80} required placeholder="z. B. Edelstein-Pflegeberater" style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Zuständige Abteilung
            <select name="departmentId" required defaultValue="26" style={input}>
              {DEPARTMENTS.map((department) => (
                <option key={department.id} value={department.id}>Abt. {department.id} · {department.name}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Auftrag / geprüfter Aufgabenbereich
            <textarea name="mission" minLength={10} maxLength={500} required rows={3} style={{ ...input, resize: "vertical" }} />
          </label>
          <button type="submit" style={btnGold} disabled={busy}>Fachgebiet prüfen & Kandidaten entwickeln</button>
        </f.Form>
        {dynamic.length === 0 && (
          <div style={{ fontSize: 12, color: C.muted }}>
            Noch keine dynamischen Mitarbeiter. Der Nischen-Scanner erschafft sie automatisch.
          </div>
        )}
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13 }}>
          {dynamic.map((a) => (
            <li key={a.key}>
              #{a.number} {a.name} – {a.mission}{" "}
              <span style={badge(a.status === "ACTIVE" ? C.emerald : C.amber)}>{a.status}</span>
              {a.status !== "ACTIVE" && (
                <f.Form method="post" style={{ display: "inline", marginLeft: 6 }}>
                  <input type="hidden" name="type" value="activate_agent" />
                  <input type="hidden" name="agentNumber" value={a.number} />
                  <button type="submit" style={btn}>Aktivieren</button>
                </f.Form>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div style={card}>
        <strong style={{ color: C.champagne }}>Skill-Versionen (v1 → v2 → v3, Rollback)</strong>
        {evolution.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Noch keine Weiterentwicklung gelaufen.</div>}
        <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Versionen werden pro Mitarbeiter aufsteigend aufgebaut; Rollback entfernt nur den neuesten Evolutionsdatensatz.</div>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12 }}>
          {evolution.map((e, i) => (
            <li key={`${e.agentKey}-${i}`}>
              {e.agentKey} · v{e.skillVersion} · Erfolg {(e.successScore * 100).toFixed(0)} %
              <f.Form method="post" style={{ display: "inline", marginLeft: 8 }}>
                <input type="hidden" name="type" value="rollback_agent" />
                <input type="hidden" name="agentKey" value={e.agentKey} />
                <button type="submit" style={btn}>Rollback</button>
              </f.Form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Tab 6: 1-Klick-Freigabe-Warteschlange & Tresor. */
export function ApprovalsVault({
  approvals,
  vault,
}: {
  approvals: ApprovalDto[];
  vault: { certs: number; invoices: number; svgs: number };
}) {
  const f = useFetcher<Msg>();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={card}>
        <strong style={{ color: C.champagne }}>1-Klick-Freigabe-Warteschlange ({approvals.length})</strong>
        {f.data?.message && <div style={{ fontSize: 12, color: C.emerald }}>{f.data.message}</div>}
        {approvals.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Keine offenen Freigaben. Alles läuft sauber.</div>}
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "grid", gap: 8 }}>
          {approvals.map((a) => (
            <li key={a.id} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 8 }}>
              <strong>{a.title}</strong>{" "}
              <span style={badge(a.riskLevel === "HIGH" ? C.red : C.amber)}>{a.riskLevel}</span>
              <div style={{ fontSize: 12, color: C.muted }}>
                {a.summary} · Wirkung {eur(a.financialImpactEur)} · {a.sourceAgentKey}
              </div>
              <f.Form method="post" style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" name="type" value="approve" style={btnGold}>Freigeben</button>
                <button type="submit" name="type" value="reject" style={btn}>Ablehnen</button>
              </f.Form>
            </li>
          ))}
        </ul>
      </div>
      <GiftForm />
      <div style={card}>
        <strong style={{ color: C.champagne }}>Tresor (PDF / GRA / xTool)</strong>
        <div style={{ fontSize: 13, marginTop: 6 }}>
          {vault.invoices} Rechnungen · {vault.certs} GRA-Zertifikate · {vault.svgs} xTool-SVG-Dateien
        </div>
        <p style={{ color: C.muted, fontSize: 12 }}>
          Die Zähler bestätigen gespeicherte Datensätze, nicht verfügbare PDF-Downloads. ZUGFeRD-/DATEV-/Chargeback- und DPP-Dateien werden hier nicht aus unvollständigen Daten erzeugt.
        </p>
        <a href="/api/workshop/daily-batch.zip" style={{ ...btn, display: "inline-block", textDecoration: "none" }}>
          Vorhandene xTool-Werkstattjobs als ZIP herunterladen
        </a>
        <div style={{ color: C.amber, fontSize: 12, marginTop: 8 }}>
          Brand-Customizer mit Logo-/Bankdatenpersistenz und individuelle Vault-Downloads benötigen ein geprüftes ShopSettings-/Dokumentenmodell; diese Oberfläche meldet sie nicht als eingerichtet.
        </div>
      </div>
    </div>
  );
}
