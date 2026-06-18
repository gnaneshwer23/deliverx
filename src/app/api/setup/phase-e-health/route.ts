import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseEHealthReport } from "@/services/phaseEHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseEHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
