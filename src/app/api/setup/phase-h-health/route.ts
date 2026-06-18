import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseHHealthReport } from "@/services/phaseHHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseHHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
