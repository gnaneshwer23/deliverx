import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { getProjectKnowledgeGraph } from "@/services/projectKnowledgeGraph";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const graph = await getProjectKnowledgeGraph(id);
    return NextResponse.json(graph);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
