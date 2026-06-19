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
  authApiBlockedTask?: { id: string; title: string; blockedReason?: string | null } | null;
  criticalDefects?: Array<{ id: string; code: string; title: string }>;
  fr003Requirement?: { id: string; reqCode: string; title: string } | null;
  fr003Clarification?: { id: string; question: string } | null;
  us49Story?: { id: string; storyCode: string; title: string } | null;
};

const TASK_PRIORITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const COMPLIANCE_FLAG_MARKERS = ["compliance", "gdpr", "regulatory", "privacy"];

export function isComplianceRequirement(flags: unknown): boolean {
  if (!Array.isArray(flags)) return false;
  return flags.some((flag) =>
    COMPLIANCE_FLAG_MARKERS.some((marker) => String(flag).toLowerCase().includes(marker)),
  );
}

export function selectPrimaryBlockedTask(
  rows: Array<{ id: string; title: string; blocked_reason?: string | null; priority?: string | null }>,
): NarrativeThreadSignals["authApiBlockedTask"] {
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => {
    const rankA = TASK_PRIORITY_RANK[a.priority ?? "medium"] ?? 9;
    const rankB = TASK_PRIORITY_RANK[b.priority ?? "medium"] ?? 9;
    return rankA - rankB;
  });

  const task = sorted[0];
  return {
    id: String(task.id),
    title: String(task.title),
    blockedReason: task.blocked_reason ?? null,
  };
}

export function mapCriticalDefectRows(
  rows: Array<{ id: string; defect_code: string; title: string }>,
): NonNullable<NarrativeThreadSignals["criticalDefects"]> {
  return rows.map((d) => ({
    id: String(d.id),
    code: String(d.defect_code),
    title: String(d.title),
  }));
}

