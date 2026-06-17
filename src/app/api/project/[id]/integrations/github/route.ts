import { NextResponse } from "next/server";
import { requireProjectAccess, apiErrorResponse } from "@/lib/api/auth";
import {
  getGitHubProjectSnapshot,
  getProjectIntegrationSettings,
} from "@/services/githubIntegration";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const [snapshot, settings] = await Promise.all([
      getGitHubProjectSnapshot(id),
      getProjectIntegrationSettings(id),
    ]);
    return NextResponse.json({
      ok: true,
      snapshot,
      settings,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
