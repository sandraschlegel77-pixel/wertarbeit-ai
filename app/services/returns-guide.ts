/** Client-sichere Umtausch-Texte (§ 312g Abs. 2 Nr. 1 BGB) – ohne Server-Abhängigkeiten. */
export type Reason = "size" | "changed_mind" | "defect" | "other";
export type Outcome = "exchange_size" | "voucher" | "engraving_notice" | "defect_help" | "review";

export interface Guidance {
  outcome: Outcome;
  de: string;
  en: string;
}

export function guide(reason: Reason, engraved: boolean): Guidance {
  if (reason === "defect") {
    return {
      outcome: "defect_help",
      de: "Das tut uns leid. Bei einem Mangel gelten Ihre gesetzlichen Gewährleistungsrechte – auch bei Gravuren. Bitte schildern Sie uns kurz den Mangel; wir melden uns mit einer Lösung.",
      en: "We are sorry. Your statutory warranty rights apply to defects – including engraved pieces. Please describe the defect briefly and we will come back with a solution.",
    };
  }
  if (engraved) {
    return {
      outcome: "engraving_notice",
      de: "Persönlich gravierte Stücke werden nach Ihren Angaben angefertigt. Dafür besteht nach § 312g Abs. 2 Nr. 1 BGB kein gesetzliches Widerrufsrecht. Senden Sie uns Ihre Anfrage trotzdem – wir schauen gemeinsam, was möglich ist, und entscheiden das persönlich.",
      en: "Personally engraved pieces are made to your specification. Under § 312g (2) no. 1 German Civil Code there is no statutory right of withdrawal for them. Please still send your request – we will look at what is possible and decide personally.",
    };
  }
  if (reason === "size") {
    return {
      outcome: "exchange_size",
      de: "Kein Problem – das passiert bei Ringen oft. Am nachhaltigsten ist ein Umtausch gegen eine passende Größe (bei Unikaten schauen wir, ob ein anderes Unikat in Ihrer Größe passt) oder ein Wertgutschein über den Kaufpreis.",
      en: "No problem – this often happens with rings. The most sustainable option is an exchange for a fitting size (for one-of-a-kind pieces we check whether another unique piece in your size suits you) or a value voucher for the purchase price.",
    };
  }
  return {
    outcome: reason === "changed_mind" ? "voucher" : "review",
    de: "Gern helfen wir Ihnen weiter. Bevor etwas zurückreist, bieten wir einen Umtausch oder einen Wertgutschein an – das schont die Umwelt. Ihr gesetzliches Widerrufsrecht bleibt davon unberührt.",
    en: "We are happy to help. Before anything travels back, we offer an exchange or a value voucher – it is kinder to the environment. Your statutory right of withdrawal remains unaffected.",
  };
}

