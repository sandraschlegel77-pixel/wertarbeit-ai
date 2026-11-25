# AtelierPilot AI – Copilot-Arbeitsregeln

Diese Datei gilt für Änderungen in diesem Repository. Der vollständige fachliche Kontext, die Sidekick-Liste, Cloud-Vorgaben und der zuletzt geprüfte Ist-Stand stehen in [`docs/ATELIERPILOT_MASTER_BLUEPRINT.md`](../docs/ATELIERPILOT_MASTER_BLUEPRINT.md). Vor größeren Aufgaben zuerst dieses Blueprint und die betroffenen Dateien lesen. Anforderungen darin beschreiben teils Ziele, nicht automatisch bereits implementierte Funktionen.

## Projekt und Arbeitsweise

- Shopify-App für Wertarbeit Manufaktur, einen nachhaltigen Familienbetrieb in Neuburg an der Kammel, Bayern. Ton: warm, handwerklich, ehrlich und wertschätzend; keine austauschbaren KI-Floskeln.
- Aktueller Roster: #000 als separate Owner-only Meta-Aufsicht, 232 Kernprofile (#1–#232), 100 Apex-Profile (#301–#400) in 26 Abteilungen und dynamische Agenten ab #401. Bei bereits belegten Nummern zwischen #301–#400 bleibt das gespeicherte dynamische Profil bis zur Nummernmigration erhalten und verdeckt das gleich nummerierte Apex-Profil für diesen Shop. #220 zeigt nur persistierte Ausnahmefälle; keine Events oder Ergebnisse erfinden.
- Änderungen präzise und eng am Auftrag halten. Bestehende Funktionen, Daten und Dateien erhalten; nichts parallel zu Cline oder einem laufenden Build überschreiben. Vor Dateiänderungen den aktuellen Arbeitsbaum prüfen und fremde Änderungen integrieren.
- Keine Secrets in Code, Doku, Logs, Git oder URLs. Nur Variablennamen dokumentieren. `.env` niemals committen.
- Keine Commit-, Push-, Deploy-, Datenbank-Migrations- oder Löschoperation ohne ausdrücklichen Auftrag. Tests/Builds nicht parallel zu anderen Bearbeitungen starten.
- Bestehende Muster und Abhängigkeiten bevorzugen; verständliche Fehler statt stiller Fallbacks. Direkt betroffene Doku aktualisieren. Geänderte Funktionalität gezielt testen.
- Vor jedem `git commit` und `git push` zwingend `git status` und `git diff --cached` prüfen. Zusätzlich die Liste der gestagten Dateien kontrollieren und sicherstellen, dass weder `.env`, echte API-Keys/Tokens, `*.sqlite*` noch Kunden- oder andere vertrauliche Daten enthalten sind. Bei Zweifeln nicht committen oder pushen.
- Aussagekräftige, saubere Commit-Nachrichten pro Meilenstein verwenden (z. B. `feat: complete AI workforce and audit gates`). Für künftige Ausbauten das [`docs/ATELIERPILOT_MASTER_BLUEPRINT.md`](../docs/ATELIERPILOT_MASTER_BLUEPRINT.md) aktiv als zentrale fachliche Wahrheitsquelle heranziehen und bei bestätigten Änderungen aktuell halten.

## Technische Leitplanken

