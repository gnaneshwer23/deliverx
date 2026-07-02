import { describe, expect, it } from "vitest";
import {
  COMING_SOON,
  LIVE_FEATURES,
  PILOT_QUOTE,
  PROOF_STATS,
  QUICK_START_STEPS,
} from "@/lib/marketing/landing-data";

describe("landing-data G5", () => {
  it("lists nine live features with title and description", () => {
    expect(LIVE_FEATURES).toHaveLength(9);
    for (const feature of LIVE_FEATURES) {
      expect(feature.title.trim().length).toBeGreaterThan(0);
      expect(feature.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("lists three coming-soon items", () => {
    expect(COMING_SOON).toHaveLength(3);
    for (const item of COMING_SOON) {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps pilot quote disabled until approved", () => {
    expect(PILOT_QUOTE.enabled).toBe(false);
    expect(PILOT_QUOTE.quote.trim()).toBe("");
  });

  it("lists three honest pilot platform stats", () => {
    expect(PROOF_STATS).toHaveLength(3);
    for (const stat of PROOF_STATS) {
      expect(stat.n.trim().length).toBeGreaterThan(0);
      expect(stat.label.trim().length).toBeGreaterThan(0);
      expect(stat.desc.trim().length).toBeGreaterThan(0);
    }
  });

  it("lists three quick-start steps for the hero strip", () => {
    expect(QUICK_START_STEPS).toHaveLength(3);
    for (const step of QUICK_START_STEPS) {
      expect(step.step.trim().length).toBeGreaterThan(0);
      expect(step.label.trim().length).toBeGreaterThan(0);
      expect(step.detail.trim().length).toBeGreaterThan(0);
    }
  });
});
