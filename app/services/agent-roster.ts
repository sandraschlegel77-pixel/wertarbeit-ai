/**
 * Stamm-Firmenstruktur: 26 Abteilungen, 220 KI-Mitarbeiter (#1–#220).
 * Ebenen: 1 Vorstand #158–161 · 2 Direktoren #153–157 · 3 Abteilungsleiter
 * #133–152 · 4 Teamleiter #1–66 · 5 Co-Agenten #67–132 · Abt. 21–26 #162–220.
 * Alle Agenten laufen über die bestehenden 20 Sidekick-Tools (sub_action).
 */
import type { AgentDef, AuditDomain, DepartmentDef } from "./agent-types";
import { TOOLS, WRITE_TOOLS, type ToolCode } from "./roster-tools";
import { BOARD, DEPT_ROWS, DIRECTORS, TEAM_RANGE } from "./roster-departments";
import { TEAM } from "./roster-team";
import { PANEL_ROWS } from "./roster-panels";

export const STAMM_COUNT = 220;

const mk = (
  number: number,
  name: string,
  role: string,
  departmentId: number,
  level: number,
  reportsTo: number | null,
  mission: string,
  revenueMechanism: string,
  tool: ToolCode,
  auditDomain: AuditDomain | null,
  background: boolean,
  valueHintEur: number
): AgentDef => ({
  number,
  key: `A${number}`,
  name,
  role,
  departmentId,
  level,
  reportsTo,
  mission,
  revenueMechanism,
  tool: TOOLS[tool],
  auditDomain,
  background,
  writes: WRITE_TOOLS.has(tool),
  valueHintEur,
});

export const DEPARTMENTS: DepartmentDef[] = DEPT_ROWS.map(
  ([id, name, mechanism, kind, auditDomain]) => {
    const dir = DIRECTORS.find((d) => d.depts.includes(id));
    const headNumber =
      id <= 20 ? 132 + id : id === 21 ? 171 : id === 22 ? 176 : id === 23 ? 180 : id === 24 ? 185 : id === 25 ? 186 : 207;
    const directorNumber = dir?.n ?? (id === 25 ? 157 : id === 26 ? 160 : null);
    return { id, name, mechanism, directorNumber, headNumber, kind, auditDomain };
  }
);

const deptById = (id: number) => DEPT_ROWS.find((r) => r[0] === id)!;

