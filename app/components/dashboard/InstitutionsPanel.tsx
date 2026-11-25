/**
 * InstitutionsPanel — 28 Institutionen direkt mit Sektor 3 verknüpft.
 * Polizei, FBI, Feuerwehr, Krankenhaus, Quarantäne, Bewährung + 23 weitere.
 */
import { C } from "./theme";

const INSTITUTIONS = [
  { id: "POLICE_01", name: "Polizei", code: "PATROL-01", status: "Online" },
  { id: "FBI_X", name: "Federal Bureau of Investigation", code: "BUREAU-X", status: "Online" },
  { id: "FIRE_112", name: "Feuerwehr", code: "RESCUE-112", status: "Online" },
  { id: "HOSP_MED", name: "Krankenhaus", code: "MED-CENTER", status: "Online" },
  { id: "QUAR_9", name: "Quarantänestation", code: "CELL-9", status: "Standby" },
  { id: "PROBATION", name: "Bewährungshelfer", code: "PROB-01", status: "Online" },
  { id: "COURT_01", name: "Amtsgericht", code: "COURT-A", status: "Online" },
  { id: "POLICE_02", name: "Kriminalpolizei", code: "PATROL-02", status: "Online" },
  { id: "INTERPOL", name: "INTERPOL", code: "INT-001", status: "Online" },
  { id: "EUA", name: "Europol", code: "EU-001", status: "Online" },
  { id: "TAX_01", name: "Finanzamt", code: "TAX-01", status: "Online" },
  { id: "ZOLL", name: "Zollverwaltung", code: "CUST-01", status: "Online" },
  { id: "IMMIGR", name: "Ausländerbehörde", code: "IMM-01", status: "Online" },
  { id: "LABOR_01", name: "Gewerbeaufsichtsamt", code: "LAB-01", status: "Online" },
  { id: "HEALTH_01", name: "Gesundheitsamt", code: "HLTH-01", status: "Online" },
  { id: "FIRE_02", name: "Feuerwehr (Zentral)", code: "RESCUE-02", status: "Online" },
  { id: "RESCUE_WATER", name: "Wasserwacht", code: "WATER-01", status: "Standby" },
  { id: "MOUNTAIN", name: "Bergwacht", code: "MOUNT-01", status: "Standby" },
  { id: "TECHNICAL", name: "Technisches Hilfswerk", code: "THW-01", status: "Online" },
  { id: "POISON", name: "Giftnotruf", code: "POISON-01", status: "Online" },
  { id: "CRISIS", name: "Krisenstab", code: "CRISIS-01", status: "Standby" },
  { id: "ENV_01", name: "Umweltbehörde", code: "ENV-01", status: "Online" },
  { id: "NUCLEAR", name: "Atomaufsicht", code: "NUC-01", status: "Standby" },
  { id: "CYBER", name: "Cybercrime-Einheit", code: "CYBER-01", status: "Online" },
  { id: "ANTITRUST", name: "Kartellamt", code: "ANTI-01", status: "Online" },
  { id: "CONSUMER", name: "Verbraucherschutz", code: "CONS-01", status: "Online" },
  { id: "DATA", name: "Datenschutzbehörde", code: "DPO-01", status: "Online" },
  { id: "AVIATION", name: "Luftfahrtbehörde", code: "AVIA-01", status: "Standby" },
] as const;

export function InstitutionsPanel() {
  return (
    <div style={{ padding: 16, color: C.champagne }}>
      <div
        style={{
          fontWeight: 800,
          color: C.gold,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
          borderBottom: `1px solid ${C.line}`,
          paddingBottom: 8,
        }}
      >
        28 INSTITUTIONEN · SEKTOR 3
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {INSTITUTIONS.map((inst) => (
          <div
            key={inst.id}
            style={{
              background: "rgba(16, 22, 33, 0.6)",
              border: `1px solid ${inst.status === "Online" ? C.emerald : C.amber}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 11,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ fontWeight: 700, color: C.champagne }}>{inst.name}</div>
            <div style={{ color: C.muted, fontSize: 10, fontFamily: "monospace" }}>{inst.code}</div>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: inst.status === "Online" ? C.emerald : C.amber,
                boxShadow: `0 0 6px ${inst.status === "Online" ? C.emerald : C.amber}`,
                alignSelf: "flex-start",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}