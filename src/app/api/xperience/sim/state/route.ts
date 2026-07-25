import { NextResponse } from "next/server";
import { ensureSimState } from "@/lib/experience-sim/runtime";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrolmentId = new URL(request.url).searchParams.get("enrolmentId")?.trim();
  if (!enrolmentId) {
    return NextResponse.json({ error: "enrolmentId required" }, { status: 400 });
  }

  try {
    const state = await ensureSimState(supabase, enrolmentId, user.id);
    return NextResponse.json({
      ok: true,
      state,
      capabilityAssigned: false,
    });
  } catch (error) {
    console.error("Experience sim state failed", error);
    return NextResponse.json({ error: "State unavailable" }, { status: 404 });
  }
}
