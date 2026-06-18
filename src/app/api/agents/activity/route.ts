import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { listAgentActivityFeed } from "@/services/agentOrchestration";

export async function GET(req: Request) {
  try {
    await requireAuth();
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const events = await listAgentActivityFeed(Number.isFinite(limit) ? limit : 20);
    return Response.json({ events });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
