/**
 * Deterministic Home journey-state resolution.
 *
 * Priority: A (not onboarded) → C (active Experience) → D (Launchpad-primary)
 * → B (onboarded, no Experience) → progress (post-Experience / assessment loop).
 *
 * Team Copilot executive dashboard (founder “Dashboard 5”) is build-gated:
 * never returned as a primary state. Thin Workspace appears only as a card.
 *
 * Launchpad-primary (D) heuristics — keep in sync with
 * docs/design/contextual-home-daily-briefing.md:
 * 1. productIntent === "launchpad", OR
 * 2. real outcome activity (interviews or applications > 0), OR
 * 3. career roadmap includes interview_prep
 * AND the user is not in active Experience work (C).
 * If the user has no Experience evidence and product is not launchpad,
 * prefer B (Experience-first) even when roadmap mentions interview prep.
 */

import {
  homeStateLetter,
  type HomeState,
  type HomeStateLetter,
  type HomeStateSignals,
} from "@/lib/contextual-home/types";

export type ResolvedHomeState = {
  state: HomeState;
  stateLetter: HomeStateLetter;
  reason: string;
};

function isLaunchpadPrimaryCandidate(signals: HomeStateSignals): boolean {
  if (signals.productIntent === "launchpad") return true;
  if (signals.interviewCount > 0 || signals.applicationCount > 0) return true;
  if (signals.hasInterviewPrepRoadmap) return true;
  return false;
}

export function resolveHomeState(signals: HomeStateSignals): ResolvedHomeState {
  // A — Professional Identity incomplete
  if (!signals.onboardingComplete) {
    return {
      state: "not_onboarded",
      stateLetter: "A",
      reason: "PI onboarding session is missing or not completed",
    };
  }

  // C — inside active Experience work
  if (signals.hasActiveExperienceWork) {
    return {
      state: "active_experience",
      stateLetter: "C",
      reason: "ACTIVE Experience enrolment with unfinished lifecycle",
    };
  }

  const launchpadPrimary = isLaunchpadPrimaryCandidate(signals);

  // Prefer B when there is still no Experience practice and the user is not a Launchpad SKU
  if (!signals.hasExperienceEvidence && signals.productIntent !== "launchpad") {
    return {
      state: "recommend_experience",
      stateLetter: "B",
      reason: "Onboarded with no experience-sourced evidence; Experience-first",
    };
  }

  // D — Launchpad-primary
  if (launchpadPrimary) {
    return {
      state: "launchpad_primary",
      stateLetter: "D",
      reason:
        signals.productIntent === "launchpad"
          ? "Launchpad product intent"
          : "Career outcomes or interview-prep roadmap activity",
    };
  }

  // B — onboarded, no Experience practice (Launchpad SKU without outcomes still lands B
  // when hasExperienceEvidence is false was already handled; remaining is no-evidence Launchpad → D above)
  if (!signals.hasExperienceEvidence) {
    return {
      state: "recommend_experience",
      stateLetter: "B",
      reason: "Onboarded with no experience-sourced evidence",
    };
  }

  // Progress — has Experience evidence, not actively enrolled, not Launchpad-primary
  return {
    state: "progress",
    stateLetter: homeStateLetter("progress"),
    reason: "Post-Experience or assessment loop; use nextAction for CTA",
  };
}
