import { NextResponse } from "next/server";
import { runEnterpriseCoordinationLoop } from "@/services/coordination";

export async function GET() {
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
