import { AiConfigError, AiGenerationError } from "@/lib/ai/anthropic";
import { ApiError, apiErrorResponse } from "@/lib/api/auth";

export function aiRouteError(err: unknown) {
  if (err instanceof AiConfigError) {
    return Response.json(
      {
        error:
          "AI is not configured. Set OPENAI_API_KEY in .env.local (dev) or Vercel Environment Variables (production), then redeploy.",
        code: "ai_not_configured",
      },
      { status: 503 },
    );
  }
  if (err instanceof AiGenerationError) {
    return Response.json({ error: err.message, code: "ai_generation_failed" }, { status: 502 });
  }
  if (err instanceof ApiError) {
    return apiErrorResponse(err);
  }
  return apiErrorResponse(err);
}
