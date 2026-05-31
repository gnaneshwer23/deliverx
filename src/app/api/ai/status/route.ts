import { getEnvDiagnostics } from "@/lib/env-check";
import { requireAuth } from "@/lib/api/auth";

export async function GET() {
  try {
    await requireAuth();
    const diag = getEnvDiagnostics();
    return Response.json({
      configured: diag.ai.configured,
      model: diag.ai.model,
      provider: diag.ai.provider,
      missing: diag.ai.missing,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return Response.json({ error: message }, { status: 401 });
  }
}
