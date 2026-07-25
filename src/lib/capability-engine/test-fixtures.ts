import type { EligibleEvidence } from "@/lib/capability-engine/types";

let seq = 0;

export function resetEvidenceSeq() {
  seq = 0;
}

export function makeEvidence(
  partial: Partial<EligibleEvidence> & Pick<EligibleEvidence, "sourceType" | "title">,
): EligibleEvidence {
  seq += 1;
  const id = partial.id ?? `ev-${seq}`;
  return {
    id,
    sourceType: partial.sourceType,
    category: partial.category ?? "practice",
    title: partial.title,
    summary: partial.summary ?? partial.title,
    capturedAt: partial.capturedAt ?? new Date().toISOString(),
    status: partial.status ?? "observed",
    contentHash: partial.contentHash ?? `hash-${id}`,
    rawContent: partial.rawContent ?? {},
    actorType: partial.actorType ?? "user",
    userContribution: partial.userContribution ?? { text: partial.title },
    aiContribution: partial.aiContribution ?? {},
    modelId: partial.modelId ?? null,
    modelVersion: partial.modelVersion ?? null,
  };
}
