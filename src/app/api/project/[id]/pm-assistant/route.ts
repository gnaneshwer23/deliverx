import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { askPmAssistant } from "@/services/aiDeliveryPm";
import { getPmDeliveryContext } from "@/services/deliveryPmContext";
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

    const ctxRow = await getPmDeliveryContext(id).catch(() => null);
    const baseContext = JSON.stringify({
      summary: ctxRow?.ai_summary,
      plan: ctxRow?.delivery_plan ?? {},
      budget: ctxRow?.budget ?? {},
    });
    const context = await enrichAssistantContext(id, question, baseContext);
    const answer = await askPmAssistant({
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
