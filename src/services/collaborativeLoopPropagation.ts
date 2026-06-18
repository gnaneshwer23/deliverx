/**
 * Collaborative loop propagation — traceable narrative threads across persona dashboards.
 */

import { createClient } from "@/lib/supabase/server";
import type { DeliveryImpactEventDraft, DeliveryImpactRole } from "./deliveryImpactEngine";
import type { TeamNeedKind, TeamNeedRow } from "./collaborativeLoopEngine";
import { emitDeliveryImpactEvents } from "./deliveryImpact";

export type NarrativeThreadId =
  | "auth-api-blocker"
  | "critical-defects"
  | "fr003-gdpr-gap";

export type NarrativeThread = {
  id: NarrativeThreadId;
  title: string;
  summary: string;
  kind: TeamNeedKind;
  priority: "high" | "medium" | "low";
  fromStakeholder: string;
  dueLabel?: string;
  href?: string;
  linkedRoles: DeliveryImpactRole[];
  entityType?: string;
  entityId?: string;
};

export type NarrativeThreadSignals = {
  projectId: string;
  authApiBlockedTask?: { id: string; title: string } | null;
  criticalDefects?: Array<{ id: string; code: string; title: string }>;
  fr003Requirement?: { id: string; reqCode: string; title: string } | null;
  fr003Clarification?: { id: string; question: string } | null;
  us49Story?: { id: string; storyCode: string; title: string } | null;
};

const THREAD_IMPACT: Record<
  NarrativeThreadId,
  Array<{ role: DeliveryImpactRole; tone: "blocked" | "waiting" | "updated" }>
> = {
  "auth-api-blocker": [
    { role: "engineer", tone: "blocked" },
    { role: "pm", tone: "waiting" },
    { role: "scrum", tone: "blocked" },
    { role: "founder", tone: "waiting" },
  ],
  "critical-defects": [
    { role: "qa", tone: "blocked" },
    { role: "engineer", tone: "waiting" },
    { role: "pm", tone: "waiting" },
    { role: "scrum", tone: "updated" },
  ],
  "fr003-gdpr-gap": [
    { role: "ba", tone: "blocked" },
    { role: "engineer", tone: "waiting" },
    { role: "qa", tone: "waiting" },
    { role: "scrum", tone: "waiting" },
  ],
};

export function resolveNarrativeThreads(signals: NarrativeThreadSignals): NarrativeThread[] {
  const { projectId } = signals;
  const threads: NarrativeThread[] = [];

  if (signals.authApiBlockedTask) {
    const task = signals.authApiBlockedTask;
    threads.push({
      id: "auth-api-blocker",
      title: `Auth API blocker: ${task.title}`,
      summary: "Engineering blocked on Auth API dependency — impacts sprint commitment.",
      kind: "blocker",
      priority: "high",
      fromStakeholder: "Engineering",
      dueLabel: "Today",
      href: `/project/${projectId}/tasks/${task.id}`,
      linkedRoles: THREAD_IMPACT["auth-api-blocker"].map((t) => t.role),
      entityType: "task",
      entityId: task.id,
    });
  }

  const critical = signals.criticalDefects ?? [];
  if (critical.length > 0) {
    const codes = critical.map((d) => d.code).join(", ");
    threads.push({
      id: "critical-defects",
      title: `Critical defects (${codes})`,
      summary: `${critical.length} critical defect${critical.length === 1 ? "" : "s"} blocking release readiness.`,
      kind: "defect",
      priority: "high",
      fromStakeholder: "QA",
      dueLabel: "Before release",
      href: `/project/${projectId}/qa`,
      linkedRoles: THREAD_IMPACT["critical-defects"].map((t) => t.role),
      entityType: "defect",
      entityId: critical[0]?.id,
    });
  }

  if (signals.fr003Requirement || signals.fr003Clarification) {
    const req = signals.fr003Requirement;
    const clar = signals.fr003Clarification;
    const story = signals.us49Story;
    threads.push({
      id: "fr003-gdpr-gap",
      title: req
        ? `${req.reqCode} GDPR gap — ${req.title}`
        : "FR-003 GDPR compliance gap",
      summary:
        clar?.question ??
        (story
          ? `${story.storyCode} blocked until GDPR requirement is clarified.`
          : "Requirement clarification blocks downstream stories."),
      kind: "clarification",
      priority: "high",
      fromStakeholder: "Business Analyst",
      dueLabel: "Before sprint planning",
      href: req
        ? `/project/${projectId}/requirements`
        : clar
          ? `/project/${projectId}/requirements`
          : undefined,
      linkedRoles: THREAD_IMPACT["fr003-gdpr-gap"].map((t) => t.role),
      entityType: req ? "requirement" : "clarification",
      entityId: req?.id ?? clar?.id,
    });
  }

  return threads;
}

