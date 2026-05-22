import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { enrichRecommendationRationales } from "@/services/aiGovernance";
import { getProjectIntelligence } from "@/services/intelligence";

type Body = { projectId?: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = body.projectId?.trim();
  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const { project } = await requireProjectAccess(projectId);
    const intelligence = await getProjectIntelligence(projectId);
    const items = intelligence.recommendations.slice(0, 5).map((r) => ({
      id: r.id,
      text: r.text,
      rationale: r.rationale,
    }));

    const rationales = await enrichRecommendationRationales({
      projectName: project.name,
      items,
    });

    return Response.json({ ok: true, rationales, model: DEFAULT_AI_MODEL });
  } catch (err) {
    return aiRouteError(err);
  }
}
