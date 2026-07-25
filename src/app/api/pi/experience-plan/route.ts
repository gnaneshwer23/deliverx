import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  createOrRefreshExperiencePlan,
  loadActiveExperiencePlan,
  planExperienceFromGaps,
  buildPlanInputFromProfile,
} from "@/lib/experience-planner";

export const dynamic = "force-dynamic";

/**
 * GET /api/pi/experience-plan — active plan or dry-run recommendation from gaps.
 * Never assigns capability.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "experience",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const preview = url.searchParams.get("preview") === "1";

    if (!preview) {
      const active = await loadActiveExperiencePlan(supabase, user.id);
      if (active) {
        return NextResponse.json({
          plan: active,
          capabilityAssigned: false as const,
        });
      }
    }

    const input = await buildPlanInputFromProfile(supabase, user.id);
    const recommendation = planExperienceFromGaps(input);
    return NextResponse.json({
      plan: null,
      recommendation,
      capabilityAssigned: false as const,
    });
  } catch (err) {
    console.error("[pi/experience-plan] GET failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan load failed" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/pi/experience-plan — create or refresh a persisted gap-ranked plan.
 * Body: { force?: boolean }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "experience",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let body: { force?: boolean } = {};
  try {
    body = (await request.json()) as { force?: boolean };
  } catch {
    body = {};
  }

  try {
    const result = await createOrRefreshExperiencePlan(supabase, user.id, {
      force: Boolean(body.force),
    });
    return NextResponse.json({
      ok: true,
      plan: result.plan,
      created: result.created,
      capabilityAssigned: false as const,
      notice:
        "Plan recommends Experience emphasis from assessment gaps. Capability levels are assigned only by capability assessment.",
    });
  } catch (err) {
    console.error("[pi/experience-plan] POST failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan create failed" },
      { status: 500 },
    );
  }
}
