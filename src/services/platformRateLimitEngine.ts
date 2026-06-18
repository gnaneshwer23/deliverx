/**
 * Platform API rate limit engine — pure window bucketing and limit decisions.
 */

export const DEFAULT_PLATFORM_RATE_LIMIT = {
  maxRequests: 120,
  windowMs: 60_000,
} as const;

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string;
  retryAfterSeconds: number;
};

export function bucketStartIso(now: Date, windowMs: number): string {
  const ms = Math.floor(now.getTime() / windowMs) * windowMs;
  return new Date(ms).toISOString();
}

export function computeRateLimitDecision(input: {
  currentCount: number;
  maxRequests: number;
  windowMs: number;
  now?: Date;
}): RateLimitDecision {
  const now = input.now ?? new Date();
  const limit = input.maxRequests;
  const bucketStart = Math.floor(now.getTime() / input.windowMs) * input.windowMs;
  const resetAt = new Date(bucketStart + input.windowMs).toISOString();
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((bucketStart + input.windowMs - now.getTime()) / 1000),
  );

  if (input.currentCount >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetAt,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - input.currentCount - 1),
    limit,
    resetAt,
    retryAfterSeconds,
  };
}

export function runPlatformRateLimitEngineSmokeTest(): {
  ok: boolean;
  limit: number;
  windowMs: number;
} {
  const bucket = bucketStartIso(new Date("2026-05-22T12:34:56.789Z"), 60_000);
  const allowed = computeRateLimitDecision({
    currentCount: 0,
    maxRequests: DEFAULT_PLATFORM_RATE_LIMIT.maxRequests,
    windowMs: DEFAULT_PLATFORM_RATE_LIMIT.windowMs,
    now: new Date("2026-05-22T12:34:56.789Z"),
  });
  const blocked = computeRateLimitDecision({
    currentCount: 120,
    maxRequests: DEFAULT_PLATFORM_RATE_LIMIT.maxRequests,
    windowMs: DEFAULT_PLATFORM_RATE_LIMIT.windowMs,
    now: new Date("2026-05-22T12:34:56.789Z"),
  });

  return {
    ok:
      bucket === "2026-05-22T12:34:00.000Z" &&
      allowed.allowed &&
      allowed.remaining === 119 &&
      !blocked.allowed &&
      blocked.remaining === 0,
    limit: DEFAULT_PLATFORM_RATE_LIMIT.maxRequests,
    windowMs: DEFAULT_PLATFORM_RATE_LIMIT.windowMs,
  };
}
