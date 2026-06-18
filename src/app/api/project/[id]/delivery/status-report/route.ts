import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { generateWeeklyStatusReport } from "@/services/deliveryPmReports";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);

    const result = await generateWeeklyStatusReport({
      projectId: id,
      projectName: project.name,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
