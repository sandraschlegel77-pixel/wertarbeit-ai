import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  buildVaultDownload,
  VaultDownloadNotFoundError,
  VaultDownloadUnavailableError,
} from "../services/vault-downloads.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  let download;
  try {
    download = await buildVaultDownload(session.shop, params.kind ?? "", params.id ?? "");
  } catch (error) {
    if (error instanceof VaultDownloadNotFoundError) {
      return new Response(error.message, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    if (error instanceof VaultDownloadUnavailableError) {
      return new Response(error.message, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    throw error;
  }
  return new Response(new Uint8Array(download.body), {
    headers: {
      "Content-Type": download.contentType,
      "Content-Disposition": `attachment; filename="${download.filename}"`,
      "Content-Length": String(download.body.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
