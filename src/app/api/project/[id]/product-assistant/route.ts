import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { askProductAssistant } from "@/services/aiPmProduct";
import { getPmProductContext } from "@/services/pmProduct";

type Body = { question?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);
    const body = (await req.json()) as Body;
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const ctxRow = await getPmProductContext(id).catch(() => null);
    const answer = await askProductAssistant({
      projectName: project.name,
      question,
      context: JSON.stringify(ctxRow?.product_context ?? {}),
    });

    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
