import { ReactNode } from "react";
import { C, card } from "./theme";

/** R&D Nischen-Labor & 6 experimentelle Beta-Engines + UniversalConnectorHub */
export function ApexRnDLabPanel(): ReactNode {
  return (
    <section
      aria-label="R&D Nischen-Labor & Beta-Engines"
      style={card}
    >
      <h2 style={{ color: C.champagne }}>R&D Nischen-Labor & Beta-Engines</h2>
      <p style={{ color: C.muted }}>
        6 experimentelle Beta-Engines · UniversalConnectorHub (alle Webseiten · Shopify Basic)·
        0,00 € Verfassungsregel (RULE_00)
      </p>
      <div style={{ marginTop: 12, color: C.text }}>
        <strong>Beta-Engines:</strong> {" "}
        <span>Engine-1 (Sidekick-Integration)</span>{" "}
        <span>Engine-2 (KI-Routing)</span>{" "}
        <span>Engine-3 (Workflow-Optimierung)</span>{" "}
        <span>Engine-4 (Daten-Transformation)</span>{" "}
        <span>Engine-5 (Shopify-Deep-Link)</span>{" "}
        <span>Engine-6 (CRM-Synchronisation)</span>
      </div>
      <div style={{ marginTop: 12, color: C.muted }}>
        <strong>UniversalConnectorHub:</strong> {" "}
        Verbindet alle Webseiten, Shopify Basic, Datenquellen & externe APIs.
      </div>
      <div style={{ marginTop: 12, color: C.muted }}>
        <strong>Verfassungsregel RULE_00:</strong> {" "}
        Alle KI-Operationen unterliegen der Core-Verfassung; keine spontanen
        Änderungen ohne Inhaber-Bestätigung.
      </div>
    </section>
  );
}