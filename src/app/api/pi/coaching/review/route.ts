import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessPiReviewAdmin } from "@/lib/pi-review/admin-access";
import {
  isCoachingEvidenceEnabled,
  listCoachQueue,
  getSubmission,
  listSubmissionReviews,
  COACHING_EVIDENCE_DISABLED_NOTICE,
} from "@/lib/coaching-evidence";

export const dynamic = "force-dynamic";

async function requireCoach() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!canAccessPiReviewAdmin(profile?.role, user)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/** Coach/reviewer queue of open coaching submissions (service-role read behind gate). */
export async function GET(request: Request) {
  const gate = await requireCoach();
  if ("error" in gate && gate.error) return gate.error;
  if (!isCoachingEvidenceEnabled()) {
    return NextResponse.json(
      { error: COACHING_EVIDENCE_DISABLED_NOTICE, enabled: false, deliverxVerified: false },
      { status: 404 },
    );
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

  const url = new URL(request.url);
  const submissionId = url.searchParams.get("submissionId");
  if (submissionId) {
    const submissionRes = await getSubmission(admin, submissionId);
    if (submissionRes.error || !submissionRes.data) {
      return NextResponse.json({ error: submissionRes.error ?? "Not found" }, { status: 404 });
    }
    const reviewsRes = await listSubmissionReviews(admin, submissionId);
    return NextResponse.json({
      data: { submission: submissionRes.data, reviews: reviewsRes.data ?? [] },
      error: null,
      enabled: true,
      deliverxVerified: false,
    });
  }

  const { data, error } = await listCoachQueue(admin, { limit: 200 });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, enabled: true, deliverxVerified: false });
}
