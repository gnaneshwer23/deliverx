import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseCHealthReport } from "@/services/phaseCHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseCHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
