import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { getProductStats } from "@/services/pmProduct";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const stats = await getProductStats(id);
    return NextResponse.json(stats);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
