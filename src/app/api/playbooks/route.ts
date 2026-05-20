import { NextResponse } from "next/server";
import { listPlaybooks } from "@/services/memory";

export async function GET() {
  try {
    const playbooks = await listPlaybooks();
    return NextResponse.json(playbooks);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "List failed" },
      { status: 500 },
    );
  }
}
