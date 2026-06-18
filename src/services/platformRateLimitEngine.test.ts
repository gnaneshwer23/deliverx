import { describe, expect, it } from "vitest";
import {
  bucketStartIso,
  computeRateLimitDecision,
  DEFAULT_PLATFORM_RATE_LIMIT,
  runPlatformRateLimitEngineSmokeTest,
} from "./platformRateLimitEngine";

describe("platformRateLimitEngine", () => {
  it("buckets timestamps to minute windows", () => {
    expect(bucketStartIso(new Date("2026-05-22T12:34:56Z"), 60_000)).toBe(
      "2026-05-22T12:34:00.000Z",
    );
  });

  it("allows requests under the limit", () => {
    const decision = computeRateLimitDecision({
      currentCount: 10,
      maxRequests: 120,
      windowMs: 60_000,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(109);
  });

  it("blocks requests at the limit", () => {
    const decision = computeRateLimitDecision({
      currentCount: 120,
      maxRequests: 120,
      windowMs: 60_000,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.remaining).toBe(0);
    expect(decision.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("passes smoke test", () => {
    const smoke = runPlatformRateLimitEngineSmokeTest();
    expect(smoke.ok).toBe(true);
    expect(smoke.limit).toBe(DEFAULT_PLATFORM_RATE_LIMIT.maxRequests);
  });
});
