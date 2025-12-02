import { startCronJob } from "./cron";

let initialized = false;

export function initializeApp() {
  if (!initialized) {
    console.log("Initializing application...");
    startCronJob();
    initialized = true;
    console.log("Application initialized successfully");
  }
}
