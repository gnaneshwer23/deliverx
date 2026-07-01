/**
 * BA requirements — CRUD, stats, traceability links.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  ClarificationGapRow,
  ClarificationRow,
  RequirementQuality,
  RequirementRow,
  StoryRow,
  TraceMatrixRow,
} from "./baRequirementEngine";
import { passesQualityGate } from "./baRequirementEngine";
import {
  clarificationChangeToImpactDrafts,
  emitLoopPropagation,
  requirementChangeToImpactDrafts,
  storyChangeToImpactDrafts,
} from "./loopEventPropagation";

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

function mapClarificationGap(row: Record<string, unknown>): ClarificationGapRow {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as string,
    gap_type: row.gap_type as string,
    priority: row.priority as string,
    requirement_id: (row.requirement_id as string | null) ?? null,
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

export async function listApprovedUserStories(projectId: string): Promise<StoryRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("user_stories")
    .select("*")
    .eq("project_id", projectId)
    .or("review_status.eq.approved,and(ai_generated.eq.false,status.in.(ready,in_progress,done))")
    .order("story_code", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStory);
}

export async function listApprovedRequirements(projectId: string): Promise<RequirementRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("project_id", projectId)
    .or("review_status.eq.approved,status.eq.approved")
    .order("req_code", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRequirement);
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

export async function listClarificationGaps(projectId: string): Promise<ClarificationGapRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("clarification_gaps")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapClarificationGap);
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
  const openGaps = (await listClarificationGaps(projectId).catch(() => [])).filter(
    (g) => g.status === "open",
  ).length;
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
    openClarifications: openClarifications + openGaps,
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
    structuredItemId?: string;
    businessCaseReviewId?: string;
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
      structured_item_id: item.structuredItemId ?? null,
      business_case_review_id: item.businessCaseReviewId ?? null,
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

  const reqIds = [...new Set(items.map((i) => i.requirementId).filter(Boolean))] as string[];
  const reqCodeById = new Map<string, string>();
  if (reqIds.length > 0) {
    const { data: reqs } = await supabase
      .from("requirements")
      .select("id, req_code")
      .in("id", reqIds);
    for (const req of reqs ?? []) {
      reqCodeById.set(String(req.id), String(req.req_code));
    }
  }

  for (const item of items) {
    void emitLoopPropagation({
      projectId,
      actionType: "clarification_create",
      entityType: "clarification",
      drafts: clarificationChangeToImpactDrafts({
        question: item.question,
        reqCode: item.requirementId ? reqCodeById.get(item.requirementId) : undefined,
        isNew: true,
      }),
    }).catch(() => 0);
  }

  return rows.length;
}

export async function bulkInsertClarificationGaps(
  projectId: string,
  items: Array<{
    title: string;
    description: string;
    gapType?: "gap" | "missing_info" | "clarification";
    priority?: string;
    structuredItemId?: string;
    businessCaseReviewId?: string;
    requirementId?: string;
  }>,
): Promise<number> {
  const { supabase, orgId } = await getOrgContext();
  const rows = items.map((item) => ({
    organisation_id: orgId,
    project_id: projectId,
    requirement_id: item.requirementId ?? null,
    business_case_review_id: item.businessCaseReviewId ?? null,
    structured_item_id: item.structuredItemId ?? null,
    title: item.title,
    description: item.description,
    gap_type: item.gapType ?? "gap",
    priority: item.priority ?? "medium",
    status: "open",
    source: "business_case_analysis",
  }));
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("clarification_gaps").insert(rows);
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
  const story = mapStory(data);

  void emitLoopPropagation({
    projectId: input.projectId,
    actionType: "story_create",
    entityType: "user_story",
    entityId: story.id,
    drafts: storyChangeToImpactDrafts({
      storyCode: story.story_code,
      title: story.title,
      statusAfter: story.status,
      isNew: true,
    }),
  }).catch(() => 0);

  return story;
}

export async function updateRequirementStatus(
  requirementId: string,
  status: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase } = await getOrgContext();

  if (status === "approved") {
    const { data: req, error: fetchError } = await supabase
      .from("requirements")
      .select("quality, review_status, ai_generated, project_id, req_code, title, status")
      .eq("id", requirementId)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!req) return { ok: false, error: "Requirement not found" };

    if (req.ai_generated && req.review_status === "needs_review") {
      return {
        ok: false,
        error: "AI-generated requirement must pass artifact review before approval.",
      };
    }

    const gate = passesQualityGate((req.quality ?? {}) as RequirementQuality);
    if (!gate.ok) {
      return {
        ok: false,
        error: `Quality gate failed: ${gate.reasons.join(", ")}`,
      };
    }
  }

  const { data: before } = await supabase
    .from("requirements")
    .select("project_id, req_code, title, status")
    .eq("id", requirementId)
    .maybeSingle();

  const { error } = await supabase
    .from("requirements")
    .update({ status })
    .eq("id", requirementId);
  if (error) throw error;

  if (before) {
    void emitLoopPropagation({
      projectId: String(before.project_id),
      actionType: "requirement_update",
      entityType: "requirement",
      entityId: requirementId,
      drafts: requirementChangeToImpactDrafts({
        reqCode: String(before.req_code),
        title: String(before.title),
        statusBefore: String(before.status),
        statusAfter: status,
      }),
    }).catch(() => 0);
  }

  return { ok: true };
}

export async function updateRequirement(
  requirementId: string,
  patch: {
    status?: string;
    title?: string;
    description?: string;
  },
): Promise<{ ok: true; requirement: RequirementRow } | { ok: false; error: string }> {
  if (patch.status) {
    const statusResult = await updateRequirementStatus(requirementId, patch.status);
    if (!statusResult.ok) return statusResult;
  }

  if (patch.title === undefined && patch.description === undefined) {
    const { supabase } = await getOrgContext();
    const { data } = await supabase
      .from("requirements")
      .select("*")
      .eq("id", requirementId)
      .maybeSingle();
    if (!data) return { ok: false, error: "Requirement not found" };
    return { ok: true, requirement: mapRequirement(data) };
  }

  const { supabase } = await getOrgContext();
  const updates: Record<string, string> = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.description !== undefined) updates.description = patch.description;

  const { data, error } = await supabase
    .from("requirements")
    .update(updates)
    .eq("id", requirementId)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) return { ok: false, error: "Requirement not found" };
  return { ok: true, requirement: mapRequirement(data) };
}

export async function answerClarification(
  clarificationId: string,
  answer: string,
): Promise<void> {
  const { supabase } = await getOrgContext();
  const { data: clar } = await supabase
    .from("requirement_clarifications")
    .select("project_id, question, requirement_id")
    .eq("id", clarificationId)
    .maybeSingle();

  const { error } = await supabase
    .from("requirement_clarifications")
    .update({ answer, status: "answered" })
    .eq("id", clarificationId);
  if (error) throw error;

  if (clar?.project_id) {
    let reqCode: string | undefined;
    if (clar.requirement_id) {
      const { data: req } = await supabase
        .from("requirements")
        .select("req_code")
        .eq("id", clar.requirement_id)
        .maybeSingle();
      reqCode = req?.req_code ? String(req.req_code) : undefined;
    }
    void emitLoopPropagation({
      projectId: String(clar.project_id),
      actionType: "clarification_answered",
      entityType: "clarification",
      entityId: clarificationId,
      drafts: [
        { targetRole: "ba", message: `Clarification answered: ${clar.question}`, tone: "updated" },
        { targetRole: "engineer", message: `${reqCode ?? "Requirement"} unblocked — clarification resolved`, tone: "ready" },
        { targetRole: "scrum", message: `Planning can proceed after clarification on ${reqCode ?? "requirement"}`, tone: "updated" },
      ],
      syncNarrativeThreads: true,
    }).catch(() => 0);
  }
}

export async function buildTraceabilityMatrix(
  projectId: string,
): Promise<TraceMatrixRow[]> {
  const { buildFullTraceabilityMatrix, syncRequirementTraceLinks } = await import(
    "./deliveryTraceability"
  );
  await syncRequirementTraceLinks(projectId).catch(() => ({ created: 0, updated: 0 }));
  const rows = await buildFullTraceabilityMatrix(projectId);
  return rows.slice(0, 20);
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
