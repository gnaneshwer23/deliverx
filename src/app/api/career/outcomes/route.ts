import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  listCalibrationFindings,
  listOutcomeEvents,
  recordOutcomeEvent,
  refreshCalibrationFindings,
  summariseOutcomes,
  scoreRunPromptForOutcome,
  outcomeNarrativeFragment,
  isOutcomeEventType,
  type RecordOutcomeInput,
} from "@/lib/real-world-outcomes";
import { createReviewCase } from "@/lib/pi-review";
import {
  loadRecentSnapshotClaims,
  toPiProfileScoreRun,
} from "@/lib/capability-engine/snapshot-claims";

export const dynamic = "force-dynamic";

async function calibrationContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const [snapshotPack, onboarding] = await Promise.all([
    loadRecentSnapshotClaims(supabase, userId, 1).catch(() => ({ latest: null })),
    supabase
      .from("pi_onboarding_sessions")
      .select("payload")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  const scoreRun = snapshotPack.latest ? toPiProfileScoreRun(snapshotPack.latest) : null;
  const payload = (onboarding.data?.payload ?? {}) as Record<string, unknown>;
  const targetSeniority =
    (payload.targetSeniority as string) || (payload.target_seniority as string) || null;
  return { gaps: scoreRun?.gaps ?? [], targetSeniority };
}

/** GET — outcome events, calibration findings, summary and narrative. Self-only. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({ userId: user.id, email: user.email, surface: "career" });
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  try {
    const [events, findings] = await Promise.all([
      listOutcomeEvents(supabase, user.id),
      listCalibrationFindings(supabase, user.id),
    ]);

    return NextResponse.json({
      events,
      findings,
      summary: summariseOutcomes(events),
      narrative: outcomeNarrativeFragment(events),
      capabilityAssigned: false as const,
      notice:
        "Outcomes are self-reported and do not change capability levels. Calibration is diagnostic guidance, not a capability judgement.",
    });
  } catch (err) {
    console.error("[career/outcomes] GET failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Load failed" },
      { status: 500 },
    );
  }
}

/**
 * POST — record an outcome or act on a calibration finding.
 * Actions: record_outcome | acknowledge_finding | dismiss_finding | challenge_finding.
 * Never triggers ScoreRun. Never writes capability.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({ userId: user.id, email: user.email, surface: "career" });
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action ?? "record_outcome");

  try {
    if (action === "record_outcome") {
      const eventType = String(body.eventType ?? "");
      if (!isOutcomeEventType(eventType)) {
        return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
      }
      if (!String(body.title ?? "").trim()) {
        return NextResponse.json({ error: "title required" }, { status: 400 });
      }

      const input: RecordOutcomeInput = {
        eventType,
        title: String(body.title),
        detail: typeof body.detail === "string" ? body.detail : undefined,
        occurredOn: typeof body.occurredOn === "string" ? body.occurredOn : undefined,
        applicationId: typeof body.applicationId === "string" ? body.applicationId : null,
        company: typeof body.company === "string" ? body.company : null,
        roleTitle: typeof body.roleTitle === "string" ? body.roleTitle : null,
        seniority: typeof body.seniority === "string" ? body.seniority : null,
        stageReached: typeof body.stageReached === "string" ? body.stageReached : null,
        sentiment:
          body.sentiment === "positive" ||
          body.sentiment === "neutral" ||
          body.sentiment === "negative"
            ? body.sentiment
            : undefined,
        artefactRef: typeof body.artefactRef === "string" ? body.artefactRef : null,
        hasArtefact: Boolean(body.hasArtefact),
      };

      const result = await recordOutcomeEvent(supabase, user.id, input);

      const ctx = await calibrationContext(supabase, user.id);
      const findings = await refreshCalibrationFindings(supabase, user.id, ctx);
      const prompt = scoreRunPromptForOutcome({
        eventType,
        findings,
        evidenceHref: "/profile/evidence?run=1",
      });

      return NextResponse.json({
        ok: true,
        event: result.event,
        evidenceId: result.evidenceId,
        strength: result.strength,
        findings,
        scoreRunPrompt: prompt,
        capabilityAssigned: false as const,
        scoreRunTriggered: false as const,
        notice:
          "Logged as self-reported outcome evidence. This does not change any capability level and no capability assessment was run.",
      });
    }

    if (action === "acknowledge_finding" || action === "dismiss_finding") {
      const findingId = String(body.findingId ?? "");
      if (!findingId) return NextResponse.json({ error: "findingId required" }, { status: 400 });
      const status = action === "acknowledge_finding" ? "acknowledged" : "dismissed";
      const { error } = await supabase
        .from("pi_calibration_findings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", findingId)
        .eq("user_id", user.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, findingId, status, capabilityAssigned: false });
    }

    if (action === "challenge_finding") {
      const findingId = String(body.findingId ?? "");
      if (!findingId) return NextResponse.json({ error: "findingId required" }, { status: 400 });

      const { data: finding, error: loadErr } = await supabase
        .from("pi_calibration_findings")
        .select("*")
        .eq("id", findingId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (loadErr) throw loadErr;
      if (!finding) return NextResponse.json({ error: "Finding not found" }, { status: 404 });

      const review = await createReviewCase(supabase, {
        userId: user.id,
        subjectKind: "development_gap",
        subjectRefType: "pi_calibration_findings",
        subjectRefId: findingId,
        subjectLabel: String(finding.title),
        subjectSnapshot: {
          findingType: finding.finding_type,
          detail: finding.detail,
          metrics: finding.metrics,
          diagnosticOnly: true,
          capabilityAssigned: false,
        },
      });
      if (review.error || !review.data) {
        throw new Error(review.error ?? "Could not open review case");
      }

      const { error: updErr } = await supabase
        .from("pi_calibration_findings")
        .update({
          status: "challenged",
          review_case_id: review.data.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", findingId)
        .eq("user_id", user.id);
      if (updErr) throw updErr;

      return NextResponse.json({
        ok: true,
        findingId,
        status: "challenged",
        reviewCaseId: review.data.id,
        capabilityAssigned: false,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[career/outcomes] POST failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 },
    );
  }
}
