import { NextResponse } from "next/server";
import { applyExperienceDecision } from "@/lib/experience-sim/runtime";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as {
    enrolmentId?: string;
    rationale?: string;
    choice?: {
      id?: string;
      label?: string;
    };
  };

  const enrolmentId = String(data.enrolmentId ?? "").trim();
  const choiceId = String(data.choice?.id ?? "").trim();
  const choiceLabel = String(data.choice?.label ?? "").trim();
  if (!enrolmentId || !choiceId || !choiceLabel) {
    return NextResponse.json(
      { error: "enrolmentId and choice required" },
      { status: 400 },
    );
  }

  try {
    const result = await applyExperienceDecision(supabase, user, {
      enrolmentId,
      choiceId,
      choiceLabel,
      rationale: data.rationale,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, state: result.state },
        { status: 409 },
      );
    }

    const summary =
      result.state.consequences.at(-1)?.summary ??
      "Decision applied to the live simulation.";

    return NextResponse.json({
      ok: true,
      summary,
      effects: result.effects,
      coachingHint: result.coachingHint,
      evidenceScore: result.evidenceRecord
        ? Math.max(
            0,
            Math.min(
              100,
              50 +
                Number(result.effects.trust ?? 0) +
                Number(result.effects.delivery ?? 0) +
                Number(result.effects.clarity ?? 0),
            ),
          )
        : null,
      evidenceRecord: result.evidenceRecord,
      state: result.state,
      // Explicit: Experience never assigns capability
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("Experience decision failed", error);
    return NextResponse.json(
      { error: "Decision could not be applied" },
      { status: 500 },
    );
  }
}
