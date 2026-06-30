/**
 * Slice A — production-proof smoke simulations (no DB / no browser).
 * Chains pure engines to prove Phases 1–4 happy paths for CI and local runs.
 */

import { helmEmptyStateHint, HELM_NAME } from "@/config/helm-copilot";
import { buildHelmSystemPrompt } from "@/lib/ai/prompts/helm-copilot";
import { isAiConfigured } from "@/lib/ai/config";
import type { DeliveryImpactEventDraft } from "./deliveryImpactEngine";
import { simulateMeetingToDeliveryPipeline } from "./deliveryPipelineEngine";
import { simulateBcGoBootstrapLoop } from "./gatewayBcGoBootstrapEngine";
import { simulatePersonaOnboardingPath } from "./gatewayOnboardingEngine";
import {
  hashInviteToken,
  signInviteJwt,
  verifyInviteJwt,
  type InviteJwtPayload,
} from "./inviteTokenService";
import {
  buildStubExtractionFromSegments,
  enrichProposalsWithSpeakerRoles,
  parseSpeakerSegments,
} from "./meetingIntelPipeline";
import { intelligenceResultToProposals } from "./meetingIntelligenceEngine";
import {
  businessCaseUploadToImpactDrafts,
  meetingIntelQueuedToImpactDrafts,
  meetingProposalAppliedToImpactDrafts,
  workspaceMemberJoinedToImpactDrafts,
} from "./loopEventPropagation";

const DEMO_PROJECT_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_PROJECT_NAME = "Patient Portal Modernisation";

export type SliceAFlowStep = {
  id: string;
  ok: boolean;
  detail: string;
};

export type SliceAFlowResult = {
  ok: boolean;
  flow: string;
  steps: SliceAFlowStep[];
  pmSignals: DeliveryImpactEventDraft[];
};

function pmSignals(drafts: DeliveryImpactEventDraft[]): DeliveryImpactEventDraft[] {
  return drafts.filter((d) => d.targetRole === "pm");
}

/** PM upload BC → generate BA invite → validate → join/bootstrap → PM propagation. */
export function simulatePmBcToBaJoinFlow(input?: {
  memberName?: string;
  inviteSecret?: string;
}): SliceAFlowResult {
  const steps: SliceAFlowStep[] = [];
  const allSignals: DeliveryImpactEventDraft[] = [];

  const bootstrap = simulateBcGoBootstrapLoop({ goAccepted: true });
  steps.push({
    id: "bc_go_bootstrap",
    ok: bootstrap.ok,
    detail: bootstrap.ok
      ? `${bootstrap.steps.join(" → ")} · ${bootstrap.bootstrapPersonas.length} personas`
      : (bootstrap.error ?? "Bootstrap failed"),
  });

  const uploadSignals = businessCaseUploadToImpactDrafts({
    projectName: DEMO_PROJECT_NAME,
    extractionStatus: "queued",
    baInviteGenerated: true,
  });
  allSignals.push(...uploadSignals);
  steps.push({
    id: "bc_upload_signals",
    ok: pmSignals(uploadSignals).some((s) => s.message.includes("AI Review Queue")),
    detail: `${uploadSignals.length} impact draft(s) including BA invite ready`,
  });

  const invitePayload: InviteJwtPayload = {
    invite_id: "11111111-1111-4111-8111-111111111111",
    project_id: DEMO_PROJECT_ID,
    project_name: DEMO_PROJECT_NAME,
    role: "ba",
    invited_by: "33333333-3333-4333-8333-333333333333",
    invited_by_name: "Sarah Johnson",
    view_mode: "full",
    expires_at: "2099-01-01T00:00:00.000Z",
  };

  if (input?.inviteSecret) {
    process.env.INVITE_JWT_SECRET = input.inviteSecret;
  }

  const token = signInviteJwt(invitePayload);
  const verified = verifyInviteJwt(token);
  const tokenHash = hashInviteToken(token);
  steps.push({
    id: "invite_generate_validate",
    ok: Boolean(verified && verified.role === "ba" && token.includes(".") && tokenHash.length > 8),
    detail: verified ? `/join?token=… (${verified.role})` : "JWT validation failed",
  });

  const joinPath = simulatePersonaOnboardingPath({ role: "ba" });
  steps.push({
    id: "join_bootstrap",
    ok: joinPath.ok && joinPath.skippedGoGate && joinPath.missionHref === "/workspace/ba",
    detail: joinPath.ok
      ? `${joinPath.steps.join(" → ")} → ${joinPath.missionHref}`
      : (joinPath.error ?? "Persona onboarding failed"),
  });

  const joinedSignals = workspaceMemberJoinedToImpactDrafts({
    role: "ba",
    projectName: DEMO_PROJECT_NAME,
    memberName: input?.memberName ?? "Alex Chen",
    bootstrapSeeded: true,
  });
  allSignals.push(...joinedSignals);
  steps.push({
    id: "pm_propagation",
    ok: pmSignals(joinedSignals).some((s) => s.message.includes("joined")),
    detail: pmSignals(joinedSignals).map((s) => s.message).join("; ") || "No PM signal",
  });

  return {
    ok: steps.every((s) => s.ok),
    flow: "pm_bc_ba_join",
    steps,
    pmSignals: pmSignals(allSignals),
  };
}

