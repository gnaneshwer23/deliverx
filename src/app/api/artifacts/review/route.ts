import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import {
  approveArtifactReview,
  listPendingArtifactReviews,
  rejectArtifactReview,
  updateArtifactReviewPayload,
} from "@/services/artifactReviews";
import type { BusinessCaseStructuredAnalysis } from "@/services/businessCaseStructuredAnalysis";
import {
  categoriesReadyToApply,
  structuredAnalysisToProjectDraft,
} from "@/services/businessCaseStructuredAnalysis";

type Body = {
  id?: string;
  action?: "approve" | "reject" | "edit";
  reviewerNotes?: string;
  structuredAnalysis?: BusinessCaseStructuredAnalysis;
};

export async function GET() {
  try {
    const reviews = await listPendingArtifactReviews(50);
    return NextResponse.json({ ok: true, reviews });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.id || !body.action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (body.action === "edit") {
      if (!body.structuredAnalysis) {
        return NextResponse.json({ error: "structuredAnalysis is required for edit" }, { status: 400 });
      }
      const pending = await listPendingArtifactReviews(50);
      const existing = pending.find((r) => r.id === body.id);
      const projectName =
        typeof existing?.payload?.projectName === "string"
          ? existing.payload.projectName
          : "Project";
      const review = await updateArtifactReviewPayload(body.id, {
        structuredAnalysis: body.structuredAnalysis,
        draft: structuredAnalysisToProjectDraft(body.structuredAnalysis, projectName),
      });
      return NextResponse.json({ ok: true, review });
    }

    if (body.action === "approve") {
      const pending = await listPendingArtifactReviews(50);
      const existing = pending.find((r) => r.id === body.id);
      if (existing?.source === "business_case_upload") {
        const analysis = existing.payload.structuredAnalysis as
          | BusinessCaseStructuredAnalysis
          | undefined;
        if (!analysis || !categoriesReadyToApply(analysis)) {
          return NextResponse.json(
            { error: "Accept at least one analysis category before creating workspace." },
            { status: 400 },
          );
        }
      }
    }

    const review =
      body.action === "approve"
        ? await approveArtifactReview(body.id, body.reviewerNotes)
        : await rejectArtifactReview(body.id, body.reviewerNotes);

    refreshProjectDashboards(review.project_id);

    return NextResponse.json({ ok: true, review });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
