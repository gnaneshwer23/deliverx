import { NextResponse } from "next/server";
import { getGlobalBenchmarks } from "@/services/global";

export async function GET() {
  try {
    const benchmarks = await getGlobalBenchmarks();
    return NextResponse.json({ benchmarks });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
