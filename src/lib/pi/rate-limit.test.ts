import { describe, expect, it } from "vitest";
import {
  DEFAULT_PI_RATE_LIMIT,
  isPiRateLimitEnabled,
  resolvePiRateLimitThresholds,
} from "@/lib/pi/rate-limit-flag";
import {
  decisionFromAtomicCount,
  simulateAtomicIncrement,
} from "@/lib/pi/rate-limit-atomic";
import { piRateLimitedResponse } from "@/lib/pi/rate-limit-response";
import { computeRateLimitDecision } from "@/services/platformRateLimitEngine";

describe("B9 PI rate-limit flag", () => {
  it("defaults ON (kill-switch only when explicitly off)", () => {
    expect(isPiRateLimitEnabled({})).toBe(true);
    expect(isPiRateLimitEnabled({ DELIVERX_PI_RATE_LIMIT: "on" })).toBe(true);
    expect(isPiRateLimitEnabled({ DELIVERX_PI_RATE_LIMIT: "off" })).toBe(false);
    expect(isPiRateLimitEnabled({ DELIVERX_PI_RATE_LIMIT: "0" })).toBe(false);
    expect(isPiRateLimitEnabled({ DELIVERX_PI_RATE_LIMIT: "disabled" })).toBe(false);
  });

  it("resolves pilot-safe default thresholds and env overrides", () => {
    expect(resolvePiRateLimitThresholds({})).toEqual(DEFAULT_PI_RATE_LIMIT);
    expect(
      resolvePiRateLimitThresholds({
        DELIVERX_PI_RATE_LIMIT_MAX: "120",
        DELIVERX_PI_RATE_LIMIT_WINDOW_MS: "30000",
      }),
    ).toEqual({ maxRequests: 120, windowMs: 30_000 });
    expect(
      resolvePiRateLimitThresholds({
        DELIVERX_PI_RATE_LIMIT_MAX: "-1",
        DELIVERX_PI_RATE_LIMIT_WINDOW_MS: "10",
      }),
    ).toEqual(DEFAULT_PI_RATE_LIMIT);
  });

  it("does not break legitimate pilot pace (90/min allows burst of UI calls)", () => {
    const decision = computeRateLimitDecision({
      currentCount: 20,
      maxRequests: DEFAULT_PI_RATE_LIMIT.maxRequests,
      windowMs: DEFAULT_PI_RATE_LIMIT.windowMs,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.remaining).toBe(69);
  });
});

describe("B9 PI rate-limit 429 contract", () => {
  it("emits calm copy, code, Retry-After, and X-RateLimit headers", async () => {
    const decision = computeRateLimitDecision({
      currentCount: 90,
      maxRequests: 90,
      windowMs: 60_000,
      now: new Date("2026-07-26T12:00:30.000Z"),
    });
    expect(decision.allowed).toBe(false);

    const res = piRateLimitedResponse(decision);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe(String(decision.retryAfterSeconds));
    expect(res.headers.get("X-RateLimit-Limit")).toBe("90");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");

    const body = (await res.json()) as {
      error: string;
      code: string;
      retryAfterSeconds: number;
    };
    expect(body.code).toBe("rate_limited");
    expect(body.error).toMatch(/wait a moment/i);
    expect(body.retryAfterSeconds).toBe(decision.retryAfterSeconds);
  });
});

describe("B9 atomic increment (0102 concurrency fix)", () => {
  const now = new Date("2026-07-26T12:00:30.000Z");

  it("allows exactly maxRequests from returned post-increment counts", () => {
    const allowed = decisionFromAtomicCount({
      returnedCount: 90,
      maxRequests: 90,
      windowMs: 60_000,
      now,
    });
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(0);

    const blocked = decisionFromAtomicCount({
      returnedCount: 91,
      maxRequests: 90,
      windowMs: 60_000,
      now,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    const res = piRateLimitedResponse(blocked);
    expect(res.status).toBe(429);
  });

  it("returns monotonically increasing counts with no lost increments", () => {
    const store = new Map<string, number>();
    const key = "user|2026-07-26T12:00:00.000Z";
    const burst = 130;
    const limit = DEFAULT_PI_RATE_LIMIT.maxRequests;

    // Simulate a concurrent burst: each logical request gets one atomic +1.
    // Mirrors SQL `ON CONFLICT DO UPDATE SET request_count = request_count + 1 RETURNING`.
    const returned = Array.from({ length: burst }, () =>
      simulateAtomicIncrement(store, key),
    );

    expect(store.get(key)).toBe(burst);
    expect(returned).toEqual(Array.from({ length: burst }, (_, i) => i + 1));
    expect(new Set(returned).size).toBe(burst);

    const decisions = returned.map((returnedCount) =>
      decisionFromAtomicCount({
        returnedCount,
        maxRequests: limit,
        windowMs: DEFAULT_PI_RATE_LIMIT.windowMs,
        now,
      }),
    );
    expect(decisions.filter((d) => d.allowed).length).toBe(limit);
    expect(decisions.filter((d) => !d.allowed).length).toBe(burst - limit);
  });
});
