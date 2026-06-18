import { NextResponse } from "next/server";
import { aiRouteError } from "@/lib/api/ai-route";
import { requireProjectAccess } from "@/lib/api/auth";
import {
  askProjectVoiceQuestion,
  OpenAiConfigError,
} from "@/services/voiceProjectUpdate";

type Body = { question?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);

    const body = (await req.json()) as Body;
    if (!body.question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const result = await askProjectVoiceQuestion(id, body.question);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return NextResponse.json(
        { error: err.message, code: "openai_not_configured" },
        { status: 503 },
      );
    }
    return aiRouteError(err);
  }
}
