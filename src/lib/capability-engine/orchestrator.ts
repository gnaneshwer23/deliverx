import { aggregateDemonstrations } from "@/lib/capability-engine/aggregate";
import {
  compareToTarget,
  defaultTargetRequirements,
  projectCapabilitySnapshot,
} from "@/lib/capability-engine/capability-projector";
import {
  applyConfidence,
  detectContradictions,
} from "@/lib/capability-engine/confidence-and-contradictions";
import { mapEvidenceToIndicators } from "@/lib/capability-engine/evidence-mapper";
import {
  deriveStrengthsAndGaps,
  compareGrowth,
  generateRecommendations,
} from "@/lib/capability-engine/growth-and-recommendations";
import {
  independentVerify,
  ModelFailureError,
} from "@/lib/capability-engine/independent-verifier";
import { normaliseEvidence } from "@/lib/capability-engine/normalise";
import { buildReviewQueue } from "@/lib/capability-engine/review-queue";
import { getRubric } from "@/lib/capability-engine/rubric";
import {
  isWellFormedJudgement,
  judgeAgainstRubric,
} from "@/lib/capability-engine/rubric-judge";
import {
  hashEvidenceSet,
  selectEligibleEvidence,
  validateProvenance,
} from "@/lib/capability-engine/select-and-validate";
import type { OrchestratorInput, OrchestratorResult } from "@/lib/capability-engine/types";
import {
  DEFAULT_RUBRIC_SLUG,
  DEFAULT_RUBRIC_VERSION,
} from "@/lib/capability-engine/types";

/**
 * Assessment Orchestrator — deterministic pipeline (steps 1–13).
 * Not a single LLM prompt: each step is a modular function.
 */
