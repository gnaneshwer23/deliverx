import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { extractCustomerDiscovery } from "@/services/aiPmProduct";

export const maxDuration = 30;

type Body = { content?: string; source?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);
    const body = (await req.json()) as Body;
    const content = body.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const result = await extractCustomerDiscovery({
      projectId: id,
      projectName: project.name,
      content,
      source: body.source?.trim(),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
