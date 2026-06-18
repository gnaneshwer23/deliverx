import { describe, expect, it } from "vitest";
import { DEFAULT_PLATFORM_SCOPES } from "./platformApi";

describe("platformApi", () => {
  it("includes F1 write and webhook scopes", () => {
    expect(DEFAULT_PLATFORM_SCOPES).toContain("write:tasks");
    expect(DEFAULT_PLATFORM_SCOPES).toContain("read:webhooks");
    expect(DEFAULT_PLATFORM_SCOPES.length).toBeGreaterThanOrEqual(7);
  });
});
