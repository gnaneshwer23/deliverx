import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getSubmission,
  isCoachingEvidenceEnabled,
  listSubmissionReviews,
  COACHING_EVIDENCE_DISABLED_NOTICE,
} from "@/lib/coaching-evidence";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Own submission detail + append-only review history (self-only). */
export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCoachingEvidenceEnabled()) {
    return NextResponse.json(
      { error: COACHING_EVIDENCE_DISABLED_NOTICE, enabled: false, deliverxVerified: false },
      { status: 404 },
    );
  }

  const submissionRes = await getSubmission(supabase, id, user.id);
  if (submissionRes.error || !submissionRes.data) {
    return NextResponse.json({ error: submissionRes.error ?? "Not found" }, { status: 404 });
  }
  const reviewsRes = await listSubmissionReviews(supabase, id);
  return NextResponse.json({
    data: { submission: submissionRes.data, reviews: reviewsRes.data ?? [] },
    error: null,
    enabled: true,
    deliverxVerified: false,
  });
}
