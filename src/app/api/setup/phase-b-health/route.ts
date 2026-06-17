import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getPhaseBHealthReport } from "@/services/phaseBHealth";

export async function GET() {
  try {
    await requireAuth();
    const report = await getPhaseBHealthReport();
    return Response.json(report);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
