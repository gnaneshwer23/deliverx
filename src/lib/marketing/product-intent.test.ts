import { describe, expect, it } from "vitest";
import { parseSuiteProduct, postSignupPath } from "@/lib/marketing/product-intent";

describe("parseSuiteProduct", () => {
  it("accepts suite product ids", () => {
    expect(parseSuiteProduct("xperience")).toBe("xperience");
    expect(parseSuiteProduct("launchpad")).toBe("launchpad");
    expect(parseSuiteProduct("team-copilot")).toBe("team-copilot");
    expect(parseSuiteProduct("team_copilot")).toBe("team-copilot");
    expect(parseSuiteProduct("professional-workspace")).toBe("team-copilot");
    expect(parseSuiteProduct("workspace")).toBe("team-copilot");
    expect(parseSuiteProduct("bundle")).toBe("bundle");
  });

  it("rejects unknown values", () => {
    expect(parseSuiteProduct("deliverx")).toBeNull();
    expect(parseSuiteProduct("")).toBeNull();
  });
});

describe("postSignupPath", () => {
  it("prefers invite and join over product", () => {
    expect(
      postSignupPath({ product: "xperience", invite: "abc" }),
    ).toBe("/invite/abc");
    expect(
      postSignupPath({ product: "launchpad", joinToken: "tok" }),
    ).toBe("/join?token=tok");
  });

  it("routes product funnels", () => {
    expect(postSignupPath({ product: "xperience" })).toBe("/onboarding/profile");
    expect(postSignupPath({ product: "launchpad" })).toBe("/onboarding/profile");
    expect(postSignupPath({ product: "launchpad", intent: "roles" })).toBe(
      "/onboarding/profile",
    );
    expect(postSignupPath({ product: "bundle" })).toBe("/onboarding/profile");
    expect(postSignupPath({ product: "team-copilot" })).toBe("/onboarding/organisation");
    expect(postSignupPath({})).toBe("/hub");
  });
});
