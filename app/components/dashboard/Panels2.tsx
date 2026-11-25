import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { AgentDef, ApprovalDto, EvolutionDto } from "../../services/agent-types";
import type { ShopBrandSettings } from "../../services/shop-settings.server";
import type { VaultDocumentSnapshot } from "../../services/vault-downloads.server";
import { DEPARTMENTS } from "../../services/agent-roster";
import { C, badge, btn, btnGold, card, eur, input } from "./theme";
import { GiftForm } from "./GiftForm";

type Msg = { message?: string };

/** KI-Selbst-Evolution & dynamische Agenten-Fabrik (ab #401). */
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
        <strong style={{ color: C.champagne }}>Agenten-Fabrik #401 → ∞ ({dynamic.length})</strong>
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
          Die Zähler bestätigen gespeicherte Datensätze. Vorhandene Rechnungs- und Zertifikatsdaten werden als ausdrücklich gekennzeichnete Entwürfe exportiert, nicht als normkonforme E-Rechnung oder offizielles GRA-Zertifikat.
        </p>
        <a href="/api/workshop/daily-batch.zip" style={{ ...btn, display: "inline-block", textDecoration: "none" }}>
          Vorhandene xTool-Werkstattjobs als ZIP herunterladen
        </a>
      </div>
    </div>
  );
}

export function VaultDownloads({ documents }: { documents: VaultDocumentSnapshot }) {
  const linkStyle = { ...btn, display: "inline-block", textDecoration: "none" as const };
  return (
    <section style={{ ...card, display: "grid", gap: 10 }} aria-label="Tresor-Downloads">
      <strong style={{ color: C.champagne }}>Werkstatt-Downloads</strong>
      <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>
        Jeder Download ist shopbezogen und erfordert eine gültige Admin-Sitzung. Unvollständige Quelldaten werden als Entwurf/Vorlage gekennzeichnet.
      </p>
      {!documents.available && <div role="status" style={{ color: C.amber }}>{documents.message}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        <a href="/api/vault/a6-card/new" style={linkStyle}>DIN-A6-Paketkarte als PDF</a>
        <a href="/api/vault/tax-zip/all" style={linkStyle}>Steuerberater-Prüfpaket als ZIP</a>
        <a href="/api/vault/chargeback-template/new" style={linkStyle}>Chargeback-Checkliste als PDF</a>
        <a href="/api/vault/b2b-letter/new" style={linkStyle}>DIN-A4-B2B-Briefentwurf als PDF</a>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>Gespeicherte Rechnungen ({documents.invoices.length})</strong>
        {documents.invoices.map((invoice) => (
          <div key={invoice.id} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12 }}>
            <span>{invoice.invoiceNo} · {invoice.orderId} · {invoice.amount} {invoice.currency}</span>
            <a href={`/api/vault/invoice/${encodeURIComponent(invoice.id)}`} style={linkStyle}>
              Rechnungsdatenblatt PDF (Entwurf, kein ZUGFeRD/PDF-A)
            </a>
          </div>
        ))}
        {documents.available && documents.invoices.length === 0 && <span style={{ color: C.muted }}>Keine Rechnungsdatensätze vorhanden.</span>}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>Gespeicherte GRA-/DPP-Datensätze ({documents.certificates.length})</strong>
        {documents.certificates.map((certificate) => (
          <div key={certificate.id} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12 }}>
            <span>{certificate.certificateNo} · {certificate.stoneType ?? "Steinart offen"} · {certificate.carat ?? "Karat offen"}</span>
            <a href={`/api/vault/gra-dpp/${encodeURIComponent(certificate.id)}`} style={linkStyle}>
              DPP-Datenpass-PDF (kein offizielles GRA-Zertifikat)
            </a>
          </div>
        ))}
        {documents.available && documents.certificates.length === 0 && <span style={{ color: C.muted }}>Keine Zertifikatsdatensätze vorhanden.</span>}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <strong>Gespeicherte xTool-SVGs ({documents.svgs.length})</strong>
        {documents.svgs.map((svg) => (
          <div key={svg.id} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12 }}>
            <span>{svg.orderId ?? "Ohne Auftrag"} · {svg.sku ?? "Ohne SKU"} · {svg.material ?? "Material offen"}</span>
            <a href={`/api/vault/xtool-svg/${encodeURIComponent(svg.id)}`} style={linkStyle}>SVG herunterladen</a>
          </div>
        ))}
        {documents.available && documents.svgs.length === 0 && <span style={{ color: C.muted }}>Keine xTool-Datensätze vorhanden.</span>}
      </div>
    </section>
  );
}