- React Router 7 für Loader, Actions und Routen; kein `@remix-run/node`.
- Shopify-API- und Plattformarbeit nach den aktuellen offiziellen Shopify-Entwicklungsrichtlinien durchführen. Shopify-Webhooks müssen HMAC-validiert werden.
- Shopify-Tarifgrenzen funktionsweisebezogen prüfen. Basic kann viele B2B-Funktionen unterstützen, aber nicht jede Plus-Funktion; direkte B2B-Katalogzuweisung und bestimmte Zahlungs-/Checkout-Funktionen können Plus-only sein. Keine Company-, Checkout-, Function- oder Multipass-Funktion ohne aktuelle Tarifprüfung voraussetzen.
- Shopify GraphQL Admin API nach Query-Kosten steuern, nicht anhand einer REST-Requestzahl. `extensions.cost.throttleStatus` auswerten, Last pro Shop/App begrenzen, Fehler mit begrenztem exponentiellem Backoff behandeln und Queries paginieren/vereinfachen. Keine unbegrenzte Parallelität oder ungemessenen großen verschachtelten Connections.
- Vor Aussagen zu Preisen, App-Store-Vermarktung oder Compliance tatsächliche Billing-Konfiguration, implementierte Features und Review-Anforderungen abgleichen. Planpreise im Code und Listing müssen übereinstimmen; Kennzahlen als echt oder simuliert kennzeichnen.
- PDFs mit `pdf-lib` und `StandardFonts.Helvetica`; kein `pdfkit`.
- Höchstens 20 Shopify-Sidekick-Tools. Zusätzliche Funktionen über `sub_action` innerhalb dieser Tools bündeln; keine zusätzlichen Tool-Deklarationen ohne vorherige Prüfung.
- Keine Storefront-Theme-Skripte, verbotenen Like-/Follow-Bots, Krypto-Mining, unerlaubte Cold-E-Mails oder externen Affiliate-Links vor dem Checkout. Keine Zahlung oder verbindliche Bestellung ohne explizite Inhaberfreigabe.
- `OWNER_SHOP_DOMAIN` und `DRY_RUN_MODE` sind zentrale Sicherheits-/Geschäftsregeln. Inhaberregeln haben Vorrang; neue schreibende Automatik muss Dry-Run, Veto und Freigabe berücksichtigen.
- Kleinanzeigen-Erneuerungen dürfen nie automatisiert geklickt oder verlängert werden. Vor einem Erneuerungsvorschlag muss Shopify-Bestand verifiziert größer als null sein; fehlende Plattform-, Event-, Kalender- oder Werkstattdaten dürfen nicht als geprüft dargestellt werden.
- Bei möglicher Parallelität, langen Aufgaben, Medienverarbeitung und Shopify-API-Aufrufen Ressourcen begrenzen; keine unbegrenzte Agenten- oder Job-Parallelität.
- Zielplattformen sind Windows lokal und später ein Linux-Docker-Container. Dateipfade für URLs/Downloads bei Bedarf mit `.replace(/\\/g, "/")` normalisieren.
- Keine unbelegten Aussagen über „Zero-Error“, Rechtskonformität, Gratisbetrieb oder garantierten 24/7-Betrieb. Anbieterlimits, Rechtsfragen, API-Versionen und Kosten anhand aktueller Quellen und realer Konfiguration prüfen.

## Sicherheits- und Datenschutzanforderungen

- Mandantendaten konsequent mit `shop` scopen. Owner-Vorteile dürfen ausschließlich dem exakt konfigurierten Inhaber-Shop zufallen.
- Datenschutz-Webhooks: `customers/data_request`, `customers/redact`, `shop/redact`; HMAC-Prüfung, nachvollziehbare Verarbeitung und Löschung/Export entsprechend den anwendbaren Anforderungen.
- Bei Deinstallation Shopify-Sessions des Shops sofort entfernen; Shop-Redaction getrennt und fristgerecht bearbeiten.
- Cron- und Monitor-Endpunkte mit starken, serverseitigen Secrets schützen. Secrets bevorzugt als Authorization-Header statt Query-Parameter übertragen, damit sie nicht in URLs/Logs landen.
- Shopify-Secrets, KI-Keys, Plattform-Tokens, Mail-Zugangsdaten, Kundendaten und Datenbank-URLs nie in Beispieldateien oder Testausgaben schreiben.

## Cloud-Zielbild und Nicht-Ziele

- Ziel: GitHub privat, Neon PostgreSQL, Render Docker Web Service und ein externer Cron-Taktgeber, möglichst ohne laufende Gebühren. Kostenlose Tarife können schlafen, Kontingente ändern oder eingestellt werden; ein Ping ist keine 24/7-Garantie.
- Vor Cloudbetrieb SQLite-Entwicklung und PostgreSQL-Produktion ausdrücklich unterscheiden. Prisma-Schema, Connection-Pooling, direkter Migrationszugang und Backup-/Restore-Verfahren vor einer Produktionsmigration validieren.
- Render-Dateisystem als flüchtig behandeln. Dokumente nur mit Größen-/Aufbewahrungskonzept persistent speichern; große Base64-Blobs und DB-Backups müssen Neon-Kontingente und Datenschutz berücksichtigen.
- Build-, Runtime- und Deploy-Befehle müssen tatsächlich in `package.json` und `Dockerfile` vorhanden sein. Keine `start:prod`- oder Healthcheck-Konfiguration behaupten, bevor sie implementiert und geprüft ist.
- Shopify `application_url`, OAuth-Redirects und Webhooks erst mit der finalen HTTPS-App-URL synchronisieren. Shopify-Webhooks mit relativen URIs wie `/webhooks` nicht ungeprüft durch absolute URLs ersetzen.

## Selbstlernen, Agentenwachstum und sichere Aktualisierung

