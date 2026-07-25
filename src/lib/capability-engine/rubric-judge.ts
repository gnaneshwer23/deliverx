import type { RubricDefinition } from "@/lib/capability-engine/rubric";
import { levelRank } from "@/lib/capability-engine/rubric";
import type {
  CapabilityLevel,
  MappedIndicator,
  NormalisedEvidence,
  StructuredJudgement,
} from "@/lib/capability-engine/types";
import {
  DEFAULT_MODEL_VERSION,
  DEFAULT_PROMPT_VERSION,
} from "@/lib/capability-engine/types";

function proposeLevel(
  strength: number,
  count: number,
  hasVerified: boolean,
  knowledgeOnly: boolean,
): CapabilityLevel {
  if (knowledgeOnly || count === 0) return "insufficient_evidence";
  if (hasVerified && strength >= 0.75 && count >= 2) return "advanced";
  if (hasVerified && strength >= 0.6) return "proficient";
  if (strength >= 0.55 && count >= 2) return "proficient";
  if (strength >= 0.4 || count >= 2) return "developing";
  if (strength >= 0.25) return "emerging";
  return "insufficient_evidence";
}

/** Rubric Judge — judges against versioned anchors; returns structured judgements only. */
export function judgeAgainstRubric(input: {
  mappings: MappedIndicator[];
  evidenceById: Map<string, NormalisedEvidence>;
  rubric: RubricDefinition;
  forceMalformed?: boolean;
}): StructuredJudgement[] {
  if (input.forceMalformed) {
    // Intentionally invalid — orchestrator must catch/reject.
    return [
      {
        competencyId: "",
        indicatorId: "",
        levelProposed: "emerging",
        evidenceReferences: [],
        reasoningSummary: "",
        counterEvidence: "",
        confidence: Number.NaN,
        limitations: "",
        modelVersion: DEFAULT_MODEL_VERSION,
        promptVersion: DEFAULT_PROMPT_VERSION,
        rubricVersion: input.rubric.version,
        reviewStatus: "pending_review",
        intelligenceKinds: [],
      },
    ];
  }

  const groups = new Map<string, MappedIndicator[]>();
  for (const m of input.mappings) {
    const key = `${m.competencyId}::${m.indicatorId}`;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  const judgements: StructuredJudgement[] = [];

  for (const [, group] of groups) {
    const first = group[0]!;
    const evidenceIds = [...new Set(group.map((g) => g.evidenceId))];
    const items = evidenceIds
      .map((id) => input.evidenceById.get(id))
      .filter(Boolean) as NormalisedEvidence[];

    const knowledgeOnly = items.every((i) => i.isKnowledgeOnly);
    const hasVerified = items.some(
      (i) =>
        i.status === "platform_verified" || i.sourceType === "external_verification",
    );
    const avgStrength =
      group.reduce((s, g) => s + g.strengthHint, 0) / Math.max(group.length, 1);

    const level = proposeLevel(
      avgStrength,
      items.filter((i) => !i.isKnowledgeOnly).length,
      hasVerified,
      knowledgeOnly,
    );

    const indicatorKey = Object.keys(input.rubric.indicators).find(
      (k) => input.rubric.indicators[k]?.indicatorId === first.indicatorId,
    );
    const anchor =
      indicatorKey && level !== "insufficient_evidence"
        ? input.rubric.indicators[indicatorKey]?.anchors[
            level as Exclude<CapabilityLevel, "insufficient_evidence">
          ]
        : null;

    const kinds = [...new Set(group.flatMap((g) => g.intelligenceKinds))];

    judgements.push({
      competencyId: first.competencyId,
      indicatorId: first.indicatorId,
      levelProposed: level,
      evidenceReferences: evidenceIds,
      reasoningSummary:
        level === "insufficient_evidence"
          ? knowledgeOnly
            ? "Evidence is knowledge-oriented (e.g. learning completion) and does not demonstrate applied competency on its own."
            : "Not enough eligible practice evidence to propose a competency level."
          : `Proposed ${level} for ${first.indicatorId} from ${evidenceIds.length} demonstration(s)${
              anchor ? ` against rubric anchor: “${anchor}”` : ""
            }.`,
      counterEvidence: items
        .filter((i) => i.status === "disputed" || i.isAiDominated)
        .map((i) => i.id)
        .join(", "),
      confidence: 0, // filled by confidence calculator
      limitations: knowledgeOnly
        ? "Knowledge evidence cannot alone establish competency."
        : hasVerified
          ? ""
          : "No externally verified evidence in this set.",
      modelVersion: DEFAULT_MODEL_VERSION,
      promptVersion: DEFAULT_PROMPT_VERSION,
      rubricVersion: input.rubric.version,
      reviewStatus: "accepted",
      intelligenceKinds: kinds.includes("competency")
        ? kinds
        : knowledgeOnly
          ? (["knowledge", "potential"] as const).slice()
          : kinds,
    });
  }

  // Stable order
  return judgements.sort(
    (a, b) =>
      a.competencyId.localeCompare(b.competencyId) ||
      levelRank(b.levelProposed) - levelRank(a.levelProposed),
  );
}

export function isWellFormedJudgement(j: StructuredJudgement): boolean {
  if (!j.competencyId || !j.indicatorId) return false;
  if (!j.reasoningSummary || j.reasoningSummary.length < 8) return false;
  if (!Number.isFinite(j.confidence) || j.confidence < 0 || j.confidence > 1) {
    // confidence may be filled later — allow NaN only before calculator
    if (Number.isNaN(j.confidence)) return true;
    return false;
  }
  if (!j.modelVersion || !j.promptVersion || !j.rubricVersion) return false;
  if (!j.reviewStatus) return false;
  return true;
}
