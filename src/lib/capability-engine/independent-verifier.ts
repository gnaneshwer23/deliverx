import type {
  NormalisedEvidence,
  StructuredJudgement,
} from "@/lib/capability-engine/types";

export class ModelFailureError extends Error {
  constructor(message = "independent_verifier_model_failure") {
    super(message);
    this.name = "ModelFailureError";
  }
}

/**
 * Independent Verifier — second pass; must not be the same step as Rubric Judge.
 * Deterministic checks + optional failure injection for tests.
 */
export function independentVerify(input: {
  judgements: StructuredJudgement[];
  evidenceById: Map<string, NormalisedEvidence>;
  forceModelFailure?: boolean;
}): {
  judgements: StructuredJudgement[];
  notes: string[];
} {
  if (input.forceModelFailure) {
    throw new ModelFailureError();
  }

  const notes: string[] = [];
  const judgements = input.judgements.map((j) => {
    const refs = j.evidenceReferences
      .map((id) => input.evidenceById.get(id))
      .filter(Boolean) as NormalisedEvidence[];

    let next = { ...j };
    const allKnowledge = refs.every((r) => r.isKnowledgeOnly);
    if (allKnowledge && j.levelProposed !== "insufficient_evidence") {
      notes.push(`verifier_downgraded:${j.competencyId}`);
      next = {
        ...next,
        levelProposed: "insufficient_evidence",
        reasoningSummary:
          "Independent verification: knowledge-only evidence cannot support a competency level.",
        limitations: [next.limitations, "Verifier rejected competency claim from knowledge-only set."]
          .filter(Boolean)
          .join(" "),
        reviewStatus: "pending_review",
      };
    }

    const aiHeavy = refs.filter((r) => r.isAiDominated).length >= Math.ceil(refs.length / 2);
    if (aiHeavy && next.levelProposed !== "insufficient_evidence") {
      notes.push(`verifier_ai_flag:${j.competencyId}`);
      next = {
        ...next,
        reviewStatus: "pending_review",
        limitations: [next.limitations, "Majority of evidence appears AI-dominated."]
          .filter(Boolean)
          .join(" "),
        counterEvidence: [next.counterEvidence, "AI-dominated contributions present"]
          .filter(Boolean)
          .join("; "),
      };
    }

    return next;
  });

  return { judgements, notes };
}
