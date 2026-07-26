/**
 * Experience onboarding setup signal — qualitative only.
 * Never present as capability readiness or an unexplained percentage.
 */

export type SetupSignalBand =
  | "Building foundations"
  | "Developing fluency"
  | "Strengthening judgment"
  | "Ready to practise under pressure";

export const SETUP_SIGNAL_HONESTY =
  "Self-reported setup signal — not capability or interview readiness";

export function setupSignalBand(confidenceRaw: string | number): SetupSignalBand {
  const confidence = Number(confidenceRaw);
  const level = Number.isFinite(confidence) ? confidence : 3;
  if (level <= 2) return "Building foundations";
  if (level <= 3) return "Developing fluency";
  if (level <= 4) return "Strengthening judgment";
  return "Ready to practise under pressure";
}

export function setupSignalFocus(input: {
  workStyle: string;
  selectedSkill: string;
  learningStyle: string;
}): { strengths: string[]; growth: string[] } {
  return {
    strengths: [input.workStyle, input.selectedSkill, input.learningStyle],
    growth: ["Stakeholder tension", "Commercial tradeoffs", "Evidence quality"],
  };
}
