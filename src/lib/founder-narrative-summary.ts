/**
 * R4 — Founder board memo narrative synthesis.
 * Business outcomes only: runway, strategy, portfolio, decisions — not delivery ops.
 */

export type BuildFounderBoardMemoNarrativeInput = {
  projectName?: string | null;
  runwayMonths: number;
  pendingDecisionsCount: number;
  pendingReviewCount: number;
  portfolioOnTrack: number;
  portfolioTotal: number;
  primaryObjectiveProgress?: number | null;
  primaryObjectiveTitle?: string | null;
  runwayBelowThreshold?: boolean;
  fallbackSummary?: string;
};

const DEFAULT_FOUNDER_SUMMARY =
  "Upload your pitch deck or business case to generate company summary, runway, and strategic objectives.";

/** One-paragraph executive narrative: what changed and what needs founder attention. */
export function buildFounderBoardMemoNarrative(
  input: BuildFounderBoardMemoNarrativeInput,
): string {
  const prefix = input.projectName ? `${input.projectName} — ` : "";
  const signals: string[] = [];

  if (input.runwayMonths < 6 || input.runwayBelowThreshold) {
    signals.push(
      `runway is at ${input.runwayMonths} months and needs a funding decision`,
    );
  } else if (input.runwayMonths < 12) {
    signals.push(`runway at ${input.runwayMonths} months is worth monitoring this quarter`);
  }

  if (input.portfolioTotal > 0) {
    const offTrack = input.portfolioTotal - input.portfolioOnTrack;
    if (offTrack > 0) {
      signals.push(
        `${offTrack} of ${input.portfolioTotal} portfolio goal${input.portfolioTotal === 1 ? "" : "s"} off track`,
      );
    }
  }

  if (
    input.primaryObjectiveProgress != null &&
    input.primaryObjectiveTitle &&
    input.primaryObjectiveProgress < 70
  ) {
    signals.push(
      `"${input.primaryObjectiveTitle}" is at ${Math.round(input.primaryObjectiveProgress)}% against quarter target`,
    );
  }

  if (input.pendingDecisionsCount > 0) {
    signals.push(
      `${input.pendingDecisionsCount} decision${input.pendingDecisionsCount === 1 ? "" : "s"} waiting on you`,
    );
  }

  if (input.pendingReviewCount > 0) {
    signals.push(
      `${input.pendingReviewCount} AI output${input.pendingReviewCount === 1 ? "" : "s"} need executive sign-off`,
    );
  }

  if (signals.length === 0) {
    if (input.fallbackSummary && input.fallbackSummary !== DEFAULT_FOUNDER_SUMMARY) {
      return input.fallbackSummary;
    }
    return `${prefix}Portfolio and runway are within range — no decisions blocking the business this week.`;
  }

  const lead =
    signals.length === 1
      ? `Since you last looked, ${signals[0]}.`
      : `Since you last looked: ${signals.slice(0, 3).join("; ")}.`;

  return `${prefix}${lead.charAt(0).toUpperCase()}${lead.slice(1)}`;
}

export type BuildFounderBoardMemoSubtitleInput = {
  projectName?: string | null;
  pendingDecisionsCount: number;
  pendingReviewCount: number;
};

/** Header subtitle for board memo — executive tone, not ops control room. */
export function buildFounderBoardMemoSubtitle(
  input: BuildFounderBoardMemoSubtitleInput,
): string {
  const project = input.projectName ? `${input.projectName} — ` : "";
  const parts: string[] = [];

  if (input.pendingDecisionsCount > 0) {
    parts.push(
      `${input.pendingDecisionsCount} decision${input.pendingDecisionsCount === 1 ? "" : "s"} for you`,
    );
  }
  if (input.pendingReviewCount > 0) {
    parts.push(
      `${input.pendingReviewCount} item${input.pendingReviewCount === 1 ? "" : "s"} to sign off`,
    );
  }

  if (parts.length === 0) {
    return `${project}Board memo — on track, nothing needs your decision today.`;
  }

  return `${project}${parts.join(" · ")}.`;
}
