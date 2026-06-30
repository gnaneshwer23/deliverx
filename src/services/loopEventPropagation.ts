/**
 * J1 — Event-driven collaborative loop propagation from real mutations.
 */

import { emitDeliveryImpactEvents } from "./deliveryImpact";
import type { DeliveryImpactEventDraft, DeliveryImpactRole } from "./deliveryImpactEngine";
import {
  loadNarrativeThreadSignals,
  narrativeThreadsToImpactDrafts,
  resolveNarrativeThreads,
  rolesReachedByThreads,
} from "./collaborativeLoopPropagation";

export function shouldSeedNarrativeDemoThreads(): boolean {
  return process.env.SEED_NARRATIVE_DEMO_THREADS === "true";
}

export function taskChangeToImpactDrafts(input: {
  title: string;
  statusBefore?: string;
  statusAfter: string;
  priorityBefore?: string;
  priorityAfter: string;
  blockedReason?: string | null;
}): DeliveryImpactEventDraft[] {
  const drafts: DeliveryImpactEventDraft[] = [];
  const statusChanged = input.statusBefore !== undefined && input.statusBefore !== input.statusAfter;
  const priorityChanged =
    input.priorityBefore !== undefined && input.priorityBefore !== input.priorityAfter;

  if (!statusChanged && !priorityChanged) return drafts;

  if (statusChanged) {
    if (input.statusAfter === "blocked") {
      const reason = input.blockedReason?.trim();
      const detail = reason ? ` — ${reason}` : "";
      drafts.push(
        { targetRole: "engineer", message: `Task blocked: ${input.title}${detail}`, tone: "blocked" },
        { targetRole: "pm", message: `Delivery blocked on "${input.title}"${detail}`, tone: "waiting" },
        { targetRole: "scrum", message: `Sprint item blocked: ${input.title}`, tone: "blocked" },
      );
      if (reason?.toLowerCase().includes("auth api") || input.title.toLowerCase().includes("auth api")) {
        drafts.push({
          targetRole: "founder",
          message: `Auth API dependency blocking "${input.title}"`,
          tone: "waiting",
        });
      }
    } else if (input.statusAfter === "done") {
      drafts.push(
        { targetRole: "pm", message: `Task completed: ${input.title}`, tone: "updated" },
        { targetRole: "scrum", message: `Done: ${input.title}`, tone: "updated" },
      );
    } else {
      drafts.push(
        { targetRole: "engineer", message: `Task status → ${input.statusAfter}: ${input.title}`, tone: "updated" },
        { targetRole: "scrum", message: `Task moved to ${input.statusAfter}: ${input.title}`, tone: "updated" },
      );
    }
  }

  if (priorityChanged) {
    drafts.push(
      { targetRole: "pm", message: `Priority ${input.priorityAfter}: ${input.title}`, tone: "updated" },
      { targetRole: "engineer", message: `Priority updated to ${input.priorityAfter} — ${input.title}`, tone: "waiting" },
    );
  }

  return drafts;
}

