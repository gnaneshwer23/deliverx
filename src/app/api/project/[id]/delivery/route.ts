import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { getPmDeliveryContext } from "@/services/deliveryPmContext";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const context = await getPmDeliveryContext(id);
    return NextResponse.json({ context });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