export function selectComplianceGapSignals(input: {
  requirements: Array<{
    id: string;
    req_code: string;
    title: string;
    status: string;
    flags?: unknown;
  }>;
  clarifications: Array<{
    id: string;
    question: string;
    requirement_id?: string | null;
    priority?: string | null;
  }>;
  stories: Array<{
    id: string;
    story_code: string;
    title: string;
    requirement_id?: string | null;
    status: string;
  }>;
}): Pick<NarrativeThreadSignals, "fr003Requirement" | "fr003Clarification" | "us49Story"> {
  const pendingRequirements = input.requirements.filter((r) => r.status === "pending_clarification");
  const complianceRequirements = input.requirements.filter((r) => isComplianceRequirement(r.flags));
  const requirement =
    pendingRequirements.find((r) => isComplianceRequirement(r.flags)) ??
    pendingRequirements[0] ??
    complianceRequirements[0] ??
    null;

  const openClarifications = input.clarifications;
  const clarification =
    (requirement
      ? openClarifications.find((c) => c.requirement_id === requirement.id)
      : null) ??
    openClarifications.find((c) => c.priority === "high") ??
    openClarifications[0] ??
    null;

  const blockedStory =
    (requirement
      ? input.stories.find((s) => s.status === "blocked" && s.requirement_id === requirement.id)
      : null) ??
    input.stories.find((s) => s.status === "blocked") ??
    null;

  return {
    fr003Requirement: requirement
      ? {
          id: String(requirement.id),
          reqCode: String(requirement.req_code),
          title: String(requirement.title),
        }
      : null,
    fr003Clarification: clarification
      ? { id: String(clarification.id), question: String(clarification.question) }
      : null,
    us49Story: blockedStory
      ? {
          id: String(blockedStory.id),
          storyCode: String(blockedStory.story_code),
          title: String(blockedStory.title),
        }
      : null,
  };
}

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
    const reason = task.blockedReason?.trim();
    threads.push({
      id: "auth-api-blocker",
      title: reason ? `Delivery blocker: ${task.title}` : `Blocked task: ${task.title}`,
      summary: reason
        ? `Blocked on ${reason} — impacts sprint commitment.`
        : "High-priority task is blocked — impacts sprint commitment.",
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
        ? `${req.reqCode} clarification gap — ${req.title}`
        : clar
          ? "Open requirement clarification"
          : "Compliance requirement gap",
      summary:
        clar?.question ??
        (story
          ? `${story.storyCode} blocked until requirement is clarified.`
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
      .select("id, title, status, blocked_reason, priority")
      .eq("project_id", projectId)
      .eq("status", "blocked"),
    supabase
      .from("defects")
      .select("id, defect_code, title, severity, status")
      .eq("project_id", projectId)
      .eq("severity", "critical")
      .neq("status", "closed")
      .order("defect_code", { ascending: true })
      .limit(10),
    supabase
      .from("requirements")
      .select("id, req_code, title, status, flags")
      .eq("project_id", projectId)
      .in("status", ["pending_clarification", "draft"])
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("requirement_clarifications")
      .select("id, question, status, requirement_id, priority")
      .eq("project_id", projectId)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("user_stories")
      .select("id, story_code, title, status, requirement_id")
      .eq("project_id", projectId)
      .eq("status", "blocked")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const complianceGap = selectComplianceGapSignals({
    requirements: reqRes.data ?? [],
    clarifications: clarRes.data ?? [],
    stories: storyRes.data ?? [],
  });

  return {
    projectId,
    authApiBlockedTask: selectPrimaryBlockedTask(taskRes.data ?? []),
    criticalDefects: mapCriticalDefectRows(defectsRes.data ?? []),
    ...complianceGap,
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
    authApiBlockedTask: { id: "task-1", title: "OAuth integration", blockedReason: "Auth API" },
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

export function runNarrativeThreadSemanticSmokeTest(): {
  ok: boolean;
  blockedTask: boolean;
  criticalDefects: number;
  complianceGap: boolean;
} {
  const blockedTask = selectPrimaryBlockedTask([
    { id: "t-low", title: "Minor fix", priority: "low", blocked_reason: null },
    { id: "t-high", title: "API integration", priority: "high", blocked_reason: "Vendor API" },
  ]);

  const criticalDefects = mapCriticalDefectRows([
    { id: "d-9", defect_code: "BUG-901", title: "Checkout failure" },
    { id: "d-1", defect_code: "BUG-100", title: "Session timeout" },
  ]);

  const complianceGap = selectComplianceGapSignals({
    requirements: [
      {
        id: "req-2",
        req_code: "NFR-012",
        title: "Data retention policy",
        status: "draft",
        flags: ["compliance"],
      },
      {
        id: "req-1",
        req_code: "FR-088",
        title: "Consent capture",
        status: "pending_clarification",
        flags: ["privacy", "gdpr"],
      },
    ],
    clarifications: [
      {
        id: "clar-1",
        question: "Does retention apply to archived audit logs?",
        requirement_id: "req-1",
        priority: "high",
      },
    ],
    stories: [
      {
        id: "story-1",
        story_code: "US-220",
        title: "Self-service deletion",
        requirement_id: "req-1",
        status: "blocked",
      },
    ],
  });

  const threads = resolveNarrativeThreads({
    projectId: "live-project",
    authApiBlockedTask: blockedTask,
    criticalDefects,
    ...complianceGap,
  });

  const complianceThread = threads.find((t) => t.id === "fr003-gdpr-gap");
  const ok =
    blockedTask?.id === "t-high" &&
    criticalDefects.length === 2 &&
    complianceGap.fr003Requirement?.reqCode === "FR-088" &&
    threads.length === 3 &&
    Boolean(complianceThread?.title.includes("FR-088"));

  return {
    ok,
    blockedTask: blockedTask?.id === "t-high",
    criticalDefects: criticalDefects.length,
    complianceGap: Boolean(complianceGap.fr003Requirement || complianceGap.fr003Clarification),
  };
}
