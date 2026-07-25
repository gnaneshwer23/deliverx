import { describe, expect, it } from "vitest";
import {
  buildLoginRedirectPath,
  isAuthEntryPath,
  isGatewayRedirectDestination,
  isOnboardingPath,
  isSettingsPath,
  isWorkspacePath,
  resolveSignupOnboardingNext,
} from "@/lib/auth/route-guards";

function mockRequest(pathname: string, search = "") {
  return {
    nextUrl: new URL(`http://local${pathname}${search}`),
  };
}

describe("route-guards", () => {
  it("detects auth entry and onboarding paths", () => {
    expect(isAuthEntryPath("/login")).toBe(true);
    expect(isAuthEntryPath("/signup")).toBe(true);
    expect(isAuthEntryPath("/onboarding/organisation")).toBe(false);
    expect(isOnboardingPath("/onboarding/organisation")).toBe(true);
    expect(isOnboardingPath("/onboarding/role?role=pm")).toBe(true);
  });

  it("detects workspace and settings shells for login next preservation", () => {
    expect(isWorkspacePath("/workspace")).toBe(true);
    expect(isWorkspacePath("/workspace/coach")).toBe(true);
    expect(isWorkspacePath("/workspaces")).toBe(false);
    expect(isSettingsPath("/settings")).toBe(true);
    expect(isSettingsPath("/settings/profile")).toBe(true);
    expect(isSettingsPath("/setting")).toBe(false);
  });

  it("builds login redirects with encoded next paths", () => {
    expect(buildLoginRedirectPath("/onboarding/organisation?role=pm")).toBe(
      "/login?next=%2Fonboarding%2Forganisation%3Frole%3Dpm",
    );
  });

  it("maps signup role params to onboarding next paths", () => {
    expect(resolveSignupOnboardingNext(mockRequest("/signup", "?role=pm"))).toBe(
      "/onboarding/organisation?role=pm",
    );
    expect(resolveSignupOnboardingNext(mockRequest("/signup", "?role=sponsor"))).toBe(
      "/onboarding/organisation?role=executive",
    );
    expect(resolveSignupOnboardingNext(mockRequest("/signup"))).toBeNull();
  });

  it("treats pm-mission onboard URLs with extra params as already at destination", () => {
    const target = "/workspace/pm-mission?onboard=1";
    expect(isGatewayRedirectDestination("/workspace/pm-mission?onboard=1", target)).toBe(true);
    expect(
      isGatewayRedirectDestination("/workspace/pm-mission?onboard=1&project=abc", target),
    ).toBe(true);
    expect(isGatewayRedirectDestination("/workspace/pm-mission", target)).toBe(false);
    expect(isGatewayRedirectDestination("/workspace/pm-mission?onboard=0", target)).toBe(false);
  });
});