export function narrativeThreadsToTeamNeeds(threads: NarrativeThread[]): TeamNeedRow[] {
  return threads.map((t) => ({
    id: `thread-${t.id}`,
    kind: t.kind,
    title: t.title,
    fromStakeholder: t.fromStakeholder,
    priority: t.priority,
    dueLabel: t.dueLabel,
    href: t.href,
  }));
}

export function narrativeThreadsToImpactDrafts(threads: NarrativeThread[]): DeliveryImpactEventDraft[] {
  const drafts: DeliveryImpactEventDraft[] = [];

  for (const thread of threads) {
    const impacts = THREAD_IMPACT[thread.id];
    for (const impact of impacts) {
      drafts.push({
        targetRole: impact.role,
        message: thread.summary,
        tone: impact.tone,
      });
    }
  }

  return drafts;
}

export function rolesReachedByThreads(threads: NarrativeThread[]): DeliveryImpactRole[] {
  const roles = new Set<DeliveryImpactRole>();
  for (const thread of threads) {
    for (const role of thread.linkedRoles) roles.add(role);
  }
  return [...roles];
}

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

export async function loadNarrativeThreadSignals(projectId: string): Promise<NarrativeThreadSignals> {
  const { supabase } = await getOrgContext();

  const [taskRes, defectsRes, reqRes, clarRes, storyRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, status, blocked_reason")
      .eq("project_id", projectId)
      .eq("status", "blocked")
      .or("blocked_reason.ilike.%Auth API%,title.ilike.%Auth API%")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("defects")
      .select("id, defect_code, title, severity, status")
      .eq("project_id", projectId)
      .eq("severity", "critical")
      .neq("status", "closed")
      .in("defect_code", ["BUG-142", "BUG-167"])
      .order("defect_code", { ascending: true }),
    supabase
      .from("requirements")
      .select("id, req_code, title, status")
      .eq("project_id", projectId)
      .eq("req_code", "FR-003")
      .maybeSingle(),
    supabase
      .from("requirement_clarifications")
      .select("id, question, status, requirement_id")
      .eq("project_id", projectId)
      .eq("status", "open")
      .ilike("question", "%GDPR%")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_stories")
      .select("id, story_code, title, status")
      .eq("project_id", projectId)
      .eq("story_code", "US-49")
      .maybeSingle(),
  ]);

  return {
    projectId,
    authApiBlockedTask: taskRes.data
      ? { id: String(taskRes.data.id), title: String(taskRes.data.title) }
      : null,
    criticalDefects: (defectsRes.data ?? []).map((d) => ({
      id: String(d.id),
      code: String(d.defect_code),
      title: String(d.title),
    })),
    fr003Requirement: reqRes.data
      ? {
          id: String(reqRes.data.id),
          reqCode: String(reqRes.data.req_code),
          title: String(reqRes.data.title),
        }
      : null,
    fr003Clarification: clarRes.data
      ? { id: String(clarRes.data.id), question: String(clarRes.data.question) }
      : null,
    us49Story: storyRes.data
      ? {
          id: String(storyRes.data.id),
          storyCode: String(storyRes.data.story_code),
          title: String(storyRes.data.title),
        }
      : null,
  };
}

export async function getNarrativeThreadsForProject(projectId: string): Promise<NarrativeThread[]> {
  const signals = await loadNarrativeThreadSignals(projectId);
  return resolveNarrativeThreads(signals);
}

