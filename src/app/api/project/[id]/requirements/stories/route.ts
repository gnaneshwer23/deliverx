import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { generateStoryForRequirement } from "@/services/aiBaRequirements";
import { listRequirements } from "@/services/baRequirements";

export const maxDuration = 30;

type Body = { requirementId?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const body = (await req.json()) as Body;

    if (!body.requirementId) {
      return NextResponse.json({ error: "requirementId is required" }, { status: 400 });
    }

    const requirements = await listRequirements(id);
    const reqRow = requirements.find((r) => r.id === body.requirementId);
    if (!reqRow) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    const story = await generateStoryForRequirement({
      projectId: id,
      requirementId: reqRow.id,
      requirementTitle: reqRow.title,
      requirementDescription: reqRow.description,
    });

    return NextResponse.json({ ok: true, story });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
