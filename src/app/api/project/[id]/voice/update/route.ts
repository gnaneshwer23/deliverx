import { NextResponse } from "next/server";
import { aiRouteError } from "@/lib/api/ai-route";
import { requireProjectAccess } from "@/lib/api/auth";
import { submitVoiceProjectUpdate } from "@/services/voiceProjectUpdate";

type Body = { transcript?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);

    const body = (await req.json()) as Body;
    if (!body.transcript?.trim()) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const result = await submitVoiceProjectUpdate(id, body.transcript);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return aiRouteError(err);
  }
}
