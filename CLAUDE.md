@AGENTS.md 
# MASTER-BAUANLEITUNG: AtelierPilot AI (FINALE ZERO-ERROR GOLD-EDITION 2027)
# SHOP: wertarbeitmanufaktur.com | TARIF: Shopify Basic | SYSTEM: Windows | BUDGET: 0,00 €

## 0. OBERSTE DIREKTIVE: 99 % VOLL-AUTOPILOT, INHABER-VETO & ZERO-ERROR-GARANTIE
- **99 % Voll-Autopilot:** Alle sicheren Aufgaben (Auto-Listing, Studio- & weiße Bilder, Kurzvideos, DE/EN-Übersetzungen, Marktplatz-Sync, GRA-Zertifikate, xTool-SVGs, E-Rechnungen, SEO/WebMCP, Backups) laufen **24/7 vollautomatisch ohne Warten auf Freigabe** durch.
- **Warnen statt Blockieren (Letztes Wort beim Inhaber):** Nur bei Konflikten (z. B. Etsy-Markenfilter, niedrige Marge, Sonderregel) pausiert der Einzelvorgang mit klarer Warnung + 1-Klick-Buttons (**[Empfehlung folgen]** vs. **[Trotzdem ausführen (Override)]**). Jede automatische Aktion hat zudem einen **1-Klick-Rückgängig-Button**.
- **Inhaber-Sonderregeln (Höchste Priorität):** Über UI und Sidekick (`manage_company_rules_and_brand_dna`) hinterlegte Chefanweisungen überstimmen Standard-Regeln immer automatisch.
- **Stresstest- & Windows-Garantie:**
  - Nutze für Routen/Loader/Actions ausschließlich `react-router` (niemals `@remix-run/node`).
  - Nutze für PDFs ausschließlich `pdf-lib` mit `StandardFonts.Helvetica` (niemals `pdfkit`).
  - Normalisiere alle Datei-/Download-Pfade für Windows mit `.replace(/\\/g, "/")`.
  - Aktiviere beim Prisma-SQLite-Start sofort `PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;`.
  - Nutze exakt die Polaris-Komponenten, die bereits in `package.json` vorinstalliert sind.
  - Arbeite komplett autonom ohne Rückfragen und führe am Ende `npx prisma generate`, `npx prisma db push`, `npm run typecheck` und `npm run build` aus, bis alles zu 100 % grün ist.

## 1. HARMONISIERTE 24/7 HYBRID-KI (0,00 €, KONFLIKTFREI & MITWACHSEND)
- **Eingebaute, mitwachsende Haus-KI (`minisearch` + lokales TF-IDF-Vektor-Gedächtnis in TypeScript):** Läuft komplett ohne C++/ONNX-Binaries direkt in Node.js (0 €). Übernimmt 24/7 Routine-Klassifizierung, Tagging, Sonderregel-Matching und speichert jede gelernte Erfahrung/Korrektur dauerhaft in `AiKnowledgeMemory`.
- **Cloud-Spezialist (`@ai-sdk/google` `gemini-2.5-flash` + direkter REST-Fallback):** Mit automatischem Multi-Key-Rotations-Pool (`GEMINI_API_KEYS` kommagetrennte Liste + optional `GROQ_API_KEY` Fallback) für Vision-Fotoanalysen, Brand-DNA-Erkennung und Juwelier-Texte.
- **24/7 Autopilot-Motor (`node-cron`):** Mit Singleton-Guard sauber in `app/entry.server.tsx` eingebunden. Arbeitet alle 10 Min. + sofort bei Webhooks, füllt `PrecomputedCache` (Sidekick-Antworten `< 150 ms`) und führt eine automatische 30-Tage-Rotation für Backups und alte Logs durch.

## 2. SHOPIFY BASIC, TOML-VALIDIERUNG & SAAS-VERMARKTUNG ("Built for Shopify")
- **`shopify.app.toml` (API `2026-10` – bestehende `client_id` & `[build]`-Werte des Templates zwingend erhalten!):**
  - `name = "AtelierPilot AI"`
  - `embedded = true`
  - `scopes = "read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_analytics,write_reports,read_content,write_content,read_discounts,write_discounts,read_fulfillments,write_fulfillments,read_locations,read_metaobjects,write_metaobjects,read_publications,write_publications,read_shipping,write_returns,write_returns,read_files,write_files,read_translations,write_translations"`
  - Verwende exakt `[[webhooks.subscriptions]]` mit `uri = "/webhooks"`:
    - `topics = ["products/create", "products/update", "products/delete", "inventory_levels/update", "orders/create", "orders/paid", "orders/cancelled", "refunds/create", "app/uninstalled"]` (bei `app/uninstalled` sofort alle Sessions des Shops in Prisma löschen!).
    - `compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]` (bei `customers/redact` sofortige `<1s` Datenlöschung).
  - Pflichtfeld `[sidekick] extensions_summary` setzen.
