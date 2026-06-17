/**
 * BA requirements — CRUD, stats, traceability links.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  ClarificationRow,
  RequirementRow,
  StoryRow,
  TraceMatrixRow,
} from "./baRequirementEngine";

export type BaProjectContext = {
  id: string;
  project_id: string;
  project_type: string | null;
  context_sources: unknown[];
  business_context: Record<string, unknown>;
  extraction_status: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string, userId: user.id };
}

function mapRequirement(row: Record<string, unknown>): RequirementRow {
  const quality = (row.quality ?? {}) as RequirementRow["quality"];
  return {
    id: row.id as string,
    req_code: row.req_code as string,
    type: row.type as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as string,
    quality,
    owner_role: (row.owner_role as string | null) ?? null,
    flags: Array.isArray(row.flags) ? (row.flags as string[]) : [],
  };
}

function mapStory(row: Record<string, unknown>): StoryRow {
  return {
    id: row.id as string,
    story_code: row.story_code as string,
    title: row.title as string,
    story: row.story as string,
    status: row.status as string,
    requirement_id: (row.requirement_id as string | null) ?? null,
  };
}

function mapClarification(row: Record<string, unknown>): ClarificationRow {
  return {
    id: row.id as string,
    question: row.question as string,
    status: row.status as string,
    priority: row.priority as string,
    stakeholder_role: (row.stakeholder_role as string | null) ?? null,
    blocks: (row.blocks as string | null) ?? null,
    due_date: (row.due_date as string | null) ?? null,
  };
}

export async function getBaProjectContext(
  projectId: string,
): Promise<BaProjectContext | null> {
  const { supabase } = await getOrgContext();
  const { data } = await supabase
    .from("ba_project_context")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  return data as BaProjectContext | null;
}

export async function upsertBaProjectContext(input: {
  projectId: string;
  projectType?: string;
  contextSources?: unknown[];
  businessContext?: Record<string, unknown>;
  extractionStatus?: string;
}): Promise<BaProjectContext> {
  const { supabase, orgId } = await getOrgContext();
  const existing = await getBaProjectContext(input.projectId);

  if (existing) {
    const { data, error } = await supabase
      .from("ba_project_context")
      .update({
        project_type: input.projectType ?? existing.project_type,
        context_sources: input.contextSources ?? existing.context_sources,
        business_context: input.businessContext ?? existing.business_context,
        extraction_status: input.extractionStatus ?? existing.extraction_status,
      })
      .eq("project_id", input.projectId)
      .select("*")
      .single();
    if (error) throw error;
    return data as BaProjectContext;
  }

  const { data, error } = await supabase
    .from("ba_project_context")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      project_type: input.projectType ?? null,
      context_sources: input.contextSources ?? [],
      business_context: input.businessContext ?? {},
      extraction_status: input.extractionStatus ?? "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as BaProjectContext;
}

export async function listRequirements(projectId: string): Promise<RequirementRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("project_id", projectId)
    .order("req_code", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRequirement);
}

export async function listUserStories(projectId: string): Promise<StoryRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("user_stories")
    .select("*")
    .eq("project_id", projectId)
    .order("story_code", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStory);
}

export async function listClarifications(projectId: string): Promise<ClarificationRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("requirement_clarifications")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapClarification);
}

export async function getRequirementStats(projectId: string) {
  const [requirements, stories, clarifications] = await Promise.all([
    listRequirements(projectId),
    listUserStories(projectId),
    listClarifications(projectId),
  ]);

  const approved = requirements.filter((r) => r.status === "approved").length;
  const pendingClarification = requirements.filter(
    (r) => r.status === "pending_clarification",
  ).length;
  const openClarifications = clarifications.filter((c) => c.status === "open").length;
  const storiesReady = stories.filter((s) => s.status === "ready").length;

  const { supabase } = await getOrgContext();
  const { count: linkedTasks } = await supabase
    .from("requirement_trace_links")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .not("task_id", "is", null);

  return {
    requirements,
    stories,
    clarifications,
    extracted: requirements.length,
    approved,
    pendingClarification,
    openClarifications,
    storiesReady,
    linkedTasks: linkedTasks ?? 0,
    stakeholderReviewsPending: clarifications.filter(
      (c) => c.status === "open" && c.stakeholder_role,
    ).length,
  };
}

export async function bulkInsertRequirements(
  projectId: string,
  items: Array<{
    type: string;
    title: string;
    description: string;
    ownerRole?: string;
    quality: Record<string, unknown>;
    flags?: string[];
    status?: string;
  }>,
  options?: { requireApproval?: boolean },
): Promise<{ count: number; ids: string[] }> {
  const { supabase, orgId } = await getOrgContext();
  const { count } = await supabase
    .from("requirements")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  let seq = (count ?? 0) + 1;
  const requireApproval = options?.requireApproval ?? false;
  const rows = items.map((item) => {
    const code = `REQ-${String(seq++).padStart(3, "0")}`;
    return {
      organisation_id: orgId,
      project_id: projectId,
      req_code: code,
      type: item.type,
      title: item.title,
      description: item.description,
      owner_role: item.ownerRole ?? null,
      quality: item.quality,
      flags: item.flags ?? [],
      status: item.status ?? "draft",
      source: "ai_extraction",
      ai_generated: requireApproval,
      review_status: requireApproval ? "needs_review" : "draft",
    };
  });

  if (rows.length === 0) return { count: 0, ids: [] };
  const { data, error } = await supabase.from("requirements").insert(rows).select("id");
  if (error) throw error;
  return { count: rows.length, ids: (data ?? []).map((r) => r.id as string) };
}

export async function bulkInsertClarifications(
  projectId: string,
  items: Array<{
    question: string;
    priority?: string;
    stakeholderRole?: string;
    blocks?: string;
    requirementId?: string;
  }>,
): Promise<number> {
  const { supabase, orgId } = await getOrgContext();
  const rows = items.map((item) => ({
    organisation_id: orgId,
    project_id: projectId,
    requirement_id: item.requirementId ?? null,
    question: item.question,
    priority: item.priority ?? "medium",
    stakeholder_role: item.stakeholderRole ?? null,
    blocks: item.blocks ?? null,
    status: "open",
  }));
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("requirement_clarifications").insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function insertUserStory(input: {
  projectId: string;
  requirementId?: string;
  title: string;
  story: string;
  acceptanceCriteria: string[];
  status?: string;
}): Promise<StoryRow> {
  const { supabase, orgId } = await getOrgContext();
  const { count } = await supabase
    .from("user_stories")
    .select("id", { count: "exact", head: true })
    .eq("project_id", input.projectId);

  const code = `US-${String((count ?? 0) + 1).padStart(2, "0")}`;
  const { data, error } = await supabase
    .from("user_stories")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      requirement_id: input.requirementId ?? null,
      story_code: code,
      title: input.title,
      story: input.story,
      acceptance_criteria: input.acceptanceCriteria,
      status: input.status ?? "ready",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapStory(data);
}

export async function updateRequirementStatus(
  requirementId: string,
  status: string,
): Promise<void> {
  const { supabase } = await getOrgContext();
  const { error } = await supabase
    .from("requirements")
    .update({ status })
    .eq("id", requirementId);
  if (error) throw error;
}

export async function answerClarification(
  clarificationId: string,
  answer: string,
): Promise<void> {
  const { supabase } = await getOrgContext();
  const { error } = await supabase
    .from("requirement_clarifications")
    .update({ answer, status: "answered" })
    .eq("id", clarificationId);
  if (error) throw error;
}

export async function buildTraceabilityMatrix(
  projectId: string,
): Promise<TraceMatrixRow[]> {
  const { supabase } = await getOrgContext();
  const [requirements, stories, links, objectives] = await Promise.all([
    listRequirements(projectId),
    listUserStories(projectId),
    supabase
      .from("requirement_trace_links")
      .select("requirement_id, user_story_id, task_id")
      .eq("project_id", projectId),
    getBaProjectContext(projectId),
  ]);

  const storyByReq = new Map<string, StoryRow>();
  for (const s of stories) {
    if (s.requirement_id) storyByReq.set(s.requirement_id, s);
  }

  const taskIds = (links.data ?? [])
    .map((l) => l.task_id)
    .filter((id): id is string => Boolean(id));

  let tasks: Array<{ id: string; title: string }> = [];
  if (taskIds.length) {
    const { data } = await supabase
      .from("tasks")
      .select("id, title")
      .in("id", taskIds);
    tasks = data ?? [];
  }
  const taskById = new Map(tasks.map((t) => [t.id, t.title]));

  const objectiveList =
    (objectives?.business_context?.objectives as string[] | undefined) ?? [];

  return requirements.slice(0, 20).map((req, index) => {
    const story = storyByReq.get(req.id);
    const link = (links.data ?? []).find((l) => l.requirement_id === req.id);
    const taskTitle = link?.task_id ? taskById.get(link.task_id) : null;

    return {
      objective: objectiveList[index % Math.max(objectiveList.length, 1)] ?? "Delivery objective",
      requirement: req.title,
      reqCode: req.req_code,
      story: story?.title ?? null,
      storyCode: story?.story_code ?? null,
      task: taskTitle ?? null,
      test: story ? `TC-${story.story_code.replace("US-", "")}` : null,
      status:
        req.status === "approved"
          ? story?.status === "ready"
            ? "Ready"
            : "In Progress"
          : "Needs review",
    };
  });
}

export async function linkRequirementToTask(
  projectId: string,
  requirementId: string,
  taskId: string,
  userStoryId?: string,
): Promise<void> {
  const { supabase, orgId } = await getOrgContext();
  const { error } = await supabase.from("requirement_trace_links").insert({
    organisation_id: orgId,
    project_id: projectId,
    requirement_id: requirementId,
    task_id: taskId,
    user_story_id: userStoryId ?? null,
    link_type: "implements",
  });
  if (error) throw error;
}
