/**
 * Project knowledge graph — load Postgres delivery data into a unified graph.
 */

import { createClient } from "@/lib/supabase/server";
import { listDecisions, listMeetings, listRaidItems } from "./governance";
import { listBenefits } from "./benefits";
import { listMilestones } from "./milestones";
import {
  getBaProjectContext,
  listApprovedRequirements,
  listUserStories,
} from "./baRequirements";
import {
  buildProjectKnowledgeGraph,
  computeGraphImpact,
  traceGraphPaths,
  type GraphBuildInput,
  type GraphImpactResult,
  type GraphTracePath,
  type ProjectKnowledgeGraph,
} from "./projectKnowledgeGraphEngine";

export type { ProjectKnowledgeGraph, GraphImpactResult, GraphTracePath };

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

export async function getProjectKnowledgeGraph(
  projectId: string,
): Promise<ProjectKnowledgeGraph> {
  const { supabase } = await getOrgContext();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) throw new Error("Project not found");

  const [
    bcReview,
    baContext,
    requirements,
    stories,
    linksRes,
    tasksRes,
    testsRes,
    benefits,
    milestones,
    meetings,
    decisions,
    raid,
  ] = await Promise.all([
    supabase
      .from("business_case_reviews")
      .select("id, recommendation, brief_excerpt")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getBaProjectContext(projectId).catch(() => null),
    listApprovedRequirements(projectId),
    listUserStories(projectId),
    supabase
      .from("requirement_trace_links")
      .select("requirement_id, user_story_id, task_id, test_case_id, benefit_id")
      .eq("project_id", projectId),
    supabase.from("tasks").select("id, title").eq("project_id", projectId),
    supabase
      .from("test_cases")
      .select("id, test_code, title, user_story_id")
      .eq("project_id", projectId),
    listBenefits(projectId).catch(() => []),
    listMilestones(projectId).catch(() => []),
    listMeetings(projectId).catch(() => []),
    listDecisions(projectId).catch(() => []),
    listRaidItems(projectId).catch(() => []),
  ]);

  const objectives =
    (baContext?.business_context?.objectives as string[] | undefined)?.map((label, i) => ({
      id: String(i),
      label,
    })) ?? [];

  const storyByReq = new Map<string, string>();
  for (const s of stories) {
    if (s.requirement_id) storyByReq.set(s.requirement_id, s.id);
  }

  const links = linksRes.data ?? [];
  const linkByReq = new Map(links.map((l) => [l.requirement_id as string, l]));

  const input: GraphBuildInput = {
    projectId,
    projectName: project.name as string,
    businessCase: bcReview.data
      ? {
          id: bcReview.data.id as string,
          label: "Business case review",
          recommendation: bcReview.data.recommendation as string,
        }
      : undefined,
    objectives,
    requirements: requirements.map((r) => ({
      id: r.id,
      code: r.req_code,
      title: r.title,
    })),
    stories: stories.map((s) => ({
      id: s.id,
      code: s.story_code,
      title: s.title,
      requirementId: s.requirement_id ?? undefined,
    })),
    tasks: (tasksRes.data ?? []).map((t) => {
      const link = [...linkByReq.values()].find((l) => l.task_id === t.id);
      return {
        id: t.id as string,
        title: t.title as string,
        storyId: (link?.user_story_id as string | null) ?? undefined,
      };
    }),
    tests: (testsRes.data ?? []).map((tc) => ({
      id: tc.id as string,
      code: tc.test_code as string,
      title: tc.title as string,
      storyId: (tc.user_story_id as string | null) ?? undefined,
    })),
    milestones: milestones.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
    })),
    benefits: benefits.map((b, i) => ({
      id: b.id,
      title: b.title,
      objectiveId: objectives[i % Math.max(objectives.length, 1)]?.id,
    })),
    meetings: meetings.map((m) => ({ id: m.id, title: m.title })),
    decisions: decisions.map((d) => ({
      id: d.id,
      title: d.title,
      meetingId: d.meeting_id ?? undefined,
    })),
    raidItems: raid.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      meetingId: r.source_meeting_id ?? undefined,
    })),
    traceLinks: links.map((l) => ({
      requirementId: l.requirement_id as string,
      storyId: l.user_story_id as string | null,
      taskId: l.task_id as string | null,
      testCaseId: l.test_case_id as string | null,
      benefitId: l.benefit_id as string | null,
    })),
  };

  return buildProjectKnowledgeGraph(input);
}

export async function getProjectGraphImpact(
  projectId: string,
  nodeId: string,
): Promise<GraphImpactResult | null> {
  const graph = await getProjectKnowledgeGraph(projectId);
  return computeGraphImpact(graph, nodeId);
}

export async function getProjectGraphTrace(
  projectId: string,
  nodeId: string,
): Promise<GraphTracePath | null> {
  const graph = await getProjectKnowledgeGraph(projectId);
  return traceGraphPaths(graph, nodeId);
}
