import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { C, btn, card } from "./theme";

/** QR-Code-Login zum Handy-Kontrollmonitor (/mobile-monitor). Läuft komplett im Browser (0 €). */
export function QrModal({
  open,
  onClose,
  monitorPath,
}: {
  open: boolean;
  onClose: () => void;
  monitorPath: string | null;
}) {
  const [src, setSrc] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!monitorPath) {
      setSrc("");
      setUrl("");
      return;
    }
    // Der Link ist 10 Minuten gültig und meldet das Handy danach 30 Tage lang an.
    const target = `${window.location.origin}${monitorPath}`;
    setUrl(target);
    QRCode.toDataURL(target, { margin: 1, width: 240, color: { dark: "#0F172A", light: "#F7E7CE" } })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [open, monitorPath]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR-Code Handy-Kontrollmonitor"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 50, display: "grid", placeItems: "center" }}
    >
      <div style={{ ...card, borderColor: C.gold, textAlign: "center", maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        <strong style={{ color: C.champagne }}>Handy-Kontrollmonitor</strong>
        {src && <img src={src} alt="QR-Code zum Handy-Kontrollmonitor" width={240} height={240} style={{ display: "block", margin: "12px auto" }} />}
        {!monitorPath && (
          <div style={{ fontSize: 13, color: C.amber, margin: "12px 0" }}>
            Monitor gesperrt: Setzen Sie MOBILE_MONITOR_TOKEN (mind. 16 Zeichen) in der .env und starten Sie neu.
          </div>
        )}
        {monitorPath && <div style={{ fontSize: 12, color: C.muted }}>QR-Code 10 Minuten gültig – danach neu öffnen.</div>}
        <button type="button" style={{ ...btn, marginTop: 12 }} onClick={onClose}>Schließen</button>
      </div>
    </div>
  );
}
