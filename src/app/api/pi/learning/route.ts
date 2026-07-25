import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  createLearningItem,
  ensureLearningPathsFromGaps,
  listLearningItems,
  listLearningPaths,
  loadLearningSummary,
  recommendLearningFromGaps,
  isLearningItemKind,
  type CreateLearningItemInput,
} from "@/lib/learning-intelligence";
import { loadActiveExperiencePlan } from "@/lib/experience-planner";
import { loadRecentSnapshotClaims, toPiProfileScoreRun } from "@/lib/capability-engine/snapshot-claims";

export const dynamic = "force-dynamic";

/**
 * GET /api/pi/learning — items, paths, gap recommendations, summary.
 * Never assigns capability.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "learning",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  try {
    const [items, paths, summary, snapshotPack, activePlan, onboarding] = await Promise.all([
      listLearningItems(supabase, user.id),
      listLearningPaths(supabase, user.id),
      loadLearningSummary(supabase, user.id),
      loadRecentSnapshotClaims(supabase, user.id, 1),
      loadActiveExperiencePlan(supabase, user.id).catch(() => null),
      supabase
        .from("pi_onboarding_sessions")
        .select("payload")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const scoreRun = snapshotPack.latest
      ? toPiProfileScoreRun(snapshotPack.latest)
      : null;
    const payload = (onboarding.data?.payload ?? {}) as Record<string, unknown>;
    const targetRole =
      typeof payload.targetRole === "string"
        ? payload.targetRole
        : typeof payload.target_role === "string"
          ? payload.target_role
          : null;

    const gaps = scoreRun?.gaps ?? [];
    const recommendations = recommendLearningFromGaps({
      gaps,
      targetRole,
      experienceHref: activePlan?.href ?? "/experience/app",
    });

    // Persist offered paths when gaps exist (idempotent)
    let persistedPaths = paths;
    if (gaps.length) {
      const ensured = await ensureLearningPathsFromGaps(supabase, {
        userId: user.id,
        gaps,
        targetRole,
        experienceHref: activePlan?.href ?? "/experience/app",
        sourceSnapshotId: scoreRun?.snapshotId ?? null,
        sourceScoreRunId: scoreRun?.scoreRunId ?? null,
        frameworkVersionId: scoreRun?.frameworkVersionId ?? null,
      });
      persistedPaths = ensured.paths;
    }

    return NextResponse.json({
      items,
      paths: persistedPaths,
      recommendations,
      summary,
      gaps,
      targetRole,
      experienceHref: activePlan?.href ?? "/experience/app",
      capabilityAssigned: false as const,
      learningNotCapability: true as const,
      notice:
        "Learning creates knowledge evidence only. Capability levels are assigned only by ScoreRun on practice evidence.",
    });
  } catch (err) {
    console.error("[pi/learning] GET failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Learning load failed" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/pi/learning — create a learning item (+ ledger knowledge evidence).
 * Body: CreateLearningItemInput. Never triggers ScoreRun. Never assigns capability.
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
    surface: "learning",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let body: CreateLearningItemInput;
  try {
    body = (await request.json()) as CreateLearningItemInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!isLearningItemKind(body.kind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  try {
    const result = await createLearningItem(supabase, user.id, body);
    return NextResponse.json({
      ok: true,
      item: result.item,
      evidenceId: result.evidenceId,
      capabilityAssigned: false as const,
      learningNotCapability: true as const,
      scoreRunTriggered: false as const,
      notice:
        "Logged as knowledge evidence. Completing learning does not assign capability or light Verified.",
    });
  } catch (err) {
    console.error("[pi/learning] POST failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 500 },
    );
  }
}
