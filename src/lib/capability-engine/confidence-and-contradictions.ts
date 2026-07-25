import type {
  Contradiction,
  NormalisedEvidence,
  StructuredJudgement,
} from "@/lib/capability-engine/types";
import { levelRank } from "@/lib/capability-engine/rubric";

export function calculateConfidence(input: {
  judgement: StructuredJudgement;
  evidenceById: Map<string, NormalisedEvidence>;
  contradictionSeverity?: Contradiction["severity"] | null;
}): number {
  const refs = input.judgement.evidenceReferences
    .map((id) => input.evidenceById.get(id))
    .filter(Boolean) as NormalisedEvidence[];

  if (input.judgement.levelProposed === "insufficient_evidence") {
    return Math.min(0.55, 0.25 + refs.length * 0.05);
  }

  let score = 0.35;
  score += Math.min(refs.length, 4) * 0.1;

  if (refs.some((r) => r.status === "platform_verified")) score += 0.2;
  if (refs.some((r) => r.sourceType === "external_verification")) score += 0.2;
  if (refs.every((r) => r.isKnowledgeOnly)) score -= 0.35;
  if (refs.some((r) => r.isAiDominated)) score -= 0.15;
  if (refs.some((r) => r.ageDays > 365)) score -= 0.1;
  if (input.contradictionSeverity === "high") score -= 0.25;
  if (input.contradictionSeverity === "medium") score -= 0.12;

  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

export function applyConfidence(
  judgements: StructuredJudgement[],
  evidenceById: Map<string, NormalisedEvidence>,
  contradictions: Contradiction[],
): StructuredJudgement[] {
  return judgements.map((j) => {
    const related = contradictions.find((c) => c.competencyId === j.competencyId);
    const confidence = calculateConfidence({
      judgement: j,
      evidenceById,
      contradictionSeverity: related?.severity ?? null,
    });
    return { ...j, confidence };
  });
}

/** Contradiction Detector — conflicting levels / signals across evidence. */
export function detectContradictions(input: {
  judgements: StructuredJudgement[];
  evidenceById: Map<string, NormalisedEvidence>;
}): Contradiction[] {
  const contradictions: Contradiction[] = [];

  for (const j of input.judgements) {
    const refs = j.evidenceReferences
      .map((id) => input.evidenceById.get(id))
      .filter(Boolean) as NormalisedEvidence[];

    const positive = refs.filter(
      (r) =>
        !r.isKnowledgeOnly &&
        (r.status === "platform_verified" || r.sourceType === "external_verification"),
    );
    const negative = refs.filter(
      (r) => r.isAiDominated || r.status === "disputed" || r.sourceType === "self_report",
    );

    if (positive.length && negative.length) {
      contradictions.push({
        competencyId: j.competencyId,
        evidenceIds: [...positive, ...negative].map((r) => r.id),
        summary:
          "Verified practice evidence conflicts with weaker or AI-dominated/self-reported signals.",
        severity: negative.length >= positive.length ? "high" : "medium",
      });
    }

    // Same competency judged both proficient+ and insufficient via knowledge split
    const peers = input.judgements.filter((p) => p.competencyId === j.competencyId);
    if (peers.length > 1) {
      const ranks = peers.map((p) => levelRank(p.levelProposed));
      if (Math.max(...ranks) - Math.min(...ranks) >= 2) {
        contradictions.push({
          competencyId: j.competencyId,
          evidenceIds: [...new Set(peers.flatMap((p) => p.evidenceReferences))],
          summary: "Material spread between proposed levels for the same competency.",
          severity: "medium",
        });
      }
    }
  }

  // Dedupe by competency
  const seen = new Set<string>();
  return contradictions.filter((c) => {
    if (seen.has(c.competencyId)) return false;
    seen.add(c.competencyId);
    return true;
  });
}
