/**
 * R4 — Founder Decision Centre builder (2–4 items, plain English, approve/decide CTAs).
 */

import { buildFounderProposalsHref } from "@/lib/founder-day-one-panels";
import { buildFounderDecisionCentreHref } from "@/lib/founder-steady-state-panels";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { FounderDecisionRow } from "@/services/founderEngine";

export const FOUNDER_DECISION_CENTRE_MIN = 2;
export const FOUNDER_DECISION_CENTRE_MAX = 4;

export type FounderDecisionCentreItem = {
  id: string;
  title: string;
  context: string;
  impact: "High" | "Medium" | "Low";
  kind: "decision" | "approval" | "review";
  row?: FounderDecisionRow;
  reviewId?: string;
  href?: string;
  waitLabel: string;
  waitSortDays: number;
};

function waitLabelFromDays(days: number): string {
  if (days <= 0) return "Waiting today";
  if (days === 1) return "Waiting 1 day";
  return `Waiting ${days} days`;
}

function plainEnglishDecision(decision: FounderDecisionRow): string {
  const project = decision.projectName ? ` for ${decision.projectName}` : "";
  if (decision.kind === "approval") {
    return `Executive approval required${project} — ${decision.impact.toLowerCase()} impact on delivery commitments.`;
  }
  return `Your sign-off unlocks the next milestone${project}.`;
}

function plainEnglishReview(review: ArtifactReviewRow): string {
  return review.summary
    ? review.summary.slice(0, 120)
    : "AI-generated output ready for executive review before the team proceeds.";
}

function normalizeImpact(impact: string): FounderDecisionCentreItem["impact"] {
  if (impact === "High" || impact === "Medium" || impact === "Low") return impact;
  return "Medium";
}

function impactSortWeight(impact: FounderDecisionCentreItem["impact"]): number {
  if (impact === "High") return 0;
  if (impact === "Medium") return 1;
  return 2;
}

export type BuildFounderDecisionCentreInput = {
  decisions: FounderDecisionRow[];
  pendingReviews: ArtifactReviewRow[];
  projectId?: string | null;
  mode?: "day-one" | "steady-state";
};

/** Build 2–4 decision items for the founder board memo — reviews first on day-one. */
export function buildFounderDecisionCentreItems(
  input: BuildFounderDecisionCentreInput,
): FounderDecisionCentreItem[] {
  const items: FounderDecisionCentreItem[] = [];
  const mode = input.mode ?? "steady-state";
  const reviewLimit = mode === "day-one" ? 2 : 1;

  for (const review of input.pendingReviews.slice(0, reviewLimit)) {
    items.push({
      id: `review-${review.id}`,
      title: review.title,
      context: plainEnglishReview(review),
      impact: "Medium",
      kind: "review",
      reviewId: review.id,
      href: buildFounderProposalsHref(input.projectId ?? undefined, review.id),
      waitLabel: waitLabelFromDays(mode === "day-one" ? 0 : 2),
      waitSortDays: mode === "day-one" ? 0 : 2,
    });
  }

  for (const decision of input.decisions) {
    if (items.length >= FOUNDER_DECISION_CENTRE_MAX) break;
    const waitDays = decision.impact === "High" ? 0 : decision.impact === "Medium" ? 2 : 5;
    items.push({
      id: `${decision.kind}-${decision.id}`,
      title: decision.title,
      context: plainEnglishDecision(decision),
      impact: normalizeImpact(decision.impact),
      kind: decision.kind,
      row: decision,
      href: buildFounderDecisionCentreHref(input.projectId),
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
    });
  }

  return items
    .sort((a, b) => {
      if (mode === "day-one") {
        if (a.kind === "review" && b.kind !== "review") return -1;
        if (b.kind === "review" && a.kind !== "review") return 1;
      }
      return (
        a.waitSortDays - b.waitSortDays ||
        impactSortWeight(a.impact) - impactSortWeight(b.impact) ||
        a.title.localeCompare(b.title)
      );
    })
    .slice(0, FOUNDER_DECISION_CENTRE_MAX);
}

export function hasFounderDecisionCentreItems(items: FounderDecisionCentreItem[]): boolean {
  return items.length > 0;
}
