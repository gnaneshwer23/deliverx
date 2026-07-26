import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/auth";
import {
  invalidTransitionResponse,
  PI_ERROR_CODE,
  piApiErrorResponse,
  piErrorResponse,
} from "@/lib/api/pi-errors";

describe("B9 PI error contracts", () => {
  it("returns stable codes for invalid transitions", async () => {
    const res = invalidTransitionResponse("completed", "accepted", "intervention");
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe(PI_ERROR_CODE.invalidTransition);
    expect(body.from).toBe("completed");
    expect(body.to).toBe("accepted");
    expect(body.error).toMatch(/cannot move/i);
  });

  it("maps ApiError rate-limit into shared envelope with headers", async () => {
    const err = new ApiError(
      "AI rate limit exceeded. Please wait a moment and try again.",
      429,
      "ai_rate_limited",
      { "Retry-After": "12" },
      { retryAfterSeconds: 12 },
    );
    const res = piApiErrorResponse(err);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("12");
    const body = await res.json();
    expect(body.code).toBe("ai_rate_limited");
    expect(body.retryAfterSeconds).toBe(12);
  });

  it("keeps calm retryable copy for server failures", async () => {
    const res = piErrorResponse(
      500,
      "Could not process. Please try again.",
      PI_ERROR_CODE.retryable,
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe("retryable");
  });
});
