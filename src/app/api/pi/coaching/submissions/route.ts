import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSubmission,
  isCoachingEvidenceEnabled,
  isCoachingIntakeMethod,
  listSubmissions,
  COACHING_EVIDENCE_DISABLED_NOTICE,
} from "@/lib/coaching-evidence";

export const dynamic = "force-dynamic";

function disabled() {
  return NextResponse.json(
    { error: COACHING_EVIDENCE_DISABLED_NOTICE, enabled: false, deliverxVerified: false },
    { status: 404 },
  );
}

/** List the signed-in learner's own coaching submissions (self-only). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCoachingEvidenceEnabled()) return disabled();

  const { data, error } = await listSubmissions(supabase, user.id);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data: data ?? [], error: null, enabled: true, deliverxVerified: false });
}

/** Create a coaching submission (self-only). Never produces evidence — that
 * requires a human coach confirmation. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCoachingEvidenceEnabled()) return disabled();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const programmeId = String(body.programmeId ?? "").trim();
  const exerciseId = String(body.exerciseId ?? "").trim();
  const title = String(body.title ?? "").trim();
  const intakeMethodRaw = String(body.intakeMethod ?? "text");
  if (!programmeId || !exerciseId || title.length < 3) {
    return NextResponse.json(
      { error: "programmeId, exerciseId, and a title (min 3 chars) are required" },
      { status: 400 },
    );
  }
  if (!isCoachingIntakeMethod(intakeMethodRaw)) {
    return NextResponse.json({ error: "Invalid intakeMethod" }, { status: 400 });
  }

  const content =
    body.content && typeof body.content === "object"
      ? (body.content as Record<string, unknown>)
      : {};
  const selfConfidence =
    body.selfConfidence == null ? null : Number(body.selfConfidence);
  const aiAssisted = body.aiAssisted === true;

  const { data, error } = await createSubmission(supabase, {
    userId: user.id,
    programmeId,
    exerciseId,
    intakeMethod: intakeMethodRaw,
    title,
    content,
    storageRef: typeof body.storageRef === "string" ? body.storageRef : null,
    selfConfidence: Number.isFinite(selfConfidence as number) ? (selfConfidence as number) : null,
    aiAssisted,
    aiContribution:
      aiAssisted && body.aiContribution && typeof body.aiContribution === "object"
        ? (body.aiContribution as Record<string, unknown>)
        : undefined,
  });

  if (error) {
    const status = /not found|not enabled|belong|between 1 and 5/i.test(error) ? 400 : 500;
    return NextResponse.json({ error, deliverxVerified: false }, { status });
  }
  return NextResponse.json(
    { data, error: null, enabled: true, deliverxVerified: false },
    { status: 201 },
  );
}
