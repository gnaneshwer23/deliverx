import { getEnvDiagnostics } from "@/lib/env-check";
import { requireAuth, apiErrorResponse } from "@/lib/api/auth";

export async function GET() {
  try {
    await requireAuth();
    return Response.json(getEnvDiagnostics());
  } catch (err) {
    return apiErrorResponse(err);
  }
}
