import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordWorkspaceContribution } from "@/lib/professional-workspace/contribution";
import type { ContributionKind } from "@/lib/professional-workspace/contribution";
import type { WorkspaceModuleId } from "@/lib/professional-workspace/modules";
import { parseWorkspaceProjectParam } from "@/lib/professional-workspace/project-context";
import {
  listWorkspaceProjects,
  resolveActiveProject,
} from "@/lib/professional-workspace/list-projects";

const KINDS = new Set<ContributionKind>([
  "user_authored",
  "ai_suggested",
  "user_accepted",
  "user_edited",
  "user_submitted",
  "outcome_followed",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as {
    moduleId?: string;
    kind?: string;
    title?: string;
    summary?: string;
    project?: string;
    parentContributionId?: string;
    payload?: Record<string, unknown>;
  };

  const kind = data.kind as ContributionKind;
  const moduleId = data.moduleId as WorkspaceModuleId;
  const title = String(data.title ?? "").trim();
  if (!KINDS.has(kind) || !moduleId || !title) {
    return NextResponse.json(
      { error: "moduleId, kind and title required" },
      { status: 400 },
    );
  }

  const projects = await listWorkspaceProjects(supabase, user.id);
  const parsed = parseWorkspaceProjectParam(data.project ?? null);
  const project = resolveActiveProject(projects, parsed?.kind ?? null, parsed?.id ?? null);
  if (!project) {
    return NextResponse.json({ error: "project required" }, { status: 400 });
  }

  if (kind === "ai_suggested") {
    // Explicit: suggestions must be accepted before submit — never auto-complete.
  }

  try {
    const result = await recordWorkspaceContribution(supabase, {
      userId: user.id,
      moduleId,
      kind,
      project,
      title,
      summary: data.summary,
      payload: {
        ...(data.payload ?? {}),
        autonomy: { mayAutoSubmit: false, mayAutoDecide: false },
      },
      parentContributionId: data.parentContributionId,
    });
    return NextResponse.json({
      ok: true,
      contributionId: result.contributionId,
      observation: result.observation,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("[workspace] contribution failed", error);
    return NextResponse.json({ error: "Could not record contribution" }, { status: 500 });
  }
}
