import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { askEngineerAssistant } from "@/services/aiEngineer";
import { getEngineerContext } from "@/services/engineerContext";
import { enrichAssistantContext } from "@/services/projectMemoryRag";

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

    const engCtx = await getEngineerContext().catch(() => null);
    const context = await enrichAssistantContext(
      id,
      question,
      JSON.stringify({
        summary: engCtx?.ai_summary,
        plan: engCtx?.engineering_plan ?? {},
      }),
    );
    const answer = await askEngineerAssistant({
      projectName: project.name,
      question,
      stack: engCtx?.tech_stack,
      context,
    });

    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
