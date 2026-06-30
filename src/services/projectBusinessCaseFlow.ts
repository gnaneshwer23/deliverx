/**
 * PM-first business case upload → AI Review Queue → BA invite flow.
 */

import { createClient } from "@/lib/supabase/server";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import { AiConfigError } from "@/lib/ai/anthropic";
import {
  reviewBusinessCase,
  type BusinessCaseReview,
} from "@/services/aiBusinessCaseReview";
import { queueArtifactReview } from "@/services/artifactReviews";
import { upsertCharter, getActiveCharter } from "@/services/charter";
import { createBrainDocument } from "@/services/brainDocumentService";
import { saveBusinessCaseReview } from "@/services/businessCaseReview";
import { generateInviteToken } from "@/services/inviteTokenService";
import { listProjectWorkspaceMembersByRole } from "@/services/workspaceMemberService";

export type BusinessCaseExtractionStatus = "none" | "pending" | "queued" | "complete";

export type ProjectBusinessCaseStatus = {
  hasBusinessCase: boolean;
  charterExcerpt: string | null;
  charterUpdatedAt: string | null;
  extractionStatus: BusinessCaseExtractionStatus;
  pendingReviewId: string | null;
  pendingReviewTitle: string | null;
  baMember: { userId: string; name: string | null; joinedAt: string } | null;
  baInviteActive: boolean;
  baInviteJoinUrl: string | null;
  baInviteExpiresAt: string | null;
};

export type UploadBusinessCaseResult = {
  status: ProjectBusinessCaseStatus;
  extractionStatus: BusinessCaseExtractionStatus;
  reviewQueued: boolean;
  baInviteUrl: string | null;
};

function excerpt(text: string | null | undefined, max = 160): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}

export function resolveExtractionQueueSummary(input: {
  aiConfigured: boolean;
  review?: BusinessCaseReview | null;
}): { summary: string; extractionStatus: BusinessCaseExtractionStatus } {
  if (!input.aiConfigured) {
    return {
      summary:
        "AI analysis pending — configure OPENAI_API_KEY to generate reviewable proposals.",
      extractionStatus: "pending",
    };
  }

  if (input.review) {
    return {
      summary:
        input.review.executiveSummary ||
        input.review.summary ||
        `Business case scored ${input.review.score}/100 — review before applying.`,
      extractionStatus: "queued",
    };
  }

  return {
    summary: "AI analysis pending — upload saved; retry when AI is available.",
    extractionStatus: "pending",
  };
}

async function findPendingBusinessCaseReview(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artifact_reviews")
    .select("id, title, summary, status, source, created_at")
    .eq("project_id", projectId)
    .eq("source", "business_case_upload")
    .eq("status", "needs_review")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as { id: string; title: string } | null;
}

async function findActiveBaInvite(projectId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("invite_tokens")
    .select("id, role, expires_at, revoked_at, created_at")
    .eq("project_id", projectId)
    .eq("role", "ba")
    .is("revoked_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as { id: string; expires_at: string } | null;
}

export async function getProjectBusinessCaseStatus(
  projectId: string,
): Promise<ProjectBusinessCaseStatus> {
  const charter = await getActiveCharter(projectId).catch(() => null);
  const pendingReview = await findPendingBusinessCaseReview(projectId);
  const baMembers = await listProjectWorkspaceMembersByRole(projectId, "ba").catch(() => []);
  const activeInvite =
    baMembers.length === 0 ? await findActiveBaInvite(projectId) : null;

  const hasBusinessCase = Boolean(charter?.content?.trim());
  let extractionStatus: BusinessCaseExtractionStatus = "none";
  if (pendingReview) extractionStatus = "queued";
  else if (hasBusinessCase) extractionStatus = "pending";

  return {
    hasBusinessCase,
    charterExcerpt: excerpt(charter?.content),
    charterUpdatedAt: charter?.updated_at ?? null,
    extractionStatus,
    pendingReviewId: pendingReview?.id ?? null,
    pendingReviewTitle: pendingReview?.title ?? null,
    baMember: baMembers[0]
      ? {
          userId: baMembers[0].user_id,
          name: baMembers[0].user_name,
          joinedAt: baMembers[0].joined_at,
        }
      : null,
    baInviteActive: Boolean(activeInvite),
    baInviteJoinUrl: null,
    baInviteExpiresAt: activeInvite?.expires_at ?? null,
  };
}

async function queueBusinessCaseExtraction(input: {
  projectId: string;
  content: string;
  projectName: string;
}): Promise<{ reviewId: string; extractionStatus: BusinessCaseExtractionStatus }> {
  let review: BusinessCaseReview | null = null;
  let aiConfigured = true;

  try {
    review = await reviewBusinessCase(input.content);
  } catch (err) {
    if (err instanceof AiConfigError) {
      aiConfigured = false;
    } else {
      throw err;
    }
  }

  const { summary, extractionStatus } = resolveExtractionQueueSummary({
    aiConfigured,
    review,
  });

  if (review) {
    await saveBusinessCaseReview({
      briefExcerpt: input.content,
      report: review,
      projectId: input.projectId,
    }).catch(() => undefined);
  }

  const queued = await queueArtifactReview({
    projectId: input.projectId,
    entityType: "structure_bundle",
    title: "Business case analysis — AI Review Queue",
    summary,
    source: "business_case_upload",
    payload: {
      extractionStatus,
      recommendation: review?.recommendation ?? null,
      score: review?.score ?? null,
      briefExcerpt: excerpt(input.content, 500),
      projectName: input.projectName,
    },
  });

  return { reviewId: queued.id, extractionStatus };
}

export async function uploadProjectBusinessCase(input: {
  projectId: string;
  projectName: string;
  content: string;
  title?: string;
  fileName?: string;
}): Promise<UploadBusinessCaseResult> {
  const trimmed = input.content.trim();
  if (!trimmed) throw new Error("Business case content is required.");

  await upsertCharter({
    projectId: input.projectId,
    title: input.title?.trim() || `${input.projectName} — business case`,
    content: trimmed,
    scopeSummary: excerpt(trimmed, 280) ?? undefined,
  });

  try {
    await createBrainDocument({
      title: input.fileName?.trim() || `${input.projectName} business case`,
      sourceType: input.fileName ? "upload" : "paste",
    });
  } catch {
    /* brain_documents table optional in some envs */
  }

  const { extractionStatus } = await queueBusinessCaseExtraction({
    projectId: input.projectId,
    content: trimmed,
    projectName: input.projectName,
  });

  let baInviteUrl: string | null = null;
  const baMembers = await listProjectWorkspaceMembersByRole(input.projectId, "ba").catch(
    () => [],
  );
  if (baMembers.length === 0) {
    const existingInvite = await findActiveBaInvite(input.projectId);
    if (!existingInvite) {
      const invite = await generateInviteToken({ projectId: input.projectId, role: "ba" });
      baInviteUrl = invite.joinUrl;
    }
  }

  refreshProjectDashboards(input.projectId);

  const status = await getProjectBusinessCaseStatus(input.projectId);
  return {
    status: { ...status, baInviteJoinUrl: baInviteUrl ?? status.baInviteJoinUrl },
    extractionStatus,
    reviewQueued: true,
    baInviteUrl,
  };
}
