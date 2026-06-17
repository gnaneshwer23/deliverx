import { NextResponse } from "next/server";
import { aiRouteError } from "@/lib/api/ai-route";
import { requireProjectAccess } from "@/lib/api/auth";
import { answerDeliveryBriefingQuestion } from "@/services/deliveryNarrator";

type Body = { question?: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireProjectAccess(id);

    const body = (await req.json()) as Body;
    if (!body.question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const result = await answerDeliveryBriefingQuestion(id, body.question);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return aiRouteError(err);
  }
}
