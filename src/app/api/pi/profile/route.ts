import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { buildPiProfileAggregate } from "@/lib/pi-profile/aggregate";

export const dynamic = "force-dynamic";

/**
 * GET /api/pi/profile — single read of the Professional Intelligence Profile centre.
 * Read-only. Never assigns capability.
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
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[pi/profile] aggregate failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Profile load failed" },
      { status: 500 },
    );
  }
}
