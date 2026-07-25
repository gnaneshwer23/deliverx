import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  OrgStructureError,
  createTeam,
  resolveOrgActor,
} from "@/lib/org-structure";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await resolveOrgActor(supabase, user.id);
  if (!actor) {
    return NextResponse.json({ error: "No organisation" }, { status: 403 });
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

  const value = body as {
    name?: unknown;
    description?: unknown;
    departmentId?: unknown;
  };

  try {
    const team = await createTeam(supabase, actor, value);
    return NextResponse.json({
      ok: true,
      team,
      capabilityAssigned: false,
    });
  } catch (error) {
    if (error instanceof OrgStructureError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[org/teams] create failed", error);
    return NextResponse.json({ error: "Could not create team" }, { status: 500 });
  }
}
