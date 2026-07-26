/**
 * Confidence-band algorithm — typed source of truth for capability bands and
 * confidence display bands. Docs: `docs/engineering/confidence-band-algorithm.md`.
 *
 * Non-goals: no unexplained % as capability truth; learning ≠ capability;
 * ScoreRun / band mapping alone never lights Verified.
 */

import type { CapabilityLevel } from "@/lib/capability-engine/types";
import { CAPABILITY_LEVELS } from "@/lib/capability-engine/types";

/** Pinned algorithm version — keep in sync with the engineering algorithm note. */
export const CONFIDENCE_BAND_ALGORITHM_VERSION = "confidence-bands@2026.1" as const;

export type ConfidenceBandAlgorithmVersion =
  typeof CONFIDENCE_BAND_ALGORITHM_VERSION;

/** Capability bands are the Capability Engine levels (PD-2026-07-05). */
export const CAPABILITY_BANDS = CAPABILITY_LEVELS;
export type CapabilityBand = CapabilityLevel;

/** Qualitative confidence strength shown in UI — never as a decorative %. */
export const CONFIDENCE_DISPLAY_BANDS = ["higher", "moderate", "lower"] as const;
export type ConfidenceDisplayBand = (typeof CONFIDENCE_DISPLAY_BANDS)[number];

export const CONFIDENCE_DISPLAY_THRESHOLDS = {
  higherMin: 0.75,
  moderateMin: 0.45,
} as const;

/** Inputs the band mapper actually uses (mirrors rubric-judge signals). */
export type CapabilityBandSignals = {
  /** Mean evidence→indicator strength hint in [0, 1]. */
  avgStrength: number;
  /** Count of non-knowledge-only practice evidence items. */
  practiceEvidenceCount: number;
  /** True when any cited item is platform_verified or external_verification. */
  hasVerified: boolean;
  /** True when every cited item is knowledge-only (learning ≠ capability). */
  knowledgeOnly: boolean;
};

/**
 * Map evidence signals to a capability band.
 * Rules must stay aligned with `docs/engineering/confidence-band-algorithm.md`.
 */
export function mapSignalsToCapabilityBand(
  signals: CapabilityBandSignals,
): CapabilityBand {
  const { avgStrength, practiceEvidenceCount, hasVerified, knowledgeOnly } =
    signals;

  if (knowledgeOnly || practiceEvidenceCount === 0) {
    return "insufficient_evidence";
  }
  if (hasVerified && avgStrength >= 0.75 && practiceEvidenceCount >= 2) {
    return "advanced";
  }
  if (hasVerified && avgStrength >= 0.6) {
    return "proficient";
  }
  if (avgStrength >= 0.55 && practiceEvidenceCount >= 2) {
    return "proficient";
  }
  if (avgStrength >= 0.4 || practiceEvidenceCount >= 2) {
    return "developing";
  }
  if (avgStrength >= 0.25) {
    return "emerging";
  }
  return "insufficient_evidence";
}

/** Map internal confidence [0,1] to a display band — never show the raw %. */
export function mapConfidenceToDisplayBand(
  confidence: number,
): ConfidenceDisplayBand {
  if (
    !Number.isFinite(confidence) ||
    confidence < CONFIDENCE_DISPLAY_THRESHOLDS.moderateMin
  ) {
    return "lower";
  }
  if (confidence >= CONFIDENCE_DISPLAY_THRESHOLDS.higherMin) {
    return "higher";
  }
  return "moderate";
}

export const CAPABILITY_BAND_COPY: Record<
  CapabilityBand,
  { label: string; whyThisBand: string }
> = {
  emerging: {
    label: "Emerging",
    whyThisBand:
      "Limited practice evidence meets the emerging threshold. Stronger bands need more or verified demonstration.",
  },
  developing: {
    label: "Developing",
    whyThisBand:
      "Repeated or mid-strength practice evidence supports developing. Proficient needs higher strength and usually verification.",
  },
  proficient: {
    label: "Proficient",
    whyThisBand:
      "Practice evidence reaches proficient strength — typically with verification, or repeated strong demonstrations.",
  },
  advanced: {
    label: "Advanced",
    whyThisBand:
      "Multiple verified practice demonstrations at high strength support advanced against the rubric anchors.",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    whyThisBand:
      "Eligible practice evidence is missing or only knowledge-oriented. Learning completion alone does not establish capability.",
  },
};

export const CONFIDENCE_DISPLAY_BAND_COPY: Record<
  ConfidenceDisplayBand,
  { label: string; whyThisBand: string }
> = {
  higher: {
    label: "Higher confidence",
    whyThisBand:
      "Several practice citations and verified signals outweigh knowledge-only, AI-dominated, stale, or contradictory evidence.",
  },
  moderate: {
    label: "Moderate confidence",
    whyThisBand:
      "Some supporting practice evidence is present, but verification, recency, or contradiction still limits certainty.",
  },
  lower: {
    label: "Lower confidence",
    whyThisBand:
      "Few citations, knowledge-only or AI-dominated signals, stale evidence, or contradictions reduce certainty in this band.",
  },
};

export function isCapabilityBand(level: string): level is CapabilityBand {
  return (CAPABILITY_BANDS as readonly string[]).includes(level);
}

export function formatCapabilityBandLabel(level: string): string {
  if (isCapabilityBand(level)) return CAPABILITY_BAND_COPY[level].label;
  return level.replace(/_/g, " ");
}

export function whyThisCapabilityBand(level: string): string | null {
  if (!isCapabilityBand(level)) return null;
  return CAPABILITY_BAND_COPY[level].whyThisBand;
}

export function formatConfidenceDisplayLabel(confidence: number): string {
  return CONFIDENCE_DISPLAY_BAND_COPY[mapConfidenceToDisplayBand(confidence)]
    .label;
}

export function whyThisConfidenceDisplayBand(confidence: number): string {
  return CONFIDENCE_DISPLAY_BAND_COPY[mapConfidenceToDisplayBand(confidence)]
    .whyThisBand;
}

/** Calm one-line citation for UI — band label + why. */
export function capabilityBandExplainLine(level: string): string {
  const label = formatCapabilityBandLabel(level);
  const why = whyThisCapabilityBand(level);
  return why ? `${label} — Why this band: ${why}` : label;
}

export function confidenceDisplayExplainLine(confidence: number): string {
  const label = formatConfidenceDisplayLabel(confidence);
  const why = whyThisConfidenceDisplayBand(confidence);
  return `${label} — Why this band: ${why}`;
}
