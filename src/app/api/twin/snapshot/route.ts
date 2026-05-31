import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/api/cron-auth";
import {
  captureAllTwinSnapshots,
  listTwinSnapshots,
  saveTwinSnapshot,
} from "@/services/twin";

/** GET — recent snapshot history, or cron capture when Bearer CRON_SECRET is sent. */
export async function GET(req: Request) {
  if (isCronAuthorized(req)) {
    try {
      const result = await captureAllTwinSnapshots();
      return NextResponse.json({ ok: true, cron: true, ...result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cron snapshot failed" },
        { status: 500 },
      );
    }
  }

  const url = new URL(req.url);
  const limit = Math.min(50, Number(url.searchParams.get("limit") ?? 20) || 20);

  try {
    const snapshots = await listTwinSnapshots(limit);
    return NextResponse.json({ snapshots });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

/**
 * POST — capture twin state.
 * - Vercel cron (daily on Hobby): Authorization Bearer CRON_SECRET → all orgs
 * - Signed-in user: single org snapshot
 */
export async function POST(req: Request) {
  if (isCronAuthorized(req)) {
    try {
      const result = await captureAllTwinSnapshots();
      return NextResponse.json({ ok: true, cron: true, ...result });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Cron snapshot failed" },
        { status: 500 },
      );
    }
  }

  try {
    const out = await saveTwinSnapshot();
    if (!out) {
      return NextResponse.json(
        { error: "Snapshot failed — has migration 0005 been applied?" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, id: out.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 401 },
    );
  }
}
