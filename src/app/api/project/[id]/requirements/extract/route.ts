import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { extractRequirementsForProject } from "@/services/aiBaRequirements";
import { upsertBaProjectContext } from "@/services/baRequirements";

type Body = {
  projectType?: string;
  content?: string;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);
    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      /* optional body */
    }

    if (body.projectType) {
      await upsertBaProjectContext({
        projectId: id,
        projectType: body.projectType,
      });
    }

    const result = await extractRequirementsForProject({
      projectId: id,
      projectName: project.name,
      projectType: body.projectType ?? project.delivery_type,
      extraContent: body.content,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
