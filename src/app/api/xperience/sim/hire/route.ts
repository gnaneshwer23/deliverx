import { NextResponse } from "next/server";
import { runHiringInterviewAction } from "@/lib/experience-sim/hiring-runtime";
import { createClient } from "@/lib/supabase/server";
import { isXpHiringInterviewEnabled } from "@/lib/xperience/hiring-interview";

export const maxDuration = 30;

const ACTIONS = new Set(["open", "turn", "complete", "skip"]);

export async function POST(request: Request) {
  if (!isXpHiringInterviewEnabled()) {
    return NextResponse.json({ error: "hiring_interview_disabled" }, { status: 404 });
  }

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
    action?: string;
    text?: string;
    claims?: {
      background?: string;
      targetRole?: string;
      selectedSkill?: string;
      workStyle?: string;
    };
  };

  const enrolmentId = String(data.enrolmentId ?? "").trim();
  const action = String(data.action ?? "").trim();
  if (!enrolmentId || !ACTIONS.has(action)) {
    return NextResponse.json({ error: "enrolmentId and action required" }, { status: 400 });
  }

  try {
    const result = await runHiringInterviewAction(supabase, user, {
      enrolmentId,
      action: action as "open" | "turn" | "complete" | "skip",
      text: data.text,
      claims: data.claims,
    });

    if (!result.ok) {
      const status =
        result.error === "hiring_interview_disabled"
          ? 404
          : result.error === "hiring_interview_too_short" || result.error === "answer_too_short"
            ? 400
            : result.error === "hiring_interview_not_offered"
              ? 409
              : 400;
      return NextResponse.json(
        {
          error: result.error,
          state: result.state ?? null,
          capabilityAssigned: false,
        },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      state: result.state,
      interview: result.state.hiringInterview ?? null,
      capabilityAssigned: false,
      verified: false,
    });
  } catch (error) {
    console.error("Experience hiring interview failed", error);
    return NextResponse.json({ error: "Hiring interview failed" }, { status: 500 });
  }
}
