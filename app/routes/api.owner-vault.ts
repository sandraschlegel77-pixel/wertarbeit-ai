import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  canAccessOwnerVault,
  deleteOwnerVaultSecret,
  listOwnerVaultSecrets,
  OwnerVaultInputError,
  saveOwnerVaultSecret,
} from "../services/owner-vault.server";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!canAccessOwnerVault(session.shop)) return json({ ok: false, message: "Tresorzugriff nicht erlaubt. Dieser Shop muss ausdrücklich in OWNER_SHOP_DOMAIN konfiguriert sein." }, 403);
  try {
    return json({ ok: true, ...await listOwnerVaultSecrets(session.shop) });
  } catch {
    console.error("[owner-vault] Tresoreinträge konnten nicht geladen werden.");
    return json({ ok: false, message: "Tresor nicht verfügbar. Datenbank und Schema prüfen." }, 503);
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!canAccessOwnerVault(session.shop)) return json({ ok: false, message: "Tresorzugriff nicht erlaubt." }, 403);
  if (request.method !== "POST") return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
  const form = await request.formData();
  const type = form.get("type");
  try {
    if (type === "save") {
      const label = form.get("label");
      const value = form.get("value");
      if (typeof label !== "string" || typeof value !== "string") throw new OwnerVaultInputError("Ungültige Eingabe.");
      await saveOwnerVaultSecret(session.shop, label, value);
    } else if (type === "delete") {
      const id = form.get("id");
      if (typeof id !== "string") throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
      await deleteOwnerVaultSecret(session.shop, id);
    } else {
      throw new OwnerVaultInputError("Unbekannte Tresoraktion.");
    }
    return json({ ok: true, action: type, message: type === "save" ? "Verschlüsselt gespeichert." : "Eintrag gelöscht." });
  } catch (error) {
    if (error instanceof OwnerVaultInputError) return json({ ok: false, message: error.message }, 400);
    console.error("[owner-vault] Tresoraktion fehlgeschlagen.");
    return json({ ok: false, message: "Tresoraktion fehlgeschlagen. Datenbank und Schema prüfen." }, 503);
  }
}
