import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { getProjectMeetingIntelligenceStats } from "@/services/meetingIntelligence";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  try {
    await requireProjectAccess(id);
    const stats = await getProjectMeetingIntelligenceStats(id);
    return Response.json({ ok: true, stats });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
