/**
 * OMEGA PRIME · 28 Institutionen des Hoheits-, Zivil- und Spezial-Apparats.
 */

export type InstitutionType = "hoheitsbehoerde" | "zivil" | "spezial"
export type QuarantineCell = "ISOLATION CELL-9" | "MED-CENTER"

export interface ApexInstitution {
  id: string
  name: string
  code: string
  type: InstitutionType
  serviceTitles: string[]
  quarantine: QuarantineCell
  description: string
}

export const APEX_INSTITUTIONS_28: ApexInstitution[] = [
  { id: "patrol-01", name: "Bundespolizei", code: "APEX PATROL-01", type: "hoheitsbehoerde", serviceTitles: ["Wachtmeister","Hauptkommissar","Polizeidirektor","Generalinspekteur"], quarantine: "ISOLATION CELL-9", description: "Öffentliche Sicherheit, Ordnungs- und Schutzpolizei, Verkehrsüberwachung." },
  { id: "bureau-x", name: "Bundeskriminalamt", code: "APEX BUREAU-X", type: "hoheitsbehoerde", serviceTitles: ["Kriminalkommissar","BKA-Referent","BKA-Direktor","BKA-Präsident"], quarantine: "ISOLATION CELL-9", description: "Ermittlungen in schweren Straftaten, Terrorismusabwehr, internationale Kooperation." },
  { id: "rescue-112", name: "Bundesfeuerwehr", code: "APEX RESCUE-112", type: "hoheitsbehoerde", serviceTitles: ["Truppmann","Brandmeister","Brandamtsrat","Direktor der Feuerwehr"], quarantine: "ISOLATION CELL-9", description: "Brandbekämpfung, Technische Hilfeleistung, Katastrophenschutz." },
  { id: "aegis-7", name: "Bundesnachrichtendienst", code: "AEGIS-7", type: "hoheitsbehoerde", serviceTitles: ["Analyst","Referent","Abteilungsleiter","BND-Präsident"], quarantine: "ISOLATION CELL-9", description: "Geheimdienstliche Aufklärung, Cyberspionage-Abwehr, strategische Frühwarnung." },
  { id: "court-lex", name: "Bundesgerichtshof", code: "APEX COURT-LEX", type: "hoheitsbehoerde", serviceTitles: ["Rechtsreferendar","Richter","Senatsvorsitzender","BGH-Präsident"], quarantine: "ISOLATION CELL-9", description: "Rechtsprechung, Verfassungsgerichtsbarkeit, zivil- und strafrechtliche Revisionsinstanz." },
  { id: "customs-z", name: "Zollverwaltung", code: "APEX CUSTOMS-Z", type: "hoheitsbehoerde", serviceTitles: ["Zollkommissar","Zollrat","Zolldirektor","Präsident der Zollverwaltung"], quarantine: "ISOLATION CELL-9", description: "Einfuhrkontrolle, Verbrauchsteuer, Schmuggelbekämpfung, Binnenmarkt-Aufsicht." },
  { id: "antitrust-ca", name: "Kartellamt", code: "APEX ANTITRUST-CA", type: "hoheitsbehoerde", serviceTitles: ["Referent","Dezernent","Abteilungsleiter","Präsident des Bundeskartellamts"], quarantine: "ISOLATION CELL-9", description: "Wettbewerbsaufsicht, Fusionskontrolle, Missbrauchsaufsicht marktbeherrschender Stellungen." },
]