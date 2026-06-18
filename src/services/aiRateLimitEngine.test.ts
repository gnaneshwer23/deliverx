import { describe, expect, it } from "vitest";
import { DEFAULT_AI_RATE_LIMIT, runAiRateLimitEngineSmokeTest } from "./aiRateLimitEngine";

describe("aiRateLimitEngine", () => {
  it("passes smoke test", () => {
    const smoke = runAiRateLimitEngineSmokeTest();
    expect(smoke.ok).toBe(true);
    expect(smoke.limit).toBe(DEFAULT_AI_RATE_LIMIT.maxRequests);
  });
});
