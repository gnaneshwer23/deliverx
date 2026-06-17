import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import {
  approveArtifactReview,
  listPendingArtifactReviews,
  rejectArtifactReview,
} from "@/services/artifactReviews";

type Body = {
  id?: string;
  action?: "approve" | "reject";
  reviewerNotes?: string;
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
