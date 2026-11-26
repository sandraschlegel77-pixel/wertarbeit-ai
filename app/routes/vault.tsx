import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator, type ActionFunctionArgs, type HeadersFunction, type LoaderFunctionArgs } from "react-router";
import { auditVaultAction, VaultAuthError, verifyOwnerVaultPassword } from "../services/owner-vault-auth.server";
import { OwnerVaultBackupError } from "../services/owner-vault-backup.server";
import {
  deleteOwnerVaultSecret, exportOwnerVaultBackup, importOwnerVaultBackup, importOwnerVaultSecrets,
  listOwnerVaultSecrets, OwnerVaultInputError, revealOwnerVaultSecret, saveOwnerVaultSecret,
} from "../services/owner-vault.server";
import { clearStandaloneCookie, createStandaloneSession, getStandaloneSession, revokeStandaloneSession, standaloneOriginAllowed, standaloneOwnerShops } from "../services/owner-vault-standalone.server";

const securityHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status = 200, cookie?: string) {
  const headers = new Headers(securityHeaders);
  if (cookie) headers.set("Set-Cookie", cookie);
  return Response.json(body, { status, headers });
}

export const headers: HeadersFunction = ({ actionHeaders, loaderHeaders }) => {
  const headers = new Headers(securityHeaders);
  const cookie = actionHeaders.get("Set-Cookie") ?? loaderHeaders.get("Set-Cookie");
  if (cookie) headers.set("Set-Cookie", cookie);
  return headers;
};

type VaultEntry = {
  shop: string; id: string; label: string; provider?: string; category?: string; stage?: string;
  username?: string; url?: string; modelHint?: string; notes?: string;
};
type VaultPage = { unlocked: boolean; shops?: string[]; entries?: VaultEntry[]; expiresAt?: number; message?: string };
type VaultResult = { ok: boolean; action?: string; message?: string; id?: string; shop?: string; secret?: string; backup?: string; expired?: boolean };

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getStandaloneSession(request);
    if (!session) return json({ unlocked: false });
    const shops = standaloneOwnerShops();
    const entries: VaultEntry[] = [];
    for (const shop of shops) {
      const listing = await listOwnerVaultSecrets(shop);
      entries.push(...listing.entries.map((entry) => ({ ...entry, shop })));
    }
    return json({ unlocked: true, shops, entries, expiresAt: session.expiresAt });
  } catch {
    console.error("[standalone-vault] Tresor konnte nicht geladen werden.");
    return json({ unlocked: false, message: "Tresor nicht verfügbar. Serverkonfiguration und Datenbank prüfen." }, 503);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
  if (!standaloneOriginAllowed(request)) return json({ ok: false, message: "Ungültiger Anfrage-Ursprung." }, 403);
  const contentLength = request.headers.get("Content-Length");
  if (contentLength && Number(contentLength) > 5 * 1024 * 1024) return json({ ok: false, message: "Anfrage ist zu groß." }, 413);
  try {
    const form = await request.formData();
    const type = form.get("type");
    if (type === "unlock") {
      const password = form.get("password");
      if (typeof password !== "string" || password.length > 1024) throw new OwnerVaultInputError("Ungültige Eingabe.");
      const shop = standaloneOwnerShops()[0];
      await verifyOwnerVaultPassword(shop, password);
      return json({ ok: true, action: "unlock" }, 200, await createStandaloneSession(shop));
    }
    const session = await getStandaloneSession(request);
    if (!session) return json({ ok: false, expired: true, message: "Tresorsitzung abgelaufen. Bitte erneut entsperren." }, 401, clearStandaloneCookie);
    if (type === "lock") {
      await revokeStandaloneSession(session);
      return json({ ok: true, action: "lock" }, 200, clearStandaloneCookie);
    }
    if (type === "ping") return json({ ok: true, action: "ping" });
    const shop = form.get("shop");
    if (typeof shop !== "string" || !standaloneOwnerShops().includes(shop)) throw new OwnerVaultInputError("Ungültiger Inhaber-Shop.");
    if (type === "reveal") {
      const id = form.get("id");
      if (typeof id !== "string") throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
      const secret = await revealOwnerVaultSecret(shop, id);
      await auditVaultAction(shop, "reveal", "completed");
      return json({ ok: true, action: "reveal", id, shop, secret });
    }
    if (type === "delete") {
      const id = form.get("id");
      if (typeof id !== "string") throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
      await deleteOwnerVaultSecret(shop, id);
      return json({ ok: true, action: "delete", message: "Eintrag gelöscht." });
    }
    if (type === "save") {
      const label = form.get("label");
      const secret = form.get("secret");
      const provider = form.get("provider");
      const stage = form.get("stage");
      const modelHint = form.get("modelHint");
      if (typeof label !== "string" || typeof secret !== "string" || typeof provider !== "string" || typeof stage !== "string" || typeof modelHint !== "string") {
        throw new OwnerVaultInputError("Ungültige Eingabe.");
      }
      await saveOwnerVaultSecret(shop, label, secret, { provider, stage, modelHint });
      return json({ ok: true, action: "save", message: "Verschlüsselt gespeichert." });
    }
    if (type === "bulk_import") {
      const input = form.get("input");
      const mode = form.get("mode");
      if (typeof input !== "string" || typeof mode !== "string") throw new OwnerVaultInputError("Ungültige Importdaten.");
      const result = await importOwnerVaultSecrets(shop, input, mode, {});
      return json({ ok: true, action: "bulk_import", message: `${result.created} neu, ${result.updated} aktualisiert, ${result.skipped} übersprungen.` });
    }
    if (type === "export" || type === "backup_import") {
      const password = form.get("backupPassword");
      if (typeof password !== "string") throw new OwnerVaultInputError("Backup-Passwort fehlt.");
      if (type === "export") return json({ ok: true, action: "export", backup: await exportOwnerVaultBackup(shop, password) });
      const file = form.get("backup");
      const mode = form.get("mode");
      if (!file || typeof file === "string" || file.size > 4 * 1024 * 1024 || typeof mode !== "string") {
        throw new OwnerVaultInputError("Ungültige Backup-Datei oder Duplikatbehandlung.");
      }
      const result = await importOwnerVaultBackup(shop, await file.text(), password, mode);
      return json({ ok: true, action: "backup_import", message: `${result.created} neu, ${result.updated} aktualisiert, ${result.skipped} übersprungen.` });
    }
    throw new OwnerVaultInputError("Unbekannte Tresoraktion.");
  } catch (error) {
    if (error instanceof VaultAuthError) return json({ ok: false, message: error.message }, error.status);
    if (error instanceof OwnerVaultInputError || error instanceof OwnerVaultBackupError) return json({ ok: false, message: error.message }, 400);
    console.error("[standalone-vault] Tresoraktion fehlgeschlagen.");
    return json({ ok: false, message: "Tresoraktion fehlgeschlagen. Datenbank und Serverkonfiguration prüfen." }, 503);
  }
}

