import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import QRCode from "qrcode";
import { C, btnGold, card, input } from "./theme";

type GiftResult = { ok?: boolean; message?: string; giftPath?: string; giftUrl?: string };

/** Geschenk-Botschaft: erzeugt /gift/<token> samt QR-Code (läuft im Browser, 0 €). */
export function GiftForm() {
  const f = useFetcher<GiftResult>();
  const busy = f.state !== "idle";
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const link = f.data?.ok && f.data.giftPath ? `${typeof window !== "undefined" ? window.location.origin : ""}${f.data.giftPath}` : "";
  // Bevorzugt die öffentliche App-URL vom Server, sonst die aktuelle Origin.
  const shown = f.data?.giftUrl && f.data.giftUrl.startsWith("http") ? f.data.giftUrl : link;

  useEffect(() => {
    if (!shown) {
      setQr("");
      return;
    }
    QRCode.toDataURL(shown, { margin: 1, width: 200, color: { dark: "#0F172A", light: "#F7E7CE" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [shown]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Zwischenablage nicht verfügbar */
    }
  };

  return (
    <div style={card}>
      <strong style={{ color: C.champagne }}>Digitale Geschenk-Botschaft</strong>
      <div style={{ fontSize: 12, color: C.muted, margin: "4px 0 8px" }}>
        Erzeugt eine edle Überraschungsseite (DE/EN) mit persönlicher Botschaft – Link und QR-Code für die Paket-Grußkarte.
      </div>
      <f.Form method="post" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <input type="hidden" name="type" value="create_gift" />
        <label style={{ display: "grid", gap: 2, fontSize: 12 }}>
          Empfänger*in
          <input name="recipientName" required maxLength={60} style={input} placeholder="z. B. Anna" />
        </label>
        <label style={{ display: "grid", gap: 2, fontSize: 12 }}>
          Von
          <input name="senderName" maxLength={60} style={input} placeholder="z. B. Thomas" />
        </label>
        <label style={{ display: "grid", gap: 2, fontSize: 12 }}>
          Produkt
          <input name="productTitle" maxLength={120} style={input} placeholder="z. B. Moissanit-Ring" />
        </label>
        <label style={{ display: "grid", gap: 2, fontSize: 12 }}>
          GRA-/Produkt-Tag (optional)
          <input name="certificateNo" maxLength={40} style={input} placeholder="GRA-123456" />
        </label>
        <label style={{ display: "grid", gap: 2, fontSize: 12, gridColumn: "1 / -1" }}>
          Persönliche Grußbotschaft
          <textarea name="message" required minLength={3} maxLength={800} rows={3} style={{ ...input, resize: "vertical" }} />
        </label>
        <label style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" name="isUnique" value="1" /> Unikat (Einzelstück)
        </label>
        <label style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
          Sprache
          <select name="locale" style={input} defaultValue="de">
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </label>
        <button type="submit" style={btnGold} disabled={busy}>{busy ? "Erstelle …" : "Geschenk-Link erstellen"}</button>
      </f.Form>
      {f.data && !f.data.ok && <div style={{ color: C.amber, fontSize: 13, marginTop: 8 }}>{f.data.message}</div>}
      {shown && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
          {qr && <img src={qr} alt="QR-Code zur Geschenk-Botschaft" width={140} height={140} />}
          <div style={{ fontSize: 13, wordBreak: "break-all", maxWidth: 360 }}>
            <div style={{ color: C.emerald }}>{f.data?.message}</div>
            <a href={shown} target="_blank" rel="noreferrer" style={{ color: C.champagne }}>{shown}</a>
            <div>
              <button type="button" onClick={copy} style={{ ...btnGold, marginTop: 8 }}>{copied ? "Kopiert ✓" : "Link kopieren"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