- Qualität kontinuierlich verbessern, aber keine „Enterprise-Qualität“, Fehlerfreiheit, kostenlose Dauerverfügbarkeit oder selbstlernende Fähigkeiten behaupten, solange sie nicht anhand echter Tests und Daten belegt sind.
- Erfolgs-/Fehlerdaten und Promptversionen nur shopgetrennt, sparsam und datenschutzgerecht speichern. Kundendaten nicht als Lernmaterial übernehmen, sofern dafür keine zulässige Grundlage und Schutzmaßnahmen bestehen.
- Selbstoptimierung darf zunächst versionierte Vorschläge erzeugen. Keine automatische Änderung an Code, Berechtigungen, Preisen, Rechtsregeln, `OwnerRule`, `DRY_RUN_MODE`, Infrastruktur oder externen Aktionen ohne Tests, nachvollziehbaren Rollback und erforderliche Inhaberfreigabe.
- Dynamische Agenten nur aus geprüften Aufgaben-/Nischenvorschlägen erzeugen; keine unautorisierte Web-Erhebung oder API-Nutzung. Kandidatenstatus, Mandantentrennung, Obergrenzen und Kostenkontrolle beibehalten.
- Audit-Status nur als „3× geprüft“ bezeichnen, wenn tatsächlich drei unabhängige Prüfschritte ausgeführt und protokolliert wurden. Prompt-Hinweise nur als gelernt/aktiv bezeichnen, wenn sie beim nächsten Auftrag tatsächlich geladen werden.
- Der #000 Meta-Supervisor ist nur dann eine unabhängige Modell-Zweitprüfung, wenn der Lauf explizit `CROSS_MODEL` meldet. Ohne OpenRouter wird `LOCAL_RULES` ausgewiesen; lokale Regeln sind kein zweites KI-Modell. Die Prüfung erhält keine Kundeninhalte.
- Die shopbezogene Notfallpause (`GLOBAL_AI_PAUSE`) ist von `DRY_RUN_MODE` getrennt. Neue Mutations-, Mail-, Agenten- und Evolutionspfade müssen die Pause serverseitig prüfen; die Pause darf nie stillschweigend den Dry-Run ausschalten.
- ROI-Autopause ist auf dynamische Agenten mit mindestens fünf erfolgreichen Live-Läufen in 30 Tagen ohne zugeordnete Echt-Buchung begrenzt. Sie misst keine Zeitersparnis und darf nicht als vollständiger Agenten-ROI dargestellt werden.
- Undo nur anbieten, wenn ein konkreter, sicherer Rücknahmepfad existiert. Das Zurücksetzen eines Protokollstatus ist keine Rücknahme externer Shopify-, E-Mail- oder Marktplatzaktionen.

## Produkt- und Rechtsanforderungen

- Ring-/Unikat-Logik, Größen-/Materialangaben, Moissanit-/Silberkennzeichnung, personalisierte Gravuren und Retouren verständlich und wahrheitsgetreu darstellen.
- Für Preis-, Steuer-, Zoll-, Verpackungs-, Widerrufs-, Barrierefreiheits- und Verbraucherrecht keine Rechtsberatung vortäuschen. Anforderungen (u. a. PAngV, BGB, UWG, DSGVO, GPSR, BFSG, OSS, LUCID, ZUGFeRD/XRechnung, DATEV, CN22/CN23) vor produktiver Umsetzung aktuell fachlich prüfen.
- Etsy-Filter für Atelierbedarf beachten. Medienvorgaben: Studio-Bilder 2048×2048, Reels 9:16 mit GEMA-freier Musik, EXIF-Copyright und zugängliche Alt-Texte.
- Metriken zu Umsatz und Einsparungen klar als echt oder simuliert ausweisen. Keine fiktiven Umsätze als tatsächliche Erlöse darstellen.
- Für öffentliche App-Store-Vermarktung nur implementierte Funktionen und belegte Ersparnisse bewerben. Shopify-Basic-Kompatibilität, Datenschutz, Berechtigungen und Tariflimits konkret prüfen; ein grüner statischer Selbsttest ist keine vollständige App-Store- oder Rechtsfreigabe.
- Keine vollständige Impressums- oder Datenschutzkonformität behaupten, solange vollständiger Betreibername, ladungsfähige Anschrift, direkte Kontaktangaben, tatsächliche Hosting-/Aufbewahrungsdetails und die vollständigen Datenzugriffs-/Löschpfade nicht verifiziert sind. Fehlende rechtliche Stammdaten nie erfinden.
- Onboarding-Preisauswahl ist keine Shopify-Buchung. Planpreis und Listing müssen vor Release mit der tatsächlich bestätigten Shopify-Billing-Subscription abgeglichen werden.

