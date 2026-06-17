import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { analyseQaWorkspace } from "@/services/aiQa";
import { upsertQaContext } from "@/services/qaContext";
import { buildTraceabilityMatrix, listRequirements, listUserStories } from "@/services/baRequirements";
import { listRaidItems } from "@/services/governance";

type Body = {
  specialisation?: string;
  testingTools?: string[];
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

    if (body.specialisation || body.testingTools) {
      await upsertQaContext({
        specialisation: body.specialisation,
        testingTools: body.testingTools,
      });
    }

    const [stories, requirements, raid, matrix] = await Promise.all([
      listUserStories(id).catch(() => []),
      listRequirements(id).catch(() => []),
      listRaidItems(id).catch(() => []),
      buildTraceabilityMatrix(id).catch(() => []),
    ]);

    const storiesSummary = stories
      .slice(0, 20)
      .map((s) => `${s.story_code}: ${s.title} (${s.status})`)
      .join("\n");

    const requirementsSummary = requirements
      .slice(0, 20)
      .map((r) => `${r.req_code}: ${r.title}`)
      .join("\n");

    const raidSummary = raid
      .filter((r) => r.type === "issue" || r.type === "risk")
      .slice(0, 15)
      .map((r) => `${r.type}: ${r.title} (${r.status})`)
      .join("\n");

    const traceHint = matrix
      .slice(0, 10)
      .map((r) => `${r.reqCode} → ${r.storyCode ?? "—"} → ${r.test ?? "—"}`)
      .join("\n");

    const result = await analyseQaWorkspace({
      projectId: id,
      projectName: project.name,
      specialisation: body.specialisation,
      testingTools: body.testingTools,
      storiesSummary,
      requirementsSummary,
      raidSummary,
      extraContent: [body.content, traceHint].filter(Boolean).join("\n\n"),
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
