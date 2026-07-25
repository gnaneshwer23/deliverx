import { describe, expect, it } from "vitest";
import {
  CAPABILITY_ASSESSMENT_COPY,
  CAREER_PRODUCT_COPY,
  readinessKindUserLabel,
} from "@/lib/ux/capability-assessment-copy";
import {
  readinessSourceChip,
  readinessSourceIsCapabilityTruth,
  readinessSourceLabel,
} from "@/lib/career-intelligence/readiness-honesty";
import { LAUNCHPAD_INCLUDES } from "@/lib/marketing/career-suite";

const BANNED_SCORERUN = /ScoreRun|score run/i;
const BANNED_COMMAND = /Command Centre|Mission Control/i;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
  return out;
}

describe("Batch 3 — UX language honesty", () => {
  it("exports capability assessment CTAs without ScoreRun jargon", () => {
    const strings = collectStrings(CAPABILITY_ASSESSMENT_COPY);
    expect(strings.length).toBeGreaterThan(10);
    for (const s of strings) {
      expect(s).not.toMatch(BANNED_SCORERUN);
    }
    expect(CAPABILITY_ASSESSMENT_COPY.runCta).toBe("Run assessment");
    expect(CAPABILITY_ASSESSMENT_COPY.latestHeading).toBe("Latest assessment");
  });

  it("uses Career Intelligence as the primary product name", () => {
    expect(CAREER_PRODUCT_COPY.productName).toBe("Career Intelligence");
    expect(CAREER_PRODUCT_COPY.hubJourneyName).toBe("Career Intelligence");
    expect(CAREER_PRODUCT_COPY.hubCta).toContain("Career Intelligence");
    expect(collectStrings(CAREER_PRODUCT_COPY).join(" ")).not.toMatch(BANNED_COMMAND);
  });

  it("labels readiness sources without presenting heuristic as capability truth", () => {
    expect(readinessSourceLabel("score_run")).not.toMatch(BANNED_SCORERUN);
    expect(readinessSourceLabel("evidence_coverage_heuristic")).toMatch(/heuristic/i);
    expect(readinessSourceLabel("evidence_coverage_heuristic")).toMatch(/not capability/i);
    expect(readinessSourceLabel("mixed")).toMatch(/heuristic/i);
    expect(readinessSourceChip("score_run")).toMatch(/capability assessment/i);
    expect(readinessKindUserLabel("score_run_projection")).toMatch(/assessment projection/i);
    expect(readinessKindUserLabel("evidence_coverage")).toMatch(/heuristic/i);
    expect(readinessSourceIsCapabilityTruth("score_run")).toBe(false);
    expect(readinessSourceIsCapabilityTruth("evidence_coverage_heuristic")).toBe(false);
    expect(readinessSourceIsCapabilityTruth("mixed")).toBe(false);
  });

  it("keeps Launchpad marketing includes free of ScoreRun jargon", () => {
    for (const line of LAUNCHPAD_INCLUDES) {
      expect(line).not.toMatch(BANNED_SCORERUN);
    }
  });
});
