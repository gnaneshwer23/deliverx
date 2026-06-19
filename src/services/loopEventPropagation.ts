/**
 * J1 — Event-driven collaborative loop propagation from real mutations.
 */

import { emitDeliveryImpactEvents } from "./deliveryImpact";
import type { DeliveryImpactEventDraft } from "./deliveryImpactEngine";
import {
  loadNarrativeThreadSignals,
  narrativeThreadsToImpactDrafts,
  resolveNarrativeThreads,
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
