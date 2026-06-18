import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { orchestrateProgrammePortfolio } from "@/services/programmeOrchestration";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await ctx.params;
    const snapshot = await orchestrateProgrammePortfolio(id);
    return Response.json({ ok: true, snapshot });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
