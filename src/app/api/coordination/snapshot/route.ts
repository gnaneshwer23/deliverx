import { NextResponse } from "next/server";
import {
  listCoordinationRuns,
  saveCoordinationRun,
  runEnterpriseCoordinationLoop,
} from "@/services/coordination";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(20, Number(url.searchParams.get("limit") ?? 10) || 10);

  try {
    const runs = await listCoordinationRuns(limit);
    return NextResponse.json({ runs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const out = await saveCoordinationRun();
    if (!out) {
      return NextResponse.json(
        { error: "Save failed — has migration 0008 been applied?" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, id: out.id, snapshot: out.snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
