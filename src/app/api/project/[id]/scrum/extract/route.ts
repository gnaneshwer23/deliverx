import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { analyseScrumWorkspace } from "@/services/aiScrum";
import { upsertScrumContext } from "@/services/scrumContext";
import { listOrgTasks } from "@/services/delivery";
import { listUserStories } from "@/services/baRequirements";

export const maxDuration = 30;

type Body = {
  agileFramework?: string;
  teamConfig?: string;
  content?: string;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);
    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      /* optional */
    }

    if (body.agileFramework || body.teamConfig) {
      await upsertScrumContext({
        agileFramework: body.agileFramework,
        teamConfig: body.teamConfig,
      });
    }

    const [tasks, stories] = await Promise.all([
      listOrgTasks({ projectId: id, limit: 50 }).catch(() => []),
      listUserStories(id).catch(() => []),
    ]);

    const sprintSummary = [
      `${stories.length} stories`,
      `${tasks.filter((t) => t.status === "done").length} tasks done`,
      `${tasks.filter((t) => t.status === "blocked").length} blocked`,
    ].join(", ");

    const blockersSummary = tasks
      .filter((t) => t.status === "blocked")
      .map((t) => t.title)
      .join("\n");

    const result = await analyseScrumWorkspace({
      projectId: id,
      projectName: project.name,
      agileFramework: body.agileFramework,
      teamConfig: body.teamConfig,
      sprintSummary,
      blockersSummary,
      extraContent: body.content,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
