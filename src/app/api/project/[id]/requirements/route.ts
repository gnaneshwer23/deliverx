import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import {
  buildTraceabilityMatrix,
  getRequirementStats,
  listClarifications,
  listRequirements,
  listUserStories,
} from "@/services/baRequirements";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);

    const [requirements, stories, clarifications, stats, matrix] =
      await Promise.all([
        listRequirements(id),
        listUserStories(id),
        listClarifications(id),
        getRequirementStats(id),
        buildTraceabilityMatrix(id),
      ]);

    return NextResponse.json({
      requirements,
      stories,
      clarifications,
      stats,
      matrix,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
