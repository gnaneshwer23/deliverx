import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { getEnvDiagnostics } from "@/lib/env-check";
import { requireAuth, apiErrorResponse } from "@/lib/api/auth";

export async function GET() {
  try {
    await requireAuth();
    return Response.json(getEnvDiagnostics(DEFAULT_AI_MODEL));
  } catch (err) {
    return apiErrorResponse(err);
  }
}
