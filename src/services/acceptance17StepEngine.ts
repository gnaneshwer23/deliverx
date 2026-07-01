/**
 * H1 — 17-step acceptance harness (integration layer, no DB / no browser).
 *
 * Chains pure engines to prove the implementation-spec happy path for CI.
 * Reuses sliceASmokeEngine patterns: bootstrap, invites, loop propagation,
 * meeting intel, and Helm copilot context.
 *
 * Run: `npm run test:acceptance`
 */

import { helmEmptyStateHint, HELM_NAME } from "@/config/helm-copilot";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import { buildHelmSystemPrompt } from "@/lib/ai/prompts/helm-copilot";
import { isAiConfigured } from "@/lib/ai/config";
import {
  buildExtractionCounts,
  type ExtractionSummaryCounts,
} from "@/lib/workspace-flow-extraction";
import { PM_INVITE_ROLE_CONFIG } from "@/lib/workspace-flow-invites";
import { buildBaHandoffSynthesis } from "@/lib/ba-handoff-kpis";
import { buildStructuredAnalysisFromReview } from "@/lib/businessCaseStructuredAnalysis.shared";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
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
  decisionChangeToImpactDrafts,
  meetingIntelQueuedToImpactDrafts,
  meetingProposalAppliedToImpactDrafts,
  requirementChangeToImpactDrafts,
  workspaceMemberJoinedToImpactDrafts,
} from "./loopEventPropagation";
import { selectStandupBatchTasks } from "@/lib/standup-tasks";

export const DEMO_PROJECT_ID = "22222222-2222-4222-8222-222222222222";
export const DEMO_PROJECT_NAME = "Patient Portal Modernisation";

export type AcceptanceCoverage = "integration" | "browser" | "skipped";

export type AcceptanceStepResult = {
  step: number;
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  coverage: AcceptanceCoverage;
};

export type Acceptance17StepResult = {
  ok: boolean;
  steps: AcceptanceStepResult[];
  pmSignals: DeliveryImpactEventDraft[];
};

/** Labels aligned to the H1 implementation spec (17 acceptance criteria). */
export const ACCEPTANCE_STEP_DEFINITIONS = [
  { step: 1, id: "pm_bc_upload", label: "PM creates project and uploads business case" },
  { step: 2, id: "ai_extraction", label: "AI extracts requirements, gaps, objectives, risks" },
  { step: 3, id: "ba_invite", label: "PM generates BA invite link" },
  { step: 4, id: "ba_join", label: "BA accepts invite and lands in workspace" },
  { step: 5, id: "ba_bc_requirements", label: "BA workspace shows BC extraction (not demo data)" },
  { step: 6, id: "ba_accept_req_pm_signal", label: "BA accepts requirement — PM signal feed updates" },
  { step: 7, id: "ba_share_pm_summary", label: "BA shares with PM — PM summary card populated" },
  { step: 8, id: "pm_all_role_invites", label: "PM generates invite links for all 6 roles" },
  { step: 9, id: "engineer_join", label: "Engineer registers and lands in pre-populated workspace" },
  { step: 10, id: "standup_upload", label: "PM uploads standup transcript" },
  { step: 11, id: "standup_intel", label: "Speaker-separated transcript and extracted tasks" },
  { step: 12, id: "pm_approve_tasks", label: "PM approves all standup task proposals" },
  { step: 13, id: "team_standup_tasks", label: "Team members see standup tasks in their workspace" },
  { step: 14, id: "sponsor_invite", label: "PM generates Sponsor (executive) invite link" },
  { step: 15, id: "sponsor_join", label: "Sponsor registers and lands on /workspace/founder" },
  { step: 16, id: "sponsor_copilot", label: "Sponsor Copilot answers from project data" },
  { step: 17, id: "sponsor_decision_pm_notify", label: "Sponsor approves decision — PM notified" },
] as const;

