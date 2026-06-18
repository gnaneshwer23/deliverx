import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { sweepOrgAgentOrchestration } from "@/services/agentOrchestration";

export async function POST() {
  try {
    await requireAuth();
    const result = await sweepOrgAgentOrchestration(3);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
