import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  OrgStructureError,
  addDepartmentMember,
  addTeamMember,
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
    kind?: unknown;
    departmentId?: unknown;
    teamId?: unknown;
    userId?: unknown;
    memberRole?: unknown;
  };

  try {
    if (value.kind === "department") {
      const member = await addDepartmentMember(supabase, actor, value);
      return NextResponse.json({ ok: true, member, capabilityAssigned: false });
    }
    if (value.kind === "team") {
      const member = await addTeamMember(supabase, actor, value);
      return NextResponse.json({ ok: true, member, capabilityAssigned: false });
    }
    return NextResponse.json({ error: "kind must be department or team" }, { status: 400 });
  } catch (error) {
    if (error instanceof OrgStructureError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[org/members] create failed", error);
    return NextResponse.json({ error: "Could not add member" }, { status: 500 });
  }
}
