# AtelierPilot AI – Startanleitung

## 1. `.env` ausfüllen
Legen Sie im Projektordner eine Datei `.env` an (Vorlage unten). Ohne KI-Schlüssel läuft die App trotzdem: die lokale Haus-KI übernimmt, und der Demo-Modus zeigt Beispieldaten.

```
GEMINI_API_KEYS="schluessel1,schluessel2"
GROQ_API_KEY="..."
OWNER_SHOP_DOMAIN="wertarbeitmanufaktur.myshopify.com"
DRY_RUN_MODE="true"
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET="..."
SHOPIFY_APP_URL="https://IHRE-DOMAIN"
SCOPES="read_products,write_products,..."
BILLING_LIVE="false"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atelierpilot?schema=public"
BRAND_SETTINGS_ENCRYPTION_KEY="64 zufaellige Hex-Zeichen, geheim und dauerhaft sichern"
```

- `OWNER_SHOP_DOMAIN`: dieser Shop läuft dauerhaft kostenlos als **OWNER UNLIMITED (0,00 €)**.
- `DRY_RUN_MODE="true"`: Änderungen landen als Vorschau in der Freigabe-Warteschlange, bis Sie im Dashboard live schalten.
- `BILLING_LIVE="true"` erst setzen, wenn Sie echte Abos abrechnen wollen (bis dahin laufen Abos mit `test: true`, wie es Shopify-Reviewer brauchen).

## 2. Datenbank & Build
```
npx prisma validate
npx prisma generate
# Nur nach Prüfung des Ziels und gesichertem Backup: db push kann Datenbankschema ändern.
npx prisma db push
npm run typecheck
npm run appstore:check
npm run build
```
Falls `prisma generate` mit `EPERM` scheitert, können laufende Node-Prozesse die Engine-Datei verwenden. Nicht alle Node-Prozesse pauschal beenden; erst konkrete Prozesse identifizieren und nur nach Freigabe gezielt schließen.

## 3. Deploy
```
npx shopify app deploy
```
Tragen Sie vorher in `shopify.app.toml` die echte `application_url` und `redirect_urls` Ihres Hostings ein (aktuell Platzhalter `https://example.com`).

## 4. Installation
Im Shopify-Partner-Dashboard die App auf `wertarbeitmanufaktur.myshopify.com` installieren. Das App-Icon liegt als `public/app-icon.png` (1200×1200) bereit.

## 5. Neue Geheimnisse in der `.env` (ohne sie sind die Endpunkte bewusst gesperrt)
```
CRON_SECRET="mindestens-16-zufaellige-zeichen"
MOBILE_MONITOR_TOKEN="mindestens-16-zufaellige-zeichen"
UNSUBSCRIBE_SECRET="optional – sonst wird SHOPIFY_API_SECRET verwendet"
STOREFRONT_URL="https://deine-shop-domain.de"
```
- **Cron (0 €):** Richten Sie bei einem kostenlosen Pinger (z. B. cron-job.org) alle 5 Minuten `GET https://IHRE-DOMAIN/api/cron` mit Header `Authorization: Bearer <CRON_SECRET>` ein.
- **Handy-Monitor:** Im Dashboard „QR-Code · Handy-Monitor“ öffnen und mit dem Handy scannen (QR 10 Min. gültig, danach 30 Tage angemeldet). Danach „Zum Startbildschirm hinzufügen“.
- **Geschenk-Botschaft:** `createGiftMessage()` in `app/services/gift.server.ts` erzeugt den Link `/gift/<token>`.
- **UWG-Abmeldelink:** `buildUnsubscribeUrl()` in `app/services/unsubscribe.server.ts` für Mails/Rechnungen.

