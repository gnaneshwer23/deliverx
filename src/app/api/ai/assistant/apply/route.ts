import { apiErrorResponse, requireAuth } from "@/lib/api/auth";
import {
  applyAssistantAction,
  type ProposedAction,
} from "@/services/assistantActions";

export async function POST(req: Request) {
  try {
    await requireAuth();
  } catch (err) {
    return apiErrorResponse(err);
  }

  let body: { action?: ProposedAction };
  try {
    body = (await req.json()) as { action?: ProposedAction };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.action?.type || !body.action.projectId || !body.action.title) {
    return Response.json({ error: "Invalid action payload" }, { status: 400 });
  }

  try {
    const result = await applyAssistantAction(body.action);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apply failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
