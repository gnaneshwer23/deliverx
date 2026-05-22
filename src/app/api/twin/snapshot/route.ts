import { NextResponse } from "next/server";
import { saveTwinSnapshot } from "@/services/twin";

/** POST to capture the current twin state into twin_snapshots history. */
export async function POST() {
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
      { status: 500 },
    );
  }
}
