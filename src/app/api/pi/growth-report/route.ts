import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { loadLatestGrowthReport } from "@/lib/pi-assessment/growth-report";

export const dynamic = "force-dynamic";

/** Latest citation-backed growth report for the authenticated user. */
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
    const report = await loadLatestGrowthReport(supabase, user.id);
    if (!report) {
      return NextResponse.json({
        ok: true,
        growthReport: null,
        message:
          "No growth report yet. Complete baseline → Experience → final assessment (with transfer) under the same framework pin.",
        capabilityAssigned: false,
        deliverxVerified: false,
      });
    }
    return NextResponse.json({
      ok: true,
      growthReport: report,
      capabilityAssigned: false,
      deliverxVerified: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Load failed" },
      { status: 500 },
    );
  }
}
