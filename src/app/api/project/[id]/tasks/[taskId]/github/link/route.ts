import { NextResponse } from "next/server";
import { requireProjectAccess, apiErrorResponse } from "@/lib/api/auth";
import { linkTaskToGitHubPr } from "@/services/githubIntegration";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string; taskId: string }> },
) {
  try {
    const { id, taskId } = await ctx.params;
    await requireProjectAccess(id);
    const body = (await req.json()) as { prUrl?: string };
    const prUrl = String(body.prUrl ?? "").trim();
    if (!prUrl) {
      return NextResponse.json({ ok: false, error: "prUrl is required" }, { status: 400 });
    }

    const link = await linkTaskToGitHubPr({
      projectId: id,
      taskId,
      prUrl,
    });

    return NextResponse.json({ ok: true, link });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
