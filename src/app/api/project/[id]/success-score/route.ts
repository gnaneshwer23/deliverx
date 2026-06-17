import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { getProjectSuccessScore, persistSuccessScoreSnapshot } from "@/services/successScore";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireProjectAccess(id);
    const score = await getProjectSuccessScore(id);
    await persistSuccessScoreSnapshot(id, score);
    return NextResponse.json(score);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
