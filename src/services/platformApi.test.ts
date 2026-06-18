import { describe, expect, it } from "vitest";
import { DEFAULT_PLATFORM_SCOPES } from "./platformApi";

describe("platformApi", () => {
  it("includes intelligence loop scope in default platform scopes", () => {
    expect(DEFAULT_PLATFORM_SCOPES).toContain("read:intelligence");
    expect(DEFAULT_PLATFORM_SCOPES).toContain("read:twin");
    expect(DEFAULT_PLATFORM_SCOPES).toHaveLength(6);
  });
});
