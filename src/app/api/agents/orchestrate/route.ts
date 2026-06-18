import { requireAuth, apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { orchestrateProjectAgents } from "@/services/agentOrchestration";

type Body = {
  projectId?: string;
  query?: string;
};

export async function POST(req: Request) {
  try {
    await requireAuth();
  } catch (err) {
    return apiErrorResponse(err);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    await requireProjectAccess(body.projectId);
    const result = await orchestrateProjectAgents({
      projectId: body.projectId,
      query: body.query,
      triggerSource: "api",
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
