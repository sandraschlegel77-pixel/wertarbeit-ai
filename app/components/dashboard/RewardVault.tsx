import { useState } from "react";
import { useFetcher } from "react-router";
import type { CapturedRewardItem, RewardScannerCheck, RewardType } from "../../services/reward-types";
import { REWARD_LABELS } from "../../services/reward-types";
import { C, badge, btn, btnGold, card, grid, input } from "./theme";

type Props = {
  items: CapturedRewardItem[];
  summary: {
    readyEur: number;
    requestedEur: number;
    receivedEur: number;
    receivedProducts: number;
  };
};

type ActionData = {
  ok?: boolean;
  message?: string;
  checks?: RewardScannerCheck[];
};

const eur = (amount: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

const STATUS_LABELS: Record<string, string> = {
  REVIEW: "Prüfung offen",
  READY: "Geprüft · bereit",
  REQUESTED: "Beantragt / unterwegs",
  RECEIVED: "Erhalten / eingelöst",
};

const rewardStatusColor = (status: string) =>
  status === "RECEIVED" ? C.emerald : status === "READY" ? C.gold : C.amber;

const nonCashType = (type: RewardType) =>
  type === "FREE_B2B_SAMPLE" || type === "CREATOR_SPONSORSHIP";

export function RewardVault({ items, summary }: Props) {
  const fetcher = useFetcher<ActionData>();
  const [clipboardMessage, setClipboardMessage] = useState("");

  async function openAndCopy(item: CapturedRewardItem) {
    if (item.sourceUrl) window.open(item.sourceUrl, "_blank", "noopener,noreferrer");
    const text = item.code || item.requestDraft || item.sourceUrl || "";
    if (!text) {
      setClipboardMessage("Für diesen Eintrag ist kein Code, Antragstext oder Link hinterlegt.");
      return;
    }
    if (!navigator.clipboard) {
      setClipboardMessage("Kopieren ist in diesem Browser nicht verfügbar. Den Antragstext unten bitte manuell kopieren.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setClipboardMessage(item.sourceUrl
        ? "Aktionslink geöffnet und Code/Antrag kopiert."
        : "Code/Antrag in die Zwischenablage kopiert.");
    } catch {
      setClipboardMessage("Der Browser hat den Zugriff auf die Zwischenablage abgelehnt. Bitte den Text unten manuell kopieren.");
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }} aria-label="Guthaben-, Bonus- und Gratisprodukt-Tresor">
      <header style={card}>
        <h2 style={{ color: C.champagne, margin: 0 }}>Guthaben-, Bonus- &amp; Gratisprodukt-Tresor</h2>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 0 }}>
          Hier werden Chancen und deine manuell bestätigten Eingänge dokumentiert. Die App reicht keine Ansprüche ein,
          löst keine Gutscheine ein und erhält keine Zahlungen. Schätzwerte sind keine Guthaben.
        </p>
      </header>

      <div style={grid(190)}>
        {[
          ["Bereit zum Einlösen / Anfordern (€)", eur(summary.readyEur)],
          ["Beantragt / Unterwegs (€)", eur(summary.requestedEur)],
          ["Ausgezahlt / Eingelöst (€)", eur(summary.receivedEur)],
          ["Gesicherte Gratisprodukte & Muster", String(summary.receivedProducts)],
        ].map(([label, value]) => (
          <div key={label} style={card}>
            <div style={{ color: C.muted, fontSize: 12 }}>{label}</div>
            <strong style={{ display: "block", color: C.champagne, fontSize: 22, marginTop: 6 }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={{ ...card, display: "grid", gap: 10 }}>
        <strong style={{ color: C.champagne }}>Chancen-Assimilator</strong>
        <div style={{ color: C.muted, fontSize: 12 }}>
          Die lokale Stichwort-Erkennung ordnet deine Angaben einer Kategorie zu und erstellt einen Anfrageentwurf.
          Links werden nicht automatisch abgerufen; Bedingungen und Anspruch bitte selbst prüfen.
        </div>
        <fetcher.Form method="post" style={{ display: "grid", gap: 8 }}>
          <input type="hidden" name="type" value="reward_create" />
          <textarea
            name="description"
            required
            minLength={3}
            maxLength={2000}
            placeholder="Neue Geld-, Bonus- oder Gratisprodukt-Chance prüfen & annehmen – z. B. DHL-Verspätung, Digitalbonus, kostenloses Schiefermuster"
            style={{ ...input, minHeight: 76, fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input name="sourceLabel" maxLength={120} placeholder="Anbieter / Quelle (optional)" style={{ ...input, flex: "1 1 190px" }} />
            <input name="sourceUrl" type="url" placeholder="Aktions-Link (HTTPS, optional)" style={{ ...input, flex: "1 1 240px" }} />
            <input name="amountEur" type="number" min="0" max="1000000" step="0.01" placeholder="Schätzwert €" style={{ ...input, width: 130 }} />
            <input name="productCount" type="number" min="1" max="100000" step="1" placeholder="Produktmenge" style={{ ...input, width: 130 }} />
            <input name="code" maxLength={256} placeholder="Code (optional)" style={{ ...input, flex: "1 1 150px" }} />
          </div>
          <button type="submit" style={btnGold} disabled={fetcher.state !== "idle"}>
            {fetcher.state !== "idle" ? "Wird gespeichert…" : "Chance vorprüfen & im Tresor speichern"}
          </button>
        </fetcher.Form>
      </div>

      <div style={{ ...card, display: "grid", gap: 8 }}>
        <strong style={{ color: C.champagne }}>Vorteils-Scanner</strong>
        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
          Der Lauf prüft nur lokale Bankabgleich-Abweichungen. Versand-, Anbieter-, Förder-, Werbe- und Affiliate-Konten
          sind nicht verbunden und werden nicht automatisiert abgefragt.
        </p>
        <fetcher.Form method="post">
          <input type="hidden" name="type" value="reward_scan" />
          <button type="submit" style={btnGold} disabled={fetcher.state !== "idle"}>
            {fetcher.state !== "idle" ? "Lokale Daten werden geprüft…" : "Jetzt alle 10 Vorteils-Scanner starten"}
          </button>
        </fetcher.Form>
        {fetcher.data?.message && (
          <div role="status" style={{ color: fetcher.data.ok === false ? C.amber : C.emerald, fontSize: 13 }}>
            {fetcher.data.message}
          </div>
        )}
        {fetcher.data?.checks && (
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4, fontSize: 12 }}>
            {fetcher.data.checks.map((check) => (
              <li key={check.type}>
                {check.label} — {check.status === "LOCAL_SCAN"
                  ? `lokaler Abgleich geprüft (${check.findings} Abweichung(en))`
                  : check.status === "MANUAL"
                    ? "manuelle Eingabe"
                    : `keine Anbindung (${check.source})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ ...card, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <strong style={{ color: C.champagne, flex: "1 1 220px" }}>Prüffälle ({items.length})</strong>
        {items.some((item) => item.status === "RECEIVED")
          ? <a href="/api/rewards-export" style={{ ...btn, display: "inline-block", textDecoration: "none" }}>
              Erhaltene Einträge als Steuerberater-Prüfliste exportieren
            </a>
          : <span style={{ ...btn, opacity: 0.55 }}>Noch keine erhaltenen Einträge zum Export</span>}
        <span style={{ color: C.muted, fontSize: 11, flexBasis: "100%" }}>
          CSV zur Prüfung; kein DATEV-Buchungsstapel. Die steuerliche Behandlung muss der Steuerberater festlegen.
        </span>
      </div>

      {clipboardMessage && <div role="status" style={{ color: C.muted, fontSize: 12 }}>{clipboardMessage}</div>}
      {items.length === 0 && <div style={{ ...card, color: C.muted }}>Noch keine Vorteils-Prüffälle gespeichert.</div>}
      {items.map((item) => (
        <article key={item.id} style={{ ...card, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <strong style={{ color: C.champagne }}>{item.title}</strong>
            <span style={badge(C.gold)}>{REWARD_LABELS[item.type]}</span>
            <span style={badge(rewardStatusColor(item.status))}>{STATUS_LABELS[item.status] ?? item.status}</span>
          </div>
          <div style={{ fontSize: 13 }}>
            {item.sourceLabel && <span>Quelle: {item.sourceLabel} · </span>}
            {item.estimatedValueEur !== null
              ? `Schätzwert ${eur(item.estimatedValueEur)}`
              : item.productCount
                ? `Mögliche Produktmenge: ${item.productCount}`
                : "Wert noch nicht angegeben"}
            {item.actualValueEur !== null && ` · Tatsächlich erhalten: ${eur(item.actualValueEur)}`}
            {item.receivedQuantity !== null && ` · Stückzahl erhalten: ${item.receivedQuantity}`}
          </div>
          <div style={{ color: C.muted, fontSize: 11 }}>
            Angelegt {new Date(item.createdAt).toLocaleString("de-DE")}
            {item.accountingReview === "OPEN" && " · Steuerliche Einordnung offen"}
          </div>
          {(item.code || item.sourceUrl || item.requestDraft || item.evidence) && (
            <details>
              <summary style={{ cursor: "pointer", color: C.champagne }}>Code, Link, Nachweis &amp; Anfrageentwurf anzeigen</summary>
              {item.code && <div style={{ marginTop: 6 }}>Code: <code>{item.code}</code></div>}
              {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" style={{ color: C.gold }}>Aktions-/Quellenlink öffnen</a>}
              {item.requestDraft && <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 12 }}>{item.requestDraft}</pre>}
              {item.evidence && <div style={{ color: C.muted, fontSize: 12 }}>Angaben/Nachweis: {item.evidence}</div>}
            </details>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <button type="button" style={btn} onClick={() => void openAndCopy(item)}>
              Code / Antrag öffnen &amp; kopieren
            </button>
            {item.status === "REVIEW" && (
              <fetcher.Form method="post">
                <input type="hidden" name="type" value="reward_status" />
                <input type="hidden" name="rewardId" value={item.id} />
                <input type="hidden" name="status" value="READY" />
                <button type="submit" style={btnGold} disabled={fetcher.state !== "idle"}>Nach Prüfung anforderbar markieren</button>
              </fetcher.Form>
            )}
            {item.status === "READY" && (
              <fetcher.Form method="post">
                <input type="hidden" name="type" value="reward_status" />
                <input type="hidden" name="rewardId" value={item.id} />
                <input type="hidden" name="status" value="REQUESTED" />
                <button type="submit" style={btnGold} disabled={fetcher.state !== "idle"}>Als beantragt / angefordert markieren</button>
              </fetcher.Form>
            )}
            {(item.status === "READY" || item.status === "REQUESTED") && (
              <fetcher.Form method="post" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <input type="hidden" name="type" value="reward_status" />
                <input type="hidden" name="rewardId" value={item.id} />
                <input type="hidden" name="status" value="RECEIVED" />
                {!nonCashType(item.type) && (
                  <input name="actualValueEur" type="number" min="0.01" max="1000000" step="0.01" required placeholder="Tatsächlich erhalten €" style={{ ...input, width: 170 }} />
                )}
                {nonCashType(item.type) && (
                  <>
                    <input name="actualValueEur" type="number" min="0.01" max="1000000" step="0.01" placeholder="Betrag/Guthaben € (optional)" style={{ ...input, width: 190 }} />
                    <input name="receivedQuantity" type="number" min="1" max="100000" step="1" required={item.type === "FREE_B2B_SAMPLE"} placeholder="Stückzahl erhalten" style={{ ...input, width: 150 }} />
                  </>
                )}
                <button type="submit" style={btnGold} disabled={fetcher.state !== "idle"}>
                  Als ausgezahlt / erhalten verbuchen
                </button>
              </fetcher.Form>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
