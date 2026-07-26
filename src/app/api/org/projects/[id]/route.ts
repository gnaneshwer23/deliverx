import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PilotAdminError,
  isPilotAdminEnabled,
  resolvePilotAdminActor,
  updateProjectConfig,
} from "@/lib/pilot-admin";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/org/projects/[id] — org admin updates allowed project config fields (audited).
 * Never mutates evidence, capability, or Verified.
 */

export async function PATCH(request: Request, context: RouteContext) {
  if (!isPilotAdminEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { id } = await context.params;
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
    goal?: unknown;
    deliveryType?: unknown;
    status?: unknown;
  };

  try {
    const project = await updateProjectConfig(supabase, actor, id, value);
    return NextResponse.json({
      ok: true,
      project,
      writesEvidence: false,
      lightsVerified: false,
    });
  } catch (error) {
    if (error instanceof PilotAdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[org/projects] patch failed", error);
    return NextResponse.json({ error: "Could not update project config" }, { status: 500 });
  }
}