export function defectChangeToImpactDrafts(input: {
  code: string;
  title: string;
  severity: string;
  status: string;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  if (input.severity !== "critical" || input.status === "closed") return [];

  const label = `${input.code}: ${input.title}`;
  return [
    { targetRole: "qa", message: `Critical defect ${label}`, tone: "blocked" },
    { targetRole: "engineer", message: `Fix critical defect ${input.code}`, tone: "waiting" },
    { targetRole: "pm", message: `Release risk — ${input.code}`, tone: "waiting" },
    { targetRole: "scrum", message: `Sprint test blocked by ${input.code}`, tone: "updated" },
  ];
}

export function requirementChangeToImpactDrafts(input: {
  reqCode: string;
  title: string;
  statusBefore?: string;
  statusAfter: string;
}): DeliveryImpactEventDraft[] {
  if (input.statusBefore === input.statusAfter) return [];

  if (input.statusAfter === "pending_clarification" || input.statusAfter === "draft") {
    return [
      {
        targetRole: "ba",
        message: `${input.reqCode} needs clarification — ${input.title}`,
        tone: "blocked",
      },
      { targetRole: "engineer", message: `Stories may block on ${input.reqCode}`, tone: "waiting" },
      { targetRole: "qa", message: `Test planning waiting on ${input.reqCode}`, tone: "waiting" },
      { targetRole: "scrum", message: `Sprint scope risk: ${input.reqCode} unclear`, tone: "waiting" },
    ];
  }

  if (input.statusAfter === "approved") {
    return [
      { targetRole: "ba", message: `${input.reqCode} approved — ${input.title}`, tone: "updated" },
      { targetRole: "engineer", message: `${input.reqCode} ready for implementation`, tone: "ready" },
      { targetRole: "qa", message: `Update test coverage for ${input.reqCode}`, tone: "waiting" },
    ];
  }

  return [
    { targetRole: "ba", message: `${input.reqCode} → ${input.statusAfter}`, tone: "updated" },
    { targetRole: "pm", message: `Requirement ${input.reqCode} status updated`, tone: "updated" },
  ];
}

export function clarificationChangeToImpactDrafts(input: {
  question: string;
  reqCode?: string;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const subject = input.reqCode ? `${input.reqCode} clarification` : "Requirement clarification";
  return [
    { targetRole: "ba", message: `${subject}: ${input.question}`, tone: "blocked" },
    { targetRole: "engineer", message: `Blocked pending ${subject.toLowerCase()}`, tone: "waiting" },
    { targetRole: "qa", message: `Acceptance criteria pending — ${subject}`, tone: "waiting" },
    { targetRole: "scrum", message: `Planning blocked: ${subject}`, tone: "waiting" },
  ];
}

export function decisionChangeToImpactDrafts(input: {
  title: string;
  status: string;
  outcome?: string | null;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const outcome = input.outcome?.trim();
  const detail = outcome ? ` — ${outcome}` : "";

  if (input.isNew || input.status === "proposed") {
    return [
      { targetRole: "founder", message: `Decision proposed: ${input.title}`, tone: "waiting" },
      { targetRole: "pm", message: `Decision log entry: ${input.title}`, tone: "updated" },
      { targetRole: "ba", message: `Governance decision may affect scope: ${input.title}`, tone: "waiting" },
    ];
  }

  if (input.status === "approved") {
    return [
      { targetRole: "founder", message: `Decision approved: ${input.title}${detail}`, tone: "updated" },
      { targetRole: "pm", message: `Decision resolved — ${input.title}`, tone: "updated" },
      { targetRole: "product", message: `Backlog may shift after decision: ${input.title}`, tone: "waiting" },
    ];
  }

  if (input.status === "rejected") {
    return [
      { targetRole: "pm", message: `Decision rejected: ${input.title}${detail}`, tone: "updated" },
      { targetRole: "founder", message: `Decision declined — ${input.title}`, tone: "updated" },
    ];
  }

  return [{ targetRole: "pm", message: `Decision updated: ${input.title}`, tone: "updated" }];
}

export function businessCaseUploadToImpactDrafts(input: {
  projectName: string;
  extractionStatus: "none" | "pending" | "queued" | "complete";
  baInviteGenerated?: boolean;
}): DeliveryImpactEventDraft[] {
  const analysisQueued = input.extractionStatus === "queued";
  const drafts: DeliveryImpactEventDraft[] = [
    {
      targetRole: "pm",
      message: analysisQueued
        ? `Business case uploaded — ${input.projectName} in AI Review Queue`
        : `Business case uploaded — ${input.projectName}`,
      tone: analysisQueued ? "waiting" : "updated",
    },
    {
      targetRole: "founder",
      message: `Business case received for ${input.projectName}`,
      tone: "updated",
    },
  ];

  if (input.baInviteGenerated) {
    drafts.push(
      {
        targetRole: "pm",
        message: "BA invite link ready — share to onboard requirements lead",
        tone: "waiting",
      },
      {
        targetRole: "ba",
        message: `${input.projectName} needs a BA — join link is active`,
        tone: "ready",
      },
    );
  } else {
    drafts.push({
      targetRole: "ba",
      message: `${input.projectName} business case uploaded — awaiting BA assignment`,
      tone: "waiting",
    });
  }

  return drafts;
}

export function businessCaseWorkspaceToImpactDrafts(input: {
  applyResult: {
    workstreams: number;
    tasks: number;
    raidItems: number;
    milestones: number;
    requirements: number;
  };
}): DeliveryImpactEventDraft[] {
  const { workstreams, tasks, raidItems, milestones, requirements } = input.applyResult;
  const parts: string[] = [];
  if (workstreams > 0) parts.push(`${workstreams} workstream${workstreams === 1 ? "" : "s"}`);
  if (tasks > 0) parts.push(`${tasks} task${tasks === 1 ? "" : "s"}`);
  if (raidItems > 0) parts.push(`${raidItems} RAID`);
  if (milestones > 0) parts.push(`${milestones} milestone${milestones === 1 ? "" : "s"}`);
  if (requirements > 0) parts.push(`${requirements} requirement${requirements === 1 ? "" : "s"}`);

  const summary =
    parts.length > 0 ? parts.join(", ") : "Workspace shell created — add delivery data to populate";

  return [
    {
      targetRole: "pm",
      message: `Project workspace created from approved business case — ${summary}`,
      tone: "updated",
    },
    {
      targetRole: "ba",
      message:
        requirements > 0
          ? `${requirements} requirement${requirements === 1 ? "" : "s"} seeded — refine in BA workspace`
          : "Business case approved — begin requirements extraction",
      tone: requirements > 0 ? "ready" : "waiting",
    },
    {
      targetRole: "scrum",
      message:
        milestones > 0 || tasks > 0
          ? `Delivery structure live — ${summary}`
          : "Awaiting delivery structure from PM-approved business case",
      tone: milestones > 0 || tasks > 0 ? "updated" : "waiting",
    },
    {
      targetRole: "founder",
      message: `Business case cleared — workspace bootstrap: ${summary}`,
      tone: "updated",
    },
  ];
}

export function brainDocumentReviewToImpactDrafts(input: {
  title: string;
  documentType: string;
  action: "accept" | "edit" | "discard";
  personaRelevance?: string[];
}): DeliveryImpactEventDraft[] {
  if (input.action === "discard") return [];

  const label = input.documentType.replace(/_/g, " ");
  const drafts: DeliveryImpactEventDraft[] = [
    {
      targetRole: "founder",
      message: `Brain ingest approved — ${label}: ${input.title}`,
      tone: "updated",
    },
    {
      targetRole: "pm",
      message: `Delivery knowledge classified (${label}) — ${input.title}`,
      tone: "ready",
    },
  ];

  for (const persona of input.personaRelevance ?? []) {
    const role = persona as DeliveryImpactRole;
    if (role === "founder" || role === "pm") continue;
    drafts.push({
      targetRole: role,
      message: `New ${label} may apply to your workspace — ${input.title}`,
      tone: "waiting",
    });
  }

  return drafts;
}

export function workspaceMemberJoinedToImpactDrafts(input: {
  role: string;
  projectName: string;
  memberName?: string | null;
  bootstrapSeeded?: boolean;
}): DeliveryImpactEventDraft[] {
  const who = input.memberName?.trim() || input.role.replace(/_/g, " ");

  switch (input.role) {
    case "ba": {
      const drafts: DeliveryImpactEventDraft[] = [
        { targetRole: "pm", message: `${who} joined ${input.projectName} as BA`, tone: "updated" },
        { targetRole: "scrum", message: `BA onboarded for ${input.projectName}`, tone: "updated" },
      ];
      if (input.bootstrapSeeded) {
        drafts.push(
          {
            targetRole: "ba",
            message: "Requirements workspace seeded from business case",
            tone: "ready",
          },
          {
            targetRole: "engineer",
            message: "Requirements extraction starting — stories may follow",
            tone: "waiting",
          },
        );
      }
      return drafts;
    }
    case "engineer":
      return [
        { targetRole: "pm", message: `${who} joined as engineer on ${input.projectName}`, tone: "updated" },
        { targetRole: "scrum", message: "Engineering capacity added to sprint planning", tone: "updated" },
      ];
    case "qa":
      return [
        { targetRole: "pm", message: `${who} joined as QA on ${input.projectName}`, tone: "updated" },
        { targetRole: "engineer", message: "QA joined — test coverage review incoming", tone: "waiting" },
      ];
    case "scrum_master":
      return [
        { targetRole: "pm", message: `${who} joined as Scrum Master on ${input.projectName}`, tone: "updated" },
        { targetRole: "scrum", message: "Sprint cadence owner is active on the project", tone: "ready" },
      ];
    default:
      return [
        { targetRole: "pm", message: `${who} joined ${input.projectName}`, tone: "updated" },
      ];
  }
}

export function meetingIntelQueuedToImpactDrafts(input: {
  meetingTitle: string;
  proposalCount: number;
  speakerCount: number;
}): DeliveryImpactEventDraft[] {
  const title = input.meetingTitle.trim() || "Meeting";
  const drafts: DeliveryImpactEventDraft[] = [
    {
      targetRole: "pm",
      message:
        input.proposalCount > 0
          ? `${title} processed — ${input.proposalCount} proposal(s) in AI Review Queue`
          : `${title} processed — no follow-ups queued`,
      tone: input.proposalCount > 0 ? "waiting" : "updated",
    },
  ];

  if (input.speakerCount > 0) {
    drafts.push({
      targetRole: "scrum",
      message: `${input.speakerCount} speaker segment${input.speakerCount === 1 ? "" : "s"} captured from ${title}`,
      tone: "updated",
    });
  }

  if (input.proposalCount > 0) {
    drafts.push(
      { targetRole: "engineer", message: `Meeting actions pending PM approval — ${title}`, tone: "waiting" },
      { targetRole: "ba", message: `Meeting intel queued for review — ${title}`, tone: "waiting" },
    );
  }

  return drafts;
}

export function meetingProposalAppliedToImpactDrafts(input: {
  actionType: string;
  title: string;
  meetingTitle?: string;
  assigneeRole?: DeliveryImpactRole | null;
}): DeliveryImpactEventDraft[] {
  const label = input.title.trim() || "Meeting follow-up";
  const meetingRef = input.meetingTitle?.trim() ? ` (${input.meetingTitle})` : "";
  const primaryRole = input.assigneeRole ?? null;

  const drafts: DeliveryImpactEventDraft[] = [];

  if (primaryRole) {
    drafts.push({
      targetRole: primaryRole,
      message: `New ${input.actionType.replace("create_", "")} from meeting${meetingRef}: ${label}`,
      tone: "ready",
    });
  }

  switch (input.actionType) {
    case "create_task":
      if (!primaryRole || primaryRole !== "engineer") {
        drafts.push({
          targetRole: "engineer",
          message: `Task distributed from meeting${meetingRef}: ${label}`,
          tone: "updated",
        });
      }
      drafts.push({ targetRole: "pm", message: `Meeting task applied: ${label}`, tone: "updated" });
      drafts.push({ targetRole: "scrum", message: `Sprint backlog updated — ${label}`, tone: "updated" });
      break;
    case "create_raid":
      drafts.push(
        { targetRole: "pm", message: `RAID updated from meeting${meetingRef}: ${label}`, tone: "blocked" },
        { targetRole: "founder", message: `Meeting risk logged: ${label}`, tone: "updated" },
      );
      break;
    case "create_decision":
      drafts.push(
        { targetRole: "founder", message: `Decision recorded from meeting${meetingRef}: ${label}`, tone: "updated" },
        { targetRole: "ba", message: `Governance decision may affect requirements: ${label}`, tone: "waiting" },
      );
      break;
    default:
      drafts.push({ targetRole: "pm", message: `Meeting proposal applied: ${label}`, tone: "updated" });
  }

  return drafts;
}

export function artifactReviewChangeToImpactDrafts(input: {
  entityType: string;
  title: string;
  decision: "approved" | "rejected";
  source?: string;
}): DeliveryImpactEventDraft[] {
  const label = input.title.trim() || "Artifact";

  if (input.source === "business_case_upload") {
    if (input.decision === "rejected") {
      return [
        {
          targetRole: "pm",
          message: "Business case analysis rejected — revise and re-upload",
          tone: "updated",
        },
        {
          targetRole: "ba",
          message: "Business case review blocked — PM must re-submit",
          tone: "waiting",
        },
      ];
    }
    return [
      {
        targetRole: "pm",
        message: "Business case analysis approved — proceed to BA onboarding",
        tone: "updated",
      },
      {
        targetRole: "ba",
        message: "Approved business case ready for requirements extraction",
        tone: "ready",
      },
      {
        targetRole: "founder",
        message: "Business case cleared for delivery",
        tone: "updated",
      },
      {
        targetRole: "scrum",
        message: "Delivery scope confirmed from approved business case",
        tone: "updated",
      },
    ];
  }

  if (input.decision === "rejected") {
    return [
      { targetRole: "pm", message: `Review rejected: ${label}`, tone: "updated" },
      { targetRole: "ba", message: `Rework needed — ${label}`, tone: "waiting" },
    ];
  }

  switch (input.entityType) {
    case "requirement":
      return [
        { targetRole: "ba", message: `Requirement approved — ${label}`, tone: "updated" },
        { targetRole: "engineer", message: `${label} ready for implementation`, tone: "ready" },
        { targetRole: "qa", message: `Update test coverage for ${label}`, tone: "waiting" },
      ];
    case "user_story":
      return [
        { targetRole: "scrum", message: `Story ready for sprint: ${label}`, tone: "ready" },
        { targetRole: "engineer", message: `Implement approved story: ${label}`, tone: "ready" },
        { targetRole: "qa", message: `Acceptance tests for ${label}`, tone: "waiting" },
      ];
    case "raid_item":
      return [
        { targetRole: "pm", message: `RAID item approved: ${label}`, tone: "updated" },
        { targetRole: "scrum", message: `Track RAID item in sprint: ${label}`, tone: "waiting" },
      ];
    case "structure_bundle":
      return [
        { targetRole: "pm", message: "Project structure applied", tone: "updated" },
        { targetRole: "scrum", message: "Workstreams and milestones are live", tone: "updated" },
        { targetRole: "engineer", message: "Delivery structure approved — review tasks", tone: "ready" },
        { targetRole: "founder", message: "GO workspace structure is active", tone: "updated" },
      ];
    case "task":
      return [
        { targetRole: "engineer", message: `Task approved: ${label}`, tone: "ready" },
        { targetRole: "scrum", message: `Sprint task cleared: ${label}`, tone: "updated" },
      ];
    default:
      return [
        { targetRole: "pm", message: `Approved: ${label}`, tone: "updated" },
        { targetRole: "ba", message: `Artifact cleared for delivery: ${label}`, tone: "updated" },
      ];
  }
}

export function raidChangeToImpactDrafts(input: {
  type: string;
  title: string;
  severity: string;
  status: string;
  statusBefore?: string;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const statusChanged = input.statusBefore !== undefined && input.statusBefore !== input.status;
  if (!input.isNew && !statusChanged) return [];

  if (input.status === "closed" || input.status === "mitigated") {
    return [{ targetRole: "pm", message: `${input.type} resolved: ${input.title}`, tone: "updated" }];
  }

  if (input.severity !== "critical" && input.severity !== "high") {
    if (input.isNew) {
      return [{ targetRole: "pm", message: `${input.type} logged: ${input.title}`, tone: "updated" }];
    }
    return [];
  }

  const drafts: DeliveryImpactEventDraft[] = [
    { targetRole: "pm", message: `${input.type} — ${input.title}`, tone: "blocked" },
    { targetRole: "scrum", message: `Impediment: ${input.title}`, tone: "blocked" },
    { targetRole: "engineer", message: `RAID may block delivery: ${input.title}`, tone: "waiting" },
  ];

  if (input.severity === "critical") {
    drafts.push({
      targetRole: "founder",
      message: `Critical ${input.type}: ${input.title}`,
      tone: "waiting",
    });
  }

  return drafts;
}

export function storyChangeToImpactDrafts(input: {
  storyCode: string;
  title: string;
  statusBefore?: string;
  statusAfter: string;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const statusChanged = input.statusBefore !== undefined && input.statusBefore !== input.statusAfter;
  if (!input.isNew && !statusChanged) return [];

  if (input.statusAfter === "blocked") {
    return [
      { targetRole: "engineer", message: `Story blocked: ${input.storyCode}`, tone: "blocked" },
      { targetRole: "scrum", message: `Sprint item blocked: ${input.storyCode} — ${input.title}`, tone: "blocked" },
      { targetRole: "ba", message: `${input.storyCode} blocked — check acceptance criteria`, tone: "waiting" },
      { targetRole: "qa", message: `Test planning blocked on ${input.storyCode}`, tone: "waiting" },
    ];
  }

  if (input.isNew || input.statusAfter === "ready") {
    return [
      { targetRole: "scrum", message: `New story ${input.storyCode}: ${input.title}`, tone: "ready" },
      { targetRole: "engineer", message: `Story available: ${input.storyCode}`, tone: "waiting" },
    ];
  }

  return [
    { targetRole: "scrum", message: `${input.storyCode} → ${input.statusAfter}`, tone: "updated" },
    { targetRole: "engineer", message: `Story status updated: ${input.storyCode}`, tone: "updated" },
  ];
}

export function workstreamChangeToImpactDrafts(input: {
  name: string;
  statusBefore?: string;
  statusAfter: string;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const statusChanged = input.statusBefore !== undefined && input.statusBefore !== input.statusAfter;
  if (!input.isNew && !statusChanged) return [];

  if (input.isNew) {
    return [
      { targetRole: "pm", message: `Workstream created: ${input.name}`, tone: "updated" },
      { targetRole: "scrum", message: `New delivery stream: ${input.name}`, tone: "updated" },
    ];
  }

  if (input.statusAfter === "completed") {
    return [
      { targetRole: "pm", message: `Workstream completed: ${input.name}`, tone: "updated" },
      { targetRole: "founder", message: `Delivery stream closed: ${input.name}`, tone: "updated" },
    ];
  }

  return [
    { targetRole: "pm", message: `${input.name} → ${input.statusAfter}`, tone: "updated" },
    { targetRole: "engineer", message: `Workstream status: ${input.name}`, tone: "updated" },
  ];
}

export function milestoneChangeToImpactDrafts(input: {
  title: string;
  statusBefore?: string;
  statusAfter: string;
  confidenceScore?: number;
  confidenceBefore?: number;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const statusChanged = input.statusBefore !== undefined && input.statusBefore !== input.statusAfter;
  const confidenceChanged =
    input.confidenceBefore !== undefined &&
    input.confidenceScore !== undefined &&
    input.confidenceBefore !== input.confidenceScore;

  if (!input.isNew && !statusChanged && !confidenceChanged) return [];

  if (input.statusAfter === "at_risk" || input.statusAfter === "slipped") {
    return [
      { targetRole: "pm", message: `Milestone ${input.statusAfter}: ${input.title}`, tone: "blocked" },
      { targetRole: "founder", message: `Timeline risk — ${input.title}`, tone: "waiting" },
      { targetRole: "scrum", message: `Sprint target at risk: ${input.title}`, tone: "waiting" },
    ];
  }

  if (input.statusAfter === "completed") {
    return [
      { targetRole: "pm", message: `Milestone reached: ${input.title}`, tone: "updated" },
      { targetRole: "founder", message: `Milestone completed: ${input.title}`, tone: "updated" },
    ];
  }

  if (input.isNew) {
    return [
      { targetRole: "pm", message: `Milestone planned: ${input.title}`, tone: "updated" },
      { targetRole: "scrum", message: `Delivery target set: ${input.title}`, tone: "updated" },
    ];
  }

  if (confidenceChanged && input.confidenceScore !== undefined && input.confidenceScore < 60) {
    return [
      { targetRole: "pm", message: `Low confidence (${input.confidenceScore}%) — ${input.title}`, tone: "waiting" },
      { targetRole: "founder", message: `Milestone confidence dropped: ${input.title}`, tone: "waiting" },
    ];
  }

  return [{ targetRole: "pm", message: `Milestone updated: ${input.title}`, tone: "updated" }];
}

export function changeRequestChangeToImpactDrafts(input: {
  title: string;
  status: string;
  statusBefore?: string;
  isNew?: boolean;
}): DeliveryImpactEventDraft[] {
  const statusChanged = input.statusBefore !== undefined && input.statusBefore !== input.status;
  if (!input.isNew && !statusChanged) return [];

  if (input.status === "submitted") {
    return [
      { targetRole: "pm", message: `Change submitted: ${input.title}`, tone: "waiting" },
      { targetRole: "founder", message: `Change request needs decision: ${input.title}`, tone: "waiting" },
      { targetRole: "ba", message: `Scope impact review: ${input.title}`, tone: "waiting" },
    ];
  }

  if (input.status === "approved" || input.status === "rejected") {
    return [
      { targetRole: "pm", message: `Change ${input.status}: ${input.title}`, tone: "updated" },
      { targetRole: "product", message: `Backlog may shift — ${input.title}`, tone: "waiting" },
    ];
  }

  if (input.isNew) {
    return [{ targetRole: "pm", message: `Change draft logged: ${input.title}`, tone: "updated" }];
  }

  return [];
}

export async function propagateNarrativeThreadsForProject(
  projectId: string,
  sourceId?: string | null,
): Promise<number> {
  const signals = await loadNarrativeThreadSignals(projectId);
  const threads = resolveNarrativeThreads(signals);
  const drafts = narrativeThreadsToImpactDrafts(threads);
  if (drafts.length === 0) return 0;

  return emitDeliveryImpactEvents({
    projectId,
    source: "artifact",
    sourceId: sourceId ?? null,
    actionType: "narrative_thread_sync",
    entityType: "narrative_threads",
    drafts,
  });
}

export async function emitLoopPropagation(input: {
  projectId: string;
  actionType: string;
  entityType?: string | null;
  entityId?: string | null;
  drafts: DeliveryImpactEventDraft[];
  syncNarrativeThreads?: boolean;
}): Promise<number> {
  let count = 0;

  if (input.drafts.length > 0) {
    count = await emitDeliveryImpactEvents({
      projectId: input.projectId,
      source: "artifact",
      sourceId: input.entityId ?? null,
      actionType: input.actionType,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      drafts: input.drafts,
    });
  }

  if (input.syncNarrativeThreads !== false) {
    count += await propagateNarrativeThreadsForProject(input.projectId, input.entityId);
  }

  return count;
}

export function runLoopEventPropagationSmokeTest(): {
  ok: boolean;
  taskDrafts: number;
  defectDrafts: number;
  requirementDrafts: number;
  decisionDrafts: number;
} {
  const taskDrafts = taskChangeToImpactDrafts({
    title: "OAuth token refresh",
    statusBefore: "in_progress",
    statusAfter: "blocked",
    priorityBefore: "medium",
    priorityAfter: "high",
    blockedReason: "Auth API",
  }).length;

  const defectDrafts = defectChangeToImpactDrafts({
    code: "BUG-142",
    title: "Auth token expiry",
    severity: "critical",
    status: "open",
    isNew: true,
  }).length;

  const requirementDrafts = requirementChangeToImpactDrafts({
    reqCode: "FR-003",
    title: "GDPR retention",
    statusBefore: "draft",
    statusAfter: "pending_clarification",
  }).length;

  const decisionDrafts = decisionChangeToImpactDrafts({
    title: "Defer mobile export fix",
    status: "proposed",
    isNew: true,
  }).length;

  const ok = taskDrafts >= 3 && defectDrafts >= 4 && requirementDrafts >= 4 && decisionDrafts >= 3;

  return { ok, taskDrafts, defectDrafts, requirementDrafts, decisionDrafts };
}

export function runOrganicLoopSmokeTest(): {
  ok: boolean;
  demoSeedOff: boolean;
  organicThreadCount: number;
  organicRolesReached: number;
  wiredMutationDrafts: number;
} {
  const demoSeedOff = !shouldSeedNarrativeDemoThreads();

  const organicSignals = {
    projectId: "proj-organic",
    authApiBlockedTask: { id: "task-1", title: "Payment gateway integration" },
    criticalDefects: [{ id: "def-1", code: "BUG-501", title: "Session timeout failure" }],
    fr003Requirement: { id: "req-1", reqCode: "FR-101", title: "Data retention policy" },
    fr003Clarification: {
      id: "clar-1",
      question: "What retention period applies to audit logs?",
    },
    us49Story: { id: "story-1", storyCode: "US-12", title: "Delete my data portal" },
  };

  const threads = resolveNarrativeThreads(organicSignals);
  const roles = rolesReachedByThreads(threads);

  const wiredMutationDrafts =
    artifactReviewChangeToImpactDrafts({
      entityType: "requirement",
      title: "FR-101 Data retention",
      decision: "approved",
    }).length +
    raidChangeToImpactDrafts({
      type: "risk",
      title: "Vendor SLA breach",
      severity: "critical",
      status: "open",
      isNew: true,
    }).length +
    storyChangeToImpactDrafts({
      storyCode: "US-12",
      title: "Delete my data portal",
      statusAfter: "blocked",
      isNew: true,
    }).length +
    workstreamChangeToImpactDrafts({
      name: "Platform",
      statusAfter: "active",
      isNew: true,
    }).length +
    milestoneChangeToImpactDrafts({
      title: "Beta launch",
      statusAfter: "at_risk",
      isNew: true,
    }).length +
    changeRequestChangeToImpactDrafts({
      title: "Extend audit retention",
      status: "submitted",
      isNew: true,
    }).length;

  const ok =
    demoSeedOff &&
    threads.length === 3 &&
    roles.length >= 3 &&
    wiredMutationDrafts >= 12;

  return {
    ok,
    demoSeedOff,
    organicThreadCount: threads.length,
    organicRolesReached: roles.length,
    wiredMutationDrafts,
  };
}
