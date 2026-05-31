import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/api/cron-auth";
import { captureAllGlobalContributions, runGlobalLoop } from "@/services/global";

export async function GET(req: Request) {
  if (isCronAuthorized(req)) {
    try {
      const result = await captureAllGlobalContributions();
      return NextResponse.json({ ok: true, cron: true, ...result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cron failed" },
        { status: 500 },
      );
    }
  }

  try {
    const snapshot = await runGlobalLoop();
    return NextResponse.json(snapshot);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: err instanceof Error && err.message === "Not authenticated" ? 401 : 500 },
    );
  }
}

/** Re-run global loop (contribute + refresh aggregates) for the signed-in org. */
export async function POST() {
  try {
    const snapshot = await runGlobalLoop();
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: err instanceof Error && err.message === "Not authenticated" ? 401 : 500 },
    );
  }
}
