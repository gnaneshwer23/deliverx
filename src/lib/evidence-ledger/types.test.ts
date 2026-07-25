import { describe, expect, it } from "vitest";
import {
  computeEvidenceContentHash,
  defaultCategoryForSource,
  initialStatusFromCapture,
  isPiEvidenceSourceType,
} from "@/lib/evidence-ledger/types";

describe("evidence ledger types", () => {
  it("accepts required source types", () => {
    expect(isPiEvidenceSourceType("decision")).toBe(true);
    expect(isPiEvidenceSourceType("launchpad_interview")).toBe(true);
    expect(isPiEvidenceSourceType("baseline_assessment")).toBe(true);
    expect(isPiEvidenceSourceType("not_a_source")).toBe(false);
  });

  it("maps learning to knowledge category", () => {
    expect(defaultCategoryForSource("learning_activity")).toBe("knowledge");
    expect(defaultCategoryForSource("decision")).toBe("practice");
  });

  it("never treats experience capture as platform_verified by default", () => {
    expect(initialStatusFromCapture("decision")).toBe("observed");
    expect(initialStatusFromCapture("experience_project")).toBe("observed");
  });

  it("computes stable content hashes", () => {
    const a = computeEvidenceContentHash({
      sourceType: "decision",
      title: "Ship the MVP",
      rawContent: { b: 2, a: 1 },
    });
    const b = computeEvidenceContentHash({
      sourceType: "decision",
      title: "Ship the MVP",
      rawContent: { a: 1, b: 2 },
    });
    const c = computeEvidenceContentHash({
      sourceType: "decision",
      title: "Ship the MVP!",
      rawContent: { a: 1, b: 2 },
    });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});
