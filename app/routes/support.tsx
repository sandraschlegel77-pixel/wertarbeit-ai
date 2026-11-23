import type { MetaFunction } from "react-router";

const SUPPORT_URL = "https://wertarbeitmanufaktur.com";

export const meta: MetaFunction = () => [
  { title: "Support | AtelierPilot AI" },
  { name: "description", content: "Support und Kontakt für AtelierPilot AI." },
  { name: "robots", content: "index,follow" },
];

export default function Support() {
  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 20, fontFamily: "system-ui, sans-serif", lineHeight: 1.65 }}>
      <h1>Support / Support</h1>
      <p>
        <strong>Betreiberin / Operator:</strong> Sandra Schlegel, Wertarbeit Manufaktur
        <br />
        Kaiserbauerstr. 6, 86476 Neuburg a. d. Kammel, Deutschland
        <br />
        <strong>E-Mail:</strong> <a href="mailto:wertarbeit.manufaktur@gmail.com">wertarbeit.manufaktur@gmail.com</a>
        <br />
        <strong>USt-IdNr. / VAT ID:</strong> DE297357263
        <br />
        <strong>Website:</strong> <a href={SUPPORT_URL}>wertarbeitmanufaktur.com</a>
      </p>

      <section lang="de">
        <h2>Deutsch</h2>
        <h3>Hilfe zur App</h3>
        <p>
          Für Fragen zur Installation, zu Freigaben, Dry-Run, KI-Pause oder Datenverarbeitung nutzen Sie bitte den
          Kontaktweg auf unserer Website. Beschreiben Sie dabei möglichst den betroffenen Shop und die App-Funktion;
          senden Sie keine Passwörter, API-Schlüssel, Tokens oder vollständigen Kundendatensätze.
        </p>
        <h3>Sicher testen</h3>
        <p>
          Neue Installationen durchlaufen einen Schnellstart mit Dry-Run. Die Auswahl im Assistenten bucht kein
          kostenpflichtiges Abo. Prüfen Sie Freigaben, bevor Sie eine Aktion mit Außenwirkung ausführen.
        </p>
      </section>

      <section lang="en">
        <h2>English</h2>
        <h3>App assistance</h3>
        <p>
          For help with installation, approvals, dry-run, the AI pause or data processing, use the contact channel on
          our website. Please identify the affected store and feature, but do not send passwords, API keys, tokens or
          full customer records.
        </p>
        <h3>Safe testing</h3>
        <p>
          New installations use a dry-run onboarding flow. Choosing a plan in the wizard does not create a paid
          subscription. Review approvals before performing an action with external effects.
        </p>
      </section>
    </main>
  );
}
