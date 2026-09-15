/**
 * Phase 4 kill-switch. The coaching evidence workflow ships default OFF:
 * when off, submission/coach surfaces are hidden, APIs 404, and no evidence path
 * is active. Individual programmes ALSO default disabled until a founder approves
 * their exercises (`coaching_programmes.enabled`).
 *
 * Rollback = unset / off; recorded submissions and evidence stay in place,
 * surfaces disappear.
 */

export type CoachingEvidenceEnv = {
  DELIVERX_COACHING_EVIDENCE?: string;
  [key: string]: string | undefined;
};

export function isCoachingEvidenceEnabled(
  env: CoachingEvidenceEnv = process.env as CoachingEvidenceEnv,
): boolean {
  const value = (env.DELIVERX_COACHING_EVIDENCE ?? "").trim().toLowerCase();
  return value === "on" || value === "1" || value === "true" || value === "enabled";
}

/** A programme is usable only when the global flag is on AND the programme is enabled. */
export function isProgrammeEnabled(
  programme: { enabled?: boolean | null } | null | undefined,
  env: CoachingEvidenceEnv = process.env as CoachingEvidenceEnv,
): boolean {
  return isCoachingEvidenceEnabled(env) && Boolean(programme?.enabled);
}

export const COACHING_EVIDENCE_DISABLED_NOTICE =
  "The coaching evidence workflow is off. Set DELIVERX_COACHING_EVIDENCE=on to enable. Coach confirmation records supported evidence — never Verified, never capability.";
