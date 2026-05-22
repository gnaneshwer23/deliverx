import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { structureProjectFromBrief } from "@/services/aiProjectStructuring";

type Body = {
  brief?: string;
  projectId?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brief = body.brief?.trim();
  if (!brief) {
    return Response.json({ error: "brief is required" }, { status: 400 });
  }

  try {
    let projectName: string | undefined;
    let deliveryType: string | null | undefined;
    let goal: string | null | undefined;

    if (body.projectId) {
      const { project } = await requireProjectAccess(body.projectId);
      projectName = project.name;
      deliveryType = project.delivery_type;
      goal = project.goal;
    }

    const draft = await structureProjectFromBrief({
      brief,
      projectName,
      deliveryType,
      goal,
    });

    return Response.json({ ok: true, draft, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
