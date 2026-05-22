import { NextResponse } from "next/server";
import { getKnowledgeGraph } from "@/services/coordination";

export async function GET() {
  try {
    const graph = await getKnowledgeGraph();
    return NextResponse.json({ graph });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
