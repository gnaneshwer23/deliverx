import { NextResponse } from "next/server";
import { submitExperienceReflection } from "@/lib/experience-sim/runtime";
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

  const data = body as { enrolmentId?: string; text?: string };
  const enrolmentId = String(data.enrolmentId ?? "").trim();
  const text = String(data.text ?? "");
  if (!enrolmentId) {
    return NextResponse.json({ error: "enrolmentId required" }, { status: 400 });
  }

  try {
    const result = await submitExperienceReflection(supabase, user, {
      enrolmentId,
      text,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      complete: result.complete,
      state: result.state,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("Experience reflection failed", error);
    return NextResponse.json({ error: "Reflection failed" }, { status: 500 });
  }
}
