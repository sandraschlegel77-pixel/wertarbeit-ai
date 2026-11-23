# AtelierPilot AI — App Store Listing Draft

**Status: internal draft, not ready to submit.** This copy describes the current code-backed product and is intentionally conservative. The present build still has placeholder Sidekick handlers and cloud, legal-contact, data-protection and Shopify live-access gaps listed in the [Master Blueprint](./ATELIERPILOT_MASTER_BLUEPRINT.md). Do not publish savings, revenue or compliance claims as measured facts.

## Deutsch

### App-Name
AtelierPilot AI

### Tagline
Shop-Abläufe sicher prüfen, steuern und im Blick behalten.

### Kurzbeschreibung
Eine Shopify-Admin-Kommandozentrale mit Dry-Run, Inhaberregeln, Freigaben, Aktionsprotokoll und mobilem Kontrollmonitor. Externe Modellprüfungen sind optional; ohne Modellschlüssel laufen die lokalen Regelprüfungen.

### Langbeschreibung
AtelierPilot AI bündelt Shop-Einstellungen, Freigaben und Betriebsübersicht in einer eingebetteten Shopify-App. Händler können ihre Marken- und Betriebsregeln pflegen, Aktionen zunächst im Dry-Run prüfen und einen shopbezogenen Notfall-Schalter verwenden, um KI-Aktionen zu pausieren.

Das Dashboard zeigt Mitarbeiter- und Abteilungsübersichten, offene Freigaben, Audit-Protokolle sowie interne Umsatz-Zuordnungen. Der mobile Monitor bietet einen kompakten Status und den gleichen Pausen- und Freigabezugriff. Die Onboarding-Auswahl löst keine Abrechnung und keine Live-Shopänderung aus.

Die App enthält aktuell 20 Backend-Handler unter einer gebündelten Sidekick-Dispatcher-Architektur. Nicht alle Handler führen bereits eine vollständige Marktplatz-, Medien- oder Finanzintegration aus; Verfügbarkeit und Reifegrad sind vor jeder Veröffentlichung transparent zu kennzeichnen. Externe Modellprüfungen benötigen eine vom Händler konfigurierte OpenRouter-Verbindung. Ohne sie sind nur lokale deterministische Prüfregeln aktiv.

„Echte“ Agenten-Zuordnungen sind interne Buchungen und stellen keinen zusätzlichen Shopumsatz oder garantierte Einsparungen dar. Die App ersetzt keine Rechts-, Steuer- oder Finanzberatung.

### Feature-Bullets
1. Eingebettete Shopify-Admin-Kommandozentrale mit shopgetrennten Einstellungen.
2. Inhaberregeln und Dry-Run als getrennte Schutzmechanismen.
3. Ein-Klick-Pause, die die KI-Aktionen dieses Shops stoppt.
4. Freigabe-Warteschlange für vorgemerkte Aktionen.
5. Mitarbeiter- und Abteilungsübersicht für 220 Stammagenten in 26 Abteilungen.
6. Fakten- und Regelprüfungen mit protokollierten Ergebnissen.
7. Interner Aktionsverlauf mit Undo nur für ausdrücklich unterstützte Protokollaktionen.
8. Mobiler, geschützter Monitor für Status und Freigaben.
9. Dreistufiger Schnellstart, der keine kostenpflichtige Buchung auslöst.
10. Transparente Trennung interner Umsatz-Zuordnungen von tatsächlichem Shopumsatz.

### SEO-Keywords
Shopify Admin, Shop-Automatisierung, Dry-Run, Freigabe-Workflow, Shop-Monitor, KI-Aktionsprotokoll, Shopify-Anwendungen, Händler-Dashboard, Inhaberregeln, Shopify-Sicherheit

### Preisübersicht aus der aktuellen Code-Konfiguration

| Angebot | Monatspreis |
|---|---:|
| Core / Free Audit | 0,00 € |
| Modul 1 — Listing & Studio | 14,90 € |
| Modul 2 — Recht & Steuer | 19,90 € |
| Modul 3 — E-Mail & B2B | 19,90 € |
| Modul 4 — Multichannel | 24,90 € |
| Modul 5 — GRA & xTool | 24,90 € |
| Modul 6 — Markt-Radar | 29,90 € |
| All-in-One | 79,90 € |

Für Jahreszahlung berechnet die aktuelle Quote zehn Monatsraten (zwei Monate rechnerisch frei). Zwei Module erhalten 10 % Bündelrabatt, drei bis fünf Module 20 %; alle sechs Module nutzen den festgelegten All-in-One-Preis. Eine 14-tägige Testphase ist im Billing-Code vorgesehen. **Vor Veröffentlichung sind diese Werte mit dem tatsächlich erzeugten Shopify-Abonnement und dem Partner-Dashboard abzugleichen.**

### FAQ

**Benötige ich einen KI-API-Schlüssel für den Schnellstart?**  
Nein. Onboarding und lokale Regelprüfungen benötigen keinen externen KI-Schlüssel. Eine unabhängige Modell-Zweitprüfung ist ohne OpenRouter-Konfiguration nicht verfügbar.

