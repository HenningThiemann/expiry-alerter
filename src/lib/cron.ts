import cron from "node-cron";

let cronJob: ReturnType<typeof cron.schedule> | null = null;

export function startCronJob() {
  // Prevent multiple initialization
  if (cronJob) {
    console.log("Cron job already running");
    return;
  }

  // Daily at 12:00 PM (Central European Time)
  // Cron Format: Minute Hour Day Month Weekday
  cronJob = cron.schedule(
    "0 12 * * *",
    async () => {
      console.log(
        `[${new Date().toISOString()}] Running daily notification check...`
      );

      try {
        // Call the Notifications API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notifications`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(
            `[${new Date().toISOString()}] Daily notifications sent:`,
            data
          );
        } else {
          console.error(
            `[${new Date().toISOString()}] Failed to send daily notifications:`,
            response.statusText
          );
        }
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error sending daily notifications:`,
          error
        );
      }
    },
    {
      timezone: "Europe/Berlin", // Central European Time
    }
  );

  console.log(
    "Daily notification cron job started - will run every day at 12:00 PM CET"
  );
}

export function stopCronJob() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("Cron job stopped");
  }
}
