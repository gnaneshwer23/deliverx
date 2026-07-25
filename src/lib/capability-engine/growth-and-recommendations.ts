import type {
  CapabilitySnapshotProfile,
  StructuredJudgement,
} from "@/lib/capability-engine/types";

/** Growth Comparator — diff two snapshots by competency level. */
export function compareGrowth(
  previous: CapabilitySnapshotProfile | null | undefined,
  current: CapabilitySnapshotProfile,
): {
  fromGeneratedAt: string | null;
  deltas: Array<{ competencyId: string; from: string; to: string }>;
} {
  if (!previous) {
    return { fromGeneratedAt: null, deltas: [] };
  }
  const prevMap = new Map(
    previous.judgements.map((j) => [j.competencyId, j.levelProposed]),
  );
  const deltas: Array<{ competencyId: string; from: string; to: string }> = [];
  for (const j of current.judgements) {
    const from = prevMap.get(j.competencyId);
    if (from && from !== j.levelProposed) {
      deltas.push({ competencyId: j.competencyId, from, to: j.levelProposed });
    }
  }
  return { fromGeneratedAt: previous.generatedAt, deltas };
}

/** Recommendation Generator — concise, evidence-referenced; no hidden CoT. */
export function generateRecommendations(input: {
  judgements: StructuredJudgement[];
  unmetCompetencies: string[];
}): CapabilitySnapshotProfile["recommendations"] {
  const recs: CapabilitySnapshotProfile["recommendations"] = [];

  for (const competencyId of input.unmetCompetencies) {
    const j = input.judgements.find((x) => x.competencyId === competencyId);
    recs.push({
      id: `rec-${competencyId}`,
      title: `Build evidence for ${competencyId}`,
      rationale:
        j?.levelProposed === "insufficient_evidence"
          ? "Current signals are insufficient or knowledge-only. Practise in Experience scenarios and capture decisions."
          : `Target level not yet met (${j?.levelProposed ?? "unknown"}). Repeat demonstrated behaviours with verified outcomes.`,
      evidenceReferences: j?.evidenceReferences ?? [],
    });
  }

  const knowledgeHeavy = input.judgements.filter((j) =>
    j.intelligenceKinds.every((k) => k === "knowledge" || k === "potential"),
  );
  if (knowledgeHeavy.length && recs.length < 5) {
    recs.push({
      id: "rec-apply-learning",
      title: "Convert learning into applied practice",
      rationale:
        "Course or reflection evidence was detected. Complete an Experience decision or work sample so capability can be demonstrated, not only claimed.",
      evidenceReferences: knowledgeHeavy.flatMap((j) => j.evidenceReferences).slice(0, 5),
    });
  }

  return recs.slice(0, 8);
}

export function deriveStrengthsAndGaps(judgements: StructuredJudgement[]): {
  strengths: string[];
  gaps: string[];
} {
  const strengths = judgements
    .filter(
      (j) =>
        j.levelProposed === "proficient" ||
        j.levelProposed === "advanced",
    )
    .map(
      (j) =>
        `${j.competencyId}: ${j.levelProposed} (${Math.round(j.confidence * 100)}% confidence)`,
    );

  const gaps = judgements
    .filter(
      (j) =>
        j.levelProposed === "insufficient_evidence" ||
        j.levelProposed === "emerging" ||
        j.reviewStatus === "pending_review",
    )
    .map((j) => `${j.competencyId}: ${j.levelProposed} — ${j.limitations || j.reasoningSummary}`);

  return { strengths, gaps };
}
