import { AiConfigError, AiGenerationError } from "@/lib/ai/anthropic";
import { ApiError, apiErrorResponse } from "@/lib/api/auth";

export function aiRouteError(err: unknown) {
  if (err instanceof AiConfigError) {
    return Response.json(
      {
        error: "Anthropic API is not configured. Set ANTHROPIC_API_KEY.",
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
