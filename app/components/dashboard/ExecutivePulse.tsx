import { C, card } from "./theme";

export function ExecutivePulse({ sentences }: { sentences: string[] }) {
  return (
    <section style={{ ...card, borderColor: C.gold, display: "grid", gap: 6 }} aria-label="Inhaber-Puls">
      <strong style={{ color: C.champagne }}>#000 Sovereign Meta-Supervisor · 3-Satz-Inhaber-Puls</strong>
      <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.5 }}>
        {sentences.map((sentence) => <li key={sentence}>{sentence}</li>)}
      </ol>
    </section>
  );
}
