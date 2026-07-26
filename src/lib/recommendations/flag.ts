/**
 * B2 rollout flag. Per six-doc build phase B2 §11 the recommendation state
 * machine ships default OFF until pilot: set DELIVERX_RECOMMENDATION_SM=on.
 * Rollback = unset the flag; data stays in place, surfaces disappear.
 */

export type RecommendationSmEnv = {
  DELIVERX_RECOMMENDATION_SM?: string;
  [key: string]: string | undefined;
};

export function isRecommendationSmEnabled(
  env: RecommendationSmEnv = process.env as RecommendationSmEnv,
): boolean {
  const value = (env.DELIVERX_RECOMMENDATION_SM ?? "").trim().toLowerCase();
  return value === "on" || value === "1" || value === "true" || value === "enabled";
}
