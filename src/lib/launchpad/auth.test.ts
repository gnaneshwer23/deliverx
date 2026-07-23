import { describe, expect, it } from "vitest";
import {
  isLaunchpadProduct,
  isLaunchpadUser,
  LAUNCHPAD_APP_PATH,
  suiteProductFromUser,
} from "@/lib/launchpad/auth";
import { calculateReadinessScore } from "@/lib/launchpad/score";
import { isLaunchpadAppPath } from "@/lib/auth/route-guards";

describe("launchpad auth helpers", () => {
  it("detects launchpad product intent", () => {
    expect(isLaunchpadProduct("launchpad")).toBe(true);
    expect(isLaunchpadProduct("xperience")).toBe(false);
    expect(LAUNCHPAD_APP_PATH).toBe("/launchpad/app");
    expect(isLaunchpadAppPath("/launchpad/app")).toBe(true);
    expect(isLaunchpadAppPath("/launchpad")).toBe(false);
  });

  it("reads product from user metadata", () => {
    const user = {
      user_metadata: { product: "launchpad" },
    } as never;
    expect(suiteProductFromUser(user)).toBe("launchpad");
    expect(isLaunchpadUser(user)).toBe(true);
    expect(isLaunchpadUser({ user_metadata: {} } as never)).toBe(false);
  });
});

describe("launchpad readiness scoring", () => {
  it("bounds readiness score", () => {
    expect(
      calculateReadinessScore({
        confidence: 1,
        hasBackground: false,
        modulesCompleted: 0,
        artefactsReady: 0,
      }),
    ).toBeGreaterThan(0);
    expect(
      calculateReadinessScore({
        confidence: 5,
        hasBackground: true,
        modulesCompleted: 5,
        artefactsReady: 10,
      }),
    ).toBe(100);
  });
});
