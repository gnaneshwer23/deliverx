/**
 * Pure helpers for B9 atomic PI rate-limit decisions.
 * DB increment is `pi_api_rate_limit_increment` (migration 0102); app code
 * decides allow/deny from the returned post-increment count.
 */

import {
  computeRateLimitDecision,
  type RateLimitDecision,
} from "@/services/platformRateLimitEngine";

/**
 * Map a post-increment counter (1 after first request) to the engine decision.
 * Uses count-before-this-request so exactly `maxRequests` requests are allowed.
 */
export function decisionFromAtomicCount(input: {
  returnedCount: number;
  maxRequests: number;
  windowMs: number;
  now?: Date;
}): RateLimitDecision {
  const returnedCount = Math.max(0, Math.floor(Number(input.returnedCount) || 0));
  return computeRateLimitDecision({
    currentCount: Math.max(0, returnedCount - 1),
    maxRequests: input.maxRequests,
    windowMs: input.windowMs,
    now: input.now,
  });
}

/**
 * In-memory stand-in for the SQL upsert `request_count = request_count + 1`.
 * Each call is atomic relative to the shared Map (single-threaded JS); used to
 * prove that N concurrent logical increments yield counts 1..N with no losses.
 */
export function simulateAtomicIncrement(
  store: Map<string, number>,
  key: string,
): number {
  const next = (store.get(key) ?? 0) + 1;
  store.set(key, next);
  return next;
}
