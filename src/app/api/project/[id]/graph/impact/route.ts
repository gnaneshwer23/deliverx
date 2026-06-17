import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { getProjectGraphImpact } from "@/services/projectKnowledgeGraph";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const nodeId = new URL(req.url).searchParams.get("nodeId");
    if (!nodeId) {
      return NextResponse.json({ error: "nodeId is required" }, { status: 400 });
    }
    const impact = await getProjectGraphImpact(id, nodeId);
    if (!impact) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }
    return NextResponse.json(impact);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
