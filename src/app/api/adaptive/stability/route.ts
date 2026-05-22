import { NextResponse } from "next/server";
import { runAdaptiveLoop } from "@/services/adaptive";

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query param required" },
      { status: 400 },
    );
  }
  try {
    const snap = await runAdaptiveLoop(projectId);
    return NextResponse.json(snap.stability);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