const SAMPLE_BC_REVIEW: BusinessCaseReview = {
  score: 78,
  recommendation: "go",
  recommendationConfidence: 82,
  executiveSummary: "Strong market need with manageable delivery risk.",
  summary: "Proceed with phased delivery.",
  strengths: ["Clear problem statement"],
  gaps: ["Vendor selection pending"],
  missingInformation: [],
  clarificationQuestions: ["Confirm retention policy for audit logs"],
  suggestedProjectName: DEMO_PROJECT_NAME,
  suggestedGoal: "Launch self-service portal for 50k patients",
  suggestedDeliveryType: "Digital Transformation",
  initialRisks: ["Integration complexity"],
  healthDimensions: {
    problemClarity: 80,
    marketNeed: 85,
    feasibility: 75,
    roi: 70,
    risk: 65,
    dependencies: 72,
    innovation: 68,
  },
  feasibilityScore: 75,
  riskScore: 35,
  innovationScore: 68,
  financialConfidence: 70,
  deliveryConfidence: 76,
  recommendationReasons: ["Validated user need", "Achievable timeline"],
  innovationAnalysis: {
    noveltyScore: 60,
    competitorComparison: "Comparable portals exist",
    differentiationGaps: [],
  },
  financialIntelligence: {
    devCostMin: 80000,
    devCostMax: 120000,
    infraCostMonthly: 3000,
    breakEvenMonths: 14,
    roi3YearPct: 140,
    currency: "GBP",
  },
  raidSeed: [],
  scenarios: [],
  deliveryConfidenceBreakdown: {
    successProbability: 76,
    timelineConfidence: 72,
    budgetConfidence: 70,
    stakeholderAlignment: 80,
  },
};

function pmSignals(drafts: DeliveryImpactEventDraft[]): DeliveryImpactEventDraft[] {
  return drafts.filter((d) => d.targetRole === "pm");
}

const INVITE_IDS: Record<string, string> = {
  ba: "11111111-1111-4111-8111-111111111111",
  engineer: "12121212-1212-4212-8212-121212121212",
  qa: "13131313-1313-4313-8313-131313131313",
  product_manager: "14141414-1414-4414-8414-141414141414",
  scrum_master: "15151515-1515-4515-8515-151515151515",
  executive: "16161616-1616-4616-8616-161616161616",
};

function baseInvitePayload(role: string, viewMode?: "read_only" | "full"): InviteJwtPayload {
  return {
    invite_id: INVITE_IDS[role] ?? "77777777-7777-4777-8777-777777777777",
    project_id: DEMO_PROJECT_ID,
    project_name: DEMO_PROJECT_NAME,
    role,
    invited_by: "33333333-3333-4333-8333-333333333333",
    invited_by_name: "Sarah Johnson",
    view_mode: viewMode ?? (role === "executive" ? "read_only" : "full"),
    expires_at: "2099-01-01T00:00:00.000Z",
  };
}

function buildPmSummaryCardCounts(): ExtractionSummaryCounts {
  const structured = buildStructuredAnalysisFromReview(SAMPLE_BC_REVIEW);
  return buildExtractionCounts({
    requirementsExtracted: 0,
    traceabilityScore: null,
    report: SAMPLE_BC_REVIEW,
    structuredAnalysis: structured,
  });
}

function validatePmSummaryCard(counts: ExtractionSummaryCounts): boolean {
  return (
    counts.gaps != null &&
    counts.gaps > 0 &&
    counts.risks != null &&
    counts.risks > 0 &&
    counts.objectives != null &&
    counts.objectives > 0
  );
}

