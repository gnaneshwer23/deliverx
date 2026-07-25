import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  applyReviewAction,
  getReviewCase,
  listReviewEvents,
  isPiReviewAction,
  USER_ACTIONS,
  type PiReviewAction,
} from "@/lib/pi-review";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caseRes = await getReviewCase(supabase, id, user.id);
  if (caseRes.error || !caseRes.data) {
    return NextResponse.json({ error: caseRes.error ?? "Not found" }, { status: 404 });
  }

  const eventsRes = await listReviewEvents(supabase, id);
  return NextResponse.json({
    data: {
      case: caseRes.data,
      events: eventsRes.data ?? [],
    },
    error: null,
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const actionRaw = String(body.action ?? "");
  if (!isPiReviewAction(actionRaw) || !(USER_ACTIONS as readonly string[]).includes(actionRaw)) {
    return NextResponse.json({ error: "Invalid user action" }, { status: 400 });
  }

  const evidenceIds = Array.isArray(body.evidenceIds)
    ? body.evidenceIds.map(String).filter(Boolean)
    : [];

  const { data, error } = await applyReviewAction(supabase, {
    caseId: id,
    caseUserId: user.id,
    actorUserId: user.id,
    actorRole: "subject_user",
    action: actionRaw as PiReviewAction,
    rationale: typeof body.rationale === "string" ? body.rationale : undefined,
    contextNote: typeof body.contextNote === "string" ? body.contextNote : undefined,
    factualCorrection:
      body.factualCorrection && typeof body.factualCorrection === "object"
        ? (body.factualCorrection as Record<string, unknown>)
        : undefined,
    evidenceIds,
    visibilityChange:
      body.visibilityChange && typeof body.visibilityChange === "object"
        ? (body.visibilityChange as Record<string, unknown>)
        : undefined,
    proposedRevision:
      body.proposedRevision && typeof body.proposedRevision === "object"
        ? (body.proposedRevision as Record<string, unknown>)
        : undefined,
    audit: { source: "api.pi.review.action", path: `/api/pi/review/${id}` },
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
