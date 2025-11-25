const cron = require("node-cron");
const alertService = require("./alertService");

exports.initCronJobs = () => {
  console.log("Initializing Cron Jobs...");

  // Schedule batch audit every 3 hours
  // Cron format: Minute Hour DayMonth Month DayWeek
  cron.schedule("0 */3 * * *", async () => {
    console.log("Running scheduled batch audit...");
    try {
      const results = await alertService.performBatchAudit(5); // Audit 5 logs per batch
      console.log(`Batch audit complete. Generated ${results.length} alerts.`);
    } catch (error) {
      console.error("Scheduled batch audit failed:", error);
    }
  });

  console.log("Cron Jobs scheduled: Batch Audit (Every 3 hours)");
};
