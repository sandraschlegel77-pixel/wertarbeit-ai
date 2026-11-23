import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { exportDailyWorkshopGravurBatch } from "../services/platform-connectors.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const date = new URL(request.url).searchParams.get("date") ?? undefined;
  const { zip, manifest } = await exportDailyWorkshopGravurBatch(session.shop, date);
  const filename = `xtool-workshop-${manifest.batchDate}.zip`;
  return new Response(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zip.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
