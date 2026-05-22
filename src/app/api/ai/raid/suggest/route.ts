import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { suggestRaidItems } from "@/services/aiGovernance";

type Body = {
  projectId?: string;
  context?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = body.projectId?.trim();
  const context = body.context?.trim();
  if (!projectId || !context) {
    return Response.json(
      { error: "projectId and context are required" },
      { status: 400 },
    );
  }

  try {
    const { project } = await requireProjectAccess(projectId);
    const items = await suggestRaidItems({
      projectId,
      projectName: project.name,
      context,
    });

    return Response.json({ ok: true, items, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
