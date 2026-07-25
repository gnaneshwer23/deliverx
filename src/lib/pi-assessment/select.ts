/**
 * Adaptive item selection — targets remaining competency uncertainty.
 * Deterministic for the pilot (no silent LLM capability assignment).
 */

import type { AssessmentCatalogItem, AssessmentItemKind } from "@/lib/pi-assessment/types";

export type SelectionContext = {
  catalog: AssessmentCatalogItem[];
  /** Competency codes already covered by answered items */
  coveredCompetencies: Set<string>;
  /** Slugs already selected in this session */
  selectedSlugs: Set<string>;
  /** Prefer these kinds early (interview → scenario → work_sample → reflection) */
  answeredKinds: Set<AssessmentItemKind>;
  maxItems: number;
  currentItemCount: number;
};

export type SelectedItem = AssessmentCatalogItem & {
  selectionReason: string;
};

const KIND_PRIORITY: AssessmentItemKind[] = [
  "interview",
  "scenario",
  "work_sample",
  "reflection",
  "decision",
  "transfer",
];

function kindRank(kind: AssessmentItemKind): number {
  const i = KIND_PRIORITY.indexOf(kind);
  return i < 0 ? 99 : i;
}

/**
 * Score an item by how much remaining uncertainty it addresses.
 * Higher = better next pick. Never assigns a capability level.
 */
export function scoreCatalogItem(
  item: AssessmentCatalogItem,
  ctx: Pick<SelectionContext, "coveredCompetencies" | "answeredKinds">,
): { score: number; reason: string } {
  const uncovered = item.competencyCodes.filter((c) => !ctx.coveredCompetencies.has(c));
  const uncoveredScore = uncovered.length * 10;
  const kindBonus =
    !ctx.answeredKinds.has(item.kind) &&
    (item.kind === "interview" ||
      item.kind === "scenario" ||
      item.kind === "work_sample" ||
      item.kind === "reflection")
      ? 5
      : 0;
  // Prefer earlier kinds until represented
  const progressionBonus = Math.max(0, 4 - kindRank(item.kind));
  const score = uncoveredScore + kindBonus + progressionBonus;

  const reasonParts: string[] = [];
  if (uncovered.length) {
    reasonParts.push(`covers_uncertain:${uncovered.join(",")}`);
  } else {
    reasonParts.push("deepens_covered");
  }
  if (kindBonus) reasonParts.push(`new_kind:${item.kind}`);
  reasonParts.push(`prompt_version:baseline-select-v1`);

  return { score, reason: reasonParts.join("|") };
}

/**
 * Pick the next catalog item, or null when the session should stop.
 */
export function selectNextAssessmentItem(ctx: SelectionContext): SelectedItem | null {
  if (ctx.currentItemCount >= ctx.maxItems) return null;

  const candidates = ctx.catalog
    .filter((item) => !ctx.selectedSlugs.has(item.slug))
    .map((item) => {
      const { score, reason } = scoreCatalogItem(item, ctx);
      return { item, score, reason };
    })
    .filter((c) => c.score > 0 || ctx.currentItemCount === 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.item.sortOrder !== b.item.sortOrder) {
        return a.item.sortOrder - b.item.sortOrder;
      }
      return a.item.slug.localeCompare(b.item.slug);
    });

  // If everything is covered but we still have room and no reflection yet, force reflection.
  if (!candidates.length) {
    const reflection = ctx.catalog.find(
      (i) => i.kind === "reflection" && !ctx.selectedSlugs.has(i.slug),
    );
    if (reflection && ctx.currentItemCount < ctx.maxItems) {
      return {
        ...reflection,
        selectionReason: "closing_reflection|prompt_version:baseline-select-v1",
      };
    }
    return null;
  }

  const top = candidates[0]!;
  // Stop early once we have interview + scenario + (work_sample|reflection) and all comps covered
  const hasInterview = ctx.answeredKinds.has("interview") || top.item.kind === "interview";
  const hasScenario = ctx.answeredKinds.has("scenario") || top.item.kind === "scenario";
  const hasClosing =
    ctx.answeredKinds.has("work_sample") ||
    ctx.answeredKinds.has("reflection") ||
    top.item.kind === "work_sample" ||
    top.item.kind === "reflection";
  const allCovered =
    ctx.catalog
      .flatMap((c) => c.competencyCodes)
      .every((c) => ctx.coveredCompetencies.has(c) || top.item.competencyCodes.includes(c)) &&
    ctx.coveredCompetencies.size > 0;

  if (
    ctx.currentItemCount >= 4 &&
    hasInterview &&
    hasScenario &&
    hasClosing &&
    allCovered &&
    top.score < 10 &&
    top.item.kind !== "reflection"
  ) {
    const reflection = ctx.catalog.find(
      (i) => i.kind === "reflection" && !ctx.selectedSlugs.has(i.slug),
    );
    if (reflection) {
      return {
        ...reflection,
        selectionReason: "closing_reflection|prompt_version:baseline-select-v1",
      };
    }
    return null;
  }

  return { ...top.item, selectionReason: top.reason };
}

/** Pre-select a balanced opening set for a new session (deterministic). */
export function selectOpeningItems(
  catalog: AssessmentCatalogItem[],
  maxItems: number,
): SelectedItem[] {
  const selected: SelectedItem[] = [];
  const covered = new Set<string>();
  const selectedSlugs = new Set<string>();
  const answeredKinds = new Set<AssessmentItemKind>();

  while (selected.length < maxItems) {
    const next = selectNextAssessmentItem({
      catalog,
      coveredCompetencies: covered,
      selectedSlugs,
      answeredKinds,
      maxItems,
      currentItemCount: selected.length,
    });
    if (!next) break;
    selected.push(next);
    selectedSlugs.add(next.slug);
    for (const c of next.competencyCodes) covered.add(c);
    answeredKinds.add(next.kind);
  }

  return selected;
}
