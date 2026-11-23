import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return { showForm: Boolean(login) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  return (
    <div className={styles.index}>
      <section className={styles.hero} style={{ display: "block", marginBottom: "3rem" }}>
        <h2 className={styles.heading}>AtelierPilot AI Core – Prozessor Rückseite & Platinen-Leiterbahnen</h2>
        <p className={styles.text}>Der goldene Core-Prozessor der Manufaktur.</p>

        {/* Interaktive SVG-Grafik: goldene Leiterbahnen, 6 Modul-Chips, Mitteleinrichtung */}
        <svg viewBox="0 0 2048 1024" className={styles.svg} aria-label="Prozessor-Rückseite & Platinen-Leiterbahnen">
          {/* Goldenes Zentrum – Core-Prozessor */}
          <circle cx="1024" cy="512" r="450" fill="#FFD700" />
          {/* Sechs Module-Chips drumherum */}
          <g transform="translate(800, 200)">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x={(i * 80) - 10} y={(i * 150) - 10} width="140" height="110" fill="#C9A227" stroke="#B8860B" />
            ))}
          </g>
          {/* Leuchtende Gold-Leiterbahnen */}
          <path d="M0,0 L1024,500 L2048,500 Z" fill="#FFD700" opacity="0.15" />
          <path d="M0,1024 L1024,1024 L2048,1024 Z" fill="#FFD700" opacity="0.15" />
        </svg>

        {/* Klickbare Info-Popovers mit Funktion & Preisen (Modul-Chips) */}
        <div className={styles.popover}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <button key={i} onClick={() => document.getElementById(`popover-${i}`)!?.classList.toggle("open")}>
              Module {i}
            </button>
          ))}
        </div>
      </section>

      {showForm && (
        <Form className={styles.form} method="post">
          <label className={styles.label}>
            <span>Shop domain</span>
            <input className={styles.input} type="text" name="shop" />
            <span>{errors?.shop ?? "e.g: my-shop-domain.myshopify.com"}</span>
          </label>
          <button className={styles.button} type="submit">Log in</button>
        </Form>
      )}
      <ul className={styles.list}>
        <li>
          <strong>Product feature</strong>. Some detail about your feature and its benefit to your customer.
        </li>
        <li>
          <strong>Product feature</strong>. Some detail about your product category.
        </li>
        <li>
          <strong>Additional details for the listing.</strong>.
        </li>
      </ul>
    </div>
  );
}

