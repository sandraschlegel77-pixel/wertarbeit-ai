import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { authenticate } from "../shopify.server";
import { sendWhatsAppServiceTemplate } from "../services/platform-connectors.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });

const messageSchema = z.object({
  phone: z.string().min(1),
  templateName: z.string().min(1),
  parameters: z.array(z.string()).max(5).optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") return json({ ok: false, error: "POST required." }, 405);
  const { session } = await authenticate.admin(request);
  let raw: unknown;
  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      raw = await request.json();
    } catch {
      return json({ ok: false, error: "JSON request body required." }, 400);
    }
  } else {
    const form = await request.formData();
    raw = {
      phone: form.get("phone"),
      templateName: form.get("templateName"),
      parameters: ["p1", "p2", "p3", "p4", "p5"]
        .map((key) => form.get(key))
        .filter((value): value is string => typeof value === "string" && value.trim() !== ""),
    };
  }
  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, error: "Ungültige WhatsApp-Nachrichtendaten." }, 400);

  try {
    const result = await sendWhatsAppServiceTemplate({
      shop: session.shop,
      phone: parsed.data.phone,
      templateName: parsed.data.templateName,
      parameters: parsed.data.parameters,
    });
    return json(result, result.ok ? 200 : 409);
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp-Versand fehlgeschlagen.";
    const status = message.includes("Opt-in")
      ? 412
      : message.includes("konfiguriert")
        ? 503
        : message.includes("API") || message.includes("Anti-Spam")
          ? 502
          : 400;
    return json({ ok: false, error: message }, status);
  }
};
