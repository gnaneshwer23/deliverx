import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseGHealthReport } from "@/services/phaseGHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseGHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
