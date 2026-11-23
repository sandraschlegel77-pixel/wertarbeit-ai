import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, useLoaderData } from "react-router";
import { getGiftByToken } from "../services/gift.server";
import { T, type Lang } from "../components/gift/giftText";

export const meta: MetaFunction = () => [
  { title: "Eine Überraschung für Sie · Wertarbeit Manufaktur" },
  { name: "robots", content: "noindex,nofollow" },
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const gift = await getGiftByToken(params.token ?? "");
  if (!gift) throw data("Diese Geschenk-Seite wurde nicht gefunden oder ist abgelaufen.", { status: 404 });
  return data({ gift }, { headers: { "Cache-Control": "private, no-store" } });
};

const CSS = `
.g-wrap{min-height:100vh;background:radial-gradient(circle at 50% 0%,#1E293B,#0F172A 70%);color:#E2E8F0;font-family:Georgia,'Times New Roman',serif;display:grid;place-items:center;padding:24px}
.g-card{max-width:560px;width:100%;text-align:center}
.g-box{width:180px;height:150px;margin:0 auto 24px;position:relative;cursor:pointer;border:0;background:none;padding:0}
.g-lid,.g-base{position:absolute;left:0;right:0;border-radius:6px;background:linear-gradient(135deg,#F3D77A,#D4AF37);box-shadow:0 8px 24px rgba(0,0,0,.5)}
.g-base{bottom:0;height:100px}.g-lid{top:0;height:56px;transform-origin:left top;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.g-open .g-lid{transform:rotate(-62deg) translateY(-8px)}
.g-ribbon{position:absolute;left:50%;top:0;bottom:0;width:22px;margin-left:-11px;background:#0F172A;opacity:.85}
.g-reveal{max-height:0;opacity:0;overflow:hidden;transition:max-height 1s ease,opacity .9s ease .2s}
.g-open .g-reveal{max-height:2400px;opacity:1}
.g-gold{color:#D4AF37}.g-h{color:#F7E7CE;margin:0 0 8px}
.g-msg{background:#162033;border:1px solid #2B3A55;border-radius:14px;padding:20px;line-height:1.7;font-size:18px;white-space:pre-wrap;margin:18px 0}
.g-sec{text-align:left;background:#162033;border:1px solid #2B3A55;border-radius:14px;padding:16px;margin:12px 0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6}
.g-sec h3{margin:0 0 6px;font-size:15px;color:#D4AF37}.g-sec ul{margin:6px 0 0;padding-left:18px}
.g-btn{background:#D4AF37;color:#0F172A;border:0;border-radius:10px;padding:12px 22px;font-weight:700;font-size:16px;cursor:pointer}
.g-ghost{background:none;border:1px solid #D4AF37;color:#F7E7CE;border-radius:10px;padding:8px 14px;cursor:pointer}
.g-foot{margin-top:28px;font-size:13px;color:#94A3B8;font-family:system-ui,sans-serif}.g-foot a{color:#D4AF37}
@media (prefers-reduced-motion:reduce){.g-lid,.g-reveal{transition:none}}
`;

export default function Gift() {
  const { gift } = useLoaderData<typeof loader>();
  const [lang, setLang] = useState<Lang>(gift.locale);
  const [open, setOpen] = useState(false);
  const t = T[lang];

  return (
    <main className={`g-wrap${open ? " g-open" : ""}`} lang={lang}>
      <style>{CSS}</style>
      <div className="g-card">
        <div style={{ textAlign: "right" }}>
          <button type="button" className="g-ghost" onClick={() => setLang(lang === "de" ? "en" : "de")}>
            {t.lang}
          </button>
        </div>

        <h1 className="g-h">{t.title}</h1>
        <p className="g-gold" style={{ marginTop: 0 }}>{t.from(gift.senderName)}</p>

        <button type="button" className="g-box" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? t.close : t.open}>
          <span className="g-base" />
          <span className="g-ribbon" />
          <span className="g-lid" />
        </button>

        {!open && <button type="button" className="g-btn" onClick={() => setOpen(true)}>{t.open}</button>}

        <div className="g-reveal" aria-hidden={!open}>
          <p style={{ fontSize: 18 }}>{t.hello(gift.recipientName)}</p>
          <p style={{ fontFamily: "system-ui,sans-serif", color: "#94A3B8" }}>{t.intro}</p>
          <div className="g-msg">{gift.message}</div>

          <div className="g-sec">
            <h3>{t.yourPiece}</h3>
            <div>{gift.productTitle}</div>
          </div>
          {gift.isUnique && (
            <div className="g-sec">
              <h3>{t.uniqueTitle}</h3>
              <div>{t.uniqueText}</div>
            </div>
          )}
          {gift.certificateNo && (
            <div className="g-sec">
              <h3>{t.certTitle}</h3>
              <div>{t.certText(gift.certificateNo)}</div>
            </div>
          )}
          <div className="g-sec">
            <h3>{t.careTitle}</h3>
            <ul>{t.care.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>

          <p className="g-gold" style={{ marginTop: 24 }}>{t.sign}</p>
          <button type="button" className="g-ghost" onClick={() => setOpen(false)}>{t.close}</button>
          <div className="g-foot">
            {t.shop}
            <br />
            <a href="/returns-portal">{t.returns}</a>
          </div>
        </div>
      </div>
    </main>
  );
}
