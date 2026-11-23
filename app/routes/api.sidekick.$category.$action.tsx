import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { runSidekickTool } from "../lib/sidekick.server";
import { authenticate } from "../shopify.server";

function shopFromSession(session: any): string {
  return session?.shop ?? "";
}

async function getSession(request: Request) {
  const { session } = await authenticate.admin(request);
  return session;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const shop = shopFromSession(session);
  const category = (params as { category?: string }).category ?? "";
  const action = (params as { action?: string }).action ?? "";
  const result = await runSidekickTool(category, action, {
    shop,
    session: session as any,
    body: null,
  });
  return result;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request);
  const shop = shopFromSession(session);
  const category = (params as { category?: string }).category ?? "";
  const action = (params as { action?: string }).action ?? "";
  const body = (await request.json().catch(() => ({}))) as any;
  const result = await runSidekickTool(category, action, {
    shop,
    session: session as any,
    body,
  });
  return result;
};

