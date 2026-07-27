import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { syncProjectMemory } from "@/services/projectMemoryRag";

export const maxDuration = 30;

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const result = await syncProjectMemory(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