## Ehrlicher Stand der Funktionen
- **Im Repository vorhanden:** Prisma-Modelle, 232 Kernprofile (#1–#232) plus 100 Apex-Profile (#301–#400) in 26 Abteilungen, Owner-only Meta-Aufsicht #000 und neue dynamische Agenten ab #401, 3×-Prüfgremien, Ausnahme-Freigabewarteschlange, Evolution mit Rollback, Verdienst-Journal, Dashboard mit sieben URL-Ansichten, interaktive Platine und Baukasten-Rechner, DSGVO-Webhooks (`/webhooks`, HMAC über `authenticate.webhook`), Billing über `appSubscriptionCreate` und Datenschutzseite `/privacy`. Die Fachprofile verwenden vorhandene Sidekick-Tools; neue Marktplatz-Adapter werden dadurch nicht automatisch bereitgestellt. Vor dem Produktivstart muss `npm run migrate:agent-numbers` eventuell vorhandene dynamische Agenten-IDs bis #400 auf #401+ verschieben; die Migration wurde nicht ausgeführt.
- **Zentraler Fertig-Tisch:** #220 aggregiert die tatsächlich vorhandene Freigabe-Warteschlange im Dashboard und `/mobile-monitor`. Eine Freigabe führt nur bei deaktiviertem `DRY_RUN_MODE`, ohne globale Pause und ohne passende aktive `OwnerRule` eine hinterlegte Sidekick-Aktion aus.
- **Verdienst-Anzeige:** „Echt“ erscheint erst, wenn über `bookRealRevenue` echte Bestelldaten verbucht werden. Bis dahin zeigt die App nur „Potenzial (Dry-Run)“ und rechnet nichts schön.
- **Neu und lauffähig (lokal getestet):** `/mobile-monitor` (PWA mit Münzregen, Ton-Schalter, Sprachbefehl, Freigaben), `/api/cron`, `/api/unsubscribe`, `/gift/<token>`, `/returns-portal`, `/.well-known/ucp`, `/shop.md`.
- **Jetzt gebaut (lokal getestet):** Mail-Autopilot, Geschenk-Formular, echte Verdienst-Buchung, vollständiges UCP-Profil (siehe Abschnitt 6).
- **Weiterhin offen:** Die Sidekick-Tools sind größtenteils noch Grundgerüste mit Platzhalter-Antworten. Der Mail-Versand wurde **nicht** gegen ein echtes Postfach getestet (nur die Schutzschichten und der „kein SMTP“-Pfad).

## 6. Neu: Mail-Autopilot, Verdienst, UCP, Cloud-Start

**Mail-Autopilot (`app/services/mail-transport.server.ts`, `gmail-autopilot.server.ts`, `gmail-replies.server.ts`)**
Läuft über `/api/cron` (alle 5 Min.). Reihenfolge je Mail: Abmelde-Blacklist → Betriebsferien → 7-Tage-Kontakt-Lock → Stilbuch → `DRY_RUN_MODE` → Versand. Ohne SMTP-Daten passiert nie ein Absturz.
- „Passt alles?“-Prüfmail: 15 Min. nach Bestellung plus 4–11 Min. Verzögerung, nur solange die Bestellung noch unversendet ist.
- Sendungs-Stau (>48 Std.): landet als Entwurf in der Freigabe-Warteschlange, Kunde erst nach Ihrer Freigabe.
- Warenkorb-Retter: höchstens 1 Mail je Warenkorb, 1–24 Std. nach Abbruch, mit Pflicht-Abmeldelink (§ 7 UWG). Benötigt `SHOPIFY_APP_URL`.
- Posteingang (IMAP): Antworten werden nur als **Entwurf** angelegt. Reklamation, Streit, Anwalt, Chargeback usw. lösen das **Sicherheits-Veto** aus (Risiko HIGH, keine Automatik).
- `.env`: entweder `GMAIL_USER` + `GMAIL_APP_PASSWORD` (Gmail-App-Passwort, nicht Ihr Kontopasswort) oder `SMTP_HOST/PORT/USER/PASS`. Betriebsferien: Inhaber-Regel `betriebsferien` = `2026-12-24..2027-01-06, 2027-08-01..2027-08-14`.
- Solange `DRY_RUN_MODE="true"` gilt, wird **keine** Mail versendet.

**Echte Verdienst-Buchung:** `orders/paid` bucht über `bookOrderRevenue` mit `isSimulated: false`. Aufteilung: 3 % des Netto-Warenwerts als interner Wertbeitrag auf die beteiligten Mitarbeiter (feste Regel in `revenue-booking.server.ts`, Gravur-Bestellungen anders gewichtet). Doppelte Webhooks buchen nicht doppelt. `checkouts/update` wird nur beobachtet (Potenzial), da noch kein Geld geflossen ist. Wichtig: Das ist eine **interne Zuordnung**, kein zusätzlicher Umsatz.

**UCP (`/.well-known/ucp`):** `ucp.version`, `services` und `payment_handlers` sind enthalten (Pflicht). Vier eigene, nur lesende Capabilities: Produktsuche, Manufaktur-Beratung, GRA-Prüfung, Ringgrößen-Hilfe. Der Namespace ergibt sich aus Ihrer `SHOPIFY_APP_URL` (Authority Binding). **Ohne `SHOPIFY_APP_URL` mit HTTPS-Domain werden bewusst keine Capabilities veröffentlicht.** Es gibt keinen eigenen Checkout und keine Zahlung. Hinweis: Shopify veröffentlicht für Ihren Shop selbst ein UCP-Profil mit Kauf-Funktionen. Mein Profil ergänzt das nur durch Beratungs-Dienste.

**Geschenk-Formular:** Dashboard → Tab 6 „Freigabe-Warteschlange & Tresor“ → „Digitale Geschenk-Botschaft“. Link und QR-Code erscheinen sofort.

**Secrets:** `node scripts/ensure-env.mjs` ergänzt fehlende oder zu kurze `CRON_SECRET`/`MOBILE_MONITOR_TOKEN` (32 Zeichen) und schreibt `.env.example`. Werte werden nie angezeigt. Das ist für diesen Rechner bereits geschehen.

**Cloud (Render, Port 3000):** `Dockerfile` (Port 3000, Health-Check `/privacy`) und `render.yaml` sind vorhanden. Das Prisma-Schema verwendet PostgreSQL über `DATABASE_URL`; in der lokalen `.env` fehlt diese Variable noch. Es wurde keine Neon-Datenbank bereitgestellt, kein SQLite-Bestand migriert und kein `prisma db push` oder Cloud-Deploy ausgeführt. Render Free hat keine dauerhafte Festplatte; produktive Daten brauchen eine erreichbare externe PostgreSQL-Instanz und einen geprüften Backup-/Migrations-/Restore-Plan. Gratis-Tarife garantieren weder 0 € Folgekosten noch 24/7-Verfügbarkeit.

**Hinweis Windows:** Steht in Ihrer Shell `NODE_ENV=production`, installiert `npm install` keine Dev-Pakete und `typecheck` scheitert. Vorher `$env:NODE_ENV=$null` setzen.
- **Sidekick-Limit:** aktuell genau 20 von 20 Tools.

## 7. Gesicherter Arbeitsstand – 24.11.2026

### Dashboard-Veredelung (letzter Arbeitsgang)

- Sieben Unterseiten werden über `?view=...` gemerkt; ältere `?tab=...`-Links bleiben kompatibel. Ein reiner Ansichtswechsel lädt die Shopdaten nicht erneut.
- Dashboard-Kopf und Kommandoübersicht trennen interne Agenten-Zuordnungen (Echt/Potenzial) vom Shop-Bestand. Demo-Bestand, UTC-Datenzeitpunkt, DB-`SELECT 1`-Ping und Node-Prozesslaufzeit sind sichtbar. Warenwert-/Gewinnwerte bleiben ausdrücklich Schätzungen auf Basis einer 19%-MwSt.-Annahme.
- Münzregen und Klang sind dekorativ, keine echten Einnahmen. Die Einstellung wird lokal gespeichert; bei gesperrtem Browser-Speicher erscheint ein Hinweis.
- Die Platine enthält den fünften Vorstandssitz #171, Info-Popovers, Abteilungs-Modulauswahl und Zoom-/Kompaktansicht. Der AtelierBot reserviert auf breiten Ansichten einen Seitenbereich; auf schmalen Ansichten wird er in den Seitenfluss gesetzt, statt Inhalte zu verdecken.
- Fertig-Tisch: Abteilungs-/Risiko-/Kategorie-Filter, getrennte #206-Titel-/Text-Kopie und erreichbare #206-Paketaktion. Eine echte Inseratsverlängerung wird nicht automatisch ausgelöst.
- Plattform-Cockpit: Portalverweise, DE/EN-Entwickleranfrage-Entwürfe (#202 laut tatsächlichem Roster; nicht #187) und ehrliche Adapter-Status. Nicht angebundene Dienste werden nicht als verbunden oder getestet ausgegeben.
- Werkstatt-Entwürfe können in einer shopbezogenen lokalen Browserwarteschlange vorgemerkt und manuell ins vorhandene Formular geladen werden. Die Daten sind unverschlüsselt, gerätegebunden und werden nicht automatisch synchronisiert; nach Übertragung löschen.
- Eigene Fachgebiets-Agenten werden zuerst als Kandidaten angelegt, nicht automatisch gestartet. Das Onboarding zeigt nur belegte Live-Bestandsdaten und weist Demo-Werte separat aus.
- Der Tresor erzeugt shop-authentifizierte Downloads aus vorhandenen Daten: Rechnungsdatenblatt, Steuerberater-Prüf-ZIP, DIN-A6-Karte, DPP-Datensatz-PDF, Chargeback-Checkliste, B2B-Briefentwurf und gespeicherte xTool-SVGs. Die Dokumente sind ausdrücklich nicht automatisch ZUGFeRD/PDF-A-konform, kein offizielles GRA-Zertifikat und keine Chargeback-Beweise.
- `ShopSettings` speichert Brand-Einstellungen shopbezogen. Das Logo ist PNG/JPEG bis 350 KB; Bankdaten liegen AES-256-GCM-verschlüsselt vor. Für Bankdaten muss `BRAND_SETTINGS_ENCRYPTION_KEY` als 32-Byte-Schlüssel gesetzt und sicher gesichert werden. Ein Schlüsselverlust macht vorhandene Bankdaten unlesbar.
- Agenten-Noten, Tendenz, XP, Rang und Akademie-Status sind eine transparente interne Heuristik aus Freigabe-Ergebnissen, Evolutions-Scores und echten Verdienstbuchungen. Ohne Evidenz wird keine Note vergeben. Approval-Trends verwenden mangels Auflösungszeitpunkt das Erstellungsdatum; daraus folgt keine Fach- oder Personalzertifizierung.
- `JudicialDecisionLedger` protokolliert ausschließlich manuell eingetragene interne Review-Schritte #221–#225 in Reihenfolge und verkettet sie per SHA-256. Die Hash-Kette prüft vorhandene Einträge, ist aber weder extern verankert noch gegen Löschen der letzten Einträge geschützt. Es gibt keine automatische Rechtsentscheidung oder Rechtsberatung.
- Die 60-Sekunden-Show zeigt einen gespeicherten Daten-Snapshot, keinen Live-Stream. Audio wird lokal über die Browser-Sprachausgabe erzeugt.
- #221–#232 bleiben serverseitig gesperrte Rollenprofile ohne eigene autonome Fachlogik. Das Ledger ist ein manuelles Prüfprotokoll; automatische Beförderungen und Prompt-Rollbacks nach Noten sind nicht implementiert.

### Validierung dieses Stands

- `npx prisma generate` – erfolgreich (Prisma 6.19.3, Binary-Engine).
- `npm run typecheck` – erfolgreich.
- `node --test scripts/agent-performance.test.mjs scripts/agent-roster.test.mjs` – 3 Tests erfolgreich.
- Gezieltes ESLint für die geänderten Dashboard-/Service-Dateien – erfolgreich.
- `npm run build` – erfolgreich; nur React-Router-Zukunftshinweise.
- `npm run appstore:check` – erfolgreich, 34/34 statische Kriterien; Sidekick 20/20.
- `git diff --check` – erfolgreich. Kein Serverstart, kein `prisma db push`, keine Shopify-Live-Aktion und keine Cloud-Migration.

## 8. Neue Metriken, internes Ledger und Tresor

- Die Note ergibt sich aus dem gleich gewichteten Mittel der verfügbaren Dimensionen: Erfolgsquote entschiedener Freigaben, mittlerer `AgentSkillEvolution.successScore` und positives/negatives Netto aus echten `AgentRevenueEntry`-Buchungen. Der Score 0–1 wird auf Note 6,0–1,0 abgebildet. Dry-Run-Buchungen zählen nicht als echte Einnahmen.
- Trend: Vergleich des zusammengesetzten Scores der letzten 30 Tage mit den vorherigen 30 Tagen; Änderung ab 0,05 ergibt ▲/▼, dazwischen ►. Für einen Zeitraum ohne Messwerte gibt es keinen Trend.
- XP: bestätigte Freigabe +25, Ablehnung +5, Evolution +10, echte Verdienstbuchung +10. Rangschwellen: 0/100/250/500/1.000/2.000 XP. Interner Akademie-Status: „zertifiziert“ bei mindestens 10 Ereignissen und Note ≤2,0; „Nachschulung“ ab 5 Ereignissen und Note ≥3,5; sonst Lernphase.
- Das Schema enthält `JudicialDecisionLedger` und `ShopSettings`. Die neuen Tabellen sind noch nicht in einer Datenbank angelegt, weil lokal keine `DATABASE_URL` konfiguriert ist. `npx prisma db push` erst gegen eine bestätigte, gesicherte PostgreSQL-Instanz ausführen.
- Die ZIP-Ausgabe ist ein Prüfpaket mit maximal 500 aktuellen Metadatensätzen je Liste und unverifizierten gespeicherten XML-/DATEV-Feldern, kein fertiger DATEV-Buchungsstapel. Rechnungs- und DPP-PDFs sind Datensatzentwürfe; fehlende Pflichtdaten werden nicht ergänzt oder erfunden.

### Wichtiger Sicherungs- und Git-Hinweis

- Der lokale Commit `f3e9893` enthält die PostgreSQL-Provider-Umstellung und Docker-Vorbereitung. Er wurde nicht gepusht. Die jetzt beschriebenen Dashboard-/Roster-Änderungen sind noch nicht committet.
- `.env` ist lokal vorhanden und wird laut `.gitignore` ausgeschlossen. Sie niemals in ein Archiv, einen Commit oder eine Nachricht aufnehmen. `.env.example` ist als Vorlage ausgenommen. `.mcp.json` ist untracked und wurde nicht geprüft; vor einem Commit auf mögliche Zugangsdaten prüfen.
- Für eine dauerhafte externe Sicherung zuerst eine geprüfte private Git-Remote/Backup-Ziel festlegen und nur explizit geprüfte Dateien übernehmen. Keine Zugangsdaten in `FERTIG_LESEN.md` oder andere Dokumentation kopieren.
