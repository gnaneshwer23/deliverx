import { requireAuth, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { structureProjectFromBrief } from "@/services/aiProjectStructuring";

export const maxDuration = 30;

type Body = {
  brief?: string;
  projectId?: string;
  projectName?: string;
  deliveryType?: string;
  goal?: string;
  discoveryAnswers?: Record<string, string>;
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
    await requireAuth();
    let projectName: string | undefined = body.projectName?.trim();
    let deliveryType: string | null | undefined = body.deliveryType?.trim();
    let goal: string | null | undefined = body.goal?.trim();

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
      discoveryAnswers: body.discoveryAnswers,
    });

    return Response.json({ ok: true, draft, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
