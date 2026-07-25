import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { completeFinalSession } from "@/lib/pi-assessment/final-complete";

export const dynamic = "force-dynamic";

/**
 * Complete final assessment: ledger evidence → final ScoreRun → growth report.
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
    surface: "final_assessment",
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
    const result = await completeFinalSession(supabase, {
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
      experienceIndustry: result.experienceIndustry,
      transferIndustry: result.transferIndustry,
      transferSlug: result.transferSlug,
      growthReport: result.growthReport
        ? {
            id: result.growthReport.id,
            status: result.growthReport.status,
            citationCount: result.growthReport.citationCount,
            report: result.growthReport.report,
          }
        : null,
      recommendedNext: result.recommendedNext,
      capabilityAssigned: false,
      deliverxVerified: false,
      notice:
        "Final/transfer evidence is observed. Capability levels come only from ScoreRun. Growth report compares baseline → practice → final under one framework pin. Verified badge stays off.",
      profileHref: "/profile",
      portfolioHref: "/portfolio",
      careerHref: "/launchpad/app",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Complete failed";
    const status =
      message.includes("at least") ||
      message.includes("requires") ||
      message.includes("not found")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
