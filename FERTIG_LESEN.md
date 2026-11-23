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
```

- `OWNER_SHOP_DOMAIN`: dieser Shop läuft dauerhaft kostenlos als **OWNER UNLIMITED (0,00 €)**.
- `DRY_RUN_MODE="true"`: Änderungen landen als Vorschau in der Freigabe-Warteschlange, bis Sie im Dashboard live schalten.
- `BILLING_LIVE="true"` erst setzen, wenn Sie echte Abos abrechnen wollen (bis dahin laufen Abos mit `test: true`, wie es Shopify-Reviewer brauchen).

## 2. Datenbank & Build
```
npx prisma validate
npx prisma generate
npx prisma db push
npm run typecheck
npm run appstore:check
npm run build
```
Falls `prisma generate` mit `EPERM` scheitert, laufen noch Node-Prozesse: `taskkill /F /IM node.exe /T` und wiederholen.

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
- **Im Repository vorhanden:** Prisma-Modelle, 220 Stamm-KI-Mitarbeiter (#1–#220) in 26 Abteilungen, separate Meta-Aufsicht #000 und dynamische Agenten ab #221, 3×-Prüfgremien, Freigabe-Warteschlange, Evolution mit Rollback, Verdienst-Journal, Dashboard mit Platine und Baukasten-Rechner, DSGVO-Webhooks (`/webhooks`, HMAC über `authenticate.webhook`), Billing über `appSubscriptionCreate` und Datenschutzseite `/privacy`. Die neuen Spezialisten sind im Roster sichtbar; ihre Rollenbeschreibung allein bedeutet keine angebundene externe Datenquelle oder fertige automatische Arbeitsergebnisse.
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

**Cloud (Render, Port 3000):** `Dockerfile` (Port 3000, Health-Check `/privacy`), `npm run start:prod` und `render.yaml` sind bereit. Geheimnisse tragen Sie im Render-Dashboard ein. **Kostenhinweis:** Der Gratis-Plan hat keine dauerhafte Festplatte. Mit SQLite gehen Daten bei jedem Neustart verloren. Für echten 0-€-Dauerbetrieb brauchen Sie eine Gratis-PostgreSQL (z. B. Neon) – das Prisma-Schema ist dafür noch **nicht** umgestellt.

**Hinweis Windows:** Steht in Ihrer Shell `NODE_ENV=production`, installiert `npm install` keine Dev-Pakete und `typecheck` scheitert. Vorher `$env:NODE_ENV=$null` setzen.
- **Sidekick-Limit:** aktuell genau 20 von 20 Tools.

## 7. Gesicherter Arbeitsstand – 23.11.2026

### Dashboard-Veredelung (letzter Arbeitsgang)

- Tabs werden über `?tab=overview|agents|earners|audits|factory|vault|platforms|rewards` gemerkt; ein reiner Tabwechsel lädt die Shop-Daten nicht erneut.
- Dashboard-Kopf und Kommandoübersicht trennen interne Agenten-Zuordnungen (Echt/Potenzial) vom Shop-Bestand. Demo-Bestand, UTC-Datenzeitpunkt, DB-`SELECT 1`-Ping und Node-Prozesslaufzeit sind sichtbar. Warenwert-/Gewinnwerte bleiben ausdrücklich Schätzungen auf Basis einer 19%-MwSt.-Annahme.
- Münzregen und Klang sind dekorativ, keine echten Einnahmen. Die Einstellung wird lokal gespeichert; bei gesperrtem Browser-Speicher erscheint ein Hinweis.
- Die Platine enthält den fünften Vorstandssitz #171, Info-Popovers, Abteilungs-Modulauswahl und Zoom-/Kompaktansicht. Der AtelierBot reserviert auf breiten Ansichten einen Seitenbereich; auf schmalen Ansichten wird er in den Seitenfluss gesetzt, statt Inhalte zu verdecken.
- Fertig-Tisch: Abteilungs-/Risiko-/Kategorie-Filter, getrennte #206-Titel-/Text-Kopie und erreichbare #206-Paketaktion. Eine echte Inseratsverlängerung wird nicht automatisch ausgelöst.
- Plattform-Cockpit: Portalverweise, DE/EN-Entwickleranfrage-Entwürfe (#202 laut tatsächlichem Roster; nicht #187) und ehrliche Adapter-Status. Nicht angebundene Dienste werden nicht als verbunden oder getestet ausgegeben.
- Werkstatt-Entwürfe können in einer shopbezogenen lokalen Browserwarteschlange vorgemerkt und manuell ins vorhandene Formular geladen werden. Die Daten sind unverschlüsselt, gerätegebunden und werden nicht automatisch synchronisiert; nach Übertragung löschen.
- Eigene Fachgebiets-Agenten werden zuerst als Kandidaten angelegt, nicht automatisch gestartet. Das Onboarding zeigt nur belegte Live-Bestandsdaten und weist Demo-Werte separat aus.
- Individuelle PDF-/DATEV-/Chargeback-/DPP-Downloads und der Brand-Customizer sind weiterhin offen: `VaultDocument`-/`ShopSettings`-Modelle und notwendige Quelldaten fehlen. Vorhandener xTool-Tagespaket-ZIP-Endpunkt bleibt nutzbar. Keine Platzhalter werden als echte Belege dargestellt.

### Validierung dieses Stands

- `npm run typecheck` – erfolgreich.
- `npm run build` – erfolgreich; nur React-Router-Zukunftshinweise.
- `npm run appstore:check` – erfolgreich, 34/34 statische Kriterien; Sidekick 20/20.
- Gezieltes ESLint für die geänderten TypeScript-/React-Dateien – erfolgreich.
- Kein Server wurde gestartet; keine Shopify-Live-Aktion oder Cloud-Migration ausgeführt.

### Wichtiger Sicherungs- und Git-Hinweis

- Das lokale `main` hat noch keinen Commit; der Arbeitsbaum zeigt Projektdateien als untracked. Daher sind die Änderungen **noch nicht durch Git versioniert oder gepusht**. Es wurde bewusst nichts pauschal gestaged oder committet: vor einem ersten Commit müssen untracked Konfigurationen und Dateien geprüft werden.
- `.env` ist lokal vorhanden und wird laut `.gitignore` ausgeschlossen. Sie niemals in ein Archiv, einen Commit oder eine Nachricht aufnehmen. `.env.example` ist als Vorlage ausgenommen. `.mcp.json` ist untracked und wurde nicht geprüft; vor einem Commit auf mögliche Zugangsdaten prüfen.
- Für eine dauerhafte externe Sicherung zuerst eine geprüfte private Git-Remote/Backup-Ziel festlegen und nur explizit geprüfte Dateien übernehmen. Keine Zugangsdaten in `FERTIG_LESEN.md` oder andere Dokumentation kopieren.