export default function StandaloneVault() {
  const data = useLoaderData<VaultPage>();
  const fetcher = useFetcher<VaultResult>();
  const revalidator = useRevalidator();
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState<{ id: string; shop: string; value: string } | null>(null);
  const handled = useRef<VaultResult | undefined>(undefined);
  const loginForm = useRef<HTMLFormElement>(null);
  const saveForm = useRef<HTMLFormElement>(null);
  const importForm = useRef<HTMLFormElement>(null);
  const exportForm = useRef<HTMLFormElement>(null);
  const backupImportForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!fetcher.data || fetcher.data === handled.current) return;
    handled.current = fetcher.data;
    if (fetcher.data.expired) { setShown(null); revalidator.revalidate(); }
    if (fetcher.data?.ok && ["unlock", "lock", "save", "delete", "bulk_import", "backup_import"].includes(fetcher.data.action ?? "")) {
      if (fetcher.data.action === "unlock") loginForm.current?.reset();
      if (fetcher.data.action === "save") saveForm.current?.reset();
      if (fetcher.data.action === "bulk_import") importForm.current?.reset();
      if (fetcher.data.action === "backup_import") backupImportForm.current?.reset();
      setShown(null);
      revalidator.revalidate();
    }
    if (fetcher.data?.ok && fetcher.data.action === "reveal" && fetcher.data.id && fetcher.data.shop && fetcher.data.secret !== undefined) {
      setShown({ id: fetcher.data.id, shop: fetcher.data.shop, value: fetcher.data.secret });
      fetcher.submit({ type: "ping" }, { method: "post", action: "/vault" });
    }
    if (fetcher.data?.ok && fetcher.data.action === "export" && fetcher.data.backup) {
      const url = URL.createObjectURL(new Blob([fetcher.data.backup], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "backup.aetherion-vault.json";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      exportForm.current?.reset();
    }
  }, [fetcher, fetcher.data, revalidator]);

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(null), 60_000);
    return () => window.clearTimeout(timer);
  }, [shown]);

  useEffect(() => {
    if (!data.expiresAt) return;
    const timer = window.setTimeout(() => { setShown(null); revalidator.revalidate(); }, Math.max(0, data.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [data.expiresAt, revalidator]);

  const shopOptions = data.shops ?? [];
  const list = (data.entries ?? []).filter((entry) =>
    (scope === "all" || entry.shop === scope) &&
    [entry.label, entry.provider, entry.category, entry.stage, entry.username, entry.url, entry.modelHint, entry.notes].join(" ").toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  return (
    <main className="sg-root" style={{ maxWidth: 960, margin: "auto", padding: 24 }}>
      <meta name="robots" content="noindex,nofollow" />
      <h1>AETHERION · Inhaber-Tresor</h1>
      {data.message && <p role="alert">{data.message}</p>}
      {!data.unlocked ? <fetcher.Form ref={loginForm} method="post">
        <input type="hidden" name="type" value="unlock" />
        <label>General-Passwort <input name="password" type="password" required maxLength={1024} autoComplete="off" /></label>
        <button type="submit" disabled={fetcher.state !== "idle"}>Tresor entsperren</button>
      </fetcher.Form> : <>
        <p>Die Notfallsitzung endet nach 15 Minuten. Nur ausdrücklich konfigurierte Inhaber-Shops sind zugänglich.</p>
        <fetcher.Form method="post"><input type="hidden" name="type" value="lock" /><button type="submit">Tresor sperren</button></fetcher.Form>
        <label>Shop <select value={scope} onChange={(event) => setScope(event.target.value)}>
          <option value="all">Alle Owner-Shops</option>
          {shopOptions.map((shop) => <option key={shop} value={shop}>{shop}</option>)}
        </select></label>
        <label> Suchen <input value={search} onChange={(event) => setSearch(event.target.value)} autoComplete="off" /></label>
        <h2>Einträge</h2>
        {list.map((entry) => <div key={`${entry.shop}:${entry.id}`}>
          <span>{entry.shop} · {entry.label} · {shown?.id === entry.id && shown.shop === entry.shop ? shown.value : "••••••••"}</span>
          <fetcher.Form method="post" style={{ display: "inline" }}>
            <input type="hidden" name="type" value="reveal" /><input type="hidden" name="id" value={entry.id} /><input type="hidden" name="shop" value={entry.shop} />
            <button type="submit">Anzeigen</button>
          </fetcher.Form>
          {shown?.id === entry.id && shown.shop === entry.shop && <button type="button" onClick={() => setShown(null)}>Verbergen</button>}
          <fetcher.Form method="post" style={{ display: "inline" }} onSubmit={(event) => { if (!window.confirm("Eintrag unwiderruflich löschen?")) event.preventDefault(); }}>
            <input type="hidden" name="type" value="delete" /><input type="hidden" name="id" value={entry.id} /><input type="hidden" name="shop" value={entry.shop} />
            <button type="submit">Löschen</button>
          </fetcher.Form>
        </div>)}
        <h2>Eintrag anlegen</h2>
        <fetcher.Form ref={saveForm} method="post" style={{ display: "grid", gap: 8 }}>
          <input type="hidden" name="type" value="save" />
          <label>Shop <select name="shop">{shopOptions.map((shop) => <option key={shop} value={shop}>{shop}</option>)}</select></label>
          <label>Bezeichnung <input name="label" required maxLength={60} autoComplete="off" /></label>
          <label>Anbieter <select name="provider" defaultValue="custom">
            <option value="custom">Sonstige</option><option value="openrouter">OpenRouter</option><option value="cloudflare">Cloudflare</option><option value="groq">Groq</option><option value="huggingface">Hugging Face</option>
          </select></label>
          <label>Phase <select name="stage"><option value="production">Produktion</option><option value="beta">Beta</option><option value="experimental">Experimentell</option><option value="test">Test</option></select></label>
          <label>Modell-Hinweis <input name="modelHint" maxLength={512} autoComplete="off" /></label>
          <label>Geheimnis <input name="secret" type="password" required autoComplete="off" /></label>
          <button type="submit">Verschlüsselt speichern</button>
        </fetcher.Form>
        <details><summary>Sammelimport und Backup</summary>
          <p>Nur einfache KEY=VALUE-Zeilen; keine Escape-Verarbeitung oder Variablenersetzung. Backups gelten nur für denselben Shop.</p>
          <fetcher.Form ref={importForm} method="post" style={{ display: "grid", gap: 8 }}>
            <input type="hidden" name="type" value="bulk_import" />
            <label>Shop <select name="shop">{shopOptions.map((shop) => <option key={shop} value={shop}>{shop}</option>)}</select></label>
            <label>Inhalt <textarea name="input" required autoComplete="off" /></label>
            <label>Duplikate <select name="mode"><option value="skip">Überspringen</option><option value="update">Aktualisieren</option></select></label>
            <button type="submit">Importieren</button>
          </fetcher.Form>
          <fetcher.Form ref={exportForm} method="post" style={{ display: "grid", gap: 8 }}>
            <input type="hidden" name="type" value="export" />
            <label>Shop <select name="shop">{shopOptions.map((shop) => <option key={shop} value={shop}>{shop}</option>)}</select></label>
            <label>Backup-Passwort <input type="password" name="backupPassword" minLength={16} maxLength={1024} required autoComplete="off" /></label>
            <button type="submit">Backup herunterladen</button>
          </fetcher.Form>
          <fetcher.Form ref={backupImportForm} method="post" encType="multipart/form-data" style={{ display: "grid", gap: 8 }}>
            <input type="hidden" name="type" value="backup_import" />
            <label>Shop <select name="shop">{shopOptions.map((shop) => <option key={shop} value={shop}>{shop}</option>)}</select></label>
            <label>Backup-Datei <input type="file" name="backup" accept=".json,application/json" required /></label>
            <label>Backup-Passwort <input type="password" name="backupPassword" minLength={16} maxLength={1024} required autoComplete="off" /></label>
            <label>Duplikate <select name="mode"><option value="skip">Überspringen</option><option value="update">Aktualisieren</option></select></label>
            <button type="submit">Backup importieren</button>
          </fetcher.Form>
        </details>
      </>}
      {fetcher.data?.message && <p role={fetcher.data.ok ? "status" : "alert"}>{fetcher.data.message}</p>}
    </main>
  );
}
