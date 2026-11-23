import { useFetcher } from "react-router";
import type { ApprovalDto } from "../../services/agent-types";
import { btn, btnGold, card, eur } from "./style";

/** 1-Klick-Freigabe-Warteschlange (ApprovalQueueItem) für das Handy. */
export function Approvals({ items }: { items: ApprovalDto[] }) {
  const f = useFetcher<{ ok?: boolean; message?: string }>();
  return (
    <section style={{ display: "grid", gap: 10 }} aria-label="Freigaben">
      <h2 style={{ margin: 0, fontSize: 16, color: "#F7E7CE" }}>1-Klick-Freigaben ({items.length})</h2>
      {f.data?.message && <small style={{ color: f.data.ok ? "#10B981" : "#F59E0B" }}>{f.data.message}</small>}
      {items.length === 0 && <div style={{ ...card, color: "#94A3B8", fontSize: 13 }}>Keine offenen Freigaben.</div>}
      {items.map((a) => (
        <div key={a.id} style={card}>
          <strong>{a.title}</strong>
          <div style={{ fontSize: 12, color: "#94A3B8", margin: "4px 0 8px" }}>
            {a.summary} · Wirkung {eur(a.financialImpactEur)} · Risiko {a.riskLevel}
          </div>
          <f.Form method="post" style={{ display: "flex", gap: 8 }}>
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" name="type" value="approve" style={btnGold} disabled={f.state !== "idle"}>
              Freigeben
            </button>
            <button type="submit" name="type" value="reject" style={btn} disabled={f.state !== "idle"}>
              Ablehnen
            </button>
          </f.Form>
        </div>
      ))}
    </section>
  );
}
