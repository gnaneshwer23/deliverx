import { NextResponse } from "next/server";
import { runEnterpriseCoordinationLoop } from "@/services/coordination";

export async function GET() {
  try {
    const { agentInsights } = await runEnterpriseCoordinationLoop();
    return NextResponse.json({ insights: agentInsights });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
