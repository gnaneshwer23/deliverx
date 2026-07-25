import type { MappedIndicator, NormalisedEvidence } from "@/lib/capability-engine/types";
import type { RubricDefinition } from "@/lib/capability-engine/rubric";

/** Evidence Mapper — maps normalised evidence to competency indicators (deterministic). */
export function mapEvidenceToIndicators(
  evidence: NormalisedEvidence[],
  rubric: RubricDefinition,
): MappedIndicator[] {
  const mappings: MappedIndicator[] = [];

  for (const item of evidence) {
    // Course / knowledge-only evidence maps to knowledge signals, NOT competency proof.
    if (item.isKnowledgeOnly) {
      mappings.push({
        evidenceId: item.id,
        competencyId: "comp.product_discovery",
        indicatorId: "ind.discovery_practice",
        strengthHint: 0.15,
        intelligenceKinds: ["knowledge", "potential"],
      });
      continue;
    }

    const text = item.normalisedText;
    const competencyHint =
      typeof item.rawContent.competency === "string"
        ? item.rawContent.competency.toLowerCase()
        : "";

    const scored: Array<{ key: string; score: number }> = [];

    if (
      competencyHint.includes("stakeholder") ||
      text.includes("stakeholder") ||
      text.includes("trust")
    ) {
      scored.push({ key: "stakeholder_judgement", score: 0.7 });
    }
    if (
      competencyHint.includes("delivery") ||
      text.includes("delivery") ||
      text.includes("roadmap") ||
      text.includes("ship")
    ) {
      scored.push({ key: "delivery_judgement", score: 0.65 });
    }
    if (
      competencyHint.includes("discovery") ||
      text.includes("hypothesis") ||
      text.includes("discovery") ||
      text.includes("user research")
    ) {
      scored.push({ key: "product_discovery", score: 0.65 });
    }

    if (item.sourceType === "external_verification") {
      scored.push({ key: "stakeholder_judgement", score: 0.85 });
      scored.push({ key: "delivery_judgement", score: 0.8 });
    }

    if (scored.length === 0) {
      // Default practice evidence → delivery judgement at low strength
      scored.push({ key: "delivery_judgement", score: 0.35 });
    }

    for (const s of scored) {
      const ind = rubric.indicators[s.key];
      if (!ind) continue;
      mappings.push({
        evidenceId: item.id,
        competencyId: ind.competencyId,
        indicatorId: ind.indicatorId,
        strengthHint: s.score,
        intelligenceKinds: item.intelligenceKinds,
      });
    }
  }

  return mappings;
}
