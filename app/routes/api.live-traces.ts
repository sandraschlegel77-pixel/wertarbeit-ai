import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { isOwnerShop } from "../services/access-control.server";
import { getRoster } from "../services/ai-agents.server";
import { getAccessibleDepartmentIds, moduleIdsFromSubscription } from "../services/module-access";
import { getRecentLiveConnectionTraces } from "../services/live-connection.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const owner = isOwnerShop(session.shop);
  const subscription = owner
    ? null
    : await db.shopSubscription.findUnique({
      where: { shop: session.shop },
      select: {
        active: true,
        moduleInvoices: true,
        moduleCertificates: true,
        moduleMultichannel: true,
        moduleGrowth: true,
      },
    });
  if (!owner && !subscription?.active) {
    return Response.json({ traces: [], snapshotAt: new Date().toISOString() }, {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const modules = owner ? [] : moduleIdsFromSubscription(subscription);
  const departments = new Set(getAccessibleDepartmentIds(modules, owner));
  const roster = await getRoster(session.shop);
  const visibleAgents = owner
    ? roster
    : roster.filter((agent) => !agent.dynamic && departments.has(agent.departmentId));
  const traces = await getRecentLiveConnectionTraces(
    session.shop,
    owner ? undefined : visibleAgents.map((agent) => agent.key)
  );
  return Response.json({ traces, snapshotAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "no-store" },
  });
};
