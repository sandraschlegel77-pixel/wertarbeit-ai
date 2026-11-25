import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { C, btn, card, input } from "./theme";
import { DomainInfoButton } from "./DomainInfoButton";
import { PLATFORM_CATALOG } from "../../services/marketplace-catalog";

type FeedUrls = { otto: string | null; hood: string | null; avocadostore: string | null };
type ActionResult = { ok?: boolean; message?: string };
type ChannelConfig = { channelKey: string; displayName: string; isVisible: boolean; connectorStatus: string };
type FeatureWish = { id: string; title: string; voteCount: number; preflightStatus: string; feasibility: string };
type BankResult = {
  ok?: boolean;
  error?: string;
  imported?: number;
  matched?: number;
  feeDeviations?: number;
  unmatched?: number;
  openPrepayments?: number;
};

interface Props {
  shop: string;
  isOwner: boolean;
  subscriptionActive: boolean;
  feeds: FeedUrls;
  channelConfigs: ChannelConfig[];
  featureWishes: FeatureWish[];
  googleSheetsConfigured: boolean;
  whatsAppConfigured: boolean;
  whatsAppOptIns: number;
  pendingWorkshopJobs: number;
  paymentLedgerEntries: number;
  ossOriginCountry: string;
  dryRun: boolean;
  paused: boolean;
}

type WorkshopField = "orderNumber" | "sku" | "material" | "ringSize" | "fontFamily" | "widthMm" | "heightMm" | "engravingText" | "svgContent";
type WorkshopDraft = Record<WorkshopField, string> & { id: string; createdAt: string };
const WORKSHOP_FIELDS: WorkshopField[] = [
  "orderNumber", "sku", "material", "ringSize", "fontFamily",
  "widthMm", "heightMm", "engravingText", "svgContent",
];

function isWorkshopDraft(value: unknown): value is WorkshopDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    WORKSHOP_FIELDS.every((field) => typeof record[field] === "string");
}

const fieldStyle = { ...input, minWidth: 180 };
const statusColor = (ok: boolean) => ok ? C.emerald : C.amber;

