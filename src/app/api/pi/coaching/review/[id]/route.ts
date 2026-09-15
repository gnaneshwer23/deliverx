import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessPiReviewAdmin } from "@/lib/pi-review/admin-access";
import {
  claimForReview,
  decideSubmission,
  isCoachingEvidenceEnabled,
  isCoachingReviewDecision,
  COACHING_EVIDENCE_DISABLED_NOTICE,
} from "@/lib/coaching-evidence";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Coach decision on a submission: confirm | reject | request_changes, or claim.
 * confirm is the ONLY path that appends `supported` evidence. Gated to coach/reviewer.
 */
export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!canAccessPiReviewAdmin(profile?.role, user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isCoachingEvidenceEnabled()) {
    return NextResponse.json(
      { error: COACHING_EVIDENCE_DISABLED_NOTICE, enabled: false, deliverxVerified: false },
      { status: 404 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Admin client not configured (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 },
    );
  }

  // Claim-for-review (submitted -> under_review) is a non-decision helper.
  if (body.action === "claim") {
    const { data, error } = await claimForReview(admin, id, user.id);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ data, error: null, enabled: true, deliverxVerified: false });
  }

  const decisionRaw = String(body.decision ?? "");
  if (!isCoachingReviewDecision(decisionRaw)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }
  const rationale = typeof body.rationale === "string" ? body.rationale : "";
  const roleRaw = body.reviewerRole === "reviewer" ? "reviewer" : "coach";

  const { data, error } = await decideSubmission(admin, {
    submissionId: id,
    reviewerId: user.id,
    reviewerRole: roleRaw,
    decision: decisionRaw,
    rationale,
    aiAssisted: body.aiAssisted === true,
    citations: body.citations,
  });

  if (error) {
    const status =
      /required|not allowed|cannot|Only a|between|citation|re-decided|not confirm/i.test(error)
        ? 400
        : 500;
    return NextResponse.json({ error, deliverxVerified: false }, { status });
  }
  return NextResponse.json({ data, error: null, enabled: true, deliverxVerified: false });
}
