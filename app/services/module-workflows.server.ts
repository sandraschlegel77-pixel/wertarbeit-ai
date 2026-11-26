import { executeModuleWithAudit } from "./module-ai-execution.server";
import { OWNER_MODULE_IDS } from "./module-access-core";
import { isConfiguredOwnerShop } from "./access-control-core";

type ModuleId = (typeof OWNER_MODULE_IDS)[number];

const workflows: Record<ModuleId, { task: string; offline: string }> = {
  m1: {
    task: "Erstelle eine Checkliste für einen DE/EN-Produktlisting-Entwurf und Studio-Medien.",
    offline: "Listing-Entwurf: Produktdaten, Material, Maße und Bestand zusammentragen; DE/EN-Texte und Alt-Text formulieren; Bildrechte und Studio-Medien prüfen. Ohne Produktdaten keine Eigenschaften erfinden.",
  },
  m2: {
    task: "Erstelle eine Prüfliste zur Vorbereitung von Rechnungsdaten und Buchhaltungsunterlagen.",
    offline: "Rechnungsprüfung: Belegdaten, Steuerangaben und Exportunterlagen zusammentragen; Format und rechtliche Anforderungen mit der Steuerberatung prüfen. Dies ist keine fertige E-Rechnung oder Rechtsprüfung.",
  },
  m3: {
    task: "Erstelle eine Checkliste für einen manuellen Kundenkommunikations- und Social-Content-Entwurf.",
    offline: "Kommunikationsentwurf: Anliegen und zulässigen Kontaktweg prüfen; eine persönliche Antwort vorbereiten und vor Versand freigeben. Für Social-Medien Bild- und Musikrechte prüfen; keine Nachricht wird versendet.",
  },
  m4: {
    task: "Erstelle eine Prüfliste zur Vorbereitung eines Multichannel-Listings.",
    offline: "Multichannel-Vorbereitung: Bestand, Produktdaten und Kanalvorgaben prüfen; Verbindung und Berechtigungen je Plattform verifizieren. Es wurde kein Marktplatz geprüft, verbunden oder synchronisiert.",
  },
  m5: {
    task: "Erstelle eine Prüfliste für Produktnachweise und einen Gravurauftrag.",
    offline: "Werkstattvorbereitung: Produktdaten und vorhandene Zertifikatsnachweise prüfen; Gravurtext, Material und Maße abstimmen. Es wurde kein Zertifikat geprüft oder erstellt und keine Gravurdatei erzeugt.",
  },
  m6: {
    task: "Erstelle einen Rechercheplan für Markttrends und Lieferantenvergleich.",
    offline: "Markt-Radar: Fragestellung und Vergleichskriterien festlegen; aktuelle Anbieterquellen, Preise und Bedingungen später mit Datum und Quelle prüfen. Es wurde keine Recherche durchgeführt und kein Lieferant kontaktiert.",
  },
};

export async function runModuleWorkflow(shop: string, moduleId: string) {
  const id = OWNER_MODULE_IDS.find((candidate) => candidate === moduleId);
  if (!id) throw new Error("AI_MODULE_INVALID");
  if (!isConfiguredOwnerShop(shop, process.env.OWNER_SHOP_DOMAIN)) {
    throw new Error("AI_MODULE_SUBSCRIPTION_UNVERIFIED");
  }
  const workflow = workflows[id];
  const result = await executeModuleWithAudit({
    shop,
    moduleId: id,
    systemPrompt: "Du erstellst ausschließlich kurze, sachliche Prüflisten auf Deutsch. Erfinde keine Fakten, Prüfungen, Quellen oder Ergebnisse. Keine Rechts- oder Steuerberatung, keine externen Aktionen. Antworte als JSON mit einem Feld text.",
    userPrompt: workflow.task,
    maxTokens: 400,
    offlineFallback: workflow.offline,
  });
  return { moduleId: id, ...result };
}