- **Mandantenfähigkeit & Baukasten-Monetarisierung:** Alle Prisma-Tabellen enthalten `shop String`. `ShopSubscription` steuert die Bausteine (`free_audit`, `starter_auto_listing`, `module_multichannel`, `module_invoices_zugferd`, `module_certificates_dpp`, `module_growth_concierge`, `all_in_one`) + Partner-Tracking (`?ref=...`). Für `://myshopify.com` (`OWNER_SHOP_DOMAIN`) wird automatisch `OWNER_UNLIMITED` (0 €) aktiviert; für App-Store-Kunden ist die Shopify Billing API (14-Tage-Testphase) vorbereitet.

## 3. EDLES DESIGN & VERKAUFSPSYCHOLOGIE (`app/routes/app._index.tsx`, DE/EN)
- Hochmoderne Admin-Oberfläche (ohne schwere Storefront-Skripte für 100 % Lighthouse-Speed) mit:
  a) **Autopilot- & Sonderregeln-Zentrale:** Status „99 % Voll-Autopilot AKTIV“, Eingabefeld für Inhaber-Sonderregeln, Steuer-Modus (MwSt. / Kleinunternehmer § 19 UStG), Warnungs-Override-Box und Live-Protokoll mit 1-Klick-Rückgängig-Button.
  b) **3-Schritt-Onboarding-Wizard ("30-Sekunden-Sofort-Scan")** + umschaltbarem **"App-Store Live-Demo-Modus"**.
  c) **Live-ROI- & Zeitersparnis-Zähler** ("Gesparte Arbeitszeit, Zusatzumsatz & gesparte App-Kosten") + Lernfortschritt der Haus-KI.
  d) **Status-Karten für die 6 KI-Mitarbeiter**, Baustein-Kacheln mit Aktiv-Schaltern, Tooltip-Hilfe ("?") & "Jetzt in Sidekick starten"-Buttons.
  e) **Tresor-Ansicht** mit 1-Klick-Download für Rechnungen, GRA-Zertifikate & fertige **xTool-SVG-Gravurdateien** (`/exports/xtool-svg/`), Partner-Empfehlungs-Link und 5-Sterne-Bewertungsbanner.

