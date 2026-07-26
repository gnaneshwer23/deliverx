/**
 * B4 rollout flag. Per six-doc build phase B4 §11 the human reviewer queue
 * ships default OFF until pilot: set DELIVERX_REVIEWER_QUEUE=on.
 * Rollback = unset / off; cases and events stay in place, surfaces disappear.
 */

export type ReviewerQueueEnv = {
  DELIVERX_REVIEWER_QUEUE?: string;
  [key: string]: string | undefined;
};

export function isReviewerQueueEnabled(
  env: ReviewerQueueEnv = process.env as ReviewerQueueEnv,
): boolean {
  const value = (env.DELIVERX_REVIEWER_QUEUE ?? "").trim().toLowerCase();
  return value === "on" || value === "1" || value === "true" || value === "enabled";
}
