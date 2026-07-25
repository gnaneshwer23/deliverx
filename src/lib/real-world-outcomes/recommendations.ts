/**
 * Outcome-driven recommendation adjustments.
 *
 * Career Intelligence uses outcomes to reprioritise recommendations/roadmap — it never
 * changes capability. Capability levels remain solely a ScoreRun product. Outcomes can
 * PROMPT a ScoreRun / roadmap refresh; they never silently rewrite the profile.
 */

import type { RoadmapAction } from "@/lib/career-intelligence/types";
import type {
  CalibrationFinding,
  OutcomeEventRecord,
  OutcomeEventType,
} from "@/lib/real-world-outcomes/types";

/**
 * Move roadmap actions that close evidence gaps implicated by calibration findings to
 * the front, and annotate why. Pure; does not touch capability.
 */
export function reprioritiseRoadmapFromOutcomes(
  roadmap: RoadmapAction[],
  findings: CalibrationFinding[],
): RoadmapAction[] {
  const implicated = new Set(
    findings
      .flatMap((f) => f.implicatedGaps)
      .map((g) => g.toLowerCase())
      .filter(Boolean),
  );
  if (implicated.size === 0) return roadmap;

  const scored = roadmap.map((action, index) => {
    const haystack = [
      action.title,
      action.rationale,
      ...action.closesRequirementIds,
    ]
      .join(" ")
      .toLowerCase();
    const hit = Array.from(implicated).some((gap) => {
      const token = gap.split(/[:\s]/)[0];
      return token.length > 2 && haystack.includes(token);
    });
    return { action, index, hit };
  });

  return scored
    .sort((a, b) => (a.hit === b.hit ? a.index - b.index : a.hit ? -1 : 1))
    .map(({ action, hit }) =>
      hit
        ? {
            ...action,
            rationale: `${action.rationale} Prioritised because recent real-world outcomes implicate this evidence gap.`,
          }
        : action,
    );
}

/** Event types that warrant prompting (never auto-running) a ScoreRun / roadmap refresh. */
const REFRESH_PROMPTING_EVENTS: ReadonlySet<OutcomeEventType> = new Set([
  "interview_feedback",
  "rejection",
  "offer_received",
  "performance_feedback",
  "promotion_achieved",
  "external_project_completed",
]);

export type ScoreRunPrompt = {
  prompt: boolean;
  /** Never true in the outcome loop — surfaced for callers/tests to assert on. */
  scoreRunTriggered: false;
  reason: string | null;
  href: string;
};

/**
 * Decide whether to PROMPT a ScoreRun refresh after an outcome. Never auto-runs.
 * A prompt appears for material outcomes (feedback, rejection, offer, promotion,
 * delivered project) so the person can choose to re-evaluate on real evidence.
 */
export function scoreRunPromptForOutcome(input: {
  eventType: OutcomeEventType;
  findings?: CalibrationFinding[];
  evidenceHref?: string;
}): ScoreRunPrompt {
  const href = input.evidenceHref ?? "/profile/evidence?run=1";
  const hasActionFinding = (input.findings ?? []).some((f) => f.severity === "action");
  const prompt = REFRESH_PROMPTING_EVENTS.has(input.eventType) || hasActionFinding;
  return {
    prompt,
    scoreRunTriggered: false,
    reason: prompt
      ? "This outcome may change your gaps. You can re-run ScoreRun on your evidence — it will not run automatically, and this outcome will not change any capability level on its own."
      : null,
    href,
  };
}

/**
 * Growth/Profile narrative fragment for loop closure. Text only — never a claim of
 * verification or capability.
 */
export function outcomeNarrativeFragment(events: OutcomeEventRecord[]): string | null {
  if (events.length === 0) return null;
  const positives = events.filter(
    (e) =>
      e.eventType === "offer_received" ||
      e.eventType === "job_started" ||
      e.eventType === "promotion_achieved" ||
      e.eventType === "external_project_completed",
  ).length;
  const interviews = events.filter((e) => e.eventType === "interview_attended").length;
  const applications = events.filter((e) => e.eventType === "application_submitted").length;
  const bits: string[] = [];
  if (applications) bits.push(`${applications} application${applications === 1 ? "" : "s"}`);
  if (interviews) bits.push(`${interviews} interview${interviews === 1 ? "" : "s"}`);
  if (positives) bits.push(`${positives} positive outcome${positives === 1 ? "" : "s"}`);
  if (bits.length === 0) return null;
  return `Real-world record (self-reported): ${bits.join(", ")}. Outcomes are self-reported and do not change capability levels.`;
}