export function PlatformConnectorsPanel(props: Props) {
  const sheets = useFetcher<ActionResult>();
  const workshop = useFetcher<ActionResult>();
  const consent = useFetcher<ActionResult>();
  const revoke = useFetcher<ActionResult>();
  const origin = useFetcher<ActionResult>();
  const whatsapp = useFetcher<{ ok?: boolean; status?: string; error?: string }>({ key: "whatsapp-message" });
  const ledger = useFetcher<BankResult>({ key: "payment-ledger" });
  const wish = useFetcher<ActionResult>({ key: "subscriber-feature-wish" });
  const channel = useFetcher<ActionResult>({ key: "workspace-channel" });
  const [developerLanguage, setDeveloperLanguage] = useState<"de" | "en">("de");
  const [copyMessage, setCopyMessage] = useState("");
  const [workshopDrafts, setWorkshopDrafts] = useState<WorkshopDraft[]>([]);
  const [workshopQueueMessage, setWorkshopQueueMessage] = useState("");
  const workshopFormRef = useRef<HTMLFormElement>(null);
  const workshopQueueKey = `atelierpilot-workshop-queue:${props.shop}`;
  const locked = props.dryRun || props.paused;

  useEffect(() => {
    setWorkshopDrafts([]);
    setWorkshopQueueMessage("");
    try {
      const saved = localStorage.getItem(workshopQueueKey);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        setWorkshopQueueMessage("Die lokale Offline-Warteschlange ist beschädigt und wurde nicht geladen.");
        return;
      }
      const validDrafts = parsed.filter(isWorkshopDraft).slice(0, 20);
      setWorkshopDrafts(validDrafts);
      if (validDrafts.length !== parsed.length) {
        setWorkshopQueueMessage("Ungültige oder überzählige lokale Entwürfe wurden nicht geladen.");
      }
    } catch {
      setWorkshopQueueMessage("Die Offline-Warteschlange konnte aus dem Browser-Speicher nicht gelesen werden.");
    }
  }, [workshopQueueKey]);

  function persistWorkshopDrafts(next: WorkshopDraft[]) {
    try {
      localStorage.setItem(workshopQueueKey, JSON.stringify(next));
      setWorkshopDrafts(next);
      setWorkshopQueueMessage("");
      return true;
    } catch {
      setWorkshopQueueMessage("Speichern im lokalen Browser-Speicher fehlgeschlagen (Speicher voll oder gesperrt).");
      return false;
    }
  }

  function saveWorkshopDraft() {
    const form = workshopFormRef.current;
    if (!form || !form.reportValidity()) return;
    if (workshopDrafts.length >= 20) {
      setWorkshopQueueMessage("Die lokale Warteschlange ist auf 20 Entwürfe begrenzt. Bitte zuerst einen übertragen oder löschen.");
      return;
    }
    const formData = new FormData(form);
    const draft: WorkshopDraft = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      orderNumber: String(formData.get("orderNumber") ?? ""),
      sku: String(formData.get("sku") ?? ""),
      material: String(formData.get("material") ?? ""),
      ringSize: String(formData.get("ringSize") ?? ""),
      fontFamily: String(formData.get("fontFamily") ?? ""),
      widthMm: String(formData.get("widthMm") ?? ""),
      heightMm: String(formData.get("heightMm") ?? ""),
      engravingText: String(formData.get("engravingText") ?? ""),
      svgContent: String(formData.get("svgContent") ?? ""),
    };
    if (draft.svgContent.length > 200_000) {
      setWorkshopQueueMessage("SVG ist zu groß für eine sichere lokale Browser-Warteschlange (max. 200.000 Zeichen).");
      return;
    }
    if (persistWorkshopDrafts([draft, ...workshopDrafts])) {
      setWorkshopQueueMessage("Offline-Entwurf nur in diesem Browser vorgemerkt; es wurde nichts an den Server gesendet.");
    }
  }

  function loadWorkshopDraft(draft: WorkshopDraft) {
    const form = workshopFormRef.current;
    if (!form) return;
    for (const field of WORKSHOP_FIELDS) {
      const control = form.querySelector(`[name="${field}"]`);
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
        control.value = draft[field];
      }
    }
    setWorkshopQueueMessage("Entwurf ins Formular geladen. Beim Speichern wird er an den Server übertragen.");
  }

  async function copyDeveloperRequest(platform: string) {
    const text = developerLanguage === "de"
      ? `Guten Tag,\n\nwir sind Wertarbeit Manufaktur, ein Familienbetrieb in Bayern. Wir prüfen eine regelkonforme Anbindung von ${platform} für Produkt-, Bestands- und Auftragsdaten. Bitte teilen Sie uns die aktuellen technischen, vertraglichen und Datenschutz-Anforderungen sowie den offiziellen Zugang zum passenden Entwickler- oder Partnerportal mit.\n\nVielen Dank\nWertarbeit Manufaktur`
      : `Hello,\n\nwe are Wertarbeit Manufaktur, a family-run workshop in Bavaria, Germany. We are evaluating a compliant ${platform} integration for product, inventory, and order data. Please share the current technical, contractual, and data-protection requirements and the official developer or partner access process.\n\nThank you,\nWertarbeit Manufaktur`;
    if (!navigator.clipboard) {
      setCopyMessage("Zwischenablage nicht verfügbar; bitte den Anfrageentwurf manuell erstellen.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`Anfrageentwurf für ${platform} (${developerLanguage.toUpperCase()}) kopiert; nicht versendet.`);
    } catch {
      setCopyMessage("Kopieren wurde vom Browser abgelehnt; der Anfrageentwurf wurde nicht versendet.");
    }
  }

  function platformStatus(key: string) {
    if (key === "sheets") {
      return props.googleSheetsConfigured
        ? "Webhook/Secret konfiguriert; keine Verbindung automatisch getestet"
        : "Bereit für Webhook/Secret";
    }
    if (key === "whatsapp") {
      return props.whatsAppConfigured
        ? "Keys vorhanden; keine Testnachricht gesendet"
        : "Bereit für Token/Phone-ID";
    }
    if (key === "otto" || key === "hood" || key === "avocadostore") {
      return props.feeds[key]
        ? "Feed konfiguriert; Marketplace-Import nicht getestet"
        : "Bereit für Feed-Konfiguration";
    }
    return "API-Adapter nicht angebunden";
  }

  const channelVisibility = new Map(props.channelConfigs.map((config) => [config.channelKey, config.isVisible]));
  const visiblePlatforms = PLATFORM_CATALOG.filter((platform) => channelVisibility.get(platform.key) !== false);
  const hiddenPlatforms = PLATFORM_CATALOG.filter((platform) => channelVisibility.get(platform.key) === false);

  function channelToggleForm(platform: (typeof PLATFORM_CATALOG)[number], visible: boolean) {
    return (
      <channel.Form method="post">
        <input type="hidden" name="type" value="set_workspace_channel_visibility" />
        <input type="hidden" name="channelKey" value={platform.key} />
        <input type="hidden" name="displayName" value={platform.name} />
        <input type="hidden" name="isVisible" value={visible ? "true" : "false"} />
        <button type="submit" style={btn} disabled={channel.state !== "idle" || !props.subscriptionActive}>
          {visible ? "Im Cockpit anzeigen" : "Ausblenden"}
        </button>
      </channel.Form>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.champagne }}>Google-Sheets-Finanzjournal</h2>
        <p style={{ color: C.muted }}>
          Konfiguration: <strong style={{ color: statusColor(props.googleSheetsConfigured) }}>
            {props.googleSheetsConfigured ? "Webhook + Secret vorhanden" : "Webhook oder Secret fehlt"}
          </strong>
          {" · "}OSS-Ursprung: <strong>{props.ossOriginCountry || "nicht gesetzt"}</strong>
        </p>
        <origin.Form method="post" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input type="hidden" name="type" value="set_oss_origin_country" />
          <input
            name="country"
            defaultValue={props.ossOriginCountry}
            aria-label="OSS-Ursprungsland, ISO-3166-1-Alpha-2"
            placeholder="DE"
            maxLength={2}
            required
            style={{ ...fieldStyle, width: 110 }}
          />
          <button type="submit" style={btn}>Ursprungsland speichern</button>
        </origin.Form>
        <sheets.Form method="post" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <input type="hidden" name="type" value="sync_google_sheets" />
          <button type="submit" style={btn} disabled={locked || !props.googleSheetsConfigured}>
            Tagesjournal jetzt synchronisieren
          </button>
          <span style={{ color: C.muted, alignSelf: "center" }}>
            {locked ? "Gesperrt durch Pause oder DRY_RUN_MODE." : "Sendet nur Finanzdaten, keine Kundennamen oder E-Mail-Adressen."}
          </span>
        </sheets.Form>
        {sheets.data?.message && <p role="status">{sheets.data.message}</p>}
        <p style={{ fontSize: 12, color: C.muted }}>
          OSS-Jahreskumulation bleibt unbekannt, bis vollständige Order-Historie freigegeben und verifiziert ist.
          Verpackungsgramm stammen ausschließlich aus dem Produkt-Metafeld, sonst bleibt der Wert leer.
        </p>
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.champagne }}>xTool-Werkstatt-Tagespaket</h2>
        <p style={{ color: C.muted }}>
          Offene Jobs heute: {props.pendingWorkshopJobs}. Nur vollständige Datensätze mit sicherem SVG-Inhalt werden exportiert;
          unvollständige Jobs stehen im Manifest unter „skippedJobs“.
        </p>
        <a href="/api/workshop/daily-batch.zip" style={{ ...btn, display: "inline-block", textDecoration: "none" }}>
          Tagespaket als ZIP herunterladen
        </a>
        <p style={{ fontSize: 12, color: C.muted }}>
          Neue Jobs werden mit vorhandener SVG-Datei erfasst; es wird kein Gravurpfad oder Font automatisch erfunden.
        </p>
        <workshop.Form ref={workshopFormRef} method="post" style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <input type="hidden" name="type" value="create_workshop_job" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <input name="orderNumber" placeholder="Bestellnummer" required style={fieldStyle} />
            <input name="sku" placeholder="SKU" required style={fieldStyle} />
            <input name="material" placeholder="Material" required style={fieldStyle} />
            <input name="ringSize" placeholder="Ringgröße" required style={fieldStyle} />
            <input name="fontFamily" placeholder="Schriftfamilie" required style={fieldStyle} />
            <input name="widthMm" type="number" min="0.1" max="1000" step="0.1" placeholder="Breite mm" required style={{ ...fieldStyle, width: 120 }} />
            <input name="heightMm" type="number" min="0.1" max="1000" step="0.1" placeholder="Höhe mm" required style={{ ...fieldStyle, width: 120 }} />
            <input name="engravingText" placeholder="Gravurtext" maxLength={500} required style={fieldStyle} />
          </div>
          <textarea
            name="svgContent"
            placeholder="Vorhandenen, validen SVG-Inhalt einfügen"
            aria-label="SVG-Inhalt"
            rows={5}
            required
            style={{ ...fieldStyle, width: "100%", boxSizing: "border-box", fontFamily: "monospace" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="submit" style={btn}>Werkstattjob speichern</button>
            <button type="button" style={btn} onClick={saveWorkshopDraft}>Offline-Entwurf lokal vormerken</button>
          </div>
        </workshop.Form>
        {workshop.data?.message && <p role="status">{workshop.data.message}</p>}
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10, display: "grid", gap: 8 }}>
          <strong>Lokale Werkstatt-Offline-Queue · {workshopDrafts.length}/20</strong>
          <small style={{ color: C.muted }}>
            Nur auf diesem Browsergerät gespeichert, nicht verschlüsselt und nicht automatisch synchronisiert.
            Bestellnummer und Gravurtext können kundenbezogen sein: nur auf einem vertrauenswürdigen Gerät nutzen und nach Übertragung löschen. Keine Namen, Telefonnummern oder Zahlungsdaten vormerken.
          </small>
          {workshopQueueMessage && <div role="status" style={{ color: C.amber, fontSize: 12 }}>{workshopQueueMessage}</div>}
          {workshopDrafts.map((draft) => (
            <div key={draft.id} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ flex: "1 1 200px", fontSize: 12 }}>
                {draft.orderNumber} · {draft.sku} · vorgemerkt {draft.createdAt.slice(0, 16).replace("T", " ")} UTC
              </span>
              <button type="button" style={btn} onClick={() => loadWorkshopDraft(draft)}>Ins Formular laden</button>
              <button type="button" style={btn} onClick={() => persistWorkshopDrafts(workshopDrafts.filter((item) => item.id !== draft.id))}>Lokal löschen</button>
            </div>
          ))}
        </div>
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.champagne }}>WhatsApp Business</h2>
        <p style={{ color: C.muted }}>
          {props.whatsAppConfigured ? "API konfiguriert" : "Token oder Phone-ID fehlt"}
          {" · "}{props.whatsAppOptIns} aktive Opt-ins
          {" · "}Telefonnummern werden nur gehasht, in Logs maskiert.
        </p>
        <consent.Form method="post" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <input type="hidden" name="type" value="record_whatsapp_optin" />
          <input name="phone" type="tel" placeholder="+491701234567" aria-label="Telefonnummer E.164" required style={fieldStyle} />
          <select name="source" aria-label="Opt-in-Nachweisquelle" required style={fieldStyle} defaultValue="">
            <option value="" disabled>Opt-in-Quelle wählen</option>
            <option value="checkout_checkbox">Checkout-Checkbox</option>
            <option value="customer_email">E-Mail des Kunden</option>
            <option value="written_consent">Schriftliche Einwilligung</option>
            <option value="in_person">Persönlich dokumentiert</option>
            <option value="other_verified">Sonstige geprüfte Quelle</option>
          </select>
          <label style={{ display: "flex", gap: 6, alignItems: "center", color: C.text }}>
            <input type="checkbox" name="verified" value="1" required />
            Ausdrückliches Kunden-Opt-in geprüft
          </label>
          <button type="submit" style={btn}>Opt-in dokumentieren</button>
        </consent.Form>
        {consent.data?.message && <p role="status">{consent.data.message}</p>}

        <revoke.Form method="post" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          <input type="hidden" name="type" value="revoke_whatsapp_optin" />
          <input name="phone" type="tel" placeholder="+491701234567" aria-label="Opt-in widerrufen für Telefonnummer" required style={fieldStyle} />
          <button type="submit" style={btn}>Opt-in widerrufen</button>
        </revoke.Form>
        {revoke.data?.message && <p role="status">{revoke.data.message}</p>}

        <whatsapp.Form action="/api/whatsapp/messages" method="post" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          <input name="phone" type="tel" placeholder="+491701234567" aria-label="Empfänger E.164" required style={fieldStyle} />
          <select name="templateName" required style={fieldStyle} aria-label="Freigegebenes Service-Template">
            <option value="gravur_freigabe_check">gravur_freigabe_check</option>
            <option value="ringgroesse_rueckfrage">ringgroesse_rueckfrage</option>
          </select>
          {[1, 2, 3].map((n) => (
            <input key={n} name={`p${n}`} placeholder={`Vorlage-Parameter ${n}`} aria-label={`Vorlage-Parameter ${n}`} style={fieldStyle} />
          ))}
          <button type="submit" style={btn} disabled={locked || !props.whatsAppConfigured}>
            Service-Template senden
          </button>
        </whatsapp.Form>
        {whatsapp.data?.status && <p role="status">WhatsApp: {whatsapp.data.status}</p>}
        {whatsapp.data?.error && <p role="alert">{whatsapp.data.error}</p>}
        <p style={{ fontSize: 12, color: C.muted }}>
          Versand nur mit aktivem Opt-in, freigegebenem Template und höchstens einem Sendeversuch je Nummer in sieben Tagen.
          Der Versand kann Meta-Kosten verursachen; 0-€-Betrieb ist nicht garantiert.
        </p>
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.champagne }}>Bank-CSV-Abgleich</h2>
        <p style={{ color: C.muted }}>
          Gespeicherte Einträge: {props.paymentLedgerEntries}. IBAN und Verwendungszweck werden nicht im Klartext gespeichert.
        </p>
        <ledger.Form action="/api/finance/payment-ledger" method="post" encType="multipart/form-data" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input name="file" type="file" accept=".csv,text/csv" required aria-label="Bank-CSV-Datei" />
          <button type="submit" style={btn}>CSV abgleichen</button>
        </ledger.Form>
        {ledger.data?.error && <p role="alert">{ledger.data.error}</p>}
        {ledger.data?.ok && (
          <p role="status">
            {ledger.data.imported} Buchungen: {ledger.data.matched} passend, {ledger.data.feeDeviations} Gebührenabweichungen,
            {" "}{ledger.data.unmatched} ungeklärt, {ledger.data.openPrepayments} offene Vorkasse.
          </p>
        )}
      </section>

      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.champagne }}>Marktplatz-Feeds</h2>
        <p style={{ color: C.muted }}>
          UTF-8-XML, nur im Online-Shop veröffentlichte aktive Produkte. Feed-URLs sind geheime Zugriffstoken; nicht öffentlich teilen.
          Das gemeinsame Schema muss je Marktplatz vor Live-Anbindung mit dessen Importvorgaben abgeglichen werden.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {(["otto", "hood", "avocadostore"] as const).map((channel) => (
            <div key={channel}>
              <strong>{channel}</strong>:{" "}
              {props.feeds[channel]
                ? <a href={props.feeds[channel] ?? undefined} target="_blank" rel="noreferrer">Feed öffnen</a>
                : <span style={{ color: C.amber }}>SHOPIFY_APP_URL (HTTPS) oder Secret fehlt</span>}
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...card, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div>
          <h2 style={{ margin: 0, color: C.champagne }}>Plattform-Cockpit &amp; Entwicklerzugänge</h2>
          <p style={{ color: C.muted, fontSize: 12, marginBottom: 0 }}>
            Kanäle können im Cockpit ein- oder ausgeblendet werden. Sichtbarkeit bedeutet nicht verbunden; Adapter- und Recherche-Ergebnisse werden getrennt ausgewiesen.
          </p>
          </div>
          <DomainInfoButton domain="platforms" />
        </div>
        <label style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 12 }}>
          Anfrageentwurf-Sprache
          <select value={developerLanguage} onChange={(event) => setDeveloperLanguage(event.target.value as "de" | "en")} style={fieldStyle}>
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
          <span style={{ color: C.muted }}>#202 · Developer-Korrespondent DE/EN · lokaler Entwurf, kein Versand</span>
        </label>
        {copyMessage && <div role="status" style={{ color: C.muted, fontSize: 12 }}>{copyMessage}</div>}
        {channel.data?.message && <div role={channel.data.ok ? "status" : "alert"} style={{ color: channel.data.ok ? C.emerald : C.amber }}>{channel.data.message}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 8 }}>
          {visiblePlatforms.map((platform) => (
            <article key={platform.key} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, display: "grid", gap: 7 }}>
              <strong>{platform.name}</strong>
              <span style={{ color: platform.status === "NOT_CONNECTED" ? C.amber : C.muted, fontSize: 11 }}>
                {platformStatus(platform.status)}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <a href={platform.portal} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none" }}>Offizielles Portal</a>
                <button type="button" style={btn} onClick={() => void copyDeveloperRequest(platform.name)}>
                  Anfrage kopieren
                </button>
                {!props.isOwner && channelToggleForm(platform, false)}
              </div>
            </article>
          ))}
        </div>
        {hiddenPlatforms.length > 0 && (
          <details>
            <summary style={{ cursor: "pointer", color: C.muted }}>Ausgeblendete Kanäle ({hiddenPlatforms.length})</summary>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 8 }}>
              {hiddenPlatforms.map((platform) => (
                <div key={platform.key} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{platform.name}</span>
                  {!props.isOwner && channelToggleForm(platform, true)}
                </div>
              ))}
            </div>
          </details>
        )}
        {!props.isOwner && (
          <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, display: "grid", gap: 8 }}>
            <h3 style={{ color: C.champagne, margin: 0 }}>Neuen Marktplatz vorschlagen</h3>
            <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
              Freitext ist erlaubt. Der Wunsch wird shopübergreifend gebündelt. Eine Quellenprüfung oder Anbindung wird nur ausgewiesen, wenn sie tatsächlich belegt und implementiert ist.
            </p>
            {props.subscriptionActive ? (
              <wish.Form method="post" style={{ display: "grid", gap: 8 }}>
                <input type="hidden" name="type" value="suggest_marketplace" />
                <input name="title" minLength={2} maxLength={80} required placeholder="Marktplatz oder Plattform, z. B. nebenan.de" style={fieldStyle} />
                <textarea name="description" maxLength={500} placeholder="Was möchtest du dort tun? (Keine Zugangsdaten eingeben.)" style={{ ...fieldStyle, minHeight: 65 }} />
                <button type="submit" style={btn} disabled={wish.state !== "idle"}>Neuen Marktplatz vorschlagen</button>
              </wish.Form>
            ) : (
              <p role="status" style={{ color: C.amber, margin: 0 }}>Für Subscriber-Wünsche ist eine aktive Subscription erforderlich.</p>
            )}
            {wish.data?.message && <p role={wish.data.ok ? "status" : "alert"} style={{ color: wish.data.ok ? C.emerald : C.amber, margin: 0 }}>{wish.data.message}</p>}
            {props.featureWishes.length > 0 && (
              <div style={{ display: "grid", gap: 4 }}>
                <strong>Deine / gebündelte Wünsche</strong>
                {props.featureWishes.map((item) => (
                  <small key={item.id} style={{ color: C.muted }}>
                    {item.title} · {item.voteCount} Shop-Stimme(n) · {item.preflightStatus} · {item.feasibility}
                  </small>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </div>
  );
}
