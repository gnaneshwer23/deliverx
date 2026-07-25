/**
 * Phase 4 — Workspace continuous observation contracts, consent, and interventions.
 * Observation only: never assigns capability levels.
 */

import type { WorkspaceModuleId } from "@/lib/professional-workspace/modules";
import type { ContributionKind } from "@/lib/professional-workspace/contribution";

export type ObservationSequenceKind =
  | "decision"
  | "artefact"
  | "meeting_action"
  | "risk_response"
  | "reflection"
  | "other";

export type ObservationConsentScope = "global" | "project";

export type ObservationConsentRecord = {
  id: string;
  userId: string;
  scope: ObservationConsentScope;
  projectKind: "org" | "experience" | null;
  projectId: string | null;
  source: "workspace";
  consented: boolean;
  plainLanguageVersion: string;
  consentedAt: string | null;
  revokedAt: string | null;
};

/** Plain-language copy shown on the consent surface. */
export const WORKSPACE_OBSERVATION_CONSENT_COPY = {
  version: "workspace-observation-v1",
  title: "Workspace observation",
  summary:
    "When you turn this on, meaningful Workspace actions you submit — decisions, artefacts, meeting outcomes, and risk responses — can be recorded as evidence on your Professional Intelligence ledger.",
  details: [
    "Observation is off by default. Nothing from Workspace is written to the Evidence Ledger until you consent.",
    "Each observation captures context, what you did, and the recorded outcome — not a capability score.",
    "AI drafts are labelled as AI-authored and never assign a capability level. Only ScoreRun interprets evidence.",
    "You can revoke consent at any time. Existing evidence stays (append-only) but new observation stops.",
    "Contribution split (you vs AI) is preserved on every evidence row.",
  ],
  revokeNote:
    "Turning observation off stops new captures. It does not delete or rewrite evidence already on your ledger.",
} as const;

export type ModuleObservationContract = {
  moduleId: WorkspaceModuleId;
  observes: boolean;
  sequenceKind: ObservationSequenceKind;
  /** Contribution kinds significant enough to append to the ledger */
  significantKinds: ContributionKind[];
  competencyHints: string[];
  indicatorHints: string[];
  description: string;
};

/**
 * Declarative map — coverage is auditable, not scattered across pages.
 * Modules with observes:false never dual-write to the ledger.
 */
export const WORKSPACE_OBSERVATION_CONTRACTS: ModuleObservationContract[] = [
  {
    moduleId: "decisions",
    observes: true,
    sequenceKind: "decision",
    significantKinds: ["user_authored", "user_submitted", "outcome_followed"],
    competencyHints: ["comp.stakeholder_management", "comp.delivery_execution"],
    indicatorHints: ["stakeholder_judgement", "delivery_under_constraint"],
    description: "Recorded decisions with rationale become practice evidence.",
  },
  {
    moduleId: "artefacts",
    observes: true,
    sequenceKind: "artefact",
    significantKinds: ["user_authored", "user_submitted", "user_accepted"],
    competencyHints: ["comp.product_discovery"],
    indicatorHints: ["artefact_craft"],
    description: "Submitted artefacts with human authorship trail.",
  },
  {
    moduleId: "meetings",
    observes: true,
    sequenceKind: "meeting_action",
    significantKinds: ["user_authored", "user_submitted", "outcome_followed"],
    competencyHints: ["comp.stakeholder_management"],
    indicatorHints: ["facilitation"],
    description: "Meeting outcomes and owned follow-ups.",
  },
  {
    moduleId: "risks",
    observes: true,
    sequenceKind: "risk_response",
    significantKinds: ["user_authored", "user_submitted", "outcome_followed"],
    competencyHints: ["comp.delivery_execution"],
    indicatorHints: ["delivery_under_constraint"],
    description: "Risk responses and mitigations you own.",
  },
  {
    moduleId: "coach",
    observes: true,
    sequenceKind: "reflection",
    significantKinds: ["user_authored", "user_submitted"],
    competencyHints: ["comp.product_discovery", "comp.stakeholder_management"],
    indicatorHints: ["reflection"],
    description: "Saved coaching reflections (user-authored).",
  },
  {
    moduleId: "inbox",
    observes: true,
    sequenceKind: "other",
    significantKinds: ["user_submitted"],
    competencyHints: ["comp.stakeholder_management"],
    indicatorHints: ["stakeholder_judgement"],
    description: "High-severity triage decisions you submit.",
  },
  {
    moduleId: "overview",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Orientation only — no ledger observation.",
  },
  {
    moduleId: "team",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Roster management — no ledger observation in MVP.",
  },
  {
    moduleId: "stakeholders",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Mapping only — no ledger observation in MVP.",
  },
  {
    moduleId: "tasks",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Task churn is filtered out to avoid ledger noise.",
  },
  {
    moduleId: "timeline",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Schedule edits filtered unless escalated via decisions/risks.",
  },
  {
    moduleId: "insights",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Insights acknowledged are not auto-observed.",
  },
  {
    moduleId: "evidence",
    observes: false,
    sequenceKind: "other",
    significantKinds: [],
    competencyHints: [],
    indicatorHints: [],
    description: "Review surface — read-only for observation.",
  },
];

export function getObservationContract(
  moduleId: WorkspaceModuleId,
): ModuleObservationContract | null {
  return WORKSPACE_OBSERVATION_CONTRACTS.find((c) => c.moduleId === moduleId) ?? null;
}

export function isSignificantContribution(
  moduleId: WorkspaceModuleId,
  kind: ContributionKind,
): boolean {
  const contract = getObservationContract(moduleId);
  if (!contract?.observes) return false;
  return contract.significantKinds.includes(kind);
}

export type InterventionKind =
  | "reflection_prompt"
  | "scenario_suggestion"
  | "learning_pointer";

export type InterventionStatus =
  | "offered"
  | "accepted"
  | "dismissed"
  | "completed"
  | "expired";

export type InterventionRecord = {
  id: string;
  userId: string;
  kind: InterventionKind;
  status: InterventionStatus;
  title: string;
  rationale: string;
  targetGap: string | null;
  competencyCodes: string[];
  href: string | null;
  sourceSnapshotId: string | null;
  sourceScoreRunId: string | null;
  triggeringEvidenceIds: string[];
  capabilityAssigned: false;
  offeredAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
};

export type InterventionDraft = {
  kind: InterventionKind;
  title: string;
  rationale: string;
  targetGap: string;
  competencyCodes: string[];
  href: string;
  triggeringEvidenceIds: string[];
  payload?: Record<string, unknown>;
};
