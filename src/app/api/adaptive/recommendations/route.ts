import { NextResponse } from "next/server";
import { runAdaptiveLoop, latestReviewByKey } from "@/services/adaptive";

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json(
      { error: "projectId query param required" },
      { status: 400 },
    );
  }
  try {
    const [snap, reviews] = await Promise.all([
      runAdaptiveLoop(projectId),
      latestReviewByKey(projectId),
    ]);
    const enriched = snap.recommendations.map((r) => ({
      ...r,
      review: reviews.get(r.key) ?? null,
    }));
    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
