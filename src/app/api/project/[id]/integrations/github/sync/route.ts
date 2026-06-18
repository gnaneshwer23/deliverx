import { NextResponse } from "next/server";
import { requireProjectAccess, apiErrorResponse } from "@/lib/api/auth";
import { syncGitHubProject } from "@/services/githubIntegration";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const snapshot = await syncGitHubProject(id);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
