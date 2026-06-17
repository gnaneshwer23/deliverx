import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getContinuousLearningSnapshot } from "@/services/continuousLearning";

export async function GET() {
  try {
    await requireAuth();
    const snapshot = await getContinuousLearningSnapshot();
    return Response.json(snapshot);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
