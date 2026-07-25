import { describe, expect, it } from "vitest";
import {
  buildLoginRedirectPath,
  isGatewayRedirectDestination,
} from "@/lib/auth/route-guards";

describe("require-onboarding gateway guard", () => {
  it("allows pm-mission onboard when target lacks project param", () => {
    const target = "/workspace/pm-mission?onboard=1&project=abc";
    expect(
      isGatewayRedirectDestination("/workspace/pm-mission?onboard=1&project=abc", target),
    ).toBe(true);
    expect(
      isGatewayRedirectDestination("/workspace/pm-mission?onboard=1&project=xyz", target),
    ).toBe(false);
  });

  it("skips re-redirect when proxy path headers are missing (empty current path)", () => {
    const shouldSkipPmMissionRedirect = (currentPath: string | null, redirectPath: string) =>
      !currentPath && redirectPath.startsWith("/workspace/pm-mission");

    expect(
      shouldSkipPmMissionRedirect(null, "/workspace/pm-mission?onboard=1"),
    ).toBe(true);
    expect(
      shouldSkipPmMissionRedirect(null, "/project/new"),
    ).toBe(false);
    expect(
      shouldSkipPmMissionRedirect("/workspace/pm-mission?onboard=1&project=x", "/workspace/pm-mission?onboard=1"),
    ).toBe(false);
  });

  it("preserves deep-link next for unauthenticated workspace/settings shells", () => {
    expect(buildLoginRedirectPath("/workspace/coach")).toBe(
      "/login?next=%2Fworkspace%2Fcoach",
    );
    expect(buildLoginRedirectPath("/settings/profile")).toBe(
      "/login?next=%2Fsettings%2Fprofile",
    );
    expect(buildLoginRedirectPath("/workspace/coach?project=abc")).toBe(
      "/login?next=%2Fworkspace%2Fcoach%3Fproject%3Dabc",
    );
  });
});
