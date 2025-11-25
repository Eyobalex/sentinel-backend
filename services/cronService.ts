import cron from "node-cron";
import { performBatchAudit } from "./alertService";
import Alert from "../models/Alert";

export const initCronJobs = () => {
  console.log("Initializing Cron Jobs...");

  // Schedule Batch Audit every 3 hours
  cron.schedule("0 */3 * * *", async () => {
    console.log("Running Scheduled Batch Audit...");
    try {
      await performBatchAudit(5);
      console.log("Scheduled Batch Audit Completed.");
    } catch (error) {
      console.error("Scheduled Batch Audit Failed:", error);
    }
  });

  // Schedule Cleanup of Medium Alerts every hour
  cron.schedule("0 * * * *", async () => {
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
    "Cron Jobs scheduled: Batch Audit (Every 3 hours), Cleanup Medium Alerts (Every hour)"
  );
};
