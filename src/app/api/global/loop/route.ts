import { NextResponse } from "next/server";
import { runGlobalLoop } from "@/services/global";

export async function GET() {
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
