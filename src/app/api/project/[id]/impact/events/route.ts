import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { listProjectImpactEvents } from "@/services/deliveryImpact";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  try {
    await requireProjectAccess(id);
    const events = await listProjectImpactEvents(id, 30);
    return Response.json({ ok: true, events });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
