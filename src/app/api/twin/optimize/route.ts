import { NextResponse } from "next/server";
import { getTwinState } from "@/services/twin";
import { optimizeExecution } from "@/services/twinEngine";

export async function GET() {
  try {
    const state = await getTwinState();
    const actions = optimizeExecution(state);
    return NextResponse.json({ state, actions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
