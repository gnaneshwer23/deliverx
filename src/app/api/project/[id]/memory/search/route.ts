import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { searchProjectMemory } from "@/services/projectMemoryRag";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const q = new URL(req.url).searchParams.get("q") ?? "";
    const limit = Number(new URL(req.url).searchParams.get("limit") ?? "8");
    const results = await searchProjectMemory(id, q, Number.isFinite(limit) ? limit : 8);
    return NextResponse.json({ results });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
