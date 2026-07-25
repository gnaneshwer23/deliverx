import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { completeBaselineSession } from "@/lib/pi-assessment/complete";

export const dynamic = "force-dynamic";

/**
 * Complete baseline: append Evidence Ledger rows with provenance, then ScoreRun
 * flagged as baseline under the session's framework pin.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "baseline",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let body: { sessionId?: string; runScore?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const result = await completeBaselineSession(supabase, {
      userId: user.id,
      sessionId: body.sessionId,
      runScore: body.runScore,
    });

    return NextResponse.json({
      ok: true,
      sessionId: result.session.id,
      status: result.session.status,
      evidenceIds: result.evidenceIds,
      scoreRunId: result.scoreRunId,
      snapshotId: result.snapshotId,
      frameworkVersionId: result.frameworkVersionId,
      frameworkSlug: result.session.frameworkSlug,
      frameworkVersion: result.session.frameworkVersion,
      readiness: result.readiness,
      strengths: result.strengths,
      gaps: result.gaps,
      recommendedNext: result.recommendedNext,
      capabilityAssigned: false,
      notice:
        "Baseline evidence is observed / self-reported. Capability levels come only from ScoreRun under a pinned framework version.",
      profileHref: "/profile",
      reviewHref: "/pi/review",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Complete failed";
    const status =
      message.includes("at least") || message === "Session not found" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