export function runCapabilityEngine(input: OrchestratorInput): OrchestratorResult {
  const stepsCompleted: string[] = [];
  const now = input.now ?? new Date();
  const rubricSlug = input.rubricSlug ?? DEFAULT_RUBRIC_SLUG;
  const rubricVersion = input.rubricVersion ?? DEFAULT_RUBRIC_VERSION;
  const rubric = getRubric(rubricSlug, rubricVersion);

  if (!rubric) {
    return {
      ok: false,
      duplicate: false,
      inputHash: "",
      error: `unknown_rubric:${rubricSlug}@${rubricVersion}`,
      judgements: [],
      snapshot: null,
      growth: null,
      reviewQueue: [],
      stepsCompleted,
    };
  }

  // 1. Select eligible evidence
  const { eligible, excluded } = selectEligibleEvidence(input.evidence, { now });
  stepsCompleted.push("select_eligible_evidence");

  const inputHash = hashEvidenceSet(eligible.map((e) => e.id));
  if (input.skipIfDuplicateHash && input.skipIfDuplicateHash === inputHash) {
    return {
      ok: true,
      duplicate: true,
      inputHash,
      judgements: [],
      snapshot: null,
      growth: null,
      reviewQueue: [],
      stepsCompleted: [...stepsCompleted, "duplicate_processing_short_circuit"],
    };
  }

  // 2. Validate provenance
  const provenanceFailed = eligible.filter((e) => !validateProvenance(e).ok);
  const provenanceOk = eligible.filter((e) => validateProvenance(e).ok);
  stepsCompleted.push("validate_provenance");

  // 3. Normalise
  const normalised = normaliseEvidence(provenanceOk, now);
  stepsCompleted.push("normalise_evidence");

  const evidenceById = new Map(normalised.map((e) => [e.id, e]));

  // 4. Map to indicators
  const mappings = mapEvidenceToIndicators(normalised, rubric);
  stepsCompleted.push("map_evidence_to_indicators");

  // Aggregate repeated demonstrations (feeds judge counts)
  aggregateDemonstrations(mappings, evidenceById);
  stepsCompleted.push("aggregate_repeated_demonstrations");

  try {
    // 5. Rubric judge
    let judgements = judgeAgainstRubric({
      mappings,
      evidenceById,
      rubric,
      forceMalformed: input.forceMalformedOutput,
    });
    stepsCompleted.push("judge_against_rubric");

    // Malformed structured output handling
    const malformed = judgements.filter((j) => {
      // Before confidence fill, NaN is allowed by isWellFormed; check structural fields
      return !j.competencyId || !j.indicatorId || !j.reasoningSummary;
    });
    if (input.forceMalformedOutput || malformed.length) {
      return {
        ok: false,
        duplicate: false,
        inputHash,
        error: "malformed_structured_output",
        judgements: [],
        snapshot: null,
        growth: null,
        reviewQueue: [
          {
            reason: "malformed_structured_output",
            payload: { count: malformed.length || judgements.length },
          },
        ],
        stepsCompleted,
      };
    }

    // 6. Independent verification
    const verified = independentVerify({
      judgements,
      evidenceById,
      forceModelFailure: input.forceModelFailure,
    });
    judgements = verified.judgements;
    stepsCompleted.push("independent_verification");

    // 8. Detect contradictions (before final confidence)
    const contradictions = detectContradictions({ judgements, evidenceById });
    stepsCompleted.push("detect_contradictions");

    // 7. Confidence
    judgements = applyConfidence(judgements, evidenceById, contradictions);
    // Final well-formed check after confidence
    if (judgements.some((j) => !isWellFormedJudgement(j))) {
      return {
        ok: false,
        duplicate: false,
        inputHash,
        error: "malformed_structured_output_after_confidence",
        judgements: [],
        snapshot: null,
        growth: null,
        reviewQueue: [{ reason: "malformed_structured_output", payload: {} }],
        stepsCompleted,
      };
    }
    stepsCompleted.push("calculate_confidence");

    const target = defaultTargetRequirements(
      input.targetRole ?? "Associate Product Manager",
      input.targetSeniority ?? "associate",
    );
    const comparison = compareToTarget(judgements, target);

    // 12. Strengths, gaps, recommendations
    const { strengths, gaps } = deriveStrengthsAndGaps(judgements);
    const recommendations = generateRecommendations({
      judgements,
      unmetCompetencies: comparison.unmet,
    });
    stepsCompleted.push("generate_strengths_gaps_recommendations");

    // 10–11. Snapshot + target comparison
    const snapshot = projectCapabilitySnapshot({
      judgements,
      contradictions,
      strengths,
      gaps,
      recommendations,
      target,
      rubricSlug,
      rubricVersion,
      now,
    });
    stepsCompleted.push("produce_capability_snapshot");
    stepsCompleted.push("compare_target_role_requirements");

    // Growth
    const growth = compareGrowth(input.previousSnapshot, snapshot);
    stepsCompleted.push("growth_comparison");

    // 13. Review queue
    const reviewQueue = buildReviewQueue({
      judgements,
      excludedOutdated: excluded.filter((e) => e.reason === "outdated").map((e) => e.id),
      verifierNotes: verified.notes,
    });
    if (provenanceFailed.length) {
      reviewQueue.push({
        reason: "provenance_validation_failed",
        payload: { evidenceIds: provenanceFailed.map((e) => e.id) },
      });
    }
    stepsCompleted.push("submit_review_queue");

    return {
      ok: true,
      duplicate: false,
      inputHash,
      judgements,
      snapshot,
      growth,
      reviewQueue,
      stepsCompleted,
    };
  } catch (err) {
    if (err instanceof ModelFailureError) {
      return {
        ok: false,
        duplicate: false,
        inputHash,
        error: "model_failure",
        judgements: [],
        snapshot: null,
        growth: null,
        reviewQueue: [{ reason: "model_failure", payload: { message: err.message } }],
        stepsCompleted,
      };
    }
    return {
      ok: false,
      duplicate: false,
      inputHash,
      error: err instanceof Error ? err.message : "orchestrator_failed",
      judgements: [],
      snapshot: null,
      growth: null,
      reviewQueue: [],
      stepsCompleted,
    };
  }
}
