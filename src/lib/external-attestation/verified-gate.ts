/**
 * Honest deliverxVerified gate + global kill switch (T8).
 * Never lights from ScoreRun, learning, outcomes, or self-report alone.
 */

import type { EvidenceStrengthLabel, VerifierStatus } from "@/lib/verified-portfolio/types";

export type VerifiedBadgeEnv = {
  DELIVERX_VERIFIED_BADGE?: string;
  [key: string]: string | undefined;
};

function truthyOff(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "0" || v === "false" || v === "off" || v === "disabled";
}

/** Global kill switch — when off, badge never lights even with valid attestation. */
export function isVerifiedBadgeEnabled(
  env: VerifiedBadgeEnv = process.env as VerifiedBadgeEnv,
): boolean {
  return !truthyOff(env.DELIVERX_VERIFIED_BADGE);
}

/**
 * Product rule (PD-2026-07-06 + T8):
 * externally_attested + externally_verified + kill switch on.
 */
export function deliverxVerifiedFromAttestation(entry: {
  verifierStatus: VerifierStatus;
  evidenceStrength: EvidenceStrengthLabel;
  env?: VerifiedBadgeEnv;
}): boolean {
  if (!isVerifiedBadgeEnabled(entry.env ?? (process.env as VerifiedBadgeEnv))) {
    return false;
  }
  return (
    entry.verifierStatus === "externally_attested" &&
    entry.evidenceStrength === "externally_verified"
  );
}

/** Sources that must never alone light the badge. */
export const NEVER_AUTO_VERIFY_SOURCES = [
  "score_run",
  "learning_activity",
  "self_report",
  "reflection",
  "real_world_outcome",
  "baseline_assessment",
  "experience_project",
  "workspace_observation",
] as const;
