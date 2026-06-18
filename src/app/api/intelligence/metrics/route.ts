import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { getDeliveryEvalMetrics } from "@/services/intelligenceMetrics";

export async function GET() {
  try {
    const metrics = await getDeliveryEvalMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
