/**
 * Pure PI API 429 envelope (B9) — no I/O.
 */

import type { RateLimitDecision } from "@/services/platformRateLimitEngine";

export function piRateLimitedResponse(decision: RateLimitDecision): Response {
  return Response.json(
    {
      error: "Too many requests. Please wait a moment and try again.",
      code: "rate_limited",
      retryAfterSeconds: decision.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(decision.retryAfterSeconds),
        "X-RateLimit-Limit": String(decision.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": decision.resetAt,
      },
    },
  );
}
