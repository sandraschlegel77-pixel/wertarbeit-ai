import { PrismaClient } from "@prisma/client";

const FIRST_DYNAMIC_NUMBER = 221;
const db = new PrismaClient();

try {
  const shops = await db.dynamicAiAgent.findMany({
    where: { agentNumber: { lt: FIRST_DYNAMIC_NUMBER } },
    select: { shop: true },
    distinct: ["shop"],
  });
  let moved = 0;

  await db.$transaction(async (tx) => {
    for (const { shop } of shops) {
      const rows = await tx.dynamicAiAgent.findMany({
        where: { shop, agentNumber: { lt: FIRST_DYNAMIC_NUMBER } },
        orderBy: { agentNumber: "asc" },
        select: { agentNumber: true },
      });
      const last = await tx.dynamicAiAgent.findFirst({
        where: { shop },
        orderBy: { agentNumber: "desc" },
        select: { agentNumber: true },
      });
      let nextNumber = Math.max(FIRST_DYNAMIC_NUMBER - 1, last?.agentNumber ?? 0) + 1;

      for (const row of rows) {
        const oldKey = `A${row.agentNumber}`;
        const newKey = `A${nextNumber}`;
        await tx.agentRevenueEntry.updateMany({ where: { shop, agentKey: oldKey }, data: { agentKey: newKey } });
        await tx.agentSkillEvolution.updateMany({ where: { shop, agentKey: oldKey }, data: { agentKey: newKey } });
        await tx.approvalQueueItem.updateMany({ where: { shop, sourceAgentKey: oldKey }, data: { sourceAgentKey: newKey } });
        await tx.tripleAuditLog.updateMany({ where: { shop, sourceAgentKey: oldKey }, data: { sourceAgentKey: newKey } });
        await tx.tripleAuditLog.updateMany({ where: { shop, pass1AuditorKey: oldKey }, data: { pass1AuditorKey: newKey } });
        await tx.tripleAuditLog.updateMany({ where: { shop, pass2AuditorKey: oldKey }, data: { pass2AuditorKey: newKey } });
        await tx.tripleAuditLog.updateMany({ where: { shop, chiefAuditorKey: oldKey }, data: { chiefAuditorKey: newKey } });
        await tx.dynamicAiAgent.updateMany({ where: { shop, reportsToId: oldKey }, data: { reportsToId: newKey } });
        await tx.autopilotLog.updateMany({
          where: { shop, action: `agent_run:${oldKey}` },
          data: { action: `agent_run:${newKey}` },
        });
        await tx.dynamicAiAgent.update({
          where: { shop_agentNumber: { shop, agentNumber: row.agentNumber } },
          data: { agentNumber: nextNumber },
        });
        nextNumber++;
        moved++;
      }
    }
  });

  console.log(`Migrated ${moved} legacy dynamic agent number(s) without deleting records.`);
} finally {
  await db.$disconnect();
}
