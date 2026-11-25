import { useState } from "react";
import { useFetcher } from "react-router";
import type { AgentDef, ApprovalDto } from "../../services/agent-types";
import { DEPARTMENTS } from "../../services/agent-roster";
import { C, badge, btn, btnGold, card, eur } from "./theme";

interface Props {
  items: ApprovalDto[];
  pendingCount: number;
  contributingAgents: number;
  isOwner?: boolean;
  canPrepareListing?: boolean;
  roster?: AgentDef[];
}

function CopySummary({ text, label = "Text kopieren" }: { text: string; label?: string }) {
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Text kopiert.");
    } catch {
      setMessage("Kopieren nicht möglich; Text bitte manuell markieren.");
    }
  }

  return (
    <span>
      <button type="button" style={btn} onClick={copy}>{label}</button>
      {message && <small role="status" style={{ marginLeft: 6, color: C.muted }}>{message}</small>}
    </span>
  );
}

/** #220 presents only real, pending ApprovalQueueItem records; it does not invent drafts. */
export function PreparationDesk({ items, pendingCount, contributingAgents, isOwner = false, canPrepareListing = false, roster = [] }: Props) {
  const fetcher = useFetcher<{ ok?: boolean; message?: string }>();
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const deptByAgent = new Map(roster.map((agent) => [agent.key, agent.departmentId]));
  const departmentOf = (agentKey: string) => {
    if (deptByAgent.has(agentKey)) return deptByAgent.get(agentKey);
    const number = Number(agentKey.replace(/\D/g, ""));
    if (number === 206) return 25;
    if (number >= 207 && number <= 220) return 26;
    return undefined;
  };
  const departments = [...new Set(items.map((item) => departmentOf(item.sourceAgentKey)).filter((id): id is number => id !== undefined))].sort((a, b) => a - b);
  const categories = [...new Set(items.map((item) => item.category))].sort();
  const filteredItems = items.filter((item) =>
    (departmentFilter === "all" || departmentOf(item.sourceAgentKey) === Number(departmentFilter)) &&
    (riskFilter === "all" || item.riskLevel === riskFilter) &&
    (categoryFilter === "all" || item.category === categoryFilter)
  );

  return (
    <section style={{ ...card, display: "grid", gap: 10 }} aria-label="1-Klick-Fertig-Tisch">
      <div>
        <strong style={{ color: C.champagne }}>{isOwner ? "#220 · Exception-Only-Fertig-Tisch" : "Ihre Freigabe-Warteschlange"}</strong>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
          {pendingCount} offene Vorbereitung(en) aus {contributingAgents} Mitarbeiter(n). Freigaben bleiben durch Pause,
          DRY_RUN_MODE und aktive OwnerRules geschützt.
        </div>
      </div>
      {fetcher.data?.message && (
        <div role="status" style={{ fontSize: 12, color: fetcher.data.ok ? C.emerald : C.amber }}>
          {fetcher.data.message}
        </div>
      )}
      {canPrepareListing && (
        <fetcher.Form method="post" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <input type="hidden" name="type" value="prepare_kleinanzeigen_refresh" />
          <input
            name="productId"
            aria-label="Shopify-Produkt-ID für Kleinanzeigen-Paket"
            placeholder="gid://shopify/Product/…"
            required
            style={{ minWidth: 250 }}
          />
          <button type="submit" style={btn} disabled={fetcher.state !== "idle"}>
            #206 Paket aus Shopify-Daten vorbereiten
          </button>
          <span style={{ fontSize: 11, color: C.muted }}>
            Nur bei Bestand &gt; 0 und verifiziertem 2048×2048-Bild; § 11 PAngV bleibt ohne 30-Tage-Historie ungeprüft.
          </span>
        </fetcher.Form>
      )}
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }} aria-label="Fertig-Tisch filtern">
          <label style={{ fontSize: 12, color: C.muted }}>
            Abteilung{" "}
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} style={{ minWidth: 150 }}>
              <option value="all">Alle Abteilungen</option>
              {departments.map((id) => (
                <option key={id} value={id}>Abt. {id} · {DEPARTMENTS.find((dept) => dept.id === id)?.name}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12, color: C.muted }}>
            Risiko{" "}
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} style={{ minWidth: 120 }}>
              <option value="all">Alle Risiken</option>
              {[...new Set(items.map((item) => item.riskLevel))].sort().map((risk) => <option key={risk} value={risk}>{risk}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: C.muted }}>
            Kategorie{" "}
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={{ minWidth: 150 }}>
              <option value="all">Alle Kategorien</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <span style={{ fontSize: 12, color: C.muted }}>{filteredItems.length} von {items.length} angezeigt</span>
        </div>
      )}
      {items.length === 0 && (
        <div style={{ fontSize: 13, color: C.muted }}>
          Keine verifizierten Entwürfe warten auf Freigabe. Nicht angebundene Marktplatz-, Google-Business- oder Eventdaten
          werden nicht als erledigt ausgegeben.
        </div>
      )}
      {items.length > 0 && filteredItems.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Keine Einträge passen zu den Filtern.</div>}
      {filteredItems.map((item) => (
        <article key={item.id} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <strong>{item.title}</strong>
            <span style={badge(item.riskLevel === "HIGH" ? C.red : C.amber)}>{item.sourceAgentKey}</span>
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 12, color: C.muted, marginTop: 6 }}>{item.summary}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {item.category} · Wirkung {eur(item.financialImpactEur)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            <CopySummary text={item.summary} />
            {item.sourceAgentKey === "A206" && (
              <>
                <CopySummary label="Kleinanzeigen-Titel kopieren" text={(item.summary.match(/Anzeigentitel \(Vorschlag\):\s*(.+)/i)?.[1] ?? "").trim()} />
                <CopySummary label="Anzeigentext kopieren" text={(item.summary.match(/Anzeigentext:\s*([\s\S]*)$/i)?.[1] ?? "").trim()} />
              </>
            )}
          </div>
          <fetcher.Form method="post" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" name="type" value="approve" style={btnGold} disabled={fetcher.state !== "idle"}>
              Jetzt mit 1 Klick übernehmen / freigeben
            </button>
            <button type="submit" name="type" value="reject" style={btn} disabled={fetcher.state !== "idle"}>
              Verwerfen
            </button>
          </fetcher.Form>
        </article>
      ))}
    </section>
  );
}
