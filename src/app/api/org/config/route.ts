import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PilotAdminError,
  assertPilotAdminGate,
  isPilotAdminEnabled,
  loadOrgConfig,
  resolvePilotAdminActor,
  updateOrgConfig,
} from "@/lib/pilot-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/org/config — org admin reads pilot organisation config.
 * PATCH /api/org/config — org admin updates allowed org fields (audited).
 * Never mutates evidence, capability, or Verified.
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
    const organisation = await loadOrgConfig(supabase, actor.organisationId);
    if (!organisation) {
      return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      organisation,
      writesEvidence: false,
      lightsVerified: false,
    });
  } catch (error) {
    if (error instanceof PilotAdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[org/config] get failed", error);
    return NextResponse.json({ error: "Could not load organisation config" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    industry?: unknown;
    teamSize?: unknown;
    deliveryType?: unknown;
  };

  try {
    const organisation = await updateOrgConfig(supabase, actor, value);
    return NextResponse.json({
      ok: true,
      organisation,
      writesEvidence: false,
      lightsVerified: false,
    });
  } catch (error) {
    if (error instanceof PilotAdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[org/config] patch failed", error);
    return NextResponse.json({ error: "Could not update organisation config" }, { status: 500 });
  }
}