export function BrandCustomizer({ settings }: { settings: ShopBrandSettings }) {
  const fetcher = useFetcher<{ ok?: boolean; message?: string }>();
  const [fileError, setFileError] = useState("");
  const [clearLogo, setClearLogo] = useState(false);
  const busy = fetcher.state !== "idle";

  useEffect(() => {
    setFileError("");
    setClearLogo(false);
  }, [settings.hasLogo]);

  return (
    <section style={{ ...card, display: "grid", gap: 10 }} aria-label="Brand-Customizer">
      <strong style={{ color: C.champagne }}>Brand-Customizer &amp; Belegdaten</strong>
      {!settings.available && <div role="status" style={{ color: C.amber }}>{settings.message}</div>}
      {settings.message && settings.available && <div role="status" style={{ color: C.amber }}>{settings.message}</div>}
      <fetcher.Form method="post" encType="multipart/form-data" style={{ display: "grid", gap: 9 }}>
        <input type="hidden" name="type" value="save_shop_settings" />
        <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
          Betriebsname
          <input name="businessName" defaultValue={settings.businessName} maxLength={120} required style={input} />
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Primärfarbe
            <input name="primaryColor" type="color" defaultValue={settings.primaryColor} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Akzentfarbe
            <input name="accentColor" type="color" defaultValue={settings.accentColor} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Schriftstil
            <select name="fontStyle" defaultValue={settings.fontStyle} style={input}>
              <option value="CLASSIC">Klassisch</option>
              <option value="MODERN">Modern</option>
            </select>
          </label>
        </div>
        <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
          Marken-Ton
          <input name="tone" defaultValue={settings.tone} maxLength={80} required style={input} />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
          Grußformel
          <textarea name="greeting" defaultValue={settings.greeting} maxLength={240} required rows={2} style={{ ...input, fontFamily: "inherit" }} />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
          Logo (PNG/JPEG, maximal 350 KB) · {settings.hasLogo ? "Logo gespeichert" : "kein Logo gespeichert"}
          <input
            name="logoFile"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setFileError(file && file.size > 350_000 ? "Datei ist größer als 350 KB." : "");
              setClearLogo(false);
            }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
          <input type="checkbox" name="clearLogo" value="1" checked={clearLogo} onChange={(event) => setClearLogo(event.target.checked)} />
          Gespeichertes Logo entfernen
        </label>
        <fieldset style={{ border: `1px solid ${C.line}`, borderRadius: 8, display: "grid", gap: 7 }}>
          <legend style={{ color: C.champagne, fontSize: 12 }}>Bankdaten für Briefvorlagen (AES-256-GCM verschlüsselt)</legend>
          <small style={{ color: C.muted }}>
            {settings.bankDetailsLocked
              ? "Verschlüsselte Daten sind gesperrt."
              : settings.bankDetailsConfigured
                ? `Gespeichert: ${settings.maskedIban ?? "Bankverbindung hinterlegt"}. Eingabefelder leer lassen, um nichts zu ändern.`
                : "Noch keine Bankdaten gespeichert."}
          </small>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            Bank
            <input name="bankName" maxLength={120} placeholder="Nur zum Ändern neu eingeben" disabled={settings.bankDetailsLocked} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            IBAN
            <input name="iban" autoComplete="off" placeholder="Nur zum Ändern neu eingeben" disabled={settings.bankDetailsLocked} style={input} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12 }}>
            BIC
            <input name="bic" maxLength={11} autoComplete="off" placeholder="Nur zum Ändern neu eingeben" disabled={settings.bankDetailsLocked} style={input} />
          </label>
          {!settings.bankDetailsEncryptionConfigured && (
            <small style={{ color: C.amber }}>Zum Speichern von Bankdaten zuerst BRAND_SETTINGS_ENCRYPTION_KEY als Umgebungsvariable setzen.</small>
          )}
          {settings.bankDetailsLocked && (
            <small style={{ color: C.red }}>Schlüssel stimmt nicht mit dem beim Speichern verwendeten Schlüssel überein. Schlüssel wiederherstellen oder gespeicherte Daten explizit löschen.</small>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
            <input type="checkbox" name="clearBankDetails" value="1" />
            Verschlüsselte Bankdaten löschen
          </label>
        </fieldset>
        {fileError && <div role="alert" style={{ color: C.red }}>{fileError}</div>}
        {fetcher.data?.message && <div role="status" style={{ color: fetcher.data.ok ? C.emerald : C.amber }}>{fetcher.data.message}</div>}
        <small style={{ color: C.muted }}>
          Verlust des Verschlüsselungsschlüssels macht gespeicherte Bankdaten unlesbar. Schlüssel sicher sichern; nicht in Git eintragen.
        </small>
        <button type="submit" style={btnGold} disabled={!settings.available || busy || !!fileError}>
          {busy ? "Wird gespeichert…" : "Brand-Einstellungen speichern"}
        </button>
      </fetcher.Form>
    </section>
  );
}
