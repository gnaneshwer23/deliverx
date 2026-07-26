import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import {
  buildDailyBriefing,
  isContextualHomeEnabled,
  projectHomeSignals,
} from "@/lib/contextual-home";
import { parseSuiteProduct } from "@/lib/marketing/product-intent";
import { buildPiProfileAggregate } from "@/lib/pi-profile/aggregate";
import { getXperienceSession } from "@/lib/xperience/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/pi/profile — single read of the Professional Intelligence Profile centre.
 * Read-only. Never assigns capability.
 * When DELIVERX_CONTEXTUAL_HOME is on, attaches Daily Briefing projection.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "profile",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  try {
    const profile = await buildPiProfileAggregate(supabase, user.id);

    if (!isContextualHomeEnabled()) {
      return NextResponse.json(profile);
    }

    try {
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      const productIntent = parseSuiteProduct(
        typeof meta?.product === "string" ? meta.product : null,
      );

      const [{ enrolment }, { data: userRow }, verifiedCount] = await Promise.all([
        getXperienceSession(supabase, user.id),
        supabase
          .from("users")
          .select("organisation_id")
          .eq("id", user.id)
          .maybeSingle(),
        countAttestedVerifiedClaims(supabase, user.id),
      ]);

      const showWorkspaceSummary =
        productIntent === "team-copilot" || Boolean(userRow?.organisation_id);

      const signals = projectHomeSignals(profile, {
        enrolment: enrolment
          ? {
              id: enrolment.id as string,
              company_name: (enrolment.company_name as string | null) ?? null,
              day: typeof enrolment.day === "number" ? enrolment.day : null,
              status: (enrolment.status as string | null) ?? null,
              lifecycle_phase:
                (enrolment.lifecycle_phase as string | null | undefined) ?? null,
              state: enrolment.state,
            }
          : null,
        productIntent,
        showWorkspaceSummary,
        verifiedClaimCount: verifiedCount,
      });

      return NextResponse.json({
        ...profile,
        homeBriefing: buildDailyBriefing(signals),
      });
    } catch (briefingErr) {
      // Briefing failure must not blank the Profile centre.
      console.error("[pi/profile] home briefing failed", briefingErr);
      return NextResponse.json({ ...profile, homeBriefing: null });
    }
  } catch (err) {
    console.error("[pi/profile] aggregate failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Profile load failed" },
      { status: 500 },
    );
  }
}

/** T8-honest count: externally_attested + externally_verified only. */
async function countAttestedVerifiedClaims(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("vpp_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("verifier_status", "externally_attested")
    .eq("evidence_strength", "externally_verified");

  if (error) {
    // Table/column drift must not invent Verified — treat as zero.
    console.warn("[pi/profile] verified count skipped", error.message);
    return 0;
  }
  return count ?? 0;
}
