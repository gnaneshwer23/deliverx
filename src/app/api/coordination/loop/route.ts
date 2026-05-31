import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/api/cron-auth";
import {
  captureAllCoordinationRuns,
  runEnterpriseCoordinationLoop,
  saveCoordinationRun,
} from "@/services/coordination";

export async function GET(req: Request) {
  if (isCronAuthorized(req)) {
    try {
      const result = await captureAllCoordinationRuns();
      return NextResponse.json({ ok: true, cron: true, ...result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cron failed" },
        { status: 500 },
      );
    }
  }

  try {
    const snapshot = await runEnterpriseCoordinationLoop();
    return NextResponse.json(snapshot);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: err instanceof Error && err.message === "Not authenticated" ? 401 : 500 },
    );
  }
}

/** Run loop and persist snapshot for the signed-in org. */
export async function POST() {
  try {
    const saved = await saveCoordinationRun();
    if (!saved) {
      return NextResponse.json(
        { error: "Save failed — has migration 0008 been applied?" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, id: saved.id, snapshot: saved.snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: err instanceof Error && err.message === "Not authenticated" ? 401 : 500 },
    );
  }
}
