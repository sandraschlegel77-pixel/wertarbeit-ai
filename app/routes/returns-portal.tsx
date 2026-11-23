import { useState } from "react";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { data, useFetcher } from "react-router";
import { submitReturnRequest } from "../services/returns.server";
import { guide, type Reason } from "../services/returns-guide";
import { RETURNS_CSS } from "../components/gift/returnsCss";

export const meta: MetaFunction = () => [
  { title: "Umtausch-Portal · Wertarbeit Manufaktur" },
  { name: "description", content: "Nachhaltiger Umtausch statt Retoure – Wertarbeit Manufaktur." },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const f = await request.formData();
  const s = (k: string) => String(f.get(k) ?? "");
  const result = await submitReturnRequest({
    email: s("email"),
    orderNo: s("orderNo"),
    reason: s("reason") as Reason,
    engraved: s("engraved") === "on",
    note: s("note"),
    honeypot: s("website"),
  });
  return data(result, { status: result.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
};

const REASONS: { v: Reason; de: string; en: string }[] = [
  { v: "size", de: "Die Größe passt nicht", en: "The size does not fit" },
  { v: "changed_mind", de: "Es gefällt mir nicht mehr", en: "I changed my mind" },
  { v: "defect", de: "Es ist beschädigt oder mangelhaft", en: "It is damaged or defective" },
  { v: "other", de: "Etwas anderes", en: "Something else" },
];

export default function ReturnsPortal() {
  const f = useFetcher<typeof action>();
  const [lang, setLang] = useState<"de" | "en">("de");
  const [reason, setReason] = useState<Reason>("size");
  const [engraved, setEngraved] = useState(false);
  const de = lang === "de";
  const live = guide(reason, engraved);
  const res = f.data;
  const sent = !!res && res.ok;
  const err = res && !res.ok ? res.error : null;

  return (
    <main className="r-wrap" lang={lang}>
      <style>{RETURNS_CSS}</style>
      <div className="r-card">
        <button type="button" className="r-ghost" onClick={() => setLang(de ? "en" : "de")}>{de ? "English" : "Deutsch"}</button>
        <h1>{de ? "Umtausch statt Retoure" : "Exchange instead of return"}</h1>
        <p className="r-sub">
          {de
            ? "Wir fertigen mit Liebe zum Detail – und tauschen lieber, als dass Pakete hin- und herreisen."
            : "We craft with care – and prefer exchanging over parcels travelling back and forth."}
        </p>

        {sent && res && res.ok ? (
          <div className="r-box r-info" role="status">
            <strong>{de ? "Danke, wir haben Ihre Anfrage erhalten." : "Thank you, we have received your request."}</strong>
            <p style={{ margin: "8px 0 0" }}>{de ? res.guidance.de : res.guidance.en}</p>
            <p style={{ margin: "8px 0 0" }}>{de ? "Wir melden uns persönlich per E-Mail." : "We will get back to you personally by email."}</p>
          </div>
        ) : (
          <f.Form method="post">
            <label htmlFor="email">{de ? "Ihre E-Mail-Adresse" : "Your email address"}</label>
            <input id="email" name="email" type="email" required autoComplete="email" />

            <label htmlFor="orderNo">{de ? "Bestellnummer (optional)" : "Order number (optional)"}</label>
            <input id="orderNo" name="orderNo" type="text" placeholder="#1001" />

            <label htmlFor="reason">{de ? "Was ist passiert?" : "What happened?"}</label>
            <select id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value as Reason)}>
              {REASONS.map((r) => <option key={r.v} value={r.v}>{de ? r.de : r.en}</option>)}
            </select>

            <div className="r-row">
              <input id="engraved" name="engraved" type="checkbox" checked={engraved} onChange={(e) => setEngraved(e.target.checked)} />
              <label htmlFor="engraved" style={{ margin: 0 }}>
                {de ? "Das Stück enthält eine persönliche Gravur" : "The piece contains a personal engraving"}
              </label>
            </div>

            <div className={`r-box ${live.outcome === "engraving_notice" ? "r-warn" : "r-info"}`} aria-live="polite">
              {de ? live.de : live.en}
            </div>

            <label htmlFor="note">{de ? "Ihre Nachricht (optional)" : "Your message (optional)"}</label>
            <textarea id="note" name="note" rows={4} maxLength={1000} />

            <div className="r-hp" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {err && <div className="r-box r-err" role="alert">{err}</div>}
            <button type="submit" className="r-btn" disabled={f.state !== "idle"}>
              {f.state !== "idle" ? (de ? "Wird gesendet…" : "Sending…") : de ? "Anfrage senden" : "Send request"}
            </button>
          </f.Form>
        )}
      </div>
    </main>
  );
}
