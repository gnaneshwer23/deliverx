import { createHash } from "node:crypto";
import type { EligibleEvidence } from "@/lib/capability-engine/types";

export function selectEligibleEvidence(
  evidence: EligibleEvidence[],
  options: { maxAgeDays?: number; now?: Date } = {},
): { eligible: EligibleEvidence[]; excluded: Array<{ id: string; reason: string }> } {
  const maxAgeDays = options.maxAgeDays ?? 730;
  const now = options.now ?? new Date();
  const eligible: EligibleEvidence[] = [];
  const excluded: Array<{ id: string; reason: string }> = [];

  for (const item of evidence) {
    if (item.status === "withdrawn") {
      excluded.push({ id: item.id, reason: "withdrawn" });
      continue;
    }
    if (item.status === "disputed") {
      excluded.push({ id: item.id, reason: "disputed" });
      continue;
    }
    const ageDays =
      (now.getTime() - new Date(item.capturedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (Number.isFinite(ageDays) && ageDays > maxAgeDays) {
      excluded.push({ id: item.id, reason: "outdated" });
      continue;
    }
    eligible.push(item);
  }

  return { eligible, excluded };
}

export function validateProvenance(item: EligibleEvidence): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (!item.actorType) reasons.push("missing_actor_type");
  if (!item.contentHash) reasons.push("missing_content_hash");
  if (item.actorType === "ai") {
    const aiKeys = Object.keys(item.aiContribution ?? {});
    if (aiKeys.length === 0) reasons.push("ai_actor_without_ai_contribution");
  }
  return { ok: reasons.length === 0, reasons };
}

export function hashEvidenceSet(evidenceIds: string[]): string {
  const sorted = [...evidenceIds].sort();
  return createHash("sha256").update(sorted.join("|")).digest("hex");
}
