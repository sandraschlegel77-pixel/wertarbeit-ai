# AtelierPilot AI – Master-Blueprint

**Stand der Übergaben:** 24. November 2026
**Zweck:** Zusammenführung der fachlichen, technischen und betrieblichen Vorgaben aus den Projektübergaben. Dieses Dokument trennt **Zielbild** von **im Repository nachgewiesenem Ist-Stand**. Eine beschriebene Funktion gilt nicht allein durch ihre Erwähnung als implementiert, getestet oder rechtskonform.

## 1. Unternehmen und Marke

- **Shop/Inhaber:** `wertarbeitmanufaktur.myshopify.com`, öffentliche Marke `wertarbeitmanufaktur.com`.
- **Standort:** Neuburg an der Kammel, Bayern, Deutschland; nachhaltiger Familienbetrieb.
- **Sortiment:** Juwelier- und Edelsteinstücke, zertifizierter Moissanit mit GRA-Echtheitszertifikat und Online-QR-Prüfung, 925er Sterling Silber, Perlen, Uhren, xTool-Lasergravuren auf Schiefer/Holz/Metall sowie Atelierbedarf für Goldschmiede und Kreative.
- **Markenstimme (`BrandVoiceGuard`):** herzlich, handwerklich, ehrlich, wertschätzend; keine Massenkonzern-Sprache und keine typischen KI-Floskeln.
- **Unikate:** feste Ringgröße als einmalig verfügbares Einzelstück (DE/US/UK/mm) oder größenverstellbares Unikat klar unterscheiden. Bei Bestand `inventory === 0` ist eine zeitnahe Deaktivierung aller verbundenen Kanäle und ein Alternativ-Unikat-Finder gewünscht.
- **Kaufhilfe/Retouren:** freundliche mm-Messhilfe und Größeninformationen vor Kauf; „Passt alles?“-Prüfung etwa 15 Minuten nach Bestellung vor Versand; Selbstbedienungs-Umtauschportal `/returns-portal`. Versand und Kundenkontakt dürfen keine nicht implementierten Automationen vortäuschen.

## 2. Geschäftsmodell

### Inhaber-Shop

- `OWNER_SHOP_DOMAIN="wertarbeitmanufaktur.myshopify.com"` soll dauerhaft `OWNER UNLIMITED (0,00 €)` aktivieren.
- Owner-Status ausschließlich durch exakten Shop-Domain-Abgleich vergeben.
- `OwnerRule` hat höchste Regelpriorität; `DRY_RUN_MODE` ist standardmäßig sicher aktiviert. Änderungen mit Außenwirkung erfordern im Zweifel eine Inhaberfreigabe.

### Shopify App Store

Geplantes Prozessor-/Modulmodell:

- Core: 0,00 €.
- Einzelne Agenten/Module: 9,90–29,90 €/Monat, mit vorgesehenen Bündel- und Jahresrabatten.
- All-in-One: 249,90 €/Monat oder 2.499,00 €/Jahr; vorgesehene 14-tägige Testphase.
- Abrechnung über Shopify GraphQL Billing API (`appSubscriptionCreate`); Trial-/Test- und Live-Abrechnung vor Freischaltung gründlich verifizieren.
- Vorgesehene Plankennungen: `free_audit`, `starter_auto_listing`, `module_multichannel`, `module_invoices_zugferd`, `module_certificates_dpp`, `module_growth_concierge`, `all_in_one`; Partner-Referenz (`ref`) nachvollziehbar und datenschutzgerecht erfassen.

## 3. Unternehmensstruktur und Schutzmechanismen

