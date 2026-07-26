/**
 * B9 PI API rate limit — per-user window counters for /api/pi/** routes.
 * Reuses the pure platformRateLimitEngine; DB-backed like org/platform limits.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  isPiRateLimitEnabled,
  resolvePiRateLimitThresholds,
  type PiRateLimitEnv,
} from "@/lib/pi/rate-limit-flag";
import { piRateLimitedResponse } from "@/lib/pi/rate-limit-response";
import {
  bucketStartIso,
  computeRateLimitDecision,
  type RateLimitDecision,
} from "./platformRateLimitEngine";

export { piRateLimitedResponse } from "@/lib/pi/rate-limit-response";

export async function checkPiApiRateLimit(
  userId: string,
  env: PiRateLimitEnv = process.env as PiRateLimitEnv,
): Promise<RateLimitDecision> {
  const { maxRequests, windowMs } = resolvePiRateLimitThresholds(env);
  const now = new Date();
  const windowBucket = bucketStartIso(now, windowMs);
  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from("pi_api_rate_limits")
    .select("request_count")
    .eq("user_id", userId)
    .eq("window_bucket", windowBucket)
    .maybeSingle();

  if (fetchError) {
    // Table missing in older envs — fail open so pilot is not bricked.
    if (fetchError.code === "42P01") {
      return computeRateLimitDecision({
        currentCount: 0,
        maxRequests,
        windowMs,
        now,
      });
    }
    throw fetchError;
  }

  const currentCount = Number(existing?.request_count ?? 0);
  const decision = computeRateLimitDecision({
    currentCount,
    maxRequests,
    windowMs,
    now,
  });

  if (!decision.allowed) return decision;

  if (existing) {
    const { error: updateError } = await admin
      .from("pi_api_rate_limits")
      .update({ request_count: currentCount + 1 })
      .eq("user_id", userId)
      .eq("window_bucket", windowBucket);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await admin.from("pi_api_rate_limits").insert({
      user_id: userId,
      window_bucket: windowBucket,
      request_count: 1,
    });
    if (insertError) throw insertError;
  }

  return computeRateLimitDecision({
    currentCount: currentCount + 1,
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
