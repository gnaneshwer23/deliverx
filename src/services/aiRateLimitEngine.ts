/**
 * AI rate limit engine — per-org limits on LLM generation calls.
 */

import {
  bucketStartIso,
  computeRateLimitDecision,
  type RateLimitDecision,
} from "./platformRateLimitEngine";

export const DEFAULT_AI_RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60_000,
} as const;

export function runAiRateLimitEngineSmokeTest(): {
  ok: boolean;
  limit: number;
  windowMs: number;
} {
  const decision = computeRateLimitDecision({
    currentCount: 0,
    maxRequests: DEFAULT_AI_RATE_LIMIT.maxRequests,
    windowMs: DEFAULT_AI_RATE_LIMIT.windowMs,
  });
  const bucket = bucketStartIso(new Date("2026-05-22T12:34:56Z"), DEFAULT_AI_RATE_LIMIT.windowMs);

  return {
    ok: decision.allowed && decision.remaining === 29 && bucket === "2026-05-22T12:34:00.000Z",
    limit: DEFAULT_AI_RATE_LIMIT.maxRequests,
    windowMs: DEFAULT_AI_RATE_LIMIT.windowMs,
  };
}

export type { RateLimitDecision };
