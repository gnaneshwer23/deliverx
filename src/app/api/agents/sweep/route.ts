import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { sweepOrgAgentOrchestration } from "@/services/agentOrchestration";

export const maxDuration = 30;

export async function POST() {
  try {
    await requireAuth();
    const result = await sweepOrgAgentOrchestration(3);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
