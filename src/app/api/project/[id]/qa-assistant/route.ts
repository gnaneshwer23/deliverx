import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { askQaAssistant } from "@/services/aiQa";
import { getQaContext } from "@/services/qaContext";
import { enrichAssistantContext } from "@/services/projectMemoryRag";

export const maxDuration = 30;

type Body = { question?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);
    const body = (await req.json()) as Body;
    if (!body.question?.trim()) {
      return NextResponse.json({ ok: false, error: "Question required" }, { status: 400 });
    }

    const qaCtx = await getQaContext().catch(() => null);
    const plan = qaCtx?.quality_plan ?? {};
    const context = await enrichAssistantContext(
      id,
      body.question.trim(),
      JSON.stringify(plan).slice(0, 4000),
    );

    const answer = await askQaAssistant({
      projectName: project.name,
      question: body.question.trim(),
      context,
    });

    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
