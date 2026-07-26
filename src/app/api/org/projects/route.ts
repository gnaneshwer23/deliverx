import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PilotAdminError,
  assertPilotAdminGate,
  isPilotAdminEnabled,
  listOrgProjectConfigs,
  resolvePilotAdminActor,
} from "@/lib/pilot-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/org/projects — org admin lists pilot project configs for their organisation.
 */

export async function GET() {
  if (!isPilotAdminEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await resolvePilotAdminActor(supabase, user.id);
  if (!actor) {
    return NextResponse.json({ error: "No organisation" }, { status: 403 });
  }

  try {
    assertPilotAdminGate(actor);
    const projects = await listOrgProjectConfigs(supabase, actor.organisationId);
    return NextResponse.json({
      ok: true,
      projects,
      writesEvidence: false,
      lightsVerified: false,
    });
  } catch (error) {
    if (error instanceof PilotAdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[org/projects] list failed", error);
    return NextResponse.json({ error: "Could not list projects" }, { status: 500 });
  }
}
