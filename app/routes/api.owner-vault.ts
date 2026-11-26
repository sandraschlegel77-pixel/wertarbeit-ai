import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  canAccessOwnerVault,
  deleteOwnerVaultSecret,
  importOwnerVaultSecrets,
  listOwnerVaultSecrets,
  OwnerVaultInputError,
  revealOwnerVaultSecret,
  saveOwnerVaultSecret,
} from "../services/owner-vault.server";
import { auditVaultAction, lockOwnerVault, requireVaultSession, unlockOwnerVault, VaultAuthError } from "../services/owner-vault-auth.server";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!canAccessOwnerVault(session.shop)) return json({ ok: false, message: "Tresorzugriff nicht erlaubt. Dieser Shop muss ausdrücklich in OWNER_SHOP_DOMAIN konfiguriert sein." }, 403);
  return json({ ok: false, message: "Bitte Tresor mit dem General-Passwort entsperren." }, 401);
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!canAccessOwnerVault(session.shop)) return json({ ok: false, message: "Tresorzugriff nicht erlaubt." }, 403);
  if (request.method !== "POST") return json({ ok: false, message: "Methode nicht erlaubt." }, 405);
  const form = await request.formData();
  const type = form.get("type");
  try {
    if (type === "unlock") {
      const password = form.get("password");
      if (typeof password !== "string" || password.length > 1024) throw new OwnerVaultInputError("Ungültige Eingabe.");
      const token = await unlockOwnerVault(session.shop, session.id, password);
      return json({ ok: true, action: "unlock", token });
    }
    const token = form.get("token");
    if (typeof token !== "string") throw new VaultAuthError("Tresor ist gesperrt.");
    requireVaultSession(token, session.shop, session.id);
    if (type === "list") {
      const marker = form.get("marker");
      if (marker !== null && (typeof marker !== "string" || !/^\d{1,12}$/.test(marker))) throw new OwnerVaultInputError("Ungültige Anfrage.");
      return json({ ok: true, action: "list", marker: marker ?? "", ...await listOwnerVaultSecrets(session.shop) });
    }
    if (type === "ping") return json({ ok: true, action: "ping" });
    if (type === "lock") {
      lockOwnerVault(token, session.shop, session.id);
      await auditVaultAction(session.shop, "lock", "completed");
      return json({ ok: true, action: "lock" });
    }
    if (type === "reveal") {
      const id = form.get("id");
      if (typeof id !== "string") throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
      const secret = await revealOwnerVaultSecret(session.shop, id);
      await auditVaultAction(session.shop, "reveal", "completed");
      return json({ ok: true, action: "reveal", id, secret });
    }
    if (type === "bulk_import") {
      const input = form.get("input");
      const mode = form.get("mode");
      const provider = form.get("provider");
      const category = form.get("category");
      const stage = form.get("stage");
      if (typeof input !== "string" || typeof mode !== "string" || typeof provider !== "string" || typeof category !== "string" || typeof stage !== "string") {
        throw new OwnerVaultInputError("Ungültige Importdaten.");
      }
      const result = await importOwnerVaultSecrets(session.shop, input, mode, { provider, category, stage });
      return json({ ok: true, action: "bulk_import", message: `Import abgeschlossen: ${result.created} neu, ${result.updated} aktualisiert, ${result.skipped} übersprungen.` });
    }
    if (type === "save") {
      const label = form.get("label");
      const value = form.get("value");
      if (typeof label !== "string" || typeof value !== "string") throw new OwnerVaultInputError("Ungültige Eingabe.");
      const field = (name: string, fallback = "") => {
        const result = form.get(name);
        if (result === null) return fallback;
        if (typeof result !== "string") throw new OwnerVaultInputError("Ungültige Eingabe.");
        return result;
      };
      await saveOwnerVaultSecret(session.shop, label, value, {
        provider: field("provider", "custom"),
        category: field("category", "Sichere Notizen"),
        stage: field("stage", "production"),
        username: field("username"),
        url: field("url"),
        modelHint: field("modelHint"),
        notes: field("notes"),
        expiresAt: field("expiresAt"),
        favorite: field("favorite") === "on",
      });
    } else if (type === "delete") {
      const id = form.get("id");
      if (typeof id !== "string") throw new OwnerVaultInputError("Ungültiger Tresoreintrag.");
      await deleteOwnerVaultSecret(session.shop, id);
    } else {
      throw new OwnerVaultInputError("Unbekannte Tresoraktion.");
    }
    return json({ ok: true, action: type, message: type === "save" ? "Verschlüsselt gespeichert." : "Eintrag gelöscht." });
  } catch (error) {
    const marker = form.get("marker");
    const listMarker = type === "list" && typeof marker === "string" && /^\d{1,12}$/.test(marker) ? { marker } : {};
    if (error instanceof OwnerVaultInputError) return json({ ok: false, ...listMarker, message: error.message }, 400);
    if (error instanceof VaultAuthError) return json({ ok: false, ...listMarker, locked: error.status === 401, message: error.message }, error.status);
    console.error("[owner-vault] Tresoraktion fehlgeschlagen.");
    return json({ ok: false, ...listMarker, message: "Tresoraktion oder Audit fehlgeschlagen. Änderungen vor erneutem Versuch prüfen." }, 503);
  }
}
