import { NextResponse } from "next/server";
import { getProgramme, runProgrammeAnalysis } from "@/services/portfolio";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const programme = await getProgramme(id);
    if (!programme) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const analysis = await runProgrammeAnalysis(id);
    return NextResponse.json({ programme, ...analysis });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
