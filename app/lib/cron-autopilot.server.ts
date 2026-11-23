import cron from "node-cron";
import db from "../db.server";

let started = false;
let autopilotTask: any = null;
let backupTask: any = null;
let rotationTask: any = null;

/** Startet den 24/7 Autopilot-Motor (Singleton-Guard). Läuft in entry.server.tsx. */
export function startCronAutopilot(): void {
  if (started) return;
  started = true;

  // Alle 10 Min. Autopilot-Tick (PrecomputedCache, Sync, etc.)
  autopilotTask = cron.schedule("*/10 * * * *", async () => {
    try {
      await runAutopilotTick();
    } catch (err) {
      console.error("[cron autopilot] tick error:", err);
    }
  });

  // Tägliches Backup um 23:00 Uhr
  backupTask = cron.schedule("0 23 * * *", async () => {
    try {
      await runDailyBackup();
    } catch (err) {
      console.error("[cron backup] error:", err);
    }
  });

  // 30-Tage-Rotation für Backups & alte Logs (Sonntags 00:00)
  rotationTask = cron.schedule("0 0 * * 0", async () => {
    try {
      await rotateBackupsAndLogs();
    } catch (err) {
      console.error("[cron rotation] error:", err);
    }
  });
}

export function stopCronAutopilot(): void {
  autopilotTask?.stop();
  backupTask?.stop();
  rotationTask?.stop();
  autopilotTask = null;
  backupTask = null;
  rotationTask = null;
  started = false;
}

async function runAutopilotTick(): Promise<void> {
  // PrecomputedCache pflegen: abgelaufene Einträge entfernen
  await db.precomputedCache.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  // Platzhalter für weitere Autopilot-Schritte (wird von Sidekick-Endpunkten befüllt)
}

async function runDailyBackup(): Promise<void> {
  await db.backupLog.create({
    data: {
      shop: "system",
      path: "/backups/daily.sqlite",
      size: 0,
    },
  });
  // Alte Backups > 30 Tage löschen
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db.backupLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

async function rotateBackupsAndLogs(): Promise<void> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db.backupLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  await db.autopilotLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
