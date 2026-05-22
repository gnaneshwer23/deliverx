import { NextResponse } from "next/server";
import { getGlobalPatterns } from "@/services/global";

export async function GET() {
  try {
    const patterns = await getGlobalPatterns();
    return NextResponse.json({ patterns });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