export async function seedNarrativeThreadDemoData(
  projectId: string,
  orgId: string,
): Promise<{ seeded: boolean; threads: NarrativeThread[]; impactEvents: number }> {
  const supabase = await createClient();

  const { data: existingReq } = await supabase
    .from("requirements")
    .select("id")
    .eq("project_id", projectId)
    .eq("req_code", "FR-003")
    .maybeSingle();

  if (existingReq) {
    const signals = await loadNarrativeThreadSignals(projectId);
    return { seeded: false, threads: resolveNarrativeThreads(signals), impactEvents: 0 };
  }

  const { data: fr003, error: reqErr } = await supabase
    .from("requirements")
    .insert({
      organisation_id: orgId,
      project_id: projectId,
      req_code: "FR-003",
      type: "functional",
      title: "GDPR data retention policy",
      description: "Users must be able to request data deletion within 30 days per GDPR Article 17.",
      status: "pending_clarification",
      owner_role: "ba",
      flags: ["compliance", "gdpr"],
      source: "bootstrap",
    })
    .select("id")
    .single();
  if (reqErr) throw reqErr;

  const fr003Id = String(fr003.id);

  const [{ data: clar }, { data: story }] = await Promise.all([
    supabase
      .from("requirement_clarifications")
      .insert({
        organisation_id: orgId,
        project_id: projectId,
        requirement_id: fr003Id,
        question: "Does FR-003 GDPR retention apply to archived audit logs or only active user profiles?",
        status: "open",
        priority: "high",
        stakeholder_role: "Sponsor",
        blocks: "US-49",
      })
      .select("id")
      .single(),
    supabase
      .from("user_stories")
      .insert({
        organisation_id: orgId,
        project_id: projectId,
        requirement_id: fr003Id,
        story_code: "US-49",
        title: "Self-service data deletion portal",
        story: "As a user I want to request account deletion so that my personal data is removed per GDPR.",
        status: "blocked",
        acceptance_criteria: [
          "Deletion request captured with confirmation email",
          "Audit trail retained per compliance policy",
        ],
      })
      .select("id")
      .single(),
  ]);

  const { data: authTask } = await supabase
    .from("tasks")
    .insert({
      organisation_id: orgId,
      project_id: projectId,
      title: "Integrate OAuth token refresh with Auth API",
      description: "Blocked until Auth API v2 endpoint is available from platform team.",
      status: "blocked",
      priority: "high",
      blocked_reason: "Auth API",
    })
    .select("id")
    .single();

  await supabase.from("defects").insert([
    {
      organisation_id: orgId,
      project_id: projectId,
      defect_code: "BUG-142",
      title: "Auth token expiry on session refresh",
      severity: "critical",
      owner: "Backend",
      status: "open",
      ai_generated: false,
      review_status: "approved",
    },
    {
      organisation_id: orgId,
      project_id: projectId,
      defect_code: "BUG-167",
      title: "Export layout break on mobile",
      severity: "critical",
      owner: "Frontend",
      status: "open",
      ai_generated: false,
      review_status: "approved",
    },
  ]);

  const signals = await loadNarrativeThreadSignals(projectId);
  const threads = resolveNarrativeThreads(signals);
  const drafts = narrativeThreadsToImpactDrafts(threads);

  const impactEvents = await emitDeliveryImpactEvents({
    projectId,
    source: "bootstrap",
    actionType: "narrative_thread_seed",
    entityType: "narrative_threads",
    drafts,
  }).catch(() => 0);

  return { seeded: true, threads, impactEvents };
}

export function runCollaborativeLoopPropagationSmokeTest(): {
  ok: boolean;
  threadCount: number;
  rolesReached: number;
} {
  const threads = resolveNarrativeThreads({
    projectId: "demo-project",
    authApiBlockedTask: { id: "task-1", title: "OAuth integration" },
    criticalDefects: [
      { id: "d1", code: "BUG-142", title: "Auth token expiry" },
      { id: "d2", code: "BUG-167", title: "Export layout" },
    ],
    fr003Requirement: { id: "r1", reqCode: "FR-003", title: "GDPR retention" },
    fr003Clarification: {
      id: "c1",
      question: "Does FR-003 apply to audit logs?",
    },
    us49Story: { id: "s1", storyCode: "US-49", title: "Data deletion portal" },
  });

  const roles = rolesReachedByThreads(threads);
  const ok = threads.length === 3 && roles.length >= 3;

  return { ok, threadCount: threads.length, rolesReached: roles.length };
}
