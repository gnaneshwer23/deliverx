/**
 * AI rate limit façade — enforce per-org limits before LLM calls.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api/auth";
import {
  bucketStartIso,
  computeRateLimitDecision,
  type RateLimitDecision,
} from "./platformRateLimitEngine";
import { DEFAULT_AI_RATE_LIMIT } from "./aiRateLimitEngine";

export async function checkOrgAiRateLimit(orgId: string): Promise<RateLimitDecision> {
  const admin = createAdminClient();
  const now = new Date();
  const { maxRequests, windowMs } = DEFAULT_AI_RATE_LIMIT;
  const windowBucket = bucketStartIso(now, windowMs);

  const { data: existing, error: fetchError } = await admin
    .from("org_ai_rate_limits")
    .select("request_count")
    .eq("organisation_id", orgId)
    .eq("window_bucket", windowBucket)
    .maybeSingle();

  if (fetchError) {
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
      .from("org_ai_rate_limits")
      .update({ request_count: currentCount + 1 })
      .eq("organisation_id", orgId)
      .eq("window_bucket", windowBucket);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await admin.from("org_ai_rate_limits").insert({
      organisation_id: orgId,
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

export async function assertOrgAiRateLimit(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError("Not authenticated", 401);
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!profile?.organisation_id) {
    throw new ApiError("No organisation", 403);
  }

  const orgId = String(profile.organisation_id);
  const decision = await checkOrgAiRateLimit(orgId);

  if (!decision.allowed) {
    throw new ApiError(
      `AI rate limit exceeded. Retry in ${decision.retryAfterSeconds}s.`,
      429,
    );
  }

  return orgId;
}
