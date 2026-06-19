import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseIHealthReport } from "@/services/phaseIHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseIHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
