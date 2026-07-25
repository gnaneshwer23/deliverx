import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ORG_STRUCTURE_INVARIANTS,
  loadOrgStructure,
  resolveOrgActor,
} from "@/lib/org-structure";

export const dynamic = "force-dynamic";

export async function GET() {
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

  try {
    const snapshot = await loadOrgStructure(supabase, actor.organisationId);
    return NextResponse.json({
      ok: true,
      ...snapshot,
      ...ORG_STRUCTURE_INVARIANTS,
    });
  } catch (error) {
    console.error("[org/structure] list failed", error);
    return NextResponse.json({ error: "Could not load organisation structure" }, { status: 500 });
  }
}
