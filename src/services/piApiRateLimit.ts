/**
 * B9 PI API rate limit — per-user window counters for /api/pi/** routes.
 * Atomic increment via `pi_api_rate_limit_increment` (0102); decide from returned count.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  isPiRateLimitEnabled,
  resolvePiRateLimitThresholds,
  type PiRateLimitEnv,
} from "@/lib/pi/rate-limit-flag";
import { decisionFromAtomicCount } from "@/lib/pi/rate-limit-atomic";
import { piRateLimitedResponse } from "@/lib/pi/rate-limit-response";
import {
  bucketStartIso,
  computeRateLimitDecision,
  type RateLimitDecision,
} from "./platformRateLimitEngine";

export { piRateLimitedResponse } from "@/lib/pi/rate-limit-response";

function isMissingRelationOrRpc(error: { code?: string } | null | undefined): boolean {
  // 42P01 = undefined_table; 42883 = undefined_function
  return error?.code === "42P01" || error?.code === "42883";
}

export async function checkPiApiRateLimit(
  userId: string,
  env: PiRateLimitEnv = process.env as PiRateLimitEnv,
): Promise<RateLimitDecision> {
  const { maxRequests, windowMs } = resolvePiRateLimitThresholds(env);
  const now = new Date();
  const windowBucket = bucketStartIso(now, windowMs);
  const admin = createAdminClient();

  const { data: returnedCount, error } = await admin.rpc("pi_api_rate_limit_increment", {
    p_user_id: userId,
    p_window_bucket: windowBucket,
  });

  if (error) {
    // Table/RPC missing in older envs — fail open so pilot is not bricked.
    if (isMissingRelationOrRpc(error)) {
      return computeRateLimitDecision({
        currentCount: 0,
        maxRequests,
        windowMs,
        now,
      });
    }
    throw error;
  }

  return decisionFromAtomicCount({
    returnedCount: Number(returnedCount ?? 0),
    maxRequests,
    windowMs,
    now,
  });
}

/**
 * Enforce the PI API rate limit for an authenticated user.
 * Returns a ready-to-send 429 Response when blocked; null when allowed (or kill-switched).
 */
export async function enforcePiApiRateLimit(
  userId: string,
  env: PiRateLimitEnv = process.env as PiRateLimitEnv,
): Promise<Response | null> {
  if (!isPiRateLimitEnabled(env)) return null;

  const decision = await checkPiApiRateLimit(userId, env);
  if (decision.allowed) return null;

  return piRateLimitedResponse(decision);
}

export type { RateLimitDecision };
