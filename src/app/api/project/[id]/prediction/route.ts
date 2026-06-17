import { NextResponse } from "next/server";
import { requireProjectAccess, apiErrorResponse } from "@/lib/api/auth";
import { getDeliveryPrediction } from "@/services/deliveryPrediction";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const prediction = await getDeliveryPrediction(id);
    return NextResponse.json({ ok: true, prediction });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
