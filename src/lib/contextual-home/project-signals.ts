/**
 * Project HomeStateSignals from existing PI aggregate + Experience session.
 * Keeps Home as a read projection — no parallel PI truth.
 */

import { formatConfidenceDisplayLabel } from "@/lib/capability-engine/confidence-bands";
import type { PiProfileAggregate } from "@/lib/pi-profile/types";
import type { HomeStateSignals } from "@/lib/contextual-home/types";

const EXPERIENCE_SOURCE_TYPES = new Set([
  "experience_project",
  "decision",
  "workspace_observation",
]);

const FINISHED_LIFECYCLES = new Set(["completed", "failed"]);

export type ExperienceEnrolmentSignal = {
  id: string;
  company_name: string | null;
  day: number | null;
  status: string | null;
  lifecycle_phase?: string | null;
  state?: unknown;
} | null;

export type HomeSignalExtras = {
  enrolment: ExperienceEnrolmentSignal;
  productIntent: HomeStateSignals["productIntent"];
  showWorkspaceSummary: boolean;
  verifiedClaimCount?: number;
};

function lifecycleFromEnrolment(enrolment: ExperienceEnrolmentSignal): string | null {
  if (!enrolment) return null;
  if (typeof enrolment.lifecycle_phase === "string" && enrolment.lifecycle_phase) {
    return enrolment.lifecycle_phase;
  }
  const state = enrolment.state;
  if (state && typeof state === "object" && state !== null && "lifecycle" in state) {
    const lifecycle = (state as { lifecycle?: unknown }).lifecycle;
    return typeof lifecycle === "string" ? lifecycle : null;
  }
  return null;
}

export function isActiveExperienceWork(enrolment: ExperienceEnrolmentSignal): boolean {
  if (!enrolment) return false;
  if ((enrolment.status ?? "").toUpperCase() !== "ACTIVE") return false;
  const lifecycle = lifecycleFromEnrolment(enrolment);
  if (lifecycle && FINISHED_LIFECYCLES.has(lifecycle)) return false;
  return true;
}

/** Qualitative B1 band only — never surface readinessSignal as a percentage. */
function bandLabelFromAggregate(profile: PiProfileAggregate): string | null {
  const scoreRun = profile.scoreRun;
  if (!scoreRun) return null;
  const confidence =
    typeof scoreRun.levels[0]?.confidence === "number"
      ? scoreRun.levels[0].confidence
      : null;
  if (confidence == null || !Number.isFinite(confidence)) return null;
  return formatConfidenceDisplayLabel(confidence);
}

export function projectHomeSignals(
  profile: PiProfileAggregate,
  extras: HomeSignalExtras,
): HomeStateSignals {
  const experienceEvidenceCount = Object.entries(profile.evidence.bySourceType)
    .filter(([k]) => EXPERIENCE_SOURCE_TYPES.has(k))
    .reduce((sum, [, n]) => sum + n, 0);

  const enrolment = extras.enrolment;
  const lifecycle = lifecycleFromEnrolment(enrolment);
  const roadmap = profile.roadmapTeaser ?? [];
  const interviewPrep = roadmap.find((r) => r.kind === "interview_prep");

  return {
    onboardingComplete: profile.identity.onboardingComplete,
    hasActiveExperienceWork: isActiveExperienceWork(enrolment),
    experienceEnrolmentId: enrolment?.id ?? null,
    experienceCompanyName: enrolment?.company_name ?? null,
    experienceDay: typeof enrolment?.day === "number" ? enrolment.day : null,
    experienceLifecycle: lifecycle,
    hasExperienceEvidence: experienceEvidenceCount > 0,
    experienceEvidenceCount,
    evidenceTotalCount: profile.evidence.totalCount,
    hasActiveExperiencePlan: Boolean(profile.experiencePlan),
    experiencePlanId: profile.experiencePlan?.id ?? null,
    experiencePlanTitle: profile.experiencePlan?.title ?? null,
    experiencePlanCompany: profile.experiencePlan?.companyName ?? null,
    experiencePlanHref: profile.experiencePlan?.href ?? null,
    experiencePlanRationale: profile.experiencePlan?.rationale ?? null,
    targetRole: profile.identity.targetRole,
    objective: profile.identity.objective,
    productIntent: extras.productIntent,
    interviewCount: profile.outcomes?.interviews ?? 0,
    applicationCount: profile.outcomes?.applications ?? 0,
    offerCount: profile.outcomes?.offers ?? 0,
    hasInterviewPrepRoadmap: Boolean(interviewPrep),
    interviewPrepHref: interviewPrep?.href ?? "/launchpad/app/interview",
    confidenceBandLabel: bandLabelFromAggregate(profile),
    scoreRunId: profile.scoreRun?.scoreRunId ?? null,
    topGap: profile.holdingBack.topGaps[0] ?? null,
    verifiedClaimCount: Math.max(0, extras.verifiedClaimCount ?? 0),
    showWorkspaceSummary: extras.showWorkspaceSummary,
    nextAction: profile.nextAction
      ? {
          title: profile.nextAction.title,
          rationale: profile.nextAction.rationale,
          href: profile.nextAction.href,
          kind: profile.nextAction.kind,
        }
      : null,
    firstName: profile.identity.firstName || null,
  };
}
