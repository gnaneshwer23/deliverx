import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/api/cron-auth";
import { runNotificationCron } from "@/services/notificationService";

/**
 * Vercel cron (08:00 UTC) — daily digests + overdue approval reminders.
 * Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runNotificationCron();
    return NextResponse.json({ ok: true, cron: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Notification cron failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
