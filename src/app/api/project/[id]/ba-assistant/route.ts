import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { askBaAssistant } from "@/services/aiBaRequirements";
import { getActiveCharter } from "@/services/charter";
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
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const charter = await getActiveCharter(id).catch(() => null);
    const context = await enrichAssistantContext(id, question, charter?.content);
    const answer = await askBaAssistant({
      projectName: project.name,
      question,
      context,
    });

    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
