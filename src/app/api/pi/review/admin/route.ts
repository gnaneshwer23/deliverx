import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessPiReviewAdmin } from "@/lib/pi-review/admin-access";
import {
  applyReviewAction,
  listReviewCases,
  listReviewEvents,
  getReviewCase,
  isPiReviewAction,
  ADMIN_ACTIONS,
  type PiReviewAction,
  type PiReviewStatus,
} from "@/lib/pi-review";

export const dynamic = "force-dynamic";

async function requireAdmin() {
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

  return { user, supabase };
}

/** Admin queue — open challenges / escalations / under review. */
export async function GET(request: Request) {
  const gate = await requireAdmin();
  if ("error" in gate && gate.error) return gate.error;

  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Admin client not configured (SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 },
    );
  }

  if (caseId) {
    const caseRes = await getReviewCase(admin, caseId);
    if (caseRes.error || !caseRes.data) {
      return NextResponse.json({ error: caseRes.error ?? "Not found" }, { status: 404 });
    }
    const eventsRes = await listReviewEvents(admin, caseId);
    return NextResponse.json({
      data: { case: caseRes.data, events: eventsRes.data ?? [] },
      error: null,
    });
  }

  const statuses: PiReviewStatus[] = [
    "challenged",
    "under_review",
    "additional_evidence_required",
    "escalated_to_human_review",
    "user_context_added",
    "pending_review",
  ];

  const { data, error } = await listReviewCases(admin, {
    status: statuses,
    openOnly: true,
    limit: 200,
  });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null });
}

/** Admin action: uphold / revise / escalate / start_review / etc. */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if ("error" in gate && gate.error) return gate.error;
  const { user } = gate;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const caseId = String(body.caseId ?? "").trim();
  if (!caseId) return NextResponse.json({ error: "caseId required" }, { status: 400 });

  const actionRaw = String(body.action ?? "");
  if (!isPiReviewAction(actionRaw) || !(ADMIN_ACTIONS as readonly string[]).includes(actionRaw)) {
    return NextResponse.json({ error: "Invalid admin action" }, { status: 400 });
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

  const evidenceIds = Array.isArray(body.evidenceIds)
    ? body.evidenceIds.map(String).filter(Boolean)
    : [];

  const { data, error } = await applyReviewAction(admin, {
    caseId,
    actorUserId: user.id,
    actorRole: "admin_reviewer",
    action: actionRaw as PiReviewAction,
    rationale: typeof body.rationale === "string" ? body.rationale : undefined,
    contextNote: typeof body.contextNote === "string" ? body.contextNote : undefined,
    evidenceIds,
    proposedRevision:
      body.proposedRevision && typeof body.proposedRevision === "object"
        ? (body.proposedRevision as Record<string, unknown>)
        : undefined,
    audit: {
      source: "api.pi.review.admin",
      reviewer_id: user.id,
      capability_mutation: false,
    },
  });

  if (error) {
    const status =
      error.includes("not allowed") || error.includes("required") || error.includes("Cannot change")
        ? 400
        : 500;
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json({ data, error: null });
}