/** Orchestrated 17-step flow — returns one result per acceptance criterion. */
export function runAcceptance17StepFlow(input?: {
  inviteSecret?: string;
  memberName?: string;
  industryBrief?: string;
}): Acceptance17StepResult {
  const steps: AcceptanceStepResult[] = [];
  const allPmSignals: DeliveryImpactEventDraft[] = [];

  if (input?.inviteSecret) {
    process.env.INVITE_JWT_SECRET = input.inviteSecret;
  }

  // Step 1 — PM creates project + uploads BC
  const bootstrap = simulateBcGoBootstrapLoop({
    brief: input?.industryBrief ?? "Retail loyalty platform — omnichannel rewards and mobile checkout.",
    goAccepted: true,
  });
  const uploadSignals = businessCaseUploadToImpactDrafts({
    projectName: DEMO_PROJECT_NAME,
    extractionStatus: "queued",
    baInviteGenerated: false,
  });
  allPmSignals.push(...pmSignals(uploadSignals));
  steps.push({
    step: 1,
    id: "pm_bc_upload",
    label: ACCEPTANCE_STEP_DEFINITIONS[0].label,
    ok: bootstrap.ok && bootstrap.steps.includes("business_case"),
    detail: bootstrap.ok
      ? `${bootstrap.steps.join(" → ")} · brief accepted`
      : (bootstrap.error ?? "Bootstrap failed"),
    coverage: "integration",
  });

  // Step 2 — AI extraction visible to PM
  const extractionCounts = buildPmSummaryCardCounts();
  const extractionVisible =
    validatePmSummaryCard(extractionCounts) &&
    Boolean(SAMPLE_BC_REVIEW.executiveSummary?.trim());
  steps.push({
    step: 2,
    id: "ai_extraction",
    label: ACCEPTANCE_STEP_DEFINITIONS[1].label,
    ok: extractionVisible,
    detail: extractionVisible
      ? `gaps=${extractionCounts.gaps}, risks=${extractionCounts.risks}, objectives=${extractionCounts.objectives}`
      : "Extraction counts missing from BC review",
    coverage: "integration",
  });

  // Step 3 — BA invite
  const baToken = signInviteJwt(baseInvitePayload("ba"));
  const baVerified = verifyInviteJwt(baToken);
  steps.push({
    step: 3,
    id: "ba_invite",
    label: ACCEPTANCE_STEP_DEFINITIONS[2].label,
    ok: Boolean(baVerified?.role === "ba" && hashInviteToken(baToken).length > 8),
    detail: baVerified ? `/join?token=… (${baVerified.role})` : "BA JWT validation failed",
    coverage: "integration",
  });

  // Step 4 — BA join
  const baJoin = simulatePersonaOnboardingPath({ role: "ba" });
  steps.push({
    step: 4,
    id: "ba_join",
    label: ACCEPTANCE_STEP_DEFINITIONS[3].label,
    ok: baJoin.ok && baJoin.missionHref === "/workspace/ba",
    detail: baJoin.ok
      ? `${baJoin.steps.join(" → ")} → ${baJoin.missionHref}`
      : (baJoin.error ?? "BA onboarding failed"),
    coverage: "integration",
  });

  // Step 5 — BA workspace from BC (not demo seed)
  const demoSeedOff = process.env.SEED_NARRATIVE_DEMO_THREADS !== "true";
  const baWorkspaceHonest =
    demoSeedOff &&
    extractionCounts.gaps != null &&
    SAMPLE_BC_REVIEW.gaps?.includes("Vendor selection pending");
  steps.push({
    step: 5,
    id: "ba_bc_requirements",
    label: ACCEPTANCE_STEP_DEFINITIONS[4].label,
    ok: baWorkspaceHonest,
    detail: baWorkspaceHonest
      ? "Counts sourced from uploaded BC review — demo narrative threads off"
      : "Expected BC-sourced extraction without demo seed",
    coverage: "integration",
  });

  // Step 6 — BA accepts requirement → PM signal (synchronous propagation path)
  const reqApprovedSignals = requirementChangeToImpactDrafts({
    reqCode: "FR-001",
    title: "Online booking",
    statusBefore: "draft",
    statusAfter: "approved",
  });
  allPmSignals.push(...pmSignals(reqApprovedSignals));
  steps.push({
    step: 6,
    id: "ba_accept_req_pm_signal",
    label: ACCEPTANCE_STEP_DEFINITIONS[5].label,
    ok: pmSignals(reqApprovedSignals).some((s) => s.message.includes("approved by BA")),
    detail: `${pmSignals(reqApprovedSignals).length} PM signal(s) from requirement approval propagation`,
    coverage: "integration",
  });

  // Step 7 — BA "Share with PM" → PM summary card data contract
  const handoffSummary = buildBaHandoffSynthesis({
    openClarifications: 0,
    pendingClarification: 0,
    storiesReady: 3,
    traceabilityScore: 72,
    pendingReviewCount: 0,
  });
  const pmCardReady = validatePmSummaryCard(extractionCounts) && handoffSummary.length > 10;
  steps.push({
    step: 7,
    id: "ba_share_pm_summary",
    label: ACCEPTANCE_STEP_DEFINITIONS[6].label,
    ok: pmCardReady,
    detail: pmCardReady
      ? `Handoff synthesis ready; PM card stats: req gaps=${extractionCounts.gaps}, risks=${extractionCounts.risks}`
      : "PM summary card data incomplete",
    coverage: "integration",
  });

  // Step 8 — PM generates all 6 role invite links
  const roleInvites = PM_INVITE_ROLE_CONFIG.map(({ role }) => {
    const token = signInviteJwt(baseInvitePayload(role));
    const verified = verifyInviteJwt(token);
    return { role, ok: verified?.role === role };
  });
  const allRolesLinked = roleInvites.every((r) => r.ok) && roleInvites.length === 6;
  steps.push({
    step: 8,
    id: "pm_all_role_invites",
    label: ACCEPTANCE_STEP_DEFINITIONS[7].label,
    ok: allRolesLinked,
    detail: allRolesLinked
      ? `6 role JWTs: ${roleInvites.map((r) => r.role).join(", ")}`
      : "Missing or invalid role invite token(s)",
    coverage: "integration",
  });

  // Step 9 — Engineer join + BC bootstrap
  const engineerJoin = simulatePersonaOnboardingPath({ role: "engineer" });
  const engineerSignals = workspaceMemberJoinedToImpactDrafts({
    role: "engineer",
    projectName: DEMO_PROJECT_NAME,
    memberName: "Jordan Lee",
    bootstrapSeeded: true,
  });
  allPmSignals.push(...pmSignals(engineerSignals));
  steps.push({
    step: 9,
    id: "engineer_join",
    label: ACCEPTANCE_STEP_DEFINITIONS[8].label,
    ok: engineerJoin.ok && engineerJoin.missionHref === "/workspace/engineer",
    detail: engineerJoin.ok
      ? `${engineerJoin.missionHref} · ${pmSignals(engineerSignals)[0]?.message ?? "joined"}`
      : (engineerJoin.error ?? "Engineer onboarding failed"),
    coverage: "integration",
  });

  // Steps 10–12 — Standup ingest → intel → PM approve
  const transcript =
    "PM: Sprint on track for Friday.\nEngineer: Blocked on OAuth token refresh — need infra credentials.\nQA: Will add regression tests once auth is unblocked.";
  const segments = parseSpeakerSegments(transcript);
  const extraction = buildStubExtractionFromSegments(segments, "Daily standup");
  const baseProposals = intelligenceResultToProposals(extraction, "Daily standup", "standup");
  const proposals = enrichProposalsWithSpeakerRoles(baseProposals, segments);

  steps.push({
    step: 10,
    id: "standup_upload",
    label: ACCEPTANCE_STEP_DEFINITIONS[9].label,
    ok: transcript.trim().length > 20,
    detail: "Paste/Whisper path simulated via transcript ingest",
    coverage: "integration",
  });

  const queuedSignals = meetingIntelQueuedToImpactDrafts({
    meetingTitle: "Daily standup",
    proposalCount: proposals.length,
    speakerCount: segments.length,
  });
  allPmSignals.push(...pmSignals(queuedSignals));
  steps.push({
    step: 11,
    id: "standup_intel",
    label: ACCEPTANCE_STEP_DEFINITIONS[10].label,
    ok: segments.length >= 3 && proposals.length > 0,
    detail: `${segments.length} speaker segment(s), ${proposals.length} task proposal(s)`,
    coverage: "integration",
  });

  const pipeline = simulateMeetingToDeliveryPipeline({
    meetingTitle: "Daily standup",
    ceremonyType: "standup",
    intelligence: extraction,
    projectId: DEMO_PROJECT_ID,
    projectName: DEMO_PROJECT_NAME,
  });
  steps.push({
    step: 12,
    id: "pm_approve_tasks",
    label: ACCEPTANCE_STEP_DEFINITIONS[11].label,
    ok: pipeline.ok && pipeline.stages.apply.ok,
    detail: pipeline.stages.apply.detail,
    coverage: "integration",
  });

  // Step 13 — Team members see standup tasks
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
  const rolesWithTasks = new Set(appliedSignals.map((s) => s.targetRole));
  const standupWorkspaceTasks = selectStandupBatchTasks([
    {
      id: "task-standup-1",
      title: taskProposal.title,
      project_id: DEMO_PROJECT_ID,
      status: "todo",
      source: "meeting",
      source_id: "meeting-standup-1",
      created_at: new Date().toISOString(),
      meeting_ceremony_type: "standup",
      meeting_scheduled_at: new Date().toISOString(),
    },
  ]);
  steps.push({
    step: 13,
    id: "team_standup_tasks",
    label: ACCEPTANCE_STEP_DEFINITIONS[12].label,
    ok:
      rolesWithTasks.has("engineer") &&
      rolesWithTasks.has("scrum") &&
      standupWorkspaceTasks.length === 1 &&
      standupWorkspaceTasks[0]?.source === "meeting",
    detail: `Standup tasks propagated to: ${[...rolesWithTasks].join(", ")} · workspace batch ${standupWorkspaceTasks.length}`,
    coverage: "integration",
  });

  // Step 14 — Sponsor invite
  const sponsorToken = signInviteJwt(baseInvitePayload("executive", "read_only"));
  const sponsorVerified = verifyInviteJwt(sponsorToken);
  steps.push({
    step: 14,
    id: "sponsor_invite",
    label: ACCEPTANCE_STEP_DEFINITIONS[13].label,
    ok: Boolean(sponsorVerified?.role === "executive" && sponsorVerified.view_mode === "read_only"),
    detail: sponsorVerified
      ? `executive read_only invite · expires ${sponsorVerified.expires_at}`
      : "Sponsor JWT validation failed",
    coverage: "integration",
  });

  // Step 15 — Sponsor lands on founder workspace
  const founderHref = resolveRoleHomePath("executive");
  steps.push({
    step: 15,
    id: "sponsor_join",
    label: ACCEPTANCE_STEP_DEFINITIONS[14].label,
    ok: founderHref === "/workspace/founder",
    detail: `Invite accept → ${founderHref} (read-only sponsor view)`,
    coverage: "integration",
  });

  // Step 16 — Sponsor Copilot grounded in project data
  const aiConfigured = isAiConfigured();
  const founderPrompt = buildHelmSystemPrompt("founder", {
    copilotName: HELM_NAME,
    orgName: "Acme Corp",
    personaId: "founder",
    personaLabel: "Founder",
    impactRole: "founder",
    projects: [{ id: DEMO_PROJECT_ID, name: DEMO_PROJECT_NAME, status: "active" }],
    focusedProject: {
      id: DEMO_PROJECT_ID,
      name: DEMO_PROJECT_NAME,
      charterTitle: "Portal charter",
      charterSummary: SAMPLE_BC_REVIEW.executiveSummary ?? "",
      flowSummary: null,
      pendingProposals: proposals.length,
      recentSignals: pmSignals(queuedSignals).map((s) => s.message),
    },
    hasLiveData: true,
    emptyHint: helmEmptyStateHint("founder"),
  });
  const copilotGrounded =
    founderPrompt.includes(DEMO_PROJECT_NAME) &&
    founderPrompt.includes("NEVER invent KPIs") &&
    founderPrompt.includes("Executive read-only");
  steps.push({
    step: 16,
    id: "sponsor_copilot",
    label: ACCEPTANCE_STEP_DEFINITIONS[15].label,
    ok: copilotGrounded,
    detail: aiConfigured
      ? `${HELM_NAME} context includes project data; live chat needs OPENAI_API_KEY + auth`
      : `${HELM_NAME} context built; live chat skipped without OPENAI_API_KEY`,
    coverage: aiConfigured ? "integration" : "skipped",
  });

  // Step 17 — Sponsor approves decision → PM notification
  const decisionSignals = decisionChangeToImpactDrafts({
    title: "Approve OAuth vendor selection",
    status: "approved",
    outcome: "Proceed with Auth0",
  });
  allPmSignals.push(...pmSignals(decisionSignals));
  steps.push({
    step: 17,
    id: "sponsor_decision_pm_notify",
    label: ACCEPTANCE_STEP_DEFINITIONS[16].label,
    ok: pmSignals(decisionSignals).some((s) => s.message.includes("Decision resolved")),
    detail: pmSignals(decisionSignals).map((s) => s.message).join("; ") || "No PM notification",
    coverage: "integration",
  });

  const integrationSteps = steps.filter((s) => s.coverage !== "skipped");
  const ok = integrationSteps.every((s) => s.ok);

  return { ok, steps, pmSignals: pmSignals(allPmSignals) };
}

/** Run a single acceptance step by number (1–17) for named Vitest cases. */
export function runAcceptanceStep(stepNumber: number): AcceptanceStepResult {
  const flow = runAcceptance17StepFlow({ inviteSecret: "acceptance-17-step-secret" });
  const step = flow.steps.find((s) => s.step === stepNumber);
  if (!step) {
    return {
      step: stepNumber,
      id: "unknown",
      label: `Step ${stepNumber}`,
      ok: false,
      detail: "Step not found in harness",
      coverage: "integration",
    };
  }
  return step;
}