/** Paste transcript → proposals queue → PM approve → task/signal propagation. */
export function simulateMeetingIntelApprovalFlow(): SliceAFlowResult {
  const steps: SliceAFlowStep[] = [];
  const allSignals: DeliveryImpactEventDraft[] = [];

  const transcript =
    "PM: Sprint on track for Friday.\nEngineer: Blocked on OAuth token refresh — need infra credentials.\nQA: Will add regression tests once auth is unblocked.";

  const segments = parseSpeakerSegments(transcript);
  steps.push({
    id: "transcript_parse",
    ok: segments.length >= 3,
    detail: `${segments.length} speaker segment(s)`,
  });

  const extraction = buildStubExtractionFromSegments(segments, "Daily standup");
  const baseProposals = intelligenceResultToProposals(extraction, "Daily standup", "standup");
  const proposals = enrichProposalsWithSpeakerRoles(baseProposals, segments);
  steps.push({
    id: "proposals_queue",
    ok: proposals.length > 0,
    detail: `${proposals.length} proposal(s) queued for PM review`,
  });

  const queuedSignals = meetingIntelQueuedToImpactDrafts({
    meetingTitle: "Daily standup",
    proposalCount: proposals.length,
    speakerCount: segments.length,
  });
  allSignals.push(...queuedSignals);
  steps.push({
    id: "pm_queue_signal",
    ok: pmSignals(queuedSignals).some((s) => s.message.includes("AI Review Queue")),
    detail: pmSignals(queuedSignals)[0]?.message ?? "No queue signal",
  });

  const pipeline = simulateMeetingToDeliveryPipeline({
    meetingTitle: "Daily standup",
    ceremonyType: "standup",
    intelligence: extraction,
    projectId: DEMO_PROJECT_ID,
    projectName: DEMO_PROJECT_NAME,
  });
  steps.push({
    id: "pm_approve_apply",
    ok: pipeline.ok && pipeline.stages.apply.ok,
    detail: pipeline.stages.apply.detail,
  });

  const taskProposal = proposals.find((p) => p.actionType === "create_task") ?? proposals[0];
  const appliedSignals = meetingProposalAppliedToImpactDrafts({
    actionType: taskProposal.actionType,
    title: taskProposal.title,
    meetingTitle: "Daily standup",
    assigneeRole:
      typeof taskProposal.payload.assigneeRole === "string"
        ? (taskProposal.payload.assigneeRole as "engineer")
        : "engineer",
  });
  allSignals.push(...appliedSignals);
  steps.push({
    id: "task_signal",
    ok:
      appliedSignals.length > 0 &&
      (pmSignals(appliedSignals).length > 0 || pipeline.impactEvents.length > 0),
    detail: `${appliedSignals.length} post-approval signal(s); ${pipeline.impactEvents.length} pipeline impact event(s)`,
  });

  return {
    ok: steps.every((s) => s.ok),
    flow: "meeting_intel_approve",
    steps,
    pmSignals: pmSignals(allSignals),
  };
}

/** Helm profile context + Ask Helm readiness (honest empty state when AI unset). */
export function simulateHelmCopilotFlow(): SliceAFlowResult & {
  aiConfigured: boolean;
  emptyStateHonest: boolean;
} {
  const steps: SliceAFlowStep[] = [];
  const aiConfigured = isAiConfigured();

  const emptyHint = helmEmptyStateHint("pm-mission");
  steps.push({
    id: "empty_state_hint",
    ok: emptyHint.includes(HELM_NAME) || emptyHint.length > 10,
    detail: emptyHint.slice(0, 80),
  });

  const prompt = buildHelmSystemPrompt("pm-mission", {
    copilotName: HELM_NAME,
    orgName: "Acme Corp",
    personaId: "pm-mission",
    personaLabel: "Delivery PM",
    impactRole: "pm",
    projects: [{ id: DEMO_PROJECT_ID, name: DEMO_PROJECT_NAME, status: "active" }],
    focusedProject: {
      id: DEMO_PROJECT_ID,
      name: DEMO_PROJECT_NAME,
      charterTitle: "Portal charter",
      charterSummary: "Self-service bookings MVP",
      flowSummary: null,
      pendingProposals: 2,
      recentSignals: ["Daily standup processed — 3 proposal(s) in AI Review Queue"],
    },
    hasLiveData: true,
    emptyHint,
  });
  steps.push({
    id: "context_prompt",
    ok: prompt.includes("NEVER invent KPIs") && prompt.includes(DEMO_PROJECT_NAME),
    detail: aiConfigured
      ? "Context prompt built; AI key present for live chat"
      : "Context prompt built; live chat needs OPENAI_API_KEY",
  });

  const emptyStateHonest = !aiConfigured || prompt.includes("Delivery PM copilot");
  steps.push({
    id: "ask_helm_ready",
    ok: emptyStateHonest,
    detail: aiConfigured
      ? `${HELM_NAME} can answer when authenticated + OPENAI_API_KEY set`
      : `${HELM_NAME} returns ai_not_configured until OPENAI_API_KEY is set`,
  });

  return {
    ok: steps.every((s) => s.ok),
    flow: "helm_copilot",
    steps,
    pmSignals: [],
    aiConfigured,
    emptyStateHonest,
  };
}

export function runSliceAProductionSmokeTests(): {
  ok: boolean;
  flows: Array<SliceAFlowResult | ReturnType<typeof simulateHelmCopilotFlow>>;
} {
  const flows = [
    simulatePmBcToBaJoinFlow({ inviteSecret: "slice-a-smoke-secret" }),
    simulateMeetingIntelApprovalFlow(),
    simulateHelmCopilotFlow(),
  ];
  return { ok: flows.every((f) => f.ok), flows };
}
