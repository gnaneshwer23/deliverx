import { NextResponse } from "next/server";
import { runEnterpriseLoop } from "@/services/twin";

export async function GET() {
  try {
    const snapshot = await runEnterpriseLoop();
    return NextResponse.json(snapshot);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
