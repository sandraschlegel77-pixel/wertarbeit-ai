import type { MetaFunction } from "react-router";

const CONTACT_URL = "https://wertarbeitmanufaktur.com";

export const meta: MetaFunction = () => [
  { title: "Datenschutz | AtelierPilot AI" },
  { name: "description", content: "Datenschutzhinweise für die Shopify-App AtelierPilot AI." },
  { name: "robots", content: "index,follow" },
];

export default function Privacy() {
  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 20, fontFamily: "system-ui, sans-serif", lineHeight: 1.65 }}>
      <h1>Datenschutz / Privacy</h1>
      <p>
        <strong>Betreiberin / Operator:</strong> Sandra Schlegel, Wertarbeit Manufaktur
        <br />
        Kaiserbauerstr. 6, 86476 Neuburg a. d. Kammel, Deutschland
        <br />
        <strong>E-Mail:</strong> <a href="mailto:wertarbeit.manufaktur@gmail.com">wertarbeit.manufaktur@gmail.com</a>
        <br />
        <strong>USt-IdNr. / VAT ID:</strong> DE297357263
        <br />
        <strong>Website:</strong> <a href={CONTACT_URL}>wertarbeitmanufaktur.com</a>
      </p>

      <section lang="de">
        <h2>Deutsch</h2>
        <h3>Verantwortlichkeit und Daten</h3>
        <p>
          AtelierPilot AI verarbeitet Daten eines verbundenen Shopify-Shops, um Anmeldung, Konfiguration und die
          vom Shopbetreiber gestarteten App-Funktionen bereitzustellen. Dazu können Shop-Domain, Shopify-Sitzungs-
          und Berechtigungsdaten, Produkte, Bestellungen, Einstellungen, Freigaben, Prüf- und Aktionsprotokolle,
          Umsatz-Zuordnungen sowie – wenn eine Funktion dies benötigt – Kundenkontakt- oder Geschenkangaben gehören.
          Der Zugriff auf Shopify-Daten richtet sich nach den bei der Installation genehmigten Berechtigungen.
        </p>
        <h3>Verwendung und externe Dienste</h3>
        <p>
          Daten werden für Authentifizierung, Shop- und Aktionsverwaltung, Freigabeabläufe, Support sowie die
          angeforderten Funktionen verarbeitet. Wenn ein Betreiber OpenRouter konfiguriert, kann eine Meta-Prüfung
          eine begrenzte Aufgabenbeschreibung und Agenten-Metadaten an OpenRouter übermitteln; Kundeninhalte sind
          dafür nicht vorgesehen. Ohne diesen Schlüssel verwendet die Prüfung lokale Regeln. Shopify verarbeitet
          Daten außerdem im Rahmen seiner eigenen Dienste.
        </p>
        <h3>Speicherung, Aufbewahrung und Rechte</h3>
        <p>
          App-Daten werden in der für die jeweilige Installation konfigurierten Datenbank gespeichert. Eine
          einheitliche automatische Aufbewahrungsfrist ist derzeit nicht zugesichert. Für Auskunft, Berichtigung,
          Löschung oder Fragen zur Verarbeitung wenden Sie sich an die oben angegebene E-Mail-Adresse. Datenzugriffe
          und Löschpflichten richten sich zusätzlich nach den Shopify-Prozessen und der konkreten Konfiguration der
          Installation.
        </p>
        <p>
          Die Hosting- und Aufbewahrungskonfiguration sowie die rechtliche Einordnung der Verarbeitung müssen vor
          einer öffentlichen App-Store-Veröffentlichung ergänzt und geprüft werden. Diese Seite ist daher noch keine
          Freigabe für eine rechtliche Veröffentlichung.
        </p>
      </section>

      <section lang="en">
        <h2>English</h2>
        <h3>Controller and data</h3>
        <p>
          AtelierPilot AI processes data from a connected Shopify store to provide authentication, configuration and
          features initiated by the merchant. This may include the store domain, Shopify session and permission data,
          products, orders, settings, approvals, audit and activity logs, revenue attributions and, when a feature
          requires it, customer contact or gift-message details. Shopify data access is limited to permissions
          approved during installation.
        </p>
        <h3>Use and external services</h3>
        <p>
          Data is used for authentication, store and action management, approval workflows, support and requested
          features. If the merchant configures OpenRouter, a meta-review may send limited task descriptions and agent
          metadata to OpenRouter; customer content is not intended for that review. Without that key, the review
          uses local rules. Shopify also processes data under its own services.
        </p>
        <h3>Storage, retention and rights</h3>
        <p>
          App data is stored in the database configured for the installation. A single automatic retention period is
          not currently guaranteed. To request access, correction or deletion, or to ask questions about processing,
          contact the operator at the email address above. Data access and deletion obligations also depend on
          Shopify processes and the installation&apos;s configuration.
        </p>
        <p>
          The hosting and retention configuration and the legal assessment of processing must be completed and
          reviewed before public App Store publication. This page is not legal clearance for publication.
        </p>
      </section>
    </main>
  );
}
