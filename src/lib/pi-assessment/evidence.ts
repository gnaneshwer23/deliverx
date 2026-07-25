/**
 * Append baseline responses to the Evidence Ledger with full provenance.
 * Never writes capability levels — ScoreRun is a separate step.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import type { PiEvidenceSourceType } from "@/lib/evidence-ledger/types";
import type {
  AssessmentItemKind,
  AssessmentItemRow,
  AssessmentSessionRow,
} from "@/lib/pi-assessment/types";

export function evidenceSourceForItemKind(kind: AssessmentItemKind): PiEvidenceSourceType {
  switch (kind) {
    case "interview":
      return "adaptive_interview";
    case "work_sample":
      return "work_sample";
    case "reflection":
      return "reflection";
    case "transfer":
      return "transfer_assessment";
    case "scenario":
    case "decision":
    default:
      return "baseline_assessment";
  }
}

export function evidenceSourceForFinalItemKind(
  kind: AssessmentItemKind,
): PiEvidenceSourceType {
  if (kind === "transfer") return "transfer_assessment";
  if (kind === "work_sample") return "work_sample";
  if (kind === "reflection") return "reflection";
  if (kind === "interview") return "adaptive_interview";
  return "final_assessment";
}

export type BaselineEvidenceAppendResult = {
  evidenceIds: string[];
  duplicates: number;
  capabilityAssigned: false;
};

export async function appendBaselineEvidence(
  supabase: SupabaseClient,
  input: {
    session: AssessmentSessionRow;
    items: AssessmentItemRow[];
    responses: Array<{
      id: string;
      itemId: string;
      responseText: string;
      userContribution: Record<string, unknown>;
      aiContribution: Record<string, unknown>;
    }>;
  },
): Promise<BaselineEvidenceAppendResult> {
  const evidenceIds: string[] = [];
  let duplicates = 0;
  const itemById = new Map(input.items.map((i) => [i.id, i]));

  for (const response of input.responses) {
    const item = itemById.get(response.itemId);
    if (!item) continue;

    const sourceType = evidenceSourceForItemKind(item.itemKind);
    const result = await appendEvidence(supabase, {
      userId: input.session.userId,
      sourceType,
      category: item.itemKind === "reflection" ? "other" : "practice",
      title: `Baseline: ${item.title}`,
      summary: response.responseText.slice(0, 240),
      rawContent: {
        note: "Baseline observation — not a capability assignment. Self-reported and scenario answers are observed evidence only.",
        capabilityAssigned: false,
        sessionId: input.session.id,
        itemId: item.id,
        itemSlug: item.slug,
        itemKind: item.itemKind,
        competencyCodes: item.competencyCodes,
        indicatorCodes: item.indicatorCodes,
        frameworkVersionId: input.session.frameworkVersionId,
        frameworkSlug: input.session.frameworkSlug,
        frameworkVersion: input.session.frameworkVersion,
        selectionReason: item.selectionReason,
        responseText: response.responseText,
        provenanceLabel: "self_reported_or_scenario_response",
      },
      sourceRecordType: "pi_assessment_sessions",
      sourceRecordId: input.session.id,
      confidentiality: "private",
      consentStatus: "analysis_allowed",
      idempotencyKey: `baseline:${input.session.id}:${item.slug}`,
      provenance: {
        actorType: "user",
        actorUserId: input.session.userId,
        userContribution: {
          ...response.userContribution,
          responseText: response.responseText,
        },
        aiContribution: {
          ...response.aiContribution,
          selectionReason: item.selectionReason,
          promptVersion: input.session.promptVersion,
          modelId: input.session.modelId,
          modelVersion: input.session.modelVersion,
          note: "System selected/adaptive-ordered the item; user authored the answer. No level written.",
        },
        modelId: input.session.modelId,
        modelVersion: input.session.modelVersion,
        promptSlug: "pi-baseline-adaptive",
        promptVersion: input.session.promptVersion,
        rawRef: {
          sessionId: input.session.id,
          itemId: item.id,
          responseId: response.id,
          catalogRef: item.catalogRef,
        },
      },
    });

    if (result.duplicate) duplicates += 1;
    evidenceIds.push(result.evidenceId);

    await supabase
      .from("pi_assessment_responses")
      .update({ evidence_id: result.evidenceId })
      .eq("id", response.id);
  }

  return { evidenceIds, duplicates, capabilityAssigned: false };
}

export type FinalEvidenceAppendResult = {
  evidenceIds: string[];
  duplicates: number;
  capabilityAssigned: false;
};

export async function appendFinalAssessmentEvidence(
  supabase: SupabaseClient,
  input: {
    session: AssessmentSessionRow;
    items: AssessmentItemRow[];
    responses: Array<{
      id: string;
      itemId: string;
      responseText: string;
      userContribution: Record<string, unknown>;
      aiContribution: Record<string, unknown>;
    }>;
    experienceIndustry: string | null;
    transferIndustry: string | null;
  },
): Promise<FinalEvidenceAppendResult> {
  const evidenceIds: string[] = [];
  let duplicates = 0;
  const itemById = new Map(input.items.map((i) => [i.id, i]));

  for (const response of input.responses) {
    const item = itemById.get(response.itemId);
    if (!item) continue;

    const sourceType = evidenceSourceForFinalItemKind(item.itemKind);
    const isTransfer = item.itemKind === "transfer";
    const result = await appendEvidence(supabase, {
      userId: input.session.userId,
      sourceType,
      category: item.itemKind === "reflection" ? "other" : "practice",
      title: isTransfer ? `Transfer: ${item.title}` : `Final: ${item.title}`,
      summary: response.responseText.slice(0, 240),
      rawContent: {
        note: isTransfer
          ? "Transfer observation in a novel industry/context — not a capability assignment."
          : "Final assessment observation — not a capability assignment.",
        capabilityAssigned: false,
        sessionId: input.session.id,
        itemId: item.id,
        itemSlug: item.slug,
        itemKind: item.itemKind,
        competencyCodes: item.competencyCodes,
        indicatorCodes: item.indicatorCodes,
        frameworkVersionId: input.session.frameworkVersionId,
        frameworkSlug: input.session.frameworkSlug,
        frameworkVersion: input.session.frameworkVersion,
        selectionReason: item.selectionReason,
        responseText: response.responseText,
        experienceIndustry: input.experienceIndustry,
        transferIndustry: input.transferIndustry,
        transfer: isTransfer,
        provenanceLabel: isTransfer
          ? "transfer_scenario_response"
          : "final_assessment_response",
      },
      sourceRecordType: "pi_assessment_sessions",
      sourceRecordId: input.session.id,
      confidentiality: "private",
      consentStatus: "analysis_allowed",
      idempotencyKey: `final:${input.session.id}:${item.slug}`,
      provenance: {
        actorType: "user",
        actorUserId: input.session.userId,
        userContribution: {
          ...response.userContribution,
          responseText: response.responseText,
        },
        aiContribution: {
          ...response.aiContribution,
          selectionReason: item.selectionReason,
          promptVersion: input.session.promptVersion,
          modelId: input.session.modelId,
          modelVersion: input.session.modelVersion,
          note: "System selected the final/transfer item; user authored the answer. No level written.",
        },
        modelId: input.session.modelId,
        modelVersion: input.session.modelVersion,
        promptSlug: "pi-final-transfer",
        promptVersion: input.session.promptVersion,
        rawRef: {
          sessionId: input.session.id,
          itemId: item.id,
          responseId: response.id,
          catalogRef: item.catalogRef,
          experienceIndustry: input.experienceIndustry,
          transferIndustry: input.transferIndustry,
        },
      },
    });

    if (result.duplicate) duplicates += 1;
    evidenceIds.push(result.evidenceId);

    await supabase
      .from("pi_assessment_responses")
      .update({ evidence_id: result.evidenceId })
      .eq("id", response.id);
  }

  return { evidenceIds, duplicates, capabilityAssigned: false };
}
