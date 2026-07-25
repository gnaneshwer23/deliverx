/** Professional Intelligence Profile centre — typed aggregate for the five questions. */

import type { SnapshotGrowthDelta } from "@/lib/capability-engine/snapshot-claims";
import type { CapabilityLevel } from "@/lib/capability-engine/types";
import type { OpportunityFit, RoadmapAction } from "@/lib/career-intelligence/types";
import type { ExperiencePlanRecord } from "@/lib/experience-planner/types";
import type { GrowthReportRecord } from "@/lib/pi-assessment/growth-report";

export type PiProfileIdentity = {
  firstName: string;
  lastName: string;
  professionalIdentity: string | null;
  targetRole: string | null;
  targetSeniority: string | null;
  objective: string | null;
  situation: string | null;
  industries: string[];
  onboardingComplete: boolean;
  /** From onboarding payload — opt-in baseline (D5). */
  baselineOptIn: boolean;
  source: "pi_onboarding" | "none";
};

export type PiProfileEvidenceHealth = {
  totalCount: number;
  latestTitle: string | null;
  latestCapturedAt: string | null;
  bySourceType: Record<string, number>;
  emptyGuidance: string | null;
};

export type PiProfileLevel = {
  competencyId: string;
  indicatorId: string;
  level: CapabilityLevel | string;
  confidence: number;
  evidenceReferences: string[];
  reasoningSummary: string;
};

export type PiProfileScoreRun = {
  snapshotId: string;
  scoreRunId: string | null;
  capturedAt: string;
  rubricSlug: string | null;
  rubricVersion: string | null;
  frameworkVersionId: string | null;
  readinessSignal: number | null;
  strengths: string[];
  gaps: string[];
  levels: PiProfileLevel[];
  recommendations: Array<{ id?: string; title: string; rationale?: string }>;
  emptyGuidance: string | null;
};

export type PiProfileNextAction = {
  title: string;
  rationale: string;
  href: string;
  kind:
    | "experience"
    | "evidence"
    | "career"
    | "onboarding"
    | "recommendation"
    | "baseline"
    | "final"
    | "portfolio_eligibility"
    | "career_readiness"
    | "profile";
} | null;

export type PiProfileAggregate = {
  identity: PiProfileIdentity;
  evidence: PiProfileEvidenceHealth;
  scoreRun: PiProfileScoreRun | null;
  /** Honest growth between the two most recent snapshots, or insufficient history. */
  growthDelta: SnapshotGrowthDelta;
  /** Citation-backed baseline → practice → final growth report when available. */
  growthReport: GrowthReportRecord | null;
  holdingBack: {
    topGaps: string[];
    emptyGuidance: string | null;
  };
  nextAction: PiProfileNextAction;
  opportunities: {
    items: OpportunityFit[];
    emptyGuidance: string | null;
  };
  /** Explicit: this aggregate never writes capability. */
  capabilityAssigned: false;
  /** Verified badge never lights from Profile / growth report (Phase 8). */
  deliverxVerified: false;
  roadmapTeaser: RoadmapAction[];
  /** Gap-ranked Experience plan (Phase 3) — recommendation only. */
  experiencePlan: ExperiencePlanRecord | null;
};
