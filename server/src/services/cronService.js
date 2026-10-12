import cron from "node-cron";
import { runAutomatedScanAndDispatch } from "./whatsappService.js";

let scheduledTask = null;

export const startCronJobs = () => {
  // Run daily at 09:00 AM Indian Standard Time (or server local time)
  // Cron format: minute hour day-of-month month day-of-week
  scheduledTask = cron.schedule("0 9 * * *", async () => {
    console.log("⏰ [Cron] Running daily automated WhatsApp reminder scan at 09:00 AM...");
    try {
      const summary = await runAutomatedScanAndDispatch(7);
      console.log(`⏰ [Cron] Auto scan complete. Processed ${summary.processed} reminders.`);
    } catch (err) {
      console.error("⏰ [Cron] Auto scan error:", err.message);
    }
  });

  console.log("⏰ Daily WhatsApp Reminder Cron Scheduler initialized (09:00 AM daily)");
};

export const stopCronJobs = () => {
  if (scheduledTask) {
    scheduledTask.stop();
  }
};
