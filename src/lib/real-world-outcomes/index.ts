/**
 * Real-world outcome loop — public API.
 * Outcomes are self-reported evidence; never capability, never externally verified (P8).
 */

export * from "@/lib/real-world-outcomes/types";
export {
  deriveOutcomeStrength,
  defaultSentimentFor,
  buildOutcomeEvidenceInput,
  summariseOutcomes,
  outcomeValidatesStrengthLabel,
} from "@/lib/real-world-outcomes/outcomes";
export {
  detectCalibrationFindings,
  type CalibrationContext,
} from "@/lib/real-world-outcomes/calibration";
export {
  reprioritiseRoadmapFromOutcomes,
  scoreRunPromptForOutcome,
  outcomeNarrativeFragment,
  type ScoreRunPrompt,
} from "@/lib/real-world-outcomes/recommendations";
export {
  listOutcomeEvents,
  listCalibrationFindings,
  recordOutcomeEvent,
  refreshCalibrationFindings,
  loadOutcomeContext,
} from "@/lib/real-world-outcomes/persist";
