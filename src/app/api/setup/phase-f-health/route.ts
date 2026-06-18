import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseFHealthReport } from "@/services/phaseFHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseFHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
