import { NextResponse } from "next/server";
import { startCronJob } from "@/lib/cron";

// This route initializes the cron job
export async function GET() {
  try {
    startCronJob();
    return NextResponse.json({
      message: "Daily notification cron job initialized",
      schedule: "Every day at 12:00 PM CET",
    });
  } catch (error) {
    console.error("Failed to initialize cron job:", error);
    return NextResponse.json(
      { error: "Failed to initialize cron job" },
      { status: 500 }
    );
  }
}