function buildStamm(): AgentDef[] {
  const out: AgentDef[] = [];

  // Ebene 4: Teamleiter #1–#66, Ebene 5: Co-Agenten #67–#132
  for (const [dStr, [from, to]] of Object.entries(TEAM_RANGE)) {
    const d = Number(dStr);
    const [, , mech, kind, audit, hint] = deptById(d);
    const bg = kind === "armada";
    for (let n = from; n <= to; n++) {
      const [name, mission, tool] = TEAM[n - 1];
      out.push(mk(n, name, "Teamleiter", d, 4, 132 + d, mission, mech, tool, audit, bg, hint / 3));
      out.push(mk(n + 66, `Co-Agent ${name}`, "Co-Agent", d, 5, n, `Unterstützt: ${mission}`, mech, tool, audit, bg, hint / 6));
    }
  }

  // Ebene 3: Abteilungsleiter #133–#152
  for (let d = 1; d <= 20; d++) {
    const row = deptById(d);
    const dir = DIRECTORS.find((x) => x.depts.includes(d))!;
    out.push(mk(132 + d, `Leiter ${row[1]}`, "Abteilungsleiter", d, 3, dir.n, `Führt Abteilung ${d}: ${row[1]}`, row[2], "BRF", row[4], row[3] === "armada", row[5]));
  }

  // Ebene 2: Direktoren #153–#157
  for (const dir of DIRECTORS) {
    out.push(mk(dir.n, dir.name, "Bereichs-Direktor", dir.depts[0], 2, dir.reportsTo, `Führt Abteilungen ${dir.depts.join(", ")}`, "Koordination & Ergebnisverantwortung", "BRF", null, false, 0));
  }

  // Ebene 1: KI-Vorstand #158–#161
  for (const b of BOARD) {
    out.push(mk(b.n, b.name, "KI-Vorstand", 24, 1, b.reportsTo, b.role, "Strategie unter OwnerRule", b.tool, null, false, 0));
  }

  // Abt. 21–24: Fachgremien #162–#185
  for (const [n, name, mission, tool, d, boss] of PANEL_ROWS) {
    const row = deptById(d);
    const chief = n === 171 || n === 176 || n === 180 || n === 185;
    out.push(mk(n, name, chief ? "Chief" : "Fachprüfer", d, chief ? 3 : 4, boss, mission, row[2], tool, row[4], false, 0));
  }

  const addedAgents: {
    number: number;
    name: string;
    role: string;
    departmentId: number;
    level: number;
    reportsTo: number;
    mission: string;
    tool: ToolCode;
    background: boolean;
    valueHintEur: number;
  }[] = [
    { number: 186, name: "Leiter Plattform- & API-Armada", role: "Abteilungsleiter", departmentId: 25, level: 3, reportsTo: 157, mission: "Koordiniert die geprüfte Plattform- und API-Anbindung", tool: "MST", background: true, valueHintEur: 0 },
    { number: 187, name: "eBay-Kanal-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft eBay-Listing- und Bestandsdaten", tool: "MSY", background: true, valueHintEur: 80 },
    { number: 188, name: "Etsy-Atelierbedarf-Filter", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Etsy-Richtlinien und Atelierbedarf-Listings", tool: "MST", background: true, valueHintEur: 80 },
    { number: 189, name: "Kaufland-Kanal-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Kaufland-Angebots- und Bestandsdaten", tool: "MSY", background: true, valueHintEur: 80 },
    { number: 190, name: "Amazon-SP-API-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Koordiniert geprüfte Amazon-SP-API-Datenflüsse", tool: "MST", background: true, valueHintEur: 80 },
    { number: 191, name: "OTTO-Market-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft OTTO-Feed- und Pflichtattributdaten", tool: "MST", background: true, valueHintEur: 70 },
    { number: 192, name: "Hood- & Avocadostore-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Hood- und Avocadostore-Feeddaten", tool: "MST", background: true, valueHintEur: 70 },
    { number: 193, name: "Google-Merchant-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Produktdaten für Google Merchant", tool: "MST", background: true, valueHintEur: 70 },
    { number: 194, name: "Pinterest-Kanal-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Bereitet Pinterest-Produktdaten vor", tool: "MST", background: true, valueHintEur: 60 },
    { number: 195, name: "Meta-Kanal-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Meta-Katalog- und Kanalstatus", tool: "MST", background: true, valueHintEur: 60 },
    { number: 196, name: "TikTok- & YouTube-Kanal-Spezialist", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Bereitet Video-Commerce-Produktdaten vor", tool: "MST", background: true, valueHintEur: 60 },
    { number: 197, name: "DHL-Versanddaten-Spezialist", role: "Logistik-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft DHL-Versand- und Trackingdaten", tool: "MOR", background: true, valueHintEur: 60 },
    { number: 198, name: "DPD-Versanddaten-Spezialist", role: "Logistik-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft DPD-Versand- und Trackingdaten", tool: "MOR", background: true, valueHintEur: 60 },
    { number: 199, name: "DATEV- & Payment-Spezialist", role: "Finanz-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Koordiniert geprüfte DATEV- und Zahlungsdaten", tool: "FIN", background: true, valueHintEur: 90 },
    { number: 200, name: "OAuth-Token-Wächter", role: "API-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Überwacht OAuth-Token-Status und Refresh-Ergebnisse", tool: "HEL", background: true, valueHintEur: 50 },
    { number: 201, name: "API-Änderungsbeobachter", role: "API-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Dokumentiert erkannte API- und Feed-Abweichungen", tool: "HEL", background: true, valueHintEur: 50 },
    { number: 202, name: "Developer-Korrespondent DE/EN", role: "API-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Bereitet sachliche Entwickleranfragen auf Deutsch und Englisch vor", tool: "SUP", background: true, valueHintEur: 50 },
    { number: 203, name: "Feed-Qualitätsprüfer", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Feed-Felder auf Vollständigkeit und Datenqualität", tool: "MST", background: true, valueHintEur: 60 },
    { number: 204, name: "Bestands- & Auftragsabgleicher", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Gleicht verfügbare Bestands- und Auftragsdaten ab", tool: "MOR", background: true, valueHintEur: 70 },
    { number: 205, name: "Plattform-Zugriffs- & Compliance-Prüfer", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Prüft Berechtigungsumfang und dokumentierte Plattformvorgaben", tool: "RUL", background: true, valueHintEur: 50 },
    { number: 206, name: "Kleinanzeigen- & Anzeigen-Freshness-Manager", role: "Plattform-Spezialist", departmentId: 25, level: 4, reportsTo: 186, mission: "Bereitet sichere, manuelle Anzeigen-Erneuerungspakete nur für Artikel mit Bestand vor", tool: "MST", background: true, valueHintEur: 80 },
    { number: 207, name: "Google-Business- & Regional-SEO-Leiter", role: "Abteilungsleiter", departmentId: 26, level: 3, reportsTo: 160, mission: "Bereitet regionale Unternehmensbeiträge und SEO-Entwürfe zur Freigabe vor", tool: "EXP", background: true, valueHintEur: 100 },
    { number: 208, name: "Markt-, Messe- & Event-Scout Bayern/DACH", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet verifizierte Messe- und Event-Bewerbungen samt Packlisten vor", tool: "BRF", background: true, valueHintEur: 70 },
    { number: 209, name: "Werkstatt- & Beratungstermin-Koordinator", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet Terminbestätigungen, Fragebögen und Kalenderdaten vor", tool: "CON", background: true, valueHintEur: 70 },
    { number: 210, name: "Reparatur- & Kulanz-Manager", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet Kostenvoranschläge und Werkstatt-Laufzettel auf Basis erfasster Auftragsdaten vor", tool: "BSP", background: true, valueHintEur: 80 },
    { number: 211, name: "Werkstatt-Verbrauchsmaterial-Disponent", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Erstellt Nachbestelllisten aus bestätigten Werkstattbeständen und Mindestmengen", tool: "INV", background: true, valueHintEur: 70 },
    { number: 212, name: "Inventur- & Versicherungswert-Auditor", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Stellt Bestands- und dokumentierte Wiederbeschaffungswerte zusammen", tool: "PRF", background: true, valueHintEur: 80 },
    { number: 213, name: "Anlass-, Vereins- & Jubiläums-Radar", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet saisonale Gravurpakete und angeforderte B2B-Entwürfe vor", tool: "CON", background: true, valueHintEur: 80 },
    { number: 214, name: "Regionalpresse- & Handwerks-PR-Redakteur", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Verfasst freigabepflichtige Pressemitteilungen und Story-Pitches", tool: "LST", background: true, valueHintEur: 60 },
    { number: 215, name: "Unikat-Alternativen-Concierge", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet passende Alternativangebote anhand tatsächlich verfügbarer Artikel vor", tool: "CON", background: true, valueHintEur: 70 },
    { number: 216, name: "B2B-Rechnungs- & Mahnwesen-Assistent", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet Zahlungserinnerungen vor; Versand bleibt einzeln freigabepflichtig", tool: "FIN", background: true, valueHintEur: 70 },
    { number: 217, name: "Upcycling- & Geschenkset-Kombinierer", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Schlägt Geschenksets nur aus bestätigten Beständen vor", tool: "LST", background: true, valueHintEur: 70 },
    { number: 218, name: "Kundenfoto- & Testimonial-Einwilligungs-Koordinator", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Bereitet datensparsame Fotoanfragen vor und prüft dokumentierte Einwilligungen", tool: "SUP", background: true, valueHintEur: 50 },
    { number: 219, name: "DACH-Juwelier- & Gravur-Marktbeobachter", role: "Vorbereitungs-Spezialist", departmentId: 26, level: 4, reportsTo: 207, mission: "Vergleicht nur belegte Marktinformationen und kennzeichnet Datenstand und Quelle", tool: "MST", background: true, valueHintEur: 60 },
    { number: 220, name: "Chief 1-Click Preparation & Daily Briefing Officer", role: "Chief Vorbereitungs-Leitstelle", departmentId: 26, level: 4, reportsTo: 207, mission: "Bündelt vorhandene, offene Agenten-Entwürfe auf dem zentralen Fertig-Tisch", tool: "BRF", background: true, valueHintEur: 0 },
  ];
  for (const agent of addedAgents) {
    out.push(mk(
      agent.number,
      agent.name,
      agent.role,
      agent.departmentId,
      agent.level,
      agent.reportsTo,
      agent.mission,
      "Vorbereiteter Entwurf; Außenwirkung nur nach Inhaberfreigabe",
      agent.tool,
      null,
      agent.background,
      agent.valueHintEur
    ));
  }

  return out.sort((a, b) => a.number - b.number);
}

/** Alle 220 Stamm-KI-Mitarbeiter (#1–#220); #000 ist die separate Meta-Aufsicht. */
export const STAMM_AGENTS: AgentDef[] = buildStamm();
