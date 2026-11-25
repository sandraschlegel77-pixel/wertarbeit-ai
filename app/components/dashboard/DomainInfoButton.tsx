import { useState } from "react";
import { C, btn } from "./theme";

const DOMAIN_INFO: Record<string, { de: { title: string; body: string }; en: { title: string; body: string } }> = {
  command: {
    de: { title: "Kommandozentrale", body: "Hier sehen Sie Shop-Status, echte interne Zuordnungen, offene Aufgaben und den Sicherheitsmodus. Demo-Werte, Schätzungen und externe Kosten werden getrennt gekennzeichnet." },
    en: { title: "Command center", body: "This view shows shop status, real internal attribution, pending work, and the safety mode. Demo values, estimates, and external costs are identified separately." },
  },
  board: {
    de: { title: "Organigramm", body: "Die Platine visualisiert vorhandene Rollen und Abteilungen. Ein Rollenprofil ist kein Beleg für autonome Arbeit; angezeigt werden nur tatsächlich erfasste Aktivitäten." },
    en: { title: "Organization board", body: "The board visualizes existing roles and departments. A role profile does not prove autonomous work; only recorded activity is shown." },
  },
  desk: {
    de: { title: "Fertig-Tisch", body: "Hier erscheinen tatsächlich gespeicherte Vorbereitungen und Freigaben. Externe Aktionen werden erst nach Prüfung der jeweiligen Berechtigung und Freigabe ausgeführt." },
    en: { title: "Preparation desk", body: "This view contains saved preparations and approvals. External actions require the relevant permission checks and approval before execution." },
  },
  team: {
    de: { title: "Belegschaft", body: "Noten und Akademiestatus sind interne, datenbasierte Heuristiken. Sie sind keine Fach-, Rechts- oder Personalzertifizierung." },
    en: { title: "Workforce", body: "Grades and academy status are internal, data-based heuristics. They are not professional, legal, or personnel certifications." },
  },
  review: {
    de: { title: "Prüfzentrum", body: "Prüfprotokolle unterstützen interne Entscheidungen, ersetzen aber keine Rechts- oder Steuerberatung und keine unabhängige externe Prüfung." },
    en: { title: "Review center", body: "Review records support internal decisions, but do not replace legal or tax advice or an independent external audit." },
  },
  vault: {
    de: { title: "Tresor", body: "Downloads beruhen auf gespeicherten Quelldaten. Entwürfe und Checklisten sind keine amtlichen Zertifikate, normkonformen Rechnungen oder Buchungsstapel." },
    en: { title: "Vault", body: "Downloads use stored source data. Drafts and checklists are not official certificates, compliant invoices, or accounting batches." },
  },
  platforms: {
    de: { title: "Marktplätze & Verbindungen", body: "Ein sichtbarer Kanal ist nicht automatisch verbunden. Ein neuer Wunsch wird erfasst; ohne aktuelle offizielle Quelle bleibt die Schnittstellenprüfung unbestätigt." },
    en: { title: "Marketplaces & connections", body: "A visible channel is not automatically connected. New requests are recorded; without a current official source, interface availability remains unverified." },
  },
};

export function DomainInfoButton({ domain }: { domain: string }) {
  const [open, setOpen] = useState(false);
  const language = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en") ? "en" : "de";
  const fallback = {
    de: { title: "System-Wissen", body: "Diese Ansicht zeigt nur den tatsächlich implementierten und gespeicherten Funktionsstand." },
    en: { title: "System information", body: "This view shows only functionality that is actually implemented and recorded." },
  };
  const content = DOMAIN_INFO[domain]?.[language] ?? fallback[language];
  return (
    <>
      <button
        type="button"
        style={{ ...btn, padding: "5px 9px", fontSize: 12 }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        ⓘ Info &amp; System-Wissen
      </button>
      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(2, 6, 23, 0.72)", display: "grid", placeItems: "center", padding: 18 }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="domain-info-title"
            style={{ background: C.slate, color: C.text, border: `1px solid ${C.gold}`, borderRadius: 14, padding: 20, width: "min(520px, 100%)", boxSizing: "border-box" }}
          >
            <h2 id="domain-info-title" style={{ color: C.champagne, marginTop: 0 }}>{content.title}</h2>
            <p style={{ lineHeight: 1.6 }}>{content.body}</p>
            <button type="button" style={btn} onClick={() => setOpen(false)}>
              {language === "en" ? "Close" : "Schließen"}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
