import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { requireAuth } from "@/lib/api/auth";

export async function GET() {
  try {
    await requireAuth();
    const configured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    return Response.json({
      configured,
      model: DEFAULT_AI_MODEL,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return Response.json({ error: message }, { status: 401 });
  }
}
