import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { getIntelligenceLoopSnapshot } from "@/services/intelligenceLoop";

export async function GET() {
  try {
    await requireAuth();
    const snapshot = await getIntelligenceLoopSnapshot();
    return Response.json(snapshot);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
