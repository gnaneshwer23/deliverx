/**
 * Delivery traceability — sync links and full req → story → task → test graph.
 */

import { createClient } from "@/lib/supabase/server";
import {
  buildDeliveryTraceGraph,
  matchTaskToStory,
  type DeliveryTraceGraph,
} from "./deliveryTraceabilityEngine";
import type { TraceMatrixRow } from "./baRequirementEngine";
import {
  getBaProjectContext,
  listApprovedRequirements,
  listUserStories,
} from "./baRequirements";

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
  return { supabase, orgId: profile.organisation_id as string };
}

export async function syncRequirementTraceLinks(projectId: string): Promise<{
  created: number;
  updated: number;
}> {
  const { supabase, orgId } = await getOrgContext();

  const [requirements, stories, tasksRes, existingRes] = await Promise.all([
    listApprovedRequirements(projectId),
    listUserStories(projectId),
    supabase.from("tasks").select("id, title, description").eq("project_id", projectId),
    supabase
      .from("requirement_trace_links")
      .select("id, requirement_id, user_story_id, task_id")
      .eq("project_id", projectId),
  ]);

  const tasks = tasksRes.data ?? [];
  const existing = existingRes.data ?? [];
  let created = 0;

  const storyByReq = new Map<string, (typeof stories)[0]>();
  for (const story of stories) {
    if (story.requirement_id) storyByReq.set(story.requirement_id, story);
  }

  const existingByReq = new Map(
    existing.map((l) => [l.requirement_id as string, l]),
  );

  const usedTaskIds = new Set(
    existing.map((l) => l.task_id).filter((id): id is string => Boolean(id)),
  );

  for (const req of requirements) {
    const story = storyByReq.get(req.id);
    if (!story) continue;

    let taskId: string | null = null;
    for (const task of tasks) {
      if (usedTaskIds.has(task.id as string)) continue;
      if (
        matchTaskToStory(
          { title: task.title as string, description: task.description as string | null },
          { story_code: story.story_code, title: story.title },
        )
      ) {
        taskId = task.id as string;
        usedTaskIds.add(taskId);
        break;
      }
    }

    const current = existingByReq.get(req.id);
    if (!current) {
      const { error } = await supabase.from("requirement_trace_links").insert({
        organisation_id: orgId,
        project_id: projectId,
        requirement_id: req.id,
        user_story_id: story.id,
        task_id: taskId,
        link_type: "implements",
      });
      if (!error) created++;
      continue;
    }

    if (!current.task_id && taskId) {
      await supabase
        .from("requirement_trace_links")
        .update({ task_id: taskId, user_story_id: story.id })
        .eq("id", current.id as string);
      created++;
    }
  }

  return { created, updated: 0 };
}

export async function buildFullTraceabilityMatrix(
  projectId: string,
): Promise<TraceMatrixRow[]> {
  const { supabase } = await getOrgContext();

  const [requirements, stories, links, objectives, testCasesRes] = await Promise.all([
    listApprovedRequirements(projectId),
    listUserStories(projectId),
    supabase
      .from("requirement_trace_links")
      .select("requirement_id, user_story_id, task_id")
      .eq("project_id", projectId),
    getBaProjectContext(projectId),
    supabase
      .from("test_cases")
      .select("test_code, title, linked_story_code, user_story_id")
      .eq("project_id", projectId),
  ]);

  const storyByReq = new Map<string, (typeof stories)[0]>();
  const storyById = new Map(stories.map((s) => [s.id, s]));
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

  const testsByStoryCode = new Map<string, string>();
  const testsByStoryId = new Map<string, string>();
  for (const tc of testCasesRes.data ?? []) {
    const code = tc.test_code as string;
    if (tc.linked_story_code) {
      testsByStoryCode.set(tc.linked_story_code as string, code);
    }
    if (tc.user_story_id) {
      testsByStoryId.set(tc.user_story_id as string, code);
    }
  }

  const objectiveList =
    (objectives?.business_context?.objectives as string[] | undefined) ?? [];

  return requirements.map((req, index) => {
    const storyFromLink = (links.data ?? []).find((l) => l.requirement_id === req.id);
    const story =
      (storyFromLink?.user_story_id
        ? storyById.get(storyFromLink.user_story_id as string)
        : null) ?? storyByReq.get(req.id);

    const taskId = storyFromLink?.task_id as string | null | undefined;
    const taskTitle = taskId ? taskById.get(taskId) ?? null : null;

    const testCode =
      (story && testsByStoryId.get(story.id)) ??
      (story && testsByStoryCode.get(story.story_code)) ??
      null;

    const status =
      req.status === "approved"
        ? story && taskTitle && testCode
          ? "Ready"
          : story && taskTitle
            ? "In Progress"
            : story
              ? "Story only"
              : "Needs story"
        : "Needs review";

    return {
      requirementId: req.id,
      objective:
        objectiveList[index % Math.max(objectiveList.length, 1)] ?? "Delivery objective",
      requirement: req.title,
      reqCode: req.req_code,
      story: story?.title ?? null,
      storyCode: story?.story_code ?? null,
      storyId: story?.id ?? null,
      task: taskTitle,
      taskId: taskId ?? null,
      test: testCode,
      testCode,
      status,
    };
  });
}

export async function getDeliveryTraceability(
  projectId: string,
  options?: { sync?: boolean },
): Promise<DeliveryTraceGraph & { syncResult?: { created: number; updated: number } }> {
  let syncResult: { created: number; updated: number } | undefined;
  if (options?.sync !== false) {
    syncResult = await syncRequirementTraceLinks(projectId);
  }
  const rows = await buildFullTraceabilityMatrix(projectId);
  return { ...buildDeliveryTraceGraph(rows), syncResult };
}