## 4. SIDEKICK EXTENSION & ROUTING (`extensions/sidekick-tools/shopify.extension.toml`, API `2026-10`)
- **Routen-Sicherheit (React Router 7):** Implementiere einen zentralen Dynamic-Dispatcher unter `app/routes/api.sidekick.$category.$action.tsx` (und registriere ihn in `app/routes.ts`, falls manuelle Routen genutzt werden), der alle 20 Endpunkte ohne `404` und ohne Cookie-Redirect (`302`) bedient!
- **Extension-TOML:** Setze zwingend `type = "sidekick_app_extension"`, `name = "AtelierPilot Sidekick Tools"`, `handle = "atelierpilot-sidekick-tools"`, klare `description` (< 250 Zeichen) und gültiges JSON-`input_schema` (`sub_action`, `query`, `force_override`) für alle 20 Tools unter 5 Intents (`brand_dna_and_auto_listing`, `multichannel_self_healing_sync`, `gra_certificates_and_bespoke`, `autonomous_finance_and_growth`, `ops_invoices_and_concierge`) und `<150ms` `PrecomputedCache`-Antwortzeiten:
  1. `learn_and_audit_brand_dna` (data -> `/api/sidekick/brand/audit-dna`)
  2. `auto_create_styled_listing_and_media` (action -> `/api/sidekick/catalog/auto-styled-listing`)
  3. `generate_and_upgrade_product_media` (action -> `/api/sidekick/catalog/media-upgrade`)
  4. `expand_storefront_collections_and_seo` (action -> `/api/sidekick/brand/expand-store`)
  5. `sync_bilingual_ucp_and_webmcp` (action -> `/api/sidekick/catalog/bilingual-ucp`)
  6. `get_marketplace_health_and_trends` (data -> `/api/sidekick/marketplace/status`)
  7. `full_multichannel_autopilot_sync` (action -> `/api/sidekick/marketplace/autopilot-sync`)
  8. `sync_orders_and_tracking_autopilot` (action -> `/api/sidekick/marketplace/sync-orders`)
  9. `assign_and_verify_gra_certificates` (action -> `/api/sidekick/jewelry/gra-certificates`)
  10. `process_bespoke_unikat_orders` (action -> `/api/sidekick/jewelry/bespoke-orders`)
  11. `get_certificate_dpp_and_evidence_vault` (data -> `/api/sidekick/jewelry/vault`)
  12. `autonomous_pricing_and_profit_guard` (data -> `/api/sidekick/finance/profit-guard`)
  13. `smart_inventory_bundles_and_reorder` (action -> `/api/sidekick/inventory/smart-ops`)
  14. `optimize_and_ab_test_listings` (action -> `/api/sidekick/catalog/growth-ab-test`)
  15. `get_daily_operations_briefing` (data -> `/api/sidekick/ops/briefing`)
  16. `run_full_system_self_heal_and_backup` (action -> `/api/sidekick/ops/self-heal`)
  17. `manage_company_rules_and_brand_dna` (action -> `/api/sidekick/ops/rules`)
  18. `manage_invoices_zugferd_and_datev` (action -> `/api/sidekick/finance/invoices`)
  19. `run_vip_concierge_and_repeat_buyer` (action -> `/api/sidekick/marketing/concierge`)
  20. `draft_support_and_analyze_returns` (action -> `/api/sidekick/support/ops`)

## 5. KOMPLETTE FACHLOGIK FÜR WERTARBEIT MANUFAKTUR
- **Familienbetrieb-Brand-DNA & Verkaufspsychologie:** Herzlicher Familienbetrieb-Ton ("Mit Hand und Liebe gefertigt & lasergraviert"), emotionale Edelstein-/Manufaktur-Geschichten, echte Einzelstück-Verknappung sowie EU/US-FTC-Kennzeichnung für Moissanit & 925 Silber.
- **xTool-Laser Studio SVG-Generator & Individualisierung:** Prüft Gravurtexte (Silber, Schiefer, Holzboxen), speichert fertige `.svg`-Vektordateien unter `/exports/xtool-svg/` + Werkstatt-Laufzettel, generiert Post-Purchase Danke-Seiten-Upsells und dokumentiert den Widerrufsausschluss (§ 312g Abs. 2 Nr. 1 BGB).
- **Auto-Listing, Medien & 2027 AI:** DE/EN-Texte (cm/inch), Studio- & weiße Bilder (`sharp`), 5-Sek.-Produktvideos (`ffmpeg-static` mit sicherem `sharp`-Fallback unter Windows), Kollektions-Ausbau, WebMCP-Juwelierberater, `Shop.md`/`llms.txt`/UCP, Mondphasen-/Geburtsstein-Content-Kalender und 7-Tage-A/B-Tests.
- **Multichannel-Sync & Community-Scout:** Etsy-Richtlinien-Prüfung (mit Inhaber-Override), eBay, Kaufland, 15-Sek.-Sync-Lock, Auto-Adapt bei API-Änderungen, `DRY_RUN_MODE="true"`, sowie 24/7 Nischen- & Micro-Influencer-Scout.
- **Zertifikate, Rechnungen, B2B & Tresor:** GRA-Zertifikate, Digitaler Produktpass (QR), Chargeback-Beweis-PDF (`pdf-lib`), DE/EN-PDF- & ZUGFeRD-E-Rechnungen (inkl. MwSt./§ 19 UStG Option & B2B-Atelier-Autopilot), Monats-DATEV-Export, Silber-/Währungskurs-Wächter, Warenkorb-Concierge (>120 €), VIP-Set-Empfehler und tägliches 23:00-Uhr-Backup (`archiver`) in `/backups` (30-Tage-Rotation).

## 6. AUSFÜHRUNGSPLAN & ABSCHLUSS
1. Installiere konfliktfreie Pakete: `npm install ai @ai-sdk/google minisearch node-cron zod pdf-lib sharp ffmpeg-static archiver` und `npm install -D @types/node-cron @types/archiver`.
