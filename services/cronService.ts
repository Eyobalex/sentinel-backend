import cron, { ScheduledTask } from "node-cron";
import { performBatchAudit } from "./alertService";
import Alert from "../models/Alert";
import { getSettings } from "./settingsService";

let cleanupTask: ScheduledTask | null = null;
let batchAuditTask: ScheduledTask | null = null;

export const initCronJobs = async () => {
  console.log("Initializing Cron Jobs...");

  const settings = await getSettings();

  // Schedule Batch Audit based on settings
  const auditSchedule = settings.batchAuditSchedule || "0 */3 * * *"; // Default to every 3 hours

  batchAuditTask = cron.schedule(auditSchedule, async () => {
    console.log("Running Scheduled Batch Audit...");
    try {
      await performBatchAudit(5);
      console.log("Scheduled Batch Audit Completed.");
    } catch (error) {
      console.error("Scheduled Batch Audit Failed:", error);
    }
  });

  // Schedule Cleanup of Medium Alerts based on settings
  const cleanupSchedule = settings.cleanupSchedule || "0 * * * *"; // Default to hourly

  cleanupTask = cron.schedule(cleanupSchedule, async () => {
    console.log("Running Cleanup of Medium Alerts...");
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await Alert.updateMany(
        {
          assigned: "not_assigned",
          "aiAnalysis.severity": "Medium",
          timestamp: { $lt: oneHourAgo },
        },
        { assigned: "no_need" }
      );
      console.log(
        `Cleanup Completed. Modified ${result.modifiedCount} alerts.`
      );
    } catch (error) {
      console.error("Cleanup of Medium Alerts Failed:", error);
    }
  });

  console.log(
    `Cron Jobs scheduled: Batch Audit (${auditSchedule}), Cleanup Medium Alerts (${cleanupSchedule})`
  );
};

export const restartCronJobs = () => {
  if (cleanupTask) {
    cleanupTask.stop();
    console.log("Stopped existing cleanup task.");
  }
  if (batchAuditTask) {
    batchAuditTask.stop();
    console.log("Stopped existing batch audit task.");
  }
  initCronJobs();
};