Aktueller Roster: 232 Kernprofile (#1–#232) plus 100 Apex-Profile (#301–#400) in 26 Abteilungen; #000 ist Owner-only. Neue dynamische Agenten beginnen ab #401. Bestehende dynamische Profile in #301–#400 behalten bis zur Nummernmigration Vorrang vor den gleich nummerierten Apex-Profilen. Rollenbeschreibungen und vorhandene Sidekick-Zuordnungen belegen keine externe Plattformanbindung oder automatisch erzeugte Arbeitsergebnisse.

- **Ebene 0:** Inhaber, `OwnerRule`, `DRY_RUN_MODE`, Handy-Monitor `/mobile-monitor`.
- **Ebene 1:** Vorstand #158–#161 und #171: CEO, CFO/CRO, COO/CCO, AI Evolution, General Counsel.
- **Ebene 2:** Direktoren #153–#157.
- **Ebene 3:** Abteilungsleitungen #133–#152 sowie Abteilungen 21–26.
- **Ebene 4/5:** Teamleiter #1–#66, Co-Agenten #67–#132 sowie Fach- und Plattformrollen #162–#232; #221–#232 sind derzeit nicht ausführbare Rollenprofile.
- **Abteilungen 16–20:** vorgesehene Hintergrund- und Zusatzumsatzprozesse (Post-Checkout, Ratgeber/Affiliate, Downloads, Gebühren-/Versand-Rückforderungen, Fördermittel, B2B, Edelmetall-Restwert, Pflege).
- **Abteilungen 21–23:** drei Prüfbereiche – Recht (`LEGAL_VERIFIED_3X`), Finanzen/Steuern (`FINANCE_VERIFIED_3X`), Meisterwerkstatt (`CRAFT_VERIFIED_3X`).
- **Abteilung 24:** Orchestrierung, Anti-Kollision, Harmonie- und Speed-Messung.
- **Abteilung 25 (#186–#206):** Plattform-/API-Armada für Marktplatz-, Feed-, Bestands-, Versand-, DATEV-/Payment- und Zugriffsprüfungen; #206 bereitet manuelle Kleinanzeigen-Erneuerungspakete vor. Automatisches Auslesen von Ablauf-/Aufrufdaten oder Verlängern auf Kleinanzeigen ist nicht implementiert.
- **Abteilung 26 (#207–#220):** Google-Business-/Regional-SEO, Event-, Werkstatt-, Inventur-, B2B-, PR- und Vorbereitungsrollen. #220 aggregiert die vorhandene `ApprovalQueueItem`-Freigabewarteschlange im 1-Klick-Fertig-Tisch. Google-Business-, Messe-, Kalender-, Rohmaterial-, Versicherungs-, Kundenfoto- und Wettbewerbsquellen sind nicht automatisch angebunden; ohne verifizierte Daten werden keine Einträge erfunden.
- **Apex-Rollenprofile (#221–#232):** Gegenspieler, vier interne Prüfprofile, Akademie-/Prompt-Profile, UI/UX-, API-, Experiment-, Saison- und Audio-Briefing-Profile. Sie sind als nicht ausführbar gesperrt, bis fachliche Implementierung, Messdaten und nötige Freigaben vorhanden sind; sie sind keine Gerichte oder Rechtsberatung.
- **Weiterentwicklung:** `AgentSkillEvolution` mit Versionen/Rollback; dynamisches Wachstum über `DynamicAiAgent` ab #401. Vor dem Produktivstart muss `npm run migrate:agent-numbers` eventuell vorhandene dynamische Nummern bis #400 und deren Schlüsselverweise transaktional verschieben; das Skript wurde hier nicht ausgeführt.
- **Verdienst:** `AgentRevenueEntry`/`bookRealRevenue`; reale Werte getrennt von Dry-Run-/Potenzialwerten für Monat und Gesamtzeitraum ausweisen.
- **Prüf- und Freigabeschutz:** Faktenprüfung gegen Shop-Daten, 7-Tage-Anti-Spam-Lock, BrandVoiceGuard, `ApprovalQueueItem`, nachvollziehbare Aktionen und Undo, wo fachlich sicher.
- Keine Zahlungen oder verbindlichen Bestellungen ohne explizite Inhaberfreigabe. Überschriften wie „24/7“ oder „vollautomatisch“ sind kein Beleg für implementierte Funktion.

## 4. Shopify Sidekick: feste Obergrenze von 20 Tools

Neue Funktionen müssen innerhalb dieser 20 Werkzeuge über `sub_action` gebündelt werden. Keine zusätzliche Tool-Deklaration ohne vorherige Prüfung der Grenze.

| Nr. | Tool | Typ | Dispatcher-Pfad |
|---:|---|---|---|
| 1 | `learn_and_audit_brand_dna` | data | `/api/sidekick/brand/audit-dna` |
| 2 | `auto_create_styled_listing_and_media` | action | `/api/sidekick/catalog/auto-styled-listing` |
| 3 | `generate_and_upgrade_product_media` | action | `/api/sidekick/catalog/media-upgrade` |
| 4 | `expand_storefront_collections_and_seo` | action | `/api/sidekick/brand/expand-store` |
| 5 | `sync_bilingual_ucp_and_webmcp` | action | `/api/sidekick/catalog/bilingual-ucp` |
| 6 | `get_marketplace_health_and_trends` | data | `/api/sidekick/marketplace/status` |
| 7 | `full_multichannel_autopilot_sync` | action | `/api/sidekick/marketplace/autopilot-sync` |
| 8 | `sync_orders_and_tracking_autopilot` | action | `/api/sidekick/marketplace/sync-orders` |
| 9 | `assign_and_verify_gra_certificates` | action | `/api/sidekick/jewelry/gra-certificates` |
| 10 | `process_bespoke_unikat_orders` | action | `/api/sidekick/jewelry/bespoke-orders` |
| 11 | `get_certificate_dpp_and_evidence_vault` | data | `/api/sidekick/jewelry/vault` |
| 12 | `autonomous_pricing_and_profit_guard` | data | `/api/sidekick/finance/profit-guard` |
| 13 | `smart_inventory_bundles_and_reorder` | action | `/api/sidekick/inventory/smart-ops` |
| 14 | `optimize_and_ab_test_listings` | action | `/api/sidekick/catalog/growth-ab-test` |
| 15 | `get_daily_operations_briefing` | data | `/api/sidekick/ops/briefing` |
| 16 | `run_full_system_self_heal_and_backup` | action | `/api/sidekick/ops/self-heal` |
| 17 | `manage_company_rules_and_brand_dna` | action | `/api/sidekick/ops/rules` |
| 18 | `manage_invoices_zugferd_and_datev` | action | `/api/sidekick/finance/invoices` |
| 19 | `run_vip_concierge_and_repeat_buyer` | action | `/api/sidekick/marketing/concierge` |
| 20 | `draft_support_and_analyze_returns` | action | `/api/sidekick/support/ops` |

Die aktuelle statische Selbstprüfung meldete 20/20 registrierte Handler. Das allein bestätigt weder eine echte Shopify-Extension noch, dass alle Handler fachlich fertig sind.

Die Werkzeuge gehören zu fünf Intents: `brand_dna_and_auto_listing`, `multichannel_self_healing_sync`, `gra_certificates_and_bespoke`, `autonomous_finance_and_growth`, `ops_invoices_and_concierge`. Für die Extension sind `sub_action`, `query` und `force_override` als geeignete Eingaben vorgesehen. Ein 30-Sekunden-Audit und ein App-Store-Demo-Modus sind gewünschte UX-Funktionen, keine belegte Vollautomatik.

## 5. Produktfunktionen und fachliche Anforderungen

### Produkte, Ringe und Medien

- Feste Ringgrößen und verstellbare Unikate getrennt beschreiben; Maße in mm und passende DE/US/UK-Größen verständlich angeben.
- Vor Kauf Messhilfe und Größenhinweise; Einzelstück bei Nullbestand kanalübergreifend sperren und Alternative anbieten, sofern echte API-Integrationen vorhanden sind.
- Studio-Bilder 2048×2048 auf weißem Grund; Reels 9:16 nur mit GEMA-freier Musik. EXIF-Copyright „Wertarbeit Manufaktur“ und barrierefreie Alt-Texte.
- Startseite schlicht mit Weißraum und 3–4 Highlight-Bereichen; Informationsarchitektur Startseite → Hauptkategorie → Unterseite → Unter-Unterseite. Monatlicher Geburtsstein-Wechsel nur nach Prüfung des tatsächlichen Shopify-Design-Syncs.
- xTool-Einzel- und B2B-Serien-SVGs, Namenlisten, Live-Vorschau, fünf Gravurtext-Vorschläge sowie Material-/Fehlerprüfung sind Zielanforderungen; keine Verfügbarkeit behaupten, solange die Workflows fehlen.

### Personalisierung, Versand und Retouren

- Gravurtext, Material und Produktionsdaten validieren. Auf den behaupteten Widerrufsausschluss bei kundenspezifischer Anfertigung (§ 312g Abs. 2 Nr. 1 BGB) im Checkout, in Bestätigung und Retourenportal hinweisen, aber aktuelle Anwendbarkeit fachlich prüfen.
- Vorgesehene 15-Minuten-Prüfmail, Paketstau-Warnung nach 48 Stunden und Versand-/Alternativartikel-Logik sind nur produktiv, wenn Mail-, Shopify- und Queue-Flows tatsächlich funktionieren.
- Offline-Queue im Handy-Monitor per `localStorage` ist geplant; lokale Daten können verloren gehen und sind keine dauerhafte Cloud-Sicherung.

### Dashboard, PWA und Dokumenten-Tresor

- Dashboard-Ziel: Autopilot-/OwnerRule-Zentrale, Dry-Run-Schalter, Warnungs-Override, Live-Protokoll/Undo, Onboarding, Demo-Modus, ROI-Zähler mit Echt-/Potenzialtrennung, KI-Mitarbeiter-/Abteilungsansicht, Modul-Kacheln, Tooltips und Sidekick-Einstiege.
- **AtelierBot im Dashboard:** Der schwebende, einklappbare, regelbasierte Baukasten-Assistent stellt drei Fragen zu Shop-Typ, Zeitfresser und Startstrategie; ein externer KI-Aufruf ist dafür nicht nötig. Er empfiehlt Module, zugeordnete Abteilungen/KI-Mitarbeiter, den aus `calcQuote` berechneten Preis und eine als grobe Schätzung gekennzeichnete Wochen-Zeitersparnis. Die Übernahme setzt nur die Modulauswahl im Preisrechner; sie aktiviert kein Abo und löst keine Abrechnung aus. Für den Inhaber-Shop gilt `OWNER UNLIMITED – 0,00 €`.
- PWA `/mobile-monitor`: QR-Login mit `MOBILE_MONITOR_TOKEN`, Freigaben, Web-Speech, Ton-/Münzanimation, optional Telegram-Push und Offline-Queue. Sicherheits- und Browserberechtigungen transparent behandeln.
- Tresor-Downloads sind shop-authentifiziert und nutzen vorhandene `Invoice`-, `GraCertificate`- und `XtoolSvg`-Daten sowie Brand-Einstellungen. Verfügbar sind Rechnungsdatenblatt, Steuerberater-Prüf-ZIP, DIN-A6-Karte, DPP-Datensatz-PDF, Chargeback-Checkliste, B2B-Briefentwurf und gespeicherte xTool-SVGs. Die Vorlagen sind ausdrücklich keine normkonformen ZUGFeRD-/XRechnungen, offiziellen GRA-Zertifikate, DATEV-Buchungsstapel oder Chargeback-Beweise.
- **Guthaben-, Bonus- & Gratisprodukt-Tresor:** `CapturedReward` hält pro Shop zehn Vorteilsarten mit Schätzwert, tatsächlichem Eingang, Nachweis, Link/Code, Anfrageentwurf und Status (Prüfung → geprüft → beantragt → erhalten). Der Chancen-Assimilator nutzt eine lokale Stichwort-Zuordnung; Links werden nicht abgerufen. Der Cron-Lauf (`/api/cron?job=silent-revenue-sweep`) erzeugt nur aus lokalen Bank-CSV-Gebührenabweichungen unverifizierte Prüffälle. Versand-, Anbieter-, Förder-, Werbe-, Affiliate-, Edelmetall-, Muster- und Sponsoring-Konten sind nicht verbunden; der Lauf stellt dort keine Ansprüche fest und versendet/beantragt nichts.
- Der Export erhaltener Vorteile ist eine shop-authentifizierte CSV-Prüfliste für den Steuerberater, **kein DATEV-Buchungsstapel**. Der Status „erhalten“ dokumentiert die Händlerbestätigung; Steuerart, Kontierung und mögliche Umsatzsteuer bleiben offen und werden nicht automatisch gebucht.
- `ShopSettings` speichert Logo, Brand-Farben, Stil, Grußformel und verschlüsselte Bankdaten. Ein separates `VaultDocument`-Dateispeichermodell gibt es nicht; PDFs/ZIPs werden aus vorhandenen Quelldaten bei Abruf generiert.

### Content, Haus-KI und Marktplätze

- Geplante Inhalte: DE/EN-Listing-Texte mit cm/inch, Studio-/Weißbilder, sichere Video-Fallbacks, SEO/Kollektionen, UCP, `Shop.md`, `llms.txt`, WebMCP-Juwelierberater, Geburtsstein-/Mondphasen-Kalender und 7-Tage-A/B-Tests.
- Lokale Haus-KI: MiniSearch plus lokales TF-IDF-Gedächtnis (`AiKnowledgeMemory`); optionale Cloud-Modelle rotieren nur verfügbare, autorisierte Kontingente. Lernkorrekturen müssen nachvollziehbar und pro Shop getrennt sein.
- Marktplatz-Zielsysteme: Etsy (nur Atelierbedarf-Filter), eBay, Kaufland; außerdem als spätere Integrationen Amazon SP-API, Otto/Hood, Google, Pinterest, Meta, TikTok, YouTube und Versanddienstleister. Adapter, OAuth-Refresh, API-Limits, Idempotenz, Sync-Locks und `DRY_RUN_MODE` sind erforderlich.
- Plattformstatus-/Trendscout, Community-/Influencer-Scans und automatische API-Anpassungen sind keine freigegebene Außenwirkung. Änderungen an Produkten, Preisen, Bestellungen oder Nachrichten benötigen passende Risiko-/Freigaberegeln.

### Steuer, Zoll, Verpackung und Preise

- Zielanforderungen: ZUGFeRD/XRechnung, DATEV, CN22/CN23, Firmenlogo, Steuerberater-ZIP, EU-OSS-Warnungen (Planwerte 8.500 €/10.000 €), LUCID-Gewichtserfassung, B2B-USt-IdNr.-Prüfung und Staffelpreise.
- § 11 PAngV (30-Tage-Tiefstpreis) vor Rabatten/Streichpreisen berücksichtigen.
- Shopsteuer, Rechnungs-, Zoll-, OSS- und Verpackungsregeln sind vor produktivem Einsatz steuerlich/rechtlich zu verifizieren; Schwellenwerte oder Rechtsausnahmen nicht als dauerhaft gültig festschreiben.

## 6. Plattform-, Datenschutz- und Betriebsregeln

- Shopify Basic, React Router 7, eingebettete App; OAuth/Session-Verwaltung über das offizielle Shopify-Paket.
- Keine Theme-/Storefront-Skripte; keine verbotenen Like-/Follow-Bots, kein Mining, kein unerlaubter Cold-E-Mail-Spam; Affiliate-Empfehlungen nicht vor Checkout.
- Etsy-Angebote nur für zulässigen Atelierbedarf. Marktplatz-APIs benötigen echte Freigaben, Tokens, Rate-Limits, Idempotenz und sichere Fehlerbehandlung.
- DSGVO-Webhooks: `customers/data_request`, `customers/redact`, `shop/redact` mit HMAC. `app/uninstalled` soll Sessions sofort löschen; `shop/redact` führt die Shop-Datenlöschung nach Shopify-Ablauf aus. Kundenanfragen müssen real exportiert bzw. gelöscht werden, nicht nur protokolliert.
- Abmeldungen über `/api/unsubscribe` mit signiertem Token und sofortiger Blacklist; E-Mail-Versand muss rechtlich zulässig und opt-out-sicher sein.
- Keine externe Skriptlast im Storefront. UI mit Filter/Paginierung und asynchroner Arbeit statt synchroner Verarbeitung großer Agentenlisten.

## 7. KI, Kosten und Betriebsversprechen

Geplante optionale Modellanbieter: `GEMINI_API_KEYS`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` (nur Free-Kontingente, falls verfügbar) sowie lokale Haus-KI. Die App soll ohne externe KI-Schlüssel startbar bleiben; fehlende Anbieter müssen transparent und ohne Erfolgssimulation behandelt werden.

0,00 €/Monat und 24/7 sind **Ziele, keine garantierten Eigenschaften**. Free-Tier-Kontingente, Schlafverhalten, Quoten, Limits, Datenaufbewahrung und Anbieterbedingungen können sich ändern. Fallbacks müssen getestet sein und dürfen keine Datenverluste, doppelten Aktionen oder stillen Fehlschläge verursachen. Kein automatischer Anbieterwechsel mit unerwarteten Kosten.

Vorgesehener Überlebens-Watchdog: Latenz, RAM, DB-Verfügbarkeit und API-Quoten überwachen; Migrations-/Umzugspaket vorbereiten, aber Anbieterwechsel, kostenpflichtige Ressourcen oder produktive Migrationen nur nach Inhaberfreigabe. Automatisch erzeugte Docker-/Provider-Konfiguration ist zu reviewen und zu testen.

## 8. Cloud-Zielarchitektur

### Neon PostgreSQL

- Produktionsschema soll `provider = "postgresql"` und `url = env("DATABASE_URL")` verwenden; optional getrennte `DIRECT_URL` nur bei sauberer Prisma-Konfiguration.
- Erwartete Variablen: `DATABASE_URL` (TLS/SSL erforderlich), optional `DIRECT_URL`. Pooler-Parameter (`-pooler`, `pgbouncer`, `connect_timeout`) nach Prisma-Version und Neon-Verbindungstyp validieren; keine pauschale URL übernehmen.
- Vor Migration: DB-Snapshot/Backup, Schema-Validierung, SQLite→PostgreSQL-Kompatibilität und Wiederherstellung testen. `prisma db push` nur nach Prüfung des Zielsystems; es ersetzt keine geplante Produktionsmigration.
- Das App-Schema verwendet PostgreSQL über `DATABASE_URL`; auch lokale Entwicklung benötigt daher eine erreichbare PostgreSQL-Instanz. SQLite-Dateien sind keine unterstützte Laufzeitdatenbank dieses Schemas.

### Persistenz und Backups

- Render-Dateisystem ist als flüchtig zu behandeln.
- `ShopSettings.invoiceLogoBase64` ist vorhanden; der Upload ist auf PNG/JPEG und 350 KB begrenzt. Bankdaten werden AES-256-GCM-verschlüsselt; `BRAND_SETTINGS_ENCRYPTION_KEY` muss als 32-Byte-Schlüssel gesetzt und gesichert werden. Ein separates `VaultDocument`-Modell für dauerhafte PDF-/SVG-Ablage ist nicht vorhanden.
- Tägliches komprimiertes JSON-/Konfigurationsbackup und Neon Point-in-Time-Restore sind Ziele. Backups dürfen nicht nur als `BackupLog`-Zeile mit Pfad/Größe protokolliert werden; tatsächliche Erstellung und Restore müssen getestet werden.

### Render Docker Service

- Ziel: Port 3000, Healthcheck, Prisma Client, `sharp` und ffmpeg. Paket-/Docker-Kommandos müssen mit den realen Scripts übereinstimmen.
- Für 512-MB-RAM-Ziel Medienjobs seriell/limitiert betreiben; `sharp.cache(false)` und `sharp.concurrency(1)` nur dort konfigurieren, wo Sharp tatsächlich verwendet wird. ffmpeg-Läufe mit Zeit-, Speicher- und Dateigrößenlimits absichern.
- Multi-Stage-Build erwägen, Build-Werkzeuge nur in der Build-Stufe; Runtime benötigt vollständige Produktionsabhängigkeiten und Prisma-Client. `NODE_OPTIONS=--max-old-space-size=460` ist kein Schutz vor Gesamtprozess-OOM und muss mit nativen Speichernutzung/Containerlimit getestet werden.
- Healthcheck soll schnell und unabhängig vom Cronjob antworten. Root-Route `/` war zuletzt ein leichter Loader-Kandidat; eine echte HTTP-Prüfung steht aus.

### Cron und Taktgeber

- `/api/cron` ist mit `CRON_SECRET` zu schützen. Ziel: fünfminütiger Takt, kurze Antwort, kleine/gebündelte Hintergrundarbeit. Secrets möglichst im Authorization-Bearer-Header statt Query-String übertragen.
- Cron-Aufgaben: OAuth-Refresh, Prüfmail-Queue, Paketstau, DB-/Latenz-Watchdog, wöchentliche Trend-/Evolutionläufe. Keine unkontrollierten parallelen Jobs.
- Der externe Cronjob ist für fünf Minuten vorgesehen. Davon getrennt ist im Server-Start ein interner `node-cron`-Autopilot im Zehn-Minuten-Takt sowie tägliche 23-Uhr-Backup- und wöchentliche Log-/Backup-Rotation geplant. Nur einen tatsächlichen, idempotenten Scheduler pro Aufgabe aktivieren; mehrere Render-Instanzen können Singleton-Guards im Prozess umgehen.
- `Promise.race`-Timeouts beenden die zugrunde liegenden Promises nicht automatisch. Antwortzeit und Prozesslast müssen gemessen werden; ein Timeout darf nicht als erfolgreicher Abschluss dargestellt werden.
- Ein externer Ping kann Free-Services wach halten, garantiert aber keine permanente Verfügbarkeit und ersetzt keinen Healthcheck.

### Shopify-Konfiguration

- `shopify.app.toml` soll App-Name, bestehende `client_id`, Build-Einstellungen, Scopes, API-Version, Sidekick-Zusammenfassung und app-spezifische Webhooks konsistent enthalten.
- Vorgesehene Webhook-Themen beinhalten Produkt-, Inventar-, Bestell-, Rückerstattungs- und `app/uninstalled`-Ereignisse plus die drei Compliance-Themen. Für app-spezifische Shopify-Webhooks werden relative URIs wie `/webhooks` verwendet.
- API-Version in TOML und im Shopify SDK muss zusammenpassen und vor Deployment mit der aktuellen Shopify-Version geprüft werden.

## 9. Environment-Variablen (nur Namen, niemals Werte in Git)

**Pflicht/Cloud:** `NODE_ENV`, `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SCOPES`, `SHOPIFY_APP_URL`, `DATABASE_URL`, optional `DIRECT_URL`, `OWNER_SHOP_DOMAIN`, `DRY_RUN_MODE`, `CRON_SECRET`, `MOBILE_MONITOR_TOKEN`.

**Optionale KI/Push:** `GEMINI_API_KEYS`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

**Optionale E-Mail:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `IMAP_HOST`, `IMAP_USER`, `IMAP_PASS`.

**Optionale Plattformen:** `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_REFRESH_TOKEN`, `ETSY_API_KEY`, `KAUFLAND_CLIENT_KEY`, `KAUFLAND_SECRET_KEY`, `PINTEREST_ACCESS_TOKEN`, `META_ACCESS_TOKEN`.

**Neue Konnektoren:** `GOOGLE_SHEETS_WEBHOOK_URL`, `GOOGLE_SHEETS_WEBHOOK_SECRET`, `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_ID`.

Weitere optionale Konfiguration aus den Übergaben: `BILLING_LIVE`, `STOREFRONT_URL`, `SHOP_CUSTOM_DOMAIN`, `UNSUBSCRIBE_SECRET`. `BILLING_LIVE` nur nach separater Freigabe und Billing-Test auf Livebetrieb stellen.

Die folgende `.env.example`-Vorlage enthält ausschließlich leere oder erkennbare Platzhalter, niemals echte Secrets. Render-URL, OAuth-Scopes und Neon-URL vor Verwendung an die verifizierte App-Konfiguration anpassen. Kunden-/Theme-Scopes können zusätzliche Shopify-Freigaben verlangen; nur tatsächlich benötigte Scopes anfordern.

```dotenv
NODE_ENV="production"
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SCOPES="read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_content,write_content,read_themes,write_themes,read_discounts,write_discounts,read_inventory,write_inventory,read_fulfillments,write_fulfillments,read_locales,read_files,write_files"
SHOPIFY_APP_URL="https://atelierpilot-ai.onrender.com"
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require"
OWNER_SHOP_DOMAIN="wertarbeitmanufaktur.myshopify.com"
DRY_RUN_MODE="true"
CRON_SECRET=""
MOBILE_MONITOR_TOKEN=""
GEMINI_API_KEYS=""
GROQ_API_KEY=""
OPENROUTER_API_KEY=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
IMAP_HOST=""
IMAP_USER=""
IMAP_PASS=""
EBAY_CLIENT_ID=""
EBAY_CLIENT_SECRET=""
EBAY_REFRESH_TOKEN=""
ETSY_API_KEY=""
KAUFLAND_CLIENT_KEY=""
KAUFLAND_SECRET_KEY=""
PINTEREST_ACCESS_TOKEN=""
META_ACCESS_TOKEN=""
GOOGLE_SHEETS_WEBHOOK_URL=""
GOOGLE_SHEETS_WEBHOOK_SECRET=""
WHATSAPP_CLOUD_TOKEN=""
WHATSAPP_PHONE_ID=""
```

Leere Secrets dürfen nicht auf Render als funktionsfähige Werte übernommen werden. `CRON_SECRET` und `MOBILE_MONITOR_TOKEN` mit mindestens 32 zufälligen Zeichen erzeugen. Das Repository hatte beim vorigen Check keine `.env`-Datei und keine `.env.example`.

## 11. Plattform-Konnektoren – Implementierungsstand

Die Konnektoren sind shopbezogen und verwenden keine Klartext-IBANs. Eine vorhandene Implementierung ist nicht gleichbedeutend mit einer eingerichteten Drittanbieter-App, Händlerfreigabe oder bestätigten Marktplatz-Kompatibilität.

### Google Sheets

- `GOOGLE_SHEETS_WEBHOOK_URL` muss auf HTTPS unter `script.google.com` zeigen; ein HTTPS-Redirect zu `*.googleusercontent.com` wird nur für die Antwort dieses Google-Web-App-Endpunkts akzeptiert. `GOOGLE_SHEETS_WEBHOOK_SECRET` wird im vereinbarten JSON-Body übertragen und muss serverseitig ebenso geschützt sein.
- Synchronisierung: manuell im Plattform-Cockpit oder per Cron-Aufruf `/api/cron?job=google-sheets-daily` mit `Authorization: Bearer <CRON_SECRET>`. Pro Aufruf werden höchstens drei Shops verarbeitet; bei `remaining > 0` muss der Aufrufer weitere Läufe auslösen. `DRY_RUN_MODE` und globale Pause verhindern den Versand.
- Die Tageszeilen stammen aus Shopify-Orders und echten `AgentRevenueEntry`-Einträgen. Kundennamen und E-Mail-Adressen werden nicht übertragen. Der Google-Apps-Script-Empfänger muss vorhandene Zeilen anhand Datum + Bestellnummer aktualisieren, statt bei Wiederholungen Duplikate anzuhängen.
- `ossCountry` wird nur bei gesetzter `CompanyRule` `oss_origin_country` und EU-Ziel befüllt. Das Zielland wird aus der Shopify-Lieferadresse gelesen; dafür muss der Shop bzw. die App den erforderlichen Zugriff auf geschützte Kundendaten besitzen. Die Abfrage gibt keine Namen oder Adressen an den Sheets-Empfänger weiter. `ossCumulativeEur` bleibt `null`, solange vollständige Historie/steuerlicher Zeitraum nicht verifiziert ist: Shopify beschränkt Standardzugriff auf Orders in der Regel auf die jüngsten 60 Tage. `lucidWeightGrams` kommt nur aus dem app-eigenen Produkt-Metafeld `lucid_packaging_weight_g`; fehlende Werte bleiben `null`, niemals 0.
- Google Apps Script-Kontingente und externe Verfügbarkeit sind nicht garantiert kostenlos oder dauerhaft verfügbar.

### xTool-Tagespaket

- `XtoolSvg` besitzt Felder für SKU, Material, Maße, Schrift, Ringgröße und SVG-Inhalt sowie den Status `OPEN`. Werkstattjobs können im authentifizierten Plattform-Cockpit mit einer bereits vorhandenen SVG-Datei erfasst werden; der Download `/api/workshop/daily-batch.zip` ist Shopify-admin-authentifiziert.
- ZIP enthält `manifest.json` plus SVG-Dateien. Es werden nur vollständige Datensätze aufgenommen; fehlende Angaben stehen als `skippedJobs` im Manifest. Dateipfade werden auf `exports/xtool-svg/` begrenzt und SVGs mit aktiven/externalen Inhalten abgewiesen.
- Es gibt weiterhin keinen automatischen Gravurjob- oder SVG-Generator und keine automatische Bestellübernahme; Bestellungen ohne vollständige Werkstattdaten erzeugen kein fiktives SVG.

### WhatsApp Business Cloud API

- Verwendet die angefragte Graph-API-Version `v21.0` und ausschließlich `gravur_freigabe_check` oder `ringgroesse_rueckfrage`.
- Der Händler muss ein bereits ausdrücklich erteiltes Opt-in verifizieren und dessen Quelle dokumentieren. Gespeichert wird ein HMAC der E.164-Telefonnummer, keine Klartextnummer; Versandlogs enthalten nur die maskierte Nummer. Widerruf, Shop-Pause, `DRY_RUN_MODE` und ein atomarer 7-Tage-Sendeversuch-Lock werden geprüft.
- Die Telefonnummer wird nur im authentifizierten Versandrequest verarbeitet. Fehlerantworten speichern keine API-Fehlermeldung oder Telefonnummer. Fehlversuche verbrauchen vorsichtshalber ebenfalls den 7-Tage-Lock.
- Meta-Templatefreigaben, Vorlagenparameter, API-Kontingente und mögliche Gebühren müssen vor Live-Nutzung im Meta-Konto geprüft werden. Keine 0-€-Garantie.

### Bank-CSV-Abgleich

- Upload im Plattform-Cockpit: UTF-8/ISO-8859-1, Semikolon/Komma, deutsches Dezimalkomma und zitierte CSV-Felder. Erwartete Kopfzeilen beinhalten `Buchungstag`, `Verwendungszweck`, `Betrag`, `Waehrung`; `IBAN_Masked` wird ignoriert.
- Abgleich erfolgt gegen versendete Rechnungen mit vorhandenem ZUGFeRD-XML, anhand Rechnungs-/Bestellnummer. Unbekannte, mehrdeutige, währungsabweichende, gebührenabweichende und offene Vorkassefälle werden getrennt gemeldet.
- Es existiert derzeit kein `VaultDocument`-Prisma-Modell; der Abgleich nutzt das vorhandene `Invoice`-Modell. Persistiert werden Status, Betrag/Währung, Zeitstempel, Rechnungsbezug und irreversible Hashes. IBAN und Verwendungszweck werden nicht im Klartext gespeichert.

### Otto-/Hood-/Avocadostore-Feed

- `/feeds/{otto|hood|avocadostore}.xml` liefert UTF-8-XML mit signierter, shopbezogener Zugriff-URL. Die Signatur verwendet `SHOPIFY_API_SECRET`; Feeds enthalten nur aktive Produkte, die im Online-Shop veröffentlicht sind.
- Preis wird nur bei Shopwährung EUR ausgegeben. Bestand `0` setzt `stock=0` und `status=inactive`. Material kommt aus dem app-eigenen Produkt-Metafeld `material`; Nachhaltigkeit kommt nur aus expliziten `sustainability:`-Tags.
- Das gemeinsame XML-Schema ist ein vereinbarter Exportvertrag, kein bestätigtes Otto-/Hood-/Avocadostore-Importformat. Vor produktivem Anbinden sind die je Marktplatz geforderten Schemas, Händlerkonten, Pflichtattribute, Rate-Limits und Feed-Tests erforderlich.
- Neue Prisma-Felder/Modelle und Metafelddefinitionen sind additiv. Vor dem Start der neuen Funktionen müssen `npx prisma generate` und ein geprüftes Schema-Update für die jeweilige Datenbank erfolgen. Keine Live-Konfiguration oder Marktplatz-Veröffentlichung wurde durch die Codeänderung vorgenommen.

## 10. Git, Shopify-Deploy und Rollback

1. Secrets-/Datei-Ignore prüfen; insbesondere `.env`, `.env.*` mit expliziter Ausnahme `!.env.example`, `node_modules/`, `build/`, `prisma/*.db*`, `*.sqlite*` und temporäre Logs.
2. Neon zunächst als leere, gesicherte Datenbank bereitstellen; Schema/URLs prüfen und Migration validieren.
3. Vor Git-Staging alle unversionierten Dateien prüfen. Keine unbekannten `.mcp.json`-/Editor-Konfigurationen, Logs, Tokens, Datenbanken oder temporären Dateien committen.
4. Privates, leeres GitHub-Repo verbinden und geprüfte Dateien committen/pushen; es gab im letzten Check noch kein Commit und kein Git-Remote.
5. Render-Service verbinden, Variablen sicher setzen und Healthcheck/Startbefehl prüfen. Finale Render-HTTPS-URL in Shopify-Konfiguration und OAuth-Redirects eintragen.
6. Shopify-Redirects müssen zum tatsächlichen Shopify-React-Router-Callback passen (bei `authPathPrefix: "/auth"` insbesondere `/auth/callback`). Keine unbestätigte Liste ähnlicher Pfade übernehmen.
7. Shopify-App-Konfiguration mit `npx shopify app deploy` veröffentlichen. Shopify-Webhooks sind in TOML typischerweise als relative App-Pfade wie `/webhooks` definiert; Shopify synchronisiert sie anhand der App-URL.
8. Erst Smoke-Test im Dry-Run; Livebetrieb erst nach Inhaberfreigabe.

Rollback-Ziel: vorherige Git-Version redeployen, Dry-Run sofort aktivieren, DB-Snapshot wiederherstellen und Agenten-Promptversionen rücksetzen. Datenbank-Rollback und API-/Bestellaktionen müssen vor dem Livegang separat getestet werden.

## 11. Phase 2 – Roadmap nach dem Cloud-Umzug

1. **Cloud-Basis:** Neon PostgreSQL, privates GitHub-Repository, Render Docker-Webservice und externer Fünf-Minuten-Cronjob einrichten. Healthcheck, Logs, Datenbankverbindung und Backup/Restore praktisch prüfen.
2. **Shopify-Veröffentlichung:** finale Render-URL und passende Redirects/Webhooks konfigurieren; `npx shopify app deploy` ausführen; `public/app-icon.png` im Shopify Dev Dashboard setzen; App im Inhaber-Shop zunächst mit Dry-Run installieren.
3. **24–48-Stunden-Praxistest:** `DRY_RUN_MODE="true"` beibehalten, Logs/Queues/Shop-Daten kontrollieren. Danach eigene Logos/Farben erst nach Implementierung der `ShopSettings`-Persistenz sowie optionale KI-/Plattform-Keys sicher auf Render hinterlegen. Live-Schaltung nur nach ausdrücklichem Inhaberentscheid und Abnahme.
4. **App-Store-Vorbereitung:** echte, nachvollziehbare Zeit- und Geldersparnisdaten des Shops dokumentieren; keine simulierten Werte als echte Resultate ausgeben. Listing, Berechtigungen, Billing, Datenschutz und App-Store-Anforderungen prüfen und erst danach öffentlich einreichen.

Diese Reihenfolge ist ein Zielplan; sie ersetzt keine erfolgreiche technische oder fachliche Abnahme der jeweiligen Meilensteine.

## 12. Zuletzt geprüfter Repository-Ist-Stand

**Read-only-Audit am 23.11.2026; kein Deploy und keine Quelldateiänderung.** Benutzerangaben zu noch laufender Cline-Arbeit waren nicht unabhängig bestätigt.

- Git: Branch `main`, keine Commits, kein Remote; zahlreiche Dateien unversioniert.
- Keine aktiven Node-/npm-/Shopify-Prozesse in der letzten Prozessabfrage. `build.out` und `typecheck.out` waren vom 22.11. und daher kein Nachweis eines aktuellen Cline-Abschlusses.
- Letzter selbst ausgeführter Build in dieser Sitzung: `npm run build` erfolgreich. `npm run appstore:check` erfolgreich (19 statische Prüfpunkte, Sidekick 20/20). `npx prisma validate` erfolgreich für das aktuelle SQLite-Schema.
- Letzter Typecheck: Fehler `TS7016` für `qrcode`; `@types/qrcode` fehlte.
- `prisma/schema.prisma`: `sqlite`/`file:dev.sqlite`, keine `VaultDocument`-/`ShopSettings`-Modelle.
- `Dockerfile`: `node:22-alpine`, installiert OpenSSL, `npm ci --omit=dev`, `npm run build`, Start über `npm run docker-start`. Kein Multi-Stage-Build und kein `NODE_OPTIONS`.
- `package.json`: `start` und `docker-start`, aber kein `start:prod`.
- `api.cron.ts`: Token-Mindestlänge 16, Query-Secret oder Bearer; Heartbeat-Ausführung ohne garantierte Gesamtdeadline unter zwei Sekunden.
- `shopify.app.toml`: `application_url` und Redirect zeigen auf `example.com`; Webhook-URI `/webhooks` relativ; Sidekick-Zusammenfassung mit fehlerhafter Zeichenkodierung. TOML und Shopify SDK verwenden jetzt Admin API `2026-10`.
- `.gitignore`: `.env`, `.env.*`, `node_modules` und einige konkrete DB-/Build-Pfade ignoriert; kein vollständiger `*.sqlite*`-/`*.db*`-Schutz und keine `.env.example`-Ausnahme.
- Media: `sharp` und `ffmpeg-static` sind Abhängigkeiten, im App-Code wurde bei der Suche keine echte Medienverarbeitung gefunden; Sidekick-Antwort war Platzhalter.
- `/` hat einen einfachen Login-/Landing-Loader; kein dedizierter Health-Endpunkt und keine aktuelle HTTP-Laufzeitprüfung.
- Das kostenlose Hosting, Neon-Pooling, Render-Healthcheck, GitHub-Push und Shopify-Deployment sind nicht verifiziert oder durchgeführt.

**Folgerung:** Das Repo ist nach diesem Stand nicht bereit für Neon/Render-Produktionsdeploy oder GitHub-Push ohne vorherige Ignoreregel-, Secret-, Build-, Schema-, Startscript- und Shopify-URL-Prüfung. Dieser Status ist ein Audit-Snapshot, kein Versprechen über spätere Änderungen.

## 13. Shopify Basic, GraphQL-Limits und App-Store-Vermarktung

### Tarifgrenzen

- Shopify-Hilfe nennt B2B für Basic, Grow, Advanced und Plus. Basic bietet u. a. Unternehmen, Unternehmensstandorte, Kataloge mit höchstens drei aktiven Zuweisungen über aktive B2B-Märkte und Mengenpreisstaffeln.
- Direkte Katalogzuweisung an einzelne Unternehmen/Standorte und bestimmte erweiterte Zahlungs-/Checkout-Funktionen sind Plus-only. Daher weder „alle B2B-Funktionen auf Basic“ noch „B2B-Unternehmen generell Plus-only“ behaupten. Vor jeder Implementierung die aktuelle Planmatrix und den betroffenen API-Zugriff prüfen.
- Quellen: [Shopify B2B features by plan](https://help.shopify.com/en/manual/b2b/getting-started/plan-features), [Shopify GraphQL Admin API rate limits](https://shopify.dev/docs/apps/build/apis/graphql-admin/rate-limits).
- Zum Auditzeitpunkt wurde in den Anwendungssourcen keine Plus-spezifische Company-, Multipass-, Checkout-UI- oder Shopify-Functions-Nutzung gefunden. Das ist nur ein Suchbefund; keine vollständige Tariffreigabe. Ebenso wurden keine konkreten Draft-Order-, B2B-Company-, Kunden-Tag-/Metafield- oder Mehrstandort-Workflows gefunden. Basic-Kompatibilität dieser noch nicht implementierten Funktionen ist damit nicht bewiesen.
- Es gibt keine nachgewiesene Begrenzung auf zehn Inventarstandorte und keine kanalübergreifende Nullbestand-Deaktivierung. `getInventoryValue` liest `inventoryQuantity`; das ist kein Standort-Sync.
- In der `.env.example` stehen Kunden- und Theme-Scopes (`read_customers`, `write_customers`, `read_themes`, `write_themes`), die in der aktuellen TOML-Scopes-Liste abweichen. Scopes vor Release abgleichen und auf notwendige Minimalberechtigungen reduzieren; geschützte Kundendaten können Shopify-Freigaben verlangen. Theme-Berechtigungen sind kein Nachweis für ein erlaubtes oder vorhandenes Theme-Script.

### Shopify API-Limits

- Die Shopify GraphQL Admin API wird nach **Query-Kostenpunkten** limitiert. Die offizielle Tabelle nennt Standard 100 Punkte/Sekunde, Advanced Shopify 200 und Shopify Plus 1.000. Die Zahlen „40 Requests/Sekunde, 2/Sekunde Wiederauffüllung“ betreffen eine andere Rate-Limit-Metrik und sind keine GraphQL-Punktwerte.
- Einzelne GraphQL-Queries sind auf 1.000 angeforderte Kostenpunkte begrenzt; Eingabe-Arrays sind grundsätzlich auf 250 Elemente begrenzt. Antworten liefern unter `extensions.cost` unter anderem `requestedQueryCost`, `actualQueryCost` und `throttleStatus`.
- Prüfung im Repository: keine Verwendung von `extensions.cost`, `throttleStatus`, `restoreRate`, `Retry-After` oder exponentiellem Backoff gefunden. Der Orchestrator begrenzt einen einzelnen Hierarchielauf auf vier Worker, aber es gibt keine erkennbare globale, shopweite oder instanzübergreifende Shopify-Request-Drosselung.
- Der Heartbeat startet fünf Schritte gleichzeitig; Token-Refresh versucht bis zu 50 Shops parallel. Einzelne `Promise.race`-Timeouts brechen die zugrunde liegenden Requests nicht ab; der initiale DB-Shopabruf hat kein Zeitlimit. Daher ist „alle Cron-Antworten unter zwei Sekunden“ nicht garantiert.
- `getInventoryValue` fragt bis zu 100 Produkte mit jeweils bis zu 50 Varianten in einer verschachtelten Connection ab. Die Kosten werden nicht gemessen; Query vereinfachen/aufteilen und anhand Shopify-Kostendaten validieren, bevor dieser Abruf für Standard-Shops als sicher gilt.
- **Erforderlich vor Livebetrieb:** zentraler, begrenzter Request-Queue-/Rate-Limit-Mechanismus pro Shop, Cost-/Throttle-Auswertung, gezieltes Backoff mit Obergrenze und Idempotenz; zusätzlich Kosten und Laufzeit repräsentativer Queries messen. Bulk Operations nur für passende große Datenabrufe verwenden.

### App-Store- und Marketing-Check

- `npm run appstore:check` lief am 23.11.2026 erneut erfolgreich: 19 statische Prüfungen grün, 20 Backend-Handler gezählt, Zero-Storefront-Impact statisch bestätigt. `extensions/` enthält im geprüften Stand aber nur `.gitkeep`; native Sidekick-Extension-Definitionen sind damit nicht nachgewiesen. Der Handler-Zähler beweist keine installierbare 20-Tool-Extension.
- Die statische Prüfung bestätigt keine vollständige DSGVO-Erfüllung: `CUSTOMERS_DATA_REQUEST` protokolliert nur eine Meldung statt Daten automatisiert bereitzustellen; `CUSTOMERS_REDACT` löscht in der sichtbaren Implementierung nur VIP-/Support-Datensätze anhand der E-Mail. Alle weiteren Speicherorte und Anforderungen müssen geprüft werden.
- `billing.server.ts` nutzt `appSubscriptionCreate`, `trialDays` und `test`-Logik; Owner wird über `isOwnerShop(shop)` ausgenommen. Nach Erhalt der `confirmationUrl` wird jedoch bereits ein Subscription-Datensatz mit `active`-Standardwert und Modulflags angelegt, ohne die Bestätigung bzw. den tatsächlichen Shopify-Abozustand abzuwarten. Module müssen an den bestätigten Abozustand gebunden werden. Kündigungen und Planänderungen sind ebenfalls gesondert zu prüfen.
- **Preisabweichung:** `services/pricing.ts` setzt `ALL_IN_ONE_PRICE = 79.9`; Jahrespreis ist das Zehnfache (799,00 €). Die Vorgabe lautet 249,90 €/Monat und 2.499,00 €/Jahr. Einzelmodule im Code liegen bei 14,90–29,90 €, nicht durchgehend bei der Zielspanne 9,90–29,90 €. Öffentliches Listing und Billing dürfen erst nach bewusster Angleichung veröffentlicht werden.
- Umsatz-/ROI-Aussagen sind teils feste „ca.“-Schätzwerte aus Modulbeschreibungen. Sie dürfen nicht als gemessene reale Einsparungen beworben werden. Für App-Store-Fallstudien echte, reproduzierbare Ausgangs- und Messdaten erfassen.

**Gesamtergebnis dieses Audits:** Keine Plus-only-Aufrufe oder Storefront-Scripts wurden in der geprüften Codebasis gefunden; der statische Sidekick-Handler-Zähler steht bei 20/20. Trotzdem kann nicht bestätigt werden, dass alle Tarif-, API-Rate-, B2B-, App-Store- oder Rechtsgrenzen eingehalten werden. Hauptblocker sind fehlendes GraphQL-Throttling, nicht belegte Basic-B2B-Funktionen, fehlende native Tool-Extension-Dateien, unvollständiger Datenschutzexport/-löschpfad und abweichende Billing-Preise. Es wurden bei diesem Audit keine Produktivfunktionen geändert.

## 14. Selbstlernen, Agentenwachstum und Watchdog – Ziel und Ist

### Verbindliche Qualitäts- und Sicherheitslinie

- „Das Beste vom Besten“ bedeutet: überprüfbare Qualität, gezielte Tests, verständliche Fehler, begrenzte Ressourcen und wartbare Lösungen – keine pauschale Fehlerfreiheits- oder Enterprise-Garantie.
- 0,00 € ist ein Betriebsziel, kein Versprechen über dauerhaft kostenlose Anbieter oder Verfügbarkeit. Free-API-Ratenlimits und Anbieteränderungen müssen berücksichtigt werden.
- Lernprozesse dürfen Erfolgsmessungen und Promptvorschläge versioniert erfassen. Sie dürfen nicht eigenständig produktiven Code, Secrets, Preise, Zugriffsrechte, Rechtsregeln, OwnerRule, Dry-Run-Status oder Infrastruktur ändern.
- Neue Agenten und externe Datenquellen müssen shopgetrennt, kontrolliert und überprüfbar sein. Keine unautorisierte Web-Erhebung oder automatisch ausgelöste Außenwirkung. Änderungen zunächst als Vorschlag/Kandidat und nur mit Tests, Rückrollmöglichkeit und nötiger Owner-Freigabe aktivieren.
- „3× geprüft“ darf nur verwendet werden, wenn drei tatsächliche, unabhängige Prüfschritte durchgeführt wurden; gespeicherte Prompt-Hinweise sind nicht „gelernt und angewendet“, solange der nächste Auftrag sie nicht lädt.

### Verdrahtung im geprüften Code

- **Agentenlauf:** `agent-runner.server.ts` verbindet Owner-Veto, Prozess-Lock, optionalen Audit, Dry-Run/Freigabe und Sidekick-Aufruf. Potenzial wird separat erfasst. Das ist eine nachvollziehbare Pipeline für den Lauf, aber keine selbstlernende Modellschleife.
- **Evolution:** `ai-evolution.server.ts` wird von Dashboard-Aktionen und dem wöchentlichen Heartbeat aufgerufen. `weeklyEvolutionRun` entwickelt nur A158–A161 und scannt sechs fest codierte Nischen; pro Scan werden höchstens zwei Kandidaten erzeugt. Der Scanner erkennt keine Internet-/Markt-/Kundenanfragen und erzeugt keine Co-Agenten.
- Die Evolution aggregiert shopweite Erfolgs-/Fehlerzähler und schreibt einen festen Insight-/Prompt-Hinweis mit standardmäßig `score = 0.7`. Der geprüfte `runAgent` lädt `evolvedPromptHint` oder `DynamicAiAgent.systemPrompt` nicht in die Ausführung. Daher lernen derzeit nicht alle #1–#220 plus Dynamische beim nächsten Auftrag automatisch aus ihren Erfahrungen.
- `rollbackAgent` löscht den neuesten Evolutionsdatensatz statt eine aktive Version zu restaurieren; der Datensatz ist damit nicht mehr als Rollback-Auditspur verfügbar. Ein sicherer Rollback muss aktive Version umschalten und Historie erhalten.
- **Drei Prüfgremien:** `runTripleAudit` führt eine Faktenprüfung und eine Domain-Regelprüfung aus. Es protokolliert zwei Pass-Statuswerte und einen `chiefAuditorKey`, ruft aber keinen dritten unabhängigen Prüfer auf. `VERIFIED_3X` ist deshalb derzeit keine belegte dreifache unabhängige Prüfung.
- **Revenue:** `ORDERS_PAID` ist an `bookOrderRevenue` und `bookRealRevenue` angeschlossen. Der Webhook fängt Buchungsfehler ab und antwortet dennoch erfolgreich; Shopify wiederholt dann möglicherweise nicht. Die Vorabprüfung auf doppelte `referenceId` besitzt keine erkennbare Unique-Constraint gegen konkurrierende Doppelzustellungen.
- **Orchestrierung:** Ein Hierarchielauf nutzt vier Worker pro Aufruf; Entity-Locks und Timing-Daten liegen im Prozessspeicher, nicht instanzübergreifend. Gleichzeitig laufende Aufrufe/mehrere Render-Instanzen sind dadurch nicht global begrenzt.
- **Watchdog/Backup:** `cron-autopilot.server.ts` räumt im Zehn-Minuten-Tick nur abgelaufenen Cache auf. Der tägliche Lauf legt eine `BackupLog`-Zeile mit `size: 0` und Pfad an, erstellt aber keinen tatsächlichen DB-/JSON-Snapshot. Der Heartbeat misst DB-Latenz und startet weitere Jobs, überwacht aber keinen RAM-/Provider-/KI-API-Quota-Status und erzeugt kein Umzugspaket.
- Für `InnovationProposal` bzw. `detectAndFillCapabilityGap` wurde im geprüften App-Code keine Implementierung gefunden.

**Ergebnis:** Die Module sind teilweise verbunden (Agentenlauf ↔ Audit/Freigabe; Wochenzyklus ↔ Evolution/Nischen; bezahlte Bestellung ↔ Erlösjournal), erfüllen aber nicht das Gesamtversprechen kontinuierlichen Selbstlernens, dreifacher unabhängiger Audits, dynamischer Markterkennung oder selbstaktualisierender Infrastruktur. Diese Zielmerkmale dürfen nicht als fertig oder aktiv beworben werden.

## 15. Cline-Handoff vom 23.11.2026, ca. 16:25 Uhr

Der Text in [`FERTIG_LESEN.md`](../FERTIG_LESEN.md), Abschnitt 6, meldet Mail-Autopilot, Geschenk-Formular, echte Verdienstbuchung und UCP als lokal gebaut. Ein Read-only-Spot-Check um 16:38 Uhr bestätigte die genannten Quelldateien und die Cron-Aufrufe; er war kein E-Mail-, Shopify-Webhook-, UCP-Konformitäts- oder Render-Laufzeittest.

- **Mail:** `heartbeat.server.ts` ruft Fit-Check, Sendungsstau, Warenkorb-Rettung und Posteingang ab. `mail-transport.server.ts` prüft Abmeldeliste, Betriebsferien, Kontakt-Lock, Stil, Dry-Run und SMTP-Konfiguration. Echter Versand wurde laut Handoff nicht mit einem Postfach getestet. Bei `DRY_RUN_MODE=false` und konfiguriertem Mailserver können Fit-Check- und Warenkorb-Mails tatsächlich versendet werden; Sendungsstau bleibt eine Freigabe. Die aktuelle `.env.example` enthält nicht alle Gmail-/SMTP-Optionen und ist keine vollständige Render-Vorlage.
- **Geschenk-Formular:** `GiftForm.tsx` und Dashboard-Action sind vorhanden; keine Laufzeitabnahme erfolgt.
- **Verdienst:** `ORDERS_PAID` ruft `bookOrderRevenue` auf; 3 % des Netto-Warenwerts sind ein interner Zuweisungspool, kein zusätzlicher Umsatz. Doppelte Buchungen werden per Vorab-`findFirst` abgefangen, aber ohne erkennbare Unique-Constraint oder atomare Transaktion ist Konkurrenzsicherheit nicht belegt. Buchungsfehler werden im Webhook abgefangen und trotzdem mit HTTP 200 quittiert.
- **UCP:** `ucp-profile.server.ts` erzeugt vier read-only Capabilities nur bei gültiger HTTPS-`SHOPIFY_APP_URL`; ohne sie bleiben Capabilities/Services leer. Es gibt keinen eigenen Checkout/Zahlungsweg. Die Spezifikationskonformität wurde in diesem Spot-Check nicht verifiziert; ein Kommentar in der Discovery-Route beschreibt weiterhin pauschal leere Capabilities und sollte mit dem Builder abgeglichen werden.
- **Render/Docker:** `render.yaml` definiert Docker, Free-Plan und `/privacy`-Healthcheck. `Dockerfile` hat ebenfalls einen Healthcheck, startet aber per `CMD npm run docker-start`; das vorhandene `start:prod`-Script wird dadurch nicht genutzt. `render.yaml` enthält kein `DATABASE_URL`; das Prisma-Schema ist weiterhin SQLite. Render kann daher im aktuellen Stand trotz vorhandenem `start:prod` nicht als persistente Neon-PostgreSQL-Konfiguration gelten.
- **Environment-Vorlage:** `scripts/ensure-env.mjs` erzeugt `.env` und `.env.example`, ohne Werte auszugeben. Das erzeugte Beispiel setzt `DATABASE_URL="file:dev.sqlite"` und ist eine lokale SQLite-Vorlage, keine Neon-/Render-Vorlage. Das Skript ersetzt dabei die Beispiel-Datei. Die echte `.env` wurde nicht gelesen oder protokolliert.
- **Typecheck:** Cline meldet, den fehlenden `@types/qrcode`-Fehler behoben zu haben; `@types/qrcode` steht inzwischen in `devDependencies`. Ein erneuter Typecheck nach dieser Änderung wurde nicht ausgeführt.

Dieser Handoff aktualisiert die vorherigen Audit-Snapshots, ersetzt aber keine erneute Build-/Typecheck-/E-Mail-/Shopify-/Cloud-Abnahme.

## 16. Cline-Gesamtübergabe vom 23.11.2026, ca. 16:44 Uhr

Die folgende Statusübersicht wurde von der Nutzerin aus Cline übernommen. Die Prüfungen und lokalen Laufzeittests sind **Cline-Berichte**, keine in dieser Copilot-Session erneut ausgeführten Tests. Cline meldet, dass seit diesen Tests keine Projektdateien geändert wurden.

### Gemeldeter Prüfstatus

| Prüfung | Von Cline gemeldetes Ergebnis |
|---|---|
| `npx prisma validate` | erfolgreich |
| `npx prisma generate` und `npx prisma db push` | erfolgreich; Datenbank synchron |
| `npm run typecheck` | Exit 0 |
| `npm run appstore:check` | 27/27 Kriterien grün, Sidekick-Tools 20/20 |
| `npm run build` | Exit 0; Client 418 Module, Server 81 Module |
| Build-Hinweise | fünf React-Router-v8-Flag-Hinweise, keine gemeldeten Fehler |

Der App-Store-Check ist inzwischen von 19 auf 27 Kriterien erweitert worden. Grün bedeutet nur, dass diese statischen Kriterien bestanden wurden; es belegt weder vollständige Compliance noch installierbare Extension, richtige Live-Konfiguration oder funktionierende Drittanbieter-Integrationen.

### Gemeldete lokale Laufzeittests

- Server auf lokalem Testport: `/privacy` 200; Ringgrößen-Endpunkt mit gültigem Wert 200 und ungültigem Wert 400; GRA-Endpunkt ohne/mit gültiger Testnummer 400/200; Advice-Endpunkt 200; bekannte UCP-Schemas 200 und unbekanntes Schema 404.
- `/api/cron` ohne Secret: 401. Mit Test-Secret: Heartbeat `ok`, 556 ms, alle neun Schritte erfolgreich; Posteingang nicht konfiguriert. Token-Refresh meldete im Test `0 OK, 1 Fehler`, da kein gültiger lokaler Shop-Token vorlag.
- UCP-Profil: Version `2026-08-25`, laut Cline ein Service, vier Capabilities und leere `payment_handlers`. Das ist ein lokaler Profiltest, kein unabhängiger Spezifikations-Validator.
- `orders/paid`: gefälschte HMAC-Signatur 401; gültige Testsignatur 200; Wiederholung 200 ohne zweite Buchung. Im Test entstanden neun interne Echt-Zuordnungen über insgesamt 3,00 € bei 100 € Netto-Warenwert. Das belegt den getesteten sequentiellen Fall, nicht atomare Idempotenz bei konkurrierenden Zustellungen.
- Cline meldet, Testdaten, temporäre Skripte und `tmp-research/` entfernt und alle Node-Prozesse beendet zu haben.

### Ergänzungen und Versionshinweise aus Cline

- Verdienst- und Mail-Agentennummern wurden laut Cline gegen die Agentenliste korrigiert (unter anderem #44 Prüfmail, #57 Gravur, #27 § 11-Prüfer). Diese Zuordnung steht noch nicht in `FERTIG_LESEN.md`.
- Doppelbuchungsschutz nutzt laut Bericht `referenceId` mit dem Präfix `order:<Name>`. Die Funktion hängt damit an dieser Referenzbildung; keine Änderung darf sie unbeabsichtigt variieren.
- Die aktuelle Code-Struktur lautet 26 Abteilungen, 232 Kernprofile (#1–#232), 100 Apex-Profile (#301–#400) und neue dynamische Agenten ab #401. #000 ist eine separate Owner-only Meta-Aufsicht. Bestehende dynamische IDs bis #400 benötigen vor dem Produktivstart die Nummernmigration.
- Die von Cline berichtete aktuelle Preisstaffel ist Core 0 €, Module 1–6 zu 14,90 €, 19,90 €, 19,90 €, 24,90 €, 24,90 € und 29,90 € pro Monat, All-in-One 79,90 € pro Monat; Jahrespreis mit zwei Monaten gratis, 10 % Bündelrabatt ab zwei und 20 % ab drei Modulen sowie 14 Tage Test. Frühere Zielvorgaben von 249,90 €/2.499 € weichen davon ab; Produkt- und Marketingangaben müssen sich an einem bewusst festgelegten realen Tarif orientieren.
- Frühere Abschnitte von `FERTIG_LESEN.md` sind teilweise überholt, insbesondere der Hinweis auf ein noch fehlendes Geschenkformular. Cline empfiehlt, sie zu bereinigen, damit die Übergabe nicht widersprüchlich ist.

### Weiterhin offene Cloud-, Funktions- und Compliance-Punkte

1. **Cloud-Blocker:** Prisma steht weiterhin auf SQLite (`provider = "sqlite"`, `file:dev.sqlite`). Auf Render Free ist das nicht dauerhaft; Neon/PostgreSQL-Migration fehlt.
2. **Shopify-Deploy:** `application_url` und `redirect_urls` in `shopify.app.toml` zeigen laut Cline weiterhin auf `https://example.com`.
3. **E-Mail:** Kein echter Mailversand mit einem realen Postfach getestet. Warenkorb-Erinnerungen können Werbung sein; Einwilligungs-/UWG-/DSGVO-Anforderungen sind fachlich zu klären. Der Abmeldelink benötigt `SHOPIFY_APP_URL`.
4. **Shopify-Datenzugriff:** `abandonedCheckouts` und Kundendaten benötigen passende Scopes und gegebenenfalls die Genehmigung für geschützte Kundendaten; kein Test gegen einen echten Shop.
5. **Sidekick-Funktionstiefe:** Laut Cline liefern mehrere Handler weiterhin Platzhalterantworten, darunter `catalog:media-upgrade` und `brand:expand-store`.
6. **Noch fehlende bzw. nicht belegte Funktionen:** persistenter Cloud-Tresor/`VaultDocument`, Umzugs-Watchdog, Marktplatz-Sync, Dropshipping-Weiterleitung, xTool-SVG-Generator, ZUGFeRD-/DATEV-Export, autonomer Rechtstext-Updater, Video-Verarbeitung, Telegram-/Web-Push und Firmenlogo-Upload.
7. **Dashboard-Daten:** Premium-Startseite, Warenwert-Cockpit und Seiten-Gesundheit sind nicht vollständig auf echte Shopify-Daten geprüft; das Cockpit kann bei leerem Shop Beispieldaten anzeigen.
8. **Rechts-/Datenschutzprüfung:** E-Mail-Einwilligung, Datenzugriff, geschützte Shopify-Kundendaten, vollständige DSGVO-Export-/Löschpfade und UCP-Spezifikationskonformität bleiben eigenständige Prüfaufgaben.

**Cloud-Bereitschaft:** Trotz der gemeldeten grünen lokalen Validierung, Builds und Smoke-Tests ist das Projekt noch nicht bereit für einen dauerhaften Render-/Neon-Produktivbetrieb oder App-Store-Deploy. SQLite, Platzhalter-URLs, ungeprüfte E-Mail-/Shopify-Live-Zugriffe und die genannten Funktions-/Compliance-Lücken bleiben maßgebliche Blocker. Es wurden laut Übergabe keine Commits, Pushes oder Deployments durchgeführt.

## 17. Meta-Supervisor, Pause, Onboarding und Listing – Implementierungsstand

Diese Sektion beschreibt die Copilot-Codeänderungen vom 23.11.2026 nach der obigen Cline-Übergabe.

- **#000 Meta-Supervisor:** `selectOptimalFreeModel` wählt den expliziten OpenRouter-Free-Router (`openrouter/free`), wenn ein Schlüssel gesetzt ist; sonst ist der Modus `local-rules`. `runMetaSupervisorAudit` protokolliert Ergebnis und Modus und wird für Aufrufe der vier Vorstandsagenten, wöchentliche Skilländerungen und neue dynamische Agenten verwendet. Die externe Prüfung erhält nur Agenten-/Aufgaben-Metadaten, keine Kundeninhalte. Sie ist eine zusätzliche Governance-Prüfung, keine echte Modell-zu-Modell-Prüfung einer generierten Geschäftsantwort, weil der bestehende Agentenlauf selbst kein generatives Entscheidungsmodell betreibt. Bei nicht erreichbarem OpenRouter wird `REVIEW` statt eines stillen Pass zurückgegeben.
- **Inhaber-Puls:** Drei Sätze werden deterministisch aus Erfolgsprotokollen, offenen Freigaben, echten internen Zuordnungen und Pausenstatus erzeugt und im Dashboard sowie Monitor angezeigt. Euro-Zuordnungen werden ausdrücklich nicht als zusätzlicher Shopumsatz bezeichnet.
- **Shop-Pause:** `GLOBAL_AI_PAUSE` wird je Shop in `CompanyRule` gespeichert und verändert `DRY_RUN_MODE` nicht. Sie wird beim Agentenlauf, Sidekick-Dispatcher, Freigabe-Ausführung, Evolutions-/Agentenerstellung, Mailversand und IMAP-/Cron-Verarbeitung geprüft. Shopify-Core-Webhooks werden dadurch nicht abgeschaltet.
- **ROI-Wächter:** Nach mindestens fünf erfolgreichen Live-Ausführungen eines dynamischen Agenten innerhalb von 30 Tagen ohne zugeordnete Echt-Buchung wird der Agent bei einem Evolutionslauf auf `PAUSED` gesetzt und protokolliert. Das gilt nicht für die 332 festen Profile und misst keine Arbeitszeitersparnis; fehlende Umsatzattribution kann deshalb zu einer falschen Pausierung führen. Reaktivierung bleibt über den bestehenden Statuspfad möglich.
- **Onboarding:** Nicht-Inhaber sehen bei fehlendem `onboarding_complete` den dreistufigen Schnellstart. Auswahl und Abschluss werden shopbezogen als `CompanyRule` gespeichert; beim Neukunden wird Dry-Run aktiviert. Das „Testlauf“-Protokoll führt keine Shopify-Mutation und keine Billing-Buchung aus. Der Inhaber behält sein Cockpit und kann den Wizard optional öffnen.
- **Pause und Historie:** Dashboard und Monitor haben einen Notfall-Schalter sowie die letzten 20 Protokolleinträge. Undo ist ausschließlich für erfolgreiche interne `sync_orders`-Protokolle aktiviert und markiert den Eintrag als `undone`; es ist ausdrücklich kein Rollback externer Shopify- oder Marktplatzänderungen. Andere Aktionen zeigen keinen Undo-Schalter.
- **Öffentliche Seiten:** `/privacy` und `/support` enthalten nun deutsche und englische Hinweise. Die Datenschutzseite beschreibt aktuelle Grenzen und behauptet weder eine 48-Stunden-Löschung noch eine vollständige Rechtskonformität. Sie ersetzt kein vollständiges Impressum: vollständiger rechtlicher Betreibername, ladungsfähige Anschrift, direkte Datenschutz-/Support-Kontaktdaten und bestätigte Hosting-/Aufbewahrungsangaben fehlen.
- **Listing:** `docs/APP_STORE_LISTING.md` enthält eine zweisprachige, als nicht einreichungsreif markierte Listing-Fassung, Preisübersicht aus der aktuellen Code-Konfiguration und Reviewer-Testschritte ohne externen KI-Schlüssel. Nicht implementierte Integrationen und interne Umsatzzuordnungen sind ausdrücklich eingeschränkt beschrieben.

### Validierung am 23.11.2026

| Prüfung | Ergebnis |
|---|---|
| `npm run typecheck` | Exit 0 |
| `npm run build` | Exit 0; 422 Client-Module und 86 Server-Module transformiert |
| `npm run appstore:check` | 34/34 statische Kriterien grün; Sidekick-Handler 20/20 |
| Geänderte TypeScript-/React-Dateien (gezieltes ESLint) | Exit 0, `sidekick.server.ts` wegen dort bereits bestehender `any`-Typen ausgenommen |

Der Build gibt fünf React-Router-v8-Future-Flag-Hinweise aus. Diese Validierung beinhaltet keinen Live-Aufruf von OpenRouter, keinen echten E-Mail-Versand, keinen Test mit einem Shopify-Produktivshop und keinen Render-/Neon-Deploy. Der statische App-Store-Check ist keine Rechts- oder App-Store-Freigabe.

**Release-Blocker bleiben bestehen:** vollständige Fachprüfung der Datenschutzhinweise, vollständige Datenexport-/Löschpfade, eine provisionierte und getestete Neon/PostgreSQL-Verbindung samt geprüftem Migrations-/Restore-Plan, produktive Shopify-URLs, echte Mail-/Shop-Tests und die noch unvollständigen Sidekick-Handler. Ein grüner Typecheck und Build können diese Produkt-/Compliance-Blocker nicht aufheben.

## 18. Betreiberangaben von der Nutzerin erhalten

Am 23.11.2026 hat die Nutzerin folgende zur Veröffentlichung bestimmten Betreiberangaben bereitgestellt und in `/privacy` sowie `/support` eingetragen:

- Sandra Schlegel, Wertarbeit Manufaktur
- Kaiserbauerstr. 6, 86476 Neuburg a. d. Kammel, Deutschland
- `wertarbeit.manufaktur@gmail.com`
- USt-IdNr. `DE297357263`

Telefonnummer, gegebenenfalls Register-/Vertretungsangaben, Datenschutzbeauftragte:r (falls bestellt) sowie tatsächlicher Hostinganbieter/-region und Aufbewahrungs-/Löschfristen wurden nicht mitgeteilt. Die Betreiberangaben sind damit ergänzt, aber die Seiten sind weiterhin nicht als vollständig rechtlich geprüft oder App-Store-freigegeben zu behandeln.

## 19. Dashboard-Kommandozentrale – UI-Stand

- Dashboard-Tabs verwenden stabile URL-IDs (`?tab=overview`, `agents`, `earners`, `audits`, `factory`, `vault`, `platforms`, `rewards`); ein reiner Tabwechsel lädt die Shopify-/Datenbankdaten nicht erneut.
- Der Header trennt interne Agenten-Zuordnungen (Echt/Potenzial) vom Shop-Bestand. Bestandswerte sind Schätzungen auf Basis der verfügbaren Preise/Einstandskosten und einer 19%-MwSt.-Annahme, keine Buchhaltung oder Gewinnprognose. Demo-Werte sind als Demo markiert; der Zeitstempel ist UTC.
- Betriebsgesundheit zeigt einen realen `SELECT 1`-Datenbank-Ping und die Laufzeit des Node-Prozesses. Harmonie und interner Speed-Score sind keine Server-Uptime- oder HTTP-Latenz-Messung.
- Der Münzregen ist ein rein dekorativer Browser-Effekt und wird nicht als echter Umsatz, Guthaben oder Auszahlung verbucht. Die Platine zeigt alle fünf Vorstandssitze einschließlich #171; Abteilungs-Infos, Zoom/Kompaktansicht und Modul-Auswahl sind vorhanden.
- Der #206-Kleinanzeigen-Entwurf wird nur mit Shopify-Daten vorbereitet; eine tatsächliche Verlängerung findet nicht statt. Die Aktionsroute wurde aus einem zuvor unerreichbaren Codezweig herausgelöst. Der Fertig-Tisch kann nach Abteilung, Risiko und Kategorie filtern; #206-Titel und -Text sind getrennt kopierbar.
- Die Plattformübersicht enthält Portalverweise und lokale DE/EN-Entwickleranfrage-Entwürfe. Der tatsächliche Developer-Korrespondent im Roster ist #202 (nicht #187). Für Plattformen ohne implementierten Adapter werden weder „verbunden“ noch erfolgreiche Verbindungstests behauptet.
- Werkstattentwürfe können in einer shopbezogenen `localStorage`-Warteschlange vorgemerkt und manuell ins vorhandene Formular geladen werden. Die Daten liegen unverschlüsselt im jeweiligen Browser, werden nicht automatisch synchronisiert und sollen keine personenbezogenen Daten enthalten.
- Neue Fachgebiets-Agenten aus der Oberfläche werden zunächst als Kandidaten angelegt; sie starten nicht automatisch. Skill-Rollbacks bleiben auf die vorhandenen Evolutionsdatensätze begrenzt.
- Individuelle PDF-/ZIP-Downloads und der Brand-Customizer sind ergänzt. Die Quelldaten reichen ausdrücklich nicht für normkonforme Rechnungen, offizielle Zertifikate oder Beweisunterlagen; Downloads sind daher gekennzeichnete Datensatzentwürfe/Vorlagen. Ein separates `VaultDocument`-Modell und dauerhafte Dateiablage gibt es nicht.

## 20. Prisma-Datasource auf PostgreSQL umgestellt

- `prisma/schema.prisma` verwendet jetzt `provider = "postgresql"` und `url = env("DATABASE_URL")`.
- `.env.example` und `scripts/ensure-env.mjs` enthalten einen lokalen PostgreSQL-Beispielwert; `render.yaml` erwartet `DATABASE_URL` als extern gesetztes Geheimnis.
- Damit ist nur der Prisma-Client-/Schema-Provider umgestellt. Es wurde keine Datenbank bereitgestellt, kein SQLite-Datenbestand migriert und kein `prisma db push` oder Cloud-Deploy ausgeführt. Vor dem Start ist `DATABASE_URL` auf eine erreichbare PostgreSQL-Instanz zu setzen und ein geprüfter Backup-/Migrations-/Restore-Ablauf erforderlich.

## 21. 7-Ansichten-Dashboard und Apex-Rollenprofile

- Die Dashboard-Navigation hat sieben URL-gespeicherte Ansichten unter `?view=...`; alte `?tab=...`-Links werden weiter auf passende Ansichten abgebildet. Der reine Ansichtswechsel lädt die Shopdaten nicht erneut.
- Der Fertig-Tisch, die Platine, Teamübersicht, Prüfzentrum, Tresor und Plattform-/Baukastenansicht sind getrennte Seitenbereiche. Notfallpause bleibt auf jeder Ansicht erreichbar. Audio nutzt die lokale Browser-Sprachausgabe; die 60-Sekunden-Show präsentiert einen festen Snapshot und ist kein Live-Stream.
- #221–#232 sind registrierte Rollenprofile und bleiben serverseitig für autonome Ausführung gesperrt. Interne Agentenmetriken (Note, Trend, XP, Rang, Akademie-Status) sind als Heuristik implementiert; sie bewirken keine Beförderung, Rollback oder fachliche Zertifizierung. #221–#225 können manuelle Review-Schritte in einem SHA-256-verketteten Prisma-Ledger protokollieren. Dieses Ledger ist nicht extern verankert oder physisch unveränderlich und trifft keine automatischen Rechtsentscheidungen.
- Die Platine bietet Sektorfilter. Linien bleiben statisch, weil kein verlässliches Live-Job-Event-Modell existiert. Für neue Rollen wird keine Kostenfreiheit garantiert; Hosting- und Drittanbieter-Kosten hängen von der realen Konfiguration ab.

## 22. Agentenmetriken, manuelles Review-Ledger und Tresor

- Metriken werden shopbezogen aus echten `AgentRevenueEntry`-Buchungen (`isSimulated=false`), `AgentSkillEvolution`-Scores und entschiedenen Freigaben aggregiert. Ohne Evidenz bleibt die Note leer.
- Der Leistungs-Score ist der gleichgewichtete Mittelwert der verfügbaren Dimensionen: Erfolgsquote entschiedener Freigaben, mittlerer Evolutions-Score und Vorzeichen des Netto-Echtverdienstes. Die Abbildung lautet `Note = round1(6 - 5 * Score)`. Potenzial/Dry-Run zählt nicht als echte Einnahme.
- Der Trend vergleicht die letzten 30 Tage mit den vorangegangenen 30 Tagen; ab einer Differenz von 0,05 wird ▲/▼ angezeigt, sonst ►. Mangels `resolvedAt` werden Freigaben nach `createdAt` zeitlich eingeordnet.
- XP: genehmigte Freigabe +25, abgelehnte +5, Evolution +10, echte Buchung +10. Rangschwellen: 0/100/250/500/1.000/2.000 XP. Akademie-Status: interne Heuristik (zertifiziert ab 10 Ereignissen und Note ≤2,0; Nachschulung ab 5 Ereignissen und Note ≥3,5; sonst Lernphase), keine formale Fach-/Personalzertifizierung.
- `JudicialDecisionLedger` erzwingt manuelle Prüfschritte #221–#225 in Folge und verkettet Datensätze per SHA-256 unter serieller Transaktion. Die Prüfschritte sind nicht bindend; die Kette ist nicht extern verankert und erkennt keine entfernte Schluss-Sequenz.
- `ShopSettings` enthält das Logo (PNG/JPEG bis 350 KB), Farben, Stil, Grußformel und AES-256-GCM-verschlüsselte Bankangaben. Für die Entschlüsselung ist `BRAND_SETTINGS_ENCRYPTION_KEY` mit 32 Byte erforderlich. Schlüsselverlust macht vorhandene Bankdaten unlesbar.
- Tresor-PDFs/ZIPs entstehen auf Abruf aus vorhandenen Daten. Das Steuerberater-Paket enthält höchstens 500 neueste Datensätze je Liste und begrenzte, unverifizierte gespeicherte XML-/DATEV-Felder. Es ist kein DATEV-Buchungsstapel; das Rechnungsdatenblatt ist keine normkonforme ZUGFeRD-/XRechnung/PDF-A-3-Rechnung, das DPP-Dossier kein offizielles GRA-Zertifikat und die Chargeback-Datei eine leere Checkliste.
- Neue Prisma-Modelle sind generiert, aber nicht in eine Datenbank gepusht: lokale `DATABASE_URL` fehlt. Vor Nutzung in PostgreSQL erst Datenbankziel und Backup bestätigen, dann Schema-Deployment durchführen.

## 23. Guardian-Benachrichtigung

- Der Guardian-Workflow sendet nach den bestehenden Prüfschritten und dem Backup den bisherigen Jobstatus als JSON, wenn beide GitHub-Actions-Secrets `GUARDIAN_NOTIFY_URL` und `NTFY_TOPIC` gesetzt sind. Ohne diese Secrets entfällt der Versand. Ein fehlgeschlagener Versand schlägt den Schritt fehl; die Benachrichtigung bestätigt weder eine erfolgreiche Wiederherstellung noch die Verfügbarkeit des Shops.

## 24. Etappe 2: kostenbegrenztes KI-Routing und Audit

- Der Router akzeptiert nur explizite OpenRouter-Modelle mit `:free` oder `openrouter/free`. Die Cascade nutzt ausschließlich entsprechende OpenRouter-Modelle und wird nur bei `AI_CLOUD_ENABLED=true` und `AETHERION_CASCADE_ENABLED=true` über den Router aufgerufen; ihr eigener Schalter bleibt unabhängig geprüft. Ein Preislimit von null wird mitgesendet. Ohne geeignete Konfiguration oder bei Fehlern meldet der Router fehlende Verfügbarkeit; es gibt keinen kostenpflichtigen Modell-Fallback.
- Konfiguration: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, optional `CF_AIG_BASE_URL` und `CF_AIG_TOKEN`. Die Cloudflare-Gateway-Konfiguration muss den OpenRouter-Zugriff separat korrekt und kostenbewusst einrichten. Kontingente, Verfügbarkeit, sonstige Gateway-/Hostingkosten und Anbieterbedingungen sind nicht garantiert.
- `executeModuleWithAudit` validiert `m1`–`m6`, prüft Shop-Pause und bestehende Shop-Modulrechte und ruft den Router auf. Für Subscriber werden nur die bereits in `moduleIdsFromSubscription` abgebildeten aktiven Module zugelassen; `m1` und `m6` besitzen dort derzeit keinen Nachweis und werden nicht freigeschaltet. Der Meta-Supervisor nutzt denselben Audit-Mechanismus mit separater Kennung, nicht einer erfundenen Modulzuordnung. Seine bestehenden lokalen Prüfungen bleiben lokal; alle derzeitigen Aufrufer setzen `primaryModel: "local-rules"`.
- `AutopilotLog` enthält pro geroutetem Lauf einen Start und anschließend das Ergebnis als Aktualisierung desselben Eintrags. Die SHA-256-Prüfsumme umfasst datensparsame Ein-/Ausgabemetadaten, keine Prompt- oder Antwortinhalte. Lokale Meta-Supervisor-Prüfungen werden separat gehasht protokolliert. Scheitert der Start-Eintrag, erfolgt kein externer Aufruf; scheitert die Ergebnisprotokollierung nach einem Aufruf, wird kein Ergebnis als erfolgreich zurückgegeben. Ein Prozessabbruch kann einen `started`-Eintrag hinterlassen. Die Hashes sind nicht verkettet oder extern verankert.
- Der Baukasten enthält weiterhin keinen allgemeinen fachlichen Ausführungspfad für alle bestehenden Funktionen; die neue Schnittstelle führt keine Module von selbst aus. Sie ist für künftige explizite KI-Modulaufrufe gedacht. Bestehende Sidekick-, Agenten-, Mail- und sonstige Geschäftsaktionen sind damit nicht pauschal als KI-Modulausführung protokolliert.

## 25. Etappe 3: Bestandsaufnahme und abgesicherte Modulprüfung

- Die Modulprüfung des KI-Wrappers liegt zentral in `requireModuleAccess`. Für diesen Wrapper gilt der Owner-Sonderzugriff nur für in `OWNER_SHOP_DOMAIN` konfigurierte Domains. Die bestehende allgemeine Owner-Prüfung erkennt weiterhin zusätzlich die beiden fest hinterlegten Domains; diese müssen für den Wrapper ebenfalls konfiguriert sein. Subscriber benötigen einen aktiven Datensatz und das jeweilige Modulflag.
- Die vorhandenen Flags bilden nur m2–m5 ab. Für m1 und m6 fehlen einzelne bestätigte Berechtigungen; sie bleiben für Subscriber gesperrt. `plan`, `ownerUnlimited` und die bloße Auswahl im Billing sind kein Nachweis einer bestätigten Shopify-Subscription. Der bestehende Billing-Pfad kann `active` und Flags bereits vor Shopify-Bestätigung speichern; die Prüfung des tatsächlichen Abostatus und der Kündigung ist weiterhin ein Release-Blocker für alle Subscriber-Module.
- Es wurden keine vorhandenen, eindeutig einem der sechs Module zugeordneten generativen KI-Aufrufe gefunden. Der Meta-Supervisor bleibt separat; nicht-generative Workflows und mehrdeutige Sidekick-Aufrufe werden nicht künstlich als Modul-KI-Ausführung ausgewiesen. Etappe 3 ist damit nicht vollständig umgesetzt.

