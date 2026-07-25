import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { migrateLaunchpadCase } from "@/lib/verified-portfolio/store";

export const dynamic = "force-dynamic";

/** H. Migrate Launchpad portfolio_case → VPP draft */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const artefactId = String((body as { artefactId?: string })?.artefactId ?? "").trim();
  if (!artefactId) {
    return NextResponse.json({ error: "artefactId required" }, { status: 400 });
  }

  try {
    const entry = await migrateLaunchpadCase(supabase, user.id, artefactId);
    return NextResponse.json({
      entry,
      notice:
        "Migrated to draft portfolio entry. Link additional evidence before sharing. Not DeliverX-verified.",
    });
  } catch (error) {
    console.error("[vpp] migrate failed", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
