import { describe, expect, it } from "vitest";
import {
  CAPABILITY_BAND_COPY,
  CONFIDENCE_BAND_ALGORITHM_VERSION,
  CONFIDENCE_DISPLAY_BAND_COPY,
  capabilityBandExplainLine,
  confidenceDisplayExplainLine,
  formatCapabilityBandLabel,
  formatConfidenceDisplayLabel,
  mapConfidenceToDisplayBand,
  mapSignalsToCapabilityBand,
  whyThisCapabilityBand,
} from "@/lib/capability-engine/confidence-bands";
import { CAPABILITY_LEVELS } from "@/lib/capability-engine/types";

describe("confidence-bands@2026.1", () => {
  it("exports the pinned algorithm version", () => {
    expect(CONFIDENCE_BAND_ALGORITHM_VERSION).toBe("confidence-bands@2026.1");
  });

  it("has copy for every capability band", () => {
    for (const level of CAPABILITY_LEVELS) {
      expect(CAPABILITY_BAND_COPY[level].label.length).toBeGreaterThan(0);
      expect(CAPABILITY_BAND_COPY[level].whyThisBand.toLowerCase()).toContain(
        level === "insufficient_evidence" ? "evidence" : level.slice(0, 5),
      );
      expect(whyThisCapabilityBand(level)).toBe(
        CAPABILITY_BAND_COPY[level].whyThisBand,
      );
    }
  });

  it("maps knowledge-only or empty practice to insufficient_evidence", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.9,
        practiceEvidenceCount: 3,
        hasVerified: true,
        knowledgeOnly: true,
      }),
    ).toBe("insufficient_evidence");
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.9,
        practiceEvidenceCount: 0,
        hasVerified: false,
        knowledgeOnly: false,
      }),
    ).toBe("insufficient_evidence");
  });

  it("maps verified high-strength repeated practice to advanced", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.8,
        practiceEvidenceCount: 2,
        hasVerified: true,
        knowledgeOnly: false,
      }),
    ).toBe("advanced");
  });

  it("maps verified mid-high strength to proficient", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.65,
        practiceEvidenceCount: 1,
        hasVerified: true,
        knowledgeOnly: false,
      }),
    ).toBe("proficient");
  });

  it("maps repeated strong practice without verification to proficient", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.55,
        practiceEvidenceCount: 2,
        hasVerified: false,
        knowledgeOnly: false,
      }),
    ).toBe("proficient");
  });

  it("maps mid strength or repeated practice to developing", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.42,
        practiceEvidenceCount: 1,
        hasVerified: false,
        knowledgeOnly: false,
      }),
    ).toBe("developing");
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.3,
        practiceEvidenceCount: 2,
        hasVerified: false,
        knowledgeOnly: false,
      }),
    ).toBe("developing");
  });

  it("maps low strength single practice to emerging", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.28,
        practiceEvidenceCount: 1,
        hasVerified: false,
        knowledgeOnly: false,
      }),
    ).toBe("emerging");
  });

  it("maps very weak signals to insufficient_evidence", () => {
    expect(
      mapSignalsToCapabilityBand({
        avgStrength: 0.1,
        practiceEvidenceCount: 1,
        hasVerified: false,
        knowledgeOnly: false,
      }),
    ).toBe("insufficient_evidence");
  });

  it("maps confidence to display bands without exposing %", () => {
    expect(mapConfidenceToDisplayBand(0.9)).toBe("higher");
    expect(mapConfidenceToDisplayBand(0.75)).toBe("higher");
    expect(mapConfidenceToDisplayBand(0.5)).toBe("moderate");
    expect(mapConfidenceToDisplayBand(0.45)).toBe("moderate");
    expect(mapConfidenceToDisplayBand(0.44)).toBe("lower");
    expect(mapConfidenceToDisplayBand(Number.NaN)).toBe("lower");
    expect(formatConfidenceDisplayLabel(0.8)).toBe(
      CONFIDENCE_DISPLAY_BAND_COPY.higher.label,
    );
    expect(formatConfidenceDisplayLabel(0.8)).not.toMatch(/%/);
  });

  it("formats explain lines for UI", () => {
    expect(formatCapabilityBandLabel("developing")).toBe("Developing");
    expect(capabilityBandExplainLine("emerging")).toContain("Why this band:");
    expect(confidenceDisplayExplainLine(0.5)).toContain("Why this band:");
    expect(capabilityBandExplainLine("custom_band")).toBe("custom band");
  });
});
