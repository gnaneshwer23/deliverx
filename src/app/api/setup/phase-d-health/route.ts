import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseDHealthReport } from "@/services/phaseDHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseDHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
