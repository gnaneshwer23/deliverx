import { describe, expect, it } from "vitest";
import {
  isXperienceProduct,
  isXperienceUser,
  suiteProductFromUser,
  XPERIENCE_APP_PATH,
} from "@/lib/xperience/auth";
import { calculateCareerScore, applyScenarioDecision } from "@/lib/xperience/score";

describe("xperience auth helpers", () => {
  it("detects xperience product intent", () => {
    expect(isXperienceProduct("xperience")).toBe(true);
    expect(isXperienceProduct("team-copilot")).toBe(false);
    expect(XPERIENCE_APP_PATH).toBe("/xperience/app");
  });

  it("reads product from user metadata", () => {
    const user = {
      user_metadata: { product: "xperience" },
    } as never;
    expect(suiteProductFromUser(user)).toBe("xperience");
    expect(isXperienceUser(user)).toBe(true);
    expect(isXperienceUser({ user_metadata: {} } as never)).toBe(false);
  });
});

describe("xperience scoring", () => {
  it("calculates career score bounds", () => {
    expect(
      calculateCareerScore({ decisions: 1, evidenceItems: 1, stakeholderScore: 14 }),
    ).toBeGreaterThan(0);
    expect(
      calculateCareerScore({ decisions: 99, evidenceItems: 99, stakeholderScore: 99 }),
    ).toBe(100);
  });

  it("scores scenario decisions", () => {
    const result = applyScenarioDecision({
      choice: {
        id: "make-decision",
        label: "Make decision",
        impact: { trust: 10, delivery: 6, clarity: 7 },
      },
    });
    expect(result.evidenceScore).toBe(73);
  });
});
