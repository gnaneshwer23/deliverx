import type {
  EligibleEvidence,
  IntelligenceKind,
  NormalisedEvidence,
} from "@/lib/capability-engine/types";

function kindsForEvidence(item: EligibleEvidence): IntelligenceKind[] {
  const kinds = new Set<IntelligenceKind>();

  if (item.category === "knowledge" || item.sourceType === "learning_activity") {
    kinds.add("knowledge");
  }
  if (item.sourceType === "reflection") {
    kinds.add("knowledge");
    kinds.add("potential");
  }
  if (
    item.sourceType === "decision" ||
    item.sourceType === "experience_project" ||
    item.sourceType === "work_sample" ||
    item.sourceType === "baseline_assessment"
  ) {
    kinds.add("applied_skill");
    kinds.add("behaviour");
    kinds.add("competency");
  }
  if (item.sourceType === "meeting" || item.sourceType === "message") {
    kinds.add("behaviour");
    kinds.add("applied_skill");
  }
  if (item.sourceType === "application_outcome" || item.category === "outcome") {
    kinds.add("outcome");
  }
  if (item.sourceType === "external_verification") {
    kinds.add("outcome");
    kinds.add("competency");
  }
  if (
    item.sourceType === "launchpad_interview" ||
    item.sourceType === "adaptive_interview"
  ) {
    kinds.add("applied_skill");
    kinds.add("potential");
    kinds.add("readiness");
  }
  if (item.sourceType === "artefact" || item.sourceType === "portfolio_import") {
    kinds.add("potential");
    kinds.add("readiness");
  }
  if (item.sourceType === "self_report") {
    kinds.add("potential");
  }
  if (kinds.size === 0) kinds.add("potential");
  return Array.from(kinds);
}

export function isAiDominated(item: EligibleEvidence): boolean {
  const ai = item.aiContribution ?? {};
  const user = item.userContribution ?? {};
  const aiSize = JSON.stringify(ai).length;
  const userSize = JSON.stringify(user).length;
  if (item.actorType === "ai" && userSize < 20) return true;
  if (aiSize > 0 && userSize > 0 && aiSize >= userSize * 3) return true;
  return false;
}

export function normaliseEvidence(
  items: EligibleEvidence[],
  now = new Date(),
): NormalisedEvidence[] {
  return items.map((item) => {
    const intelligenceKinds = kindsForEvidence(item);
    const isKnowledgeOnly =
      item.sourceType === "learning_activity" ||
      item.category === "knowledge" ||
      (intelligenceKinds.includes("knowledge") &&
        !intelligenceKinds.includes("competency") &&
        !intelligenceKinds.includes("applied_skill") &&
        !intelligenceKinds.includes("behaviour") &&
        !intelligenceKinds.includes("outcome"));

    const ageDays =
      (now.getTime() - new Date(item.capturedAt).getTime()) / (1000 * 60 * 60 * 24);
    const normalisedText = [
      item.title,
      item.summary,
      JSON.stringify(item.rawContent ?? {}),
    ]
      .join(" ")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    return {
      ...item,
      intelligenceKinds,
      isKnowledgeOnly,
      isAiDominated: isAiDominated(item),
      ageDays: Number.isFinite(ageDays) ? ageDays : 0,
      normalisedText,
    };
  });
}
