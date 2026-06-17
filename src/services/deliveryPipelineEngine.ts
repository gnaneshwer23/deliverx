/**
 * Phase B delivery pipeline — pure simulation of meeting → approve → dashboard → notify.
 * Used for integration tests and health smoke checks (no DB required).
 */

import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import {
  proposalApplyToImpactEvents,
  type DeliveryImpactEventDraft,
} from "./deliveryImpactEngine";
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  type StructuredProposal,
} from "./proposedActionEngine";
import {
  intelligenceResultToProposals,
  normalizeMeetingIntelligence,
  type MeetingIntelligenceResult,
} from "./meetingIntelligenceEngine";
import { proposalToNotificationContext } from "./notificationEngine";

export type PipelineStage = "extract" | "propose" | "apply" | "impact" | "notify";

export type PipelineStageResult = {
  ok: boolean;
  detail: string;
  durationMs?: number;
};

export type PipelineSimulationInput = {
  meetingTitle: string;
  ceremonyType?: MeetingCeremonyType;
  intelligence: Partial<MeetingIntelligenceResult>;
  projectId?: string;
  projectName?: string;
};

export type PipelineSimulationResult = {
  ok: boolean;
  stages: Record<PipelineStage, PipelineStageResult>;
  proposals: StructuredProposal[];
  applyResults: Array<{ actionType: string; result: Record<string, unknown> }>;
  impactEvents: DeliveryImpactEventDraft[];
  totalImpactRoles: number;
  notificationContexts: number;
  elapsedMs: number;
};

function simulateApply(proposal: StructuredProposal): Record<string, unknown> {
  switch (proposal.actionType) {
    case "create_task":
      return { entityType: "task", entityId: "sim-task-id" };
    case "create_raid":
      return { entityType: "raid", entityId: "sim-raid-id" };
    case "create_decision":
      return { entityType: "decision", entityId: "sim-decision-id" };
    case "calendar_event": {
      const scheduledAt =
        typeof proposal.payload.scheduledAt === "string"
          ? proposal.payload.scheduledAt
          : new Date().toISOString();
      const event = {
        title: String(proposal.payload.title ?? proposal.title),
        scheduledAt,
        durationMinutes: Number(proposal.payload.durationMinutes ?? 60),
        description: proposal.summary,
      };
      return {
        entityType: "calendar_event",
        calendarUrl: buildGoogleCalendarUrl(event),
        outlookCalendarUrl: buildOutlookCalendarUrl(event),
      };
    }
    default:
      return { entityType: proposal.actionType };
  }
}

export function simulateMeetingToDeliveryPipeline(
  input: PipelineSimulationInput,
): PipelineSimulationResult {
  const started = Date.now();
  const stages = {} as Record<PipelineStage, PipelineStageResult>;
  const projectId = input.projectId ?? "00000000-0000-4000-8000-000000000001";
  const projectName = input.projectName ?? "Demo Project";
  const ceremonyType = input.ceremonyType ?? "standup";

  const extractStarted = Date.now();
  const normalized = normalizeMeetingIntelligence(input.intelligence);
  stages.extract = {
    ok: normalized.summary.length > 0 || (normalized.actions?.length ?? 0) > 0,
    detail: `Summary ${normalized.summary.length} chars, ${normalized.actions.length} actions`,
    durationMs: Date.now() - extractStarted,
  };

  const proposeStarted = Date.now();
  const proposals = intelligenceResultToProposals(
    normalized,
    input.meetingTitle,
    ceremonyType,
  );
  stages.propose = {
    ok: proposals.length > 0,
    detail: `${proposals.length} structured proposal(s) queued`,
    durationMs: Date.now() - proposeStarted,
  };

  const applyStarted = Date.now();
  const applyResults = proposals.map((p) => ({
    actionType: p.actionType,
    result: simulateApply(p),
  }));
  stages.apply = {
    ok: applyResults.length > 0,
    detail: `Simulated apply for ${applyResults.length} proposal(s)`,
    durationMs: Date.now() - applyStarted,
  };

  const impactStarted = Date.now();
  const impactEvents: DeliveryImpactEventDraft[] = [];
  for (let i = 0; i < proposals.length; i++) {
    const p = proposals[i];
    const r = applyResults[i].result;
    impactEvents.push(
      ...proposalApplyToImpactEvents({
        actionType: p.actionType,
        title: p.title,
        source: "meeting",
        applyResult: r,
      }),
    );
  }
  const uniqueRoles = new Set(impactEvents.map((e) => e.targetRole));
  stages.impact = {
    ok: impactEvents.length > 0,
    detail: `${impactEvents.length} impact event(s) across ${uniqueRoles.size} role(s)`,
    durationMs: Date.now() - impactStarted,
  };

  const notifyStarted = Date.now();
  let notificationContexts = 0;
  for (let i = 0; i < proposals.length; i++) {
    const ctx = proposalToNotificationContext(
      {
        id: `sim-${i}`,
        organisation_id: "00000000-0000-4000-8000-000000000002",
        project_id: projectId,
        source: "meeting",
        source_id: null,
        action_type: proposals[i].actionType,
        title: proposals[i].title,
        summary: proposals[i].summary,
        payload: proposals[i].payload,
        status: "applied",
        reviewer_notes: null,
        apply_result: applyResults[i].result,
        decided_by: null,
        decided_at: null,
        applied_at: new Date().toISOString(),
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      applyResults[i].result,
      projectName,
      "https://app.deliverx.dev",
    );
    if (ctx.proposalTitle) notificationContexts++;
  }
  stages.notify = {
    ok: notificationContexts > 0,
    detail: `${notificationContexts} notification context(s) ready`,
    durationMs: Date.now() - notifyStarted,
  };

  const ok = Object.values(stages).every((s) => s.ok);

  return {
    ok,
    stages,
    proposals,
    applyResults,
    impactEvents,
    totalImpactRoles: uniqueRoles.size,
    notificationContexts,
    elapsedMs: Date.now() - started,
  };
}

/** Target: full pipeline simulation under 50ms (pure compute, no I/O). */
export const PIPELINE_PERF_BUDGET_MS = 50;

export function assertPipelinePerformance(result: PipelineSimulationResult): boolean {
  return result.elapsedMs <= PIPELINE_PERF_BUDGET_MS;
}
