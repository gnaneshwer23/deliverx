import { NextResponse } from "next/server";
import { getGlobalGraph } from "@/services/global";

export async function GET() {
  try {
    const graph = await getGlobalGraph();
    return NextResponse.json({ graph });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