**Ändert der Schnellstart meinen Shop oder startet er ein Abo?**  
Nein. Er speichert die Auswahl, stellt bei Neukunden den Dry-Run ein und erstellt ein internes Prüfprotokoll. Er startet keine Shopify-Änderung und keine Abrechnung.

**Kann ich alle Aktionen sofort stoppen?**  
Der shopbezogene Pausenschalter blockiert die Sidekick-Aktionen, Agentenläufe, Evolutionsläufe und Mailversand der Installation. Er ist kein Ersatz für die Shopify-Deinstallation oder das Widerrufen von Drittanbieter-Zugangsdaten.

**Sind interne Agenten-Zuordnungen zusätzlicher Umsatz?**  
Nein. Es sind interne Buchungswerte und keine zusätzlichen Verkäufe oder garantierten finanziellen Ergebnisse.

**Sind alle 20 Handler vollständig integriert?**  
Nein. Die Zahl bezeichnet Backend-Handler; einige Integrationen sind noch unvollständig oder liefern Vorschau-/Platzhalterdaten.

## English

### App name
AtelierPilot AI

### Tagline
Review, control and monitor your Shopify operations safely.

### Short description
An embedded Shopify admin hub for dry-run previews, merchant rules, approvals, action history and a mobile monitor. External model review is optional; local rule checks work without an AI key.

### Full description
AtelierPilot AI brings shop settings, approvals and operational status into an embedded Shopify app. Merchants can maintain shop-specific rules, review actions in dry-run mode and use an emergency pause to stop AI actions for their store.

The dashboard presents agent and department views, pending approvals, audit records and internal revenue attributions. The protected mobile monitor provides a compact status view and access to pause and approval controls. Completing onboarding does not start billing or make live shop changes.

The app currently contains 20 backend handlers behind a grouped Sidekick dispatcher. Not every handler provides a complete marketplace, media or finance integration; feature maturity must be stated accurately before publication. External model review requires an OpenRouter connection configured by the merchant. Without it, only deterministic local rules are available.

“Real” agent attributions are internal bookkeeping entries. They are not additional store sales or guaranteed savings. The app does not replace legal, tax or financial advice.

### Feature bullets
1. Embedded Shopify admin hub with shop-scoped settings.
2. Merchant rules and dry-run as separate safeguards.
3. One-click pause for this store's AI actions.
4. Approval queue for actions awaiting review.
5. Agent and department overview for 220 built-in agents across 26 departments.
6. Fact and rule checks with recorded outcomes.
7. Action history with undo only for explicitly supported log actions.
8. Protected mobile monitor for status and approvals.
9. Three-step onboarding that does not create a paid subscription.
10. Clear separation between internal attributions and actual store sales.

### SEO keywords
Shopify admin, store automation, dry run, approval workflow, store monitor, AI action history, Shopify app, merchant dashboard, merchant rules, Shopify safety

### Pricing from the current code configuration

| Offer | Monthly price |
|---|---:|
| Core / Free Audit | €0.00 |
| Module 1 — Listing & Studio | €14.90 |
| Module 2 — Legal & Finance | €19.90 |
| Module 3 — Email & B2B | €19.90 |
| Module 4 — Multichannel | €24.90 |
| Module 5 — GRA & xTool | €24.90 |
| Module 6 — Market Radar | €29.90 |
| All-in-One | €79.90 |

Annual billing currently charges ten monthly installments (two months effectively free). Two modules receive a 10% bundle discount; three to five receive 20%; all six use the configured All-in-One price. A 14-day trial is present in the billing code. **Verify actual Shopify subscriptions and Partner Dashboard configuration before publication.**

### FAQ

**Do I need an AI API key for onboarding?**  
No. Onboarding and local rule checks work without an external AI key. Independent model review is unavailable until the merchant configures OpenRouter.

**Does onboarding change my store or start a subscription?**  
No. It stores setup choices, enables dry-run for a new merchant and records an internal check. It does not change Shopify data or start billing.

**Can I stop all actions immediately?**  
The shop-scoped pause blocks Sidekick actions, agent runs, evolution runs and mail sending for that installation. It does not replace uninstalling the app or revoking third-party credentials.

**Are agent attributions extra revenue?**  
No. They are internal bookkeeping values, not additional sales or guaranteed financial results.

**Are all 20 handlers fully integrated?**  
No. The count refers to backend handlers; some integrations remain incomplete or return preview/placeholder data.

### Reviewer test instructions

1. Install the app on a development store and open the embedded dashboard.
2. Complete the three-step onboarding; confirm that no subscription is created and no product/order is modified.
3. Verify that the new merchant remains in dry-run mode and can open the approvals and action-history areas.
4. Trigger the global pause and verify an attempted Sidekick/agent action is blocked; unpause only after confirming the shop is still in dry-run.
5. Open `/mobile-monitor` using the authenticated dashboard QR flow and verify the same pause and approval status.
6. No external AI API key is required for these checks. Without OpenRouter, the UI must identify the supervisor mode as local rules rather than an independent model audit.
7. Do not send live emails, create paid subscriptions or modify production product/order data during review.

**Pre-submission blockers:** confirm applicable registry/representative details, hosting and retention disclosures, complete the privacy and data-redaction review, configure durable production storage, replace deployment URLs, and replace or remove every incomplete handler claim.
