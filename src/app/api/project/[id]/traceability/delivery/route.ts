import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import {
  getDeliveryTraceability,
  syncRequirementTraceLinks,
} from "@/services/deliveryTraceability";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const graph = await getDeliveryTraceability(id, { sync: false });
    return NextResponse.json(graph);
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const result = await syncRequirementTraceLinks(id);
    const graph = await getDeliveryTraceability(id, { sync: false });
    return NextResponse.json({ ok: true, ...result, graph });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
