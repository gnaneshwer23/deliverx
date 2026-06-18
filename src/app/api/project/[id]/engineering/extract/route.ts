import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { analyseEngineerWorkspace } from "@/services/aiEngineer";
import { upsertEngineerContext } from "@/services/engineerContext";
import { listUserStories } from "@/services/baRequirements";
import { createClient } from "@/lib/supabase/server";

type Body = {
  specialisation?: string;
  techStack?: Record<string, string[]>;
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

    if (body.specialisation || body.techStack) {
      await upsertEngineerContext({
        specialisation: body.specialisation,
        techStack: body.techStack,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [stories, taskRes] = await Promise.all([
      listUserStories(id).catch(() => []),
      user
        ? supabase
            .from("tasks")
            .select("title, status, priority")
            .eq("project_id", id)
            .eq("assignee_id", user.id)
            .limit(20)
        : Promise.resolve({ data: [] }),
    ]);

    const storiesSummary = stories
      .slice(0, 10)
      .map((s) => `${s.story_code}: ${s.title} (${s.status})`)
      .join("\n");
    const tasksSummary = ((taskRes.data ?? []) as Array<{ title: string; status: string }>)
      .map((t) => `${t.title} — ${t.status}`)
      .join("\n");

    const result = await analyseEngineerWorkspace({
      projectId: id,
      projectName: project.name,
      specialisation: body.specialisation,
      techStack: body.techStack,
      storiesSummary,
      tasksSummary,
      extraContent: body.content,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