## Intent-first-Marktplätze und Rollenrechte

- Die Bedienung soll vom Händlerwunsch ausgehen: Der Inhaber kann ein Ziel in Alltagssprache benennen und soll nicht selbst zuerst API-Verfügbarkeit, Portale oder technische Voraussetzungen recherchieren müssen. API-Schlüssel, Passwörter, OAuth-Tokens und Kundendaten gehören niemals in dieses Freitextfeld.
- `OWNER` wird ausschließlich mit `isOwnerShop(shop)` anhand der exakten konfigurierten Shopdomain erkannt. `SUBSCRIBER`-Rechte müssen serverseitig getrennt und zusätzlich durch die tatsächlich aktive Subscription/Module geprüft werden; UI-Ausblendung allein ist keine Autorisierung.
- Inhaber-Direktiven dürfen nur innerhalb sicherer, ausdrücklich erlaubter Fähigkeiten interpretiert werden. Subscriber-Wünsche für neue Funktionen oder Marktplätze dürfen Vorschläge erfassen, aber weder globale App-Konfiguration noch andere Shops verändern.
- Marktplatzwünsche müssen unabhängig von einer fest codierten Kanalliste erfasst werden können. Ein Katalogstatus darf „verbunden“ oder „verfügbar“ nur nach erfolgreicher, echter Konfiguration bzw. Prüfung melden; bloße Roster-Rollen, Portal-Links, kopierte Anfrageentwürfe und gespeicherte Wünsche sind kein Adapter und keine Recherche.
- Verfügbarkeits- und Compliance-Recherchen müssen auf nachvollziehbare offizielle Anbieter-/Entwicklerquellen gestützt werden und Quelle, Abruf-/Prüfdatum, Prüfumfang und Unsicherheit ausweisen. Mögliche Ergebnisse sind direkte API, offizieller Feed/Partner, manuelle Assistenz, offiziell nicht möglich oder unbestätigt. Ohne verlässliche Quelle bzw. verfügbare Recherchefähigkeit bleibt das Ergebnis ausdrücklich unbestätigt.
- Ein KI-Modell ohne dokumentierte Websuche darf nicht als Recherche-Agent ausgegeben werden. Ein fehlender Schlüssel, erschöpftes Kontingent, Netzwerkfehler oder nicht erreichbare Quelle darf weder als positive Prüfung noch als erfolgreiche Anbindung erscheinen. Kein Free-Tier-Angebot, 0-€-Betrieb oder unbegrenztes Kontingent ist garantiert.
- Reale API-/Feed-Anbindungen brauchen pro Plattform geprüfte Bedingungen, minimale Berechtigungen, sichere Tokenablage, Mandantentrennung, Rate-Limits, Idempotenz, begrenzte Retries, Dry-Run und nachvollziehbare Fehler. Außenwirkung erst nach erfüllten Plattformanforderungen und nötiger Inhaberfreigabe.
- „Automatisch ausführen“ gilt nur für eine tatsächlich implementierte und getestete Fähigkeit mit geklärten Berechtigungen, Kosten und Rücknahmepfad. Ausschließlich echte Ausführungsergebnisse dürfen als erledigte Mitarbeiterarbeit protokolliert werden.

## Ausbau und Quellenprüfung

- Das Zielbild von 400+ Stammprofilen ist keine Bestandsangabe. Vor dem Anlegen neuer Nummernbereiche müssen Nummernraum, bestehende IDs, Migrationen und Roster-Tests geprüft werden; bestehende IDs niemals stillschweigend neu nummerieren.
- Neue Agentenrollen benötigen konkrete, getestete Fachlogik und eine tatsächliche Schnittstelle, bevor sie als autonom ausführbar oder als erledigte Arbeit angezeigt werden. Ein Rollenname, Prompt oder Abteilungsdiagramm genügt nicht.
- Vom Nutzer gelieferte Gesetzesbezeichnungen, Schwellenwerte, Stichtage, Standards, API-Versionen und künftige Rechtsänderungen sind Prüfhinweise, keine verifizierten Tatsachen. Vor Code, UI-Aussagen, Steuerregeln oder automatischen Entscheidungen sind aktuelle offizielle Primärquellen und – bei Rechts-/Steuerwirkung – fachliche Prüfung erforderlich.
- Rechtliche, steuerliche oder produktbezogene Automatismen müssen Unsicherheit sichtbar machen und dürfen nicht als Beratung, verbindliche Prüfung oder Rechtskonformitätsgarantie bezeichnet werden. Unbekannte oder nicht verifizierte Fälle gehen in eine menschliche Prüfung statt in eine Erfolgsmeldung.

