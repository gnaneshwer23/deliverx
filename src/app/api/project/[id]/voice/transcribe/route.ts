import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { OpenAiConfigError } from "@/lib/ai/openai";
import { transcribeProjectVoice } from "@/services/voiceProjectUpdate";

export const maxDuration = 30;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "file is required" }, { status: 400 });
    }

    const transcript = await transcribeProjectVoice(file);
    return Response.json({ ok: true, transcript });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return Response.json(
        { error: "OpenAI API is not configured. Set OPENAI_API_KEY.", code: "openai_not_configured" },
        { status: 503 },
      );
    }
    return aiRouteError(err);
  }
}
