import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { isGlobalSearchEnabled, runGlobalSearch } from "@/lib/global-search";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/pi/search?q= — self-only global search for the suite shell.
 * Returns catalogue destinations/help plus the caller's own evidence, projects,
 * artefacts, and Experience enrolments. Never accepts a target user id.
 */
export async function GET(request: Request) {
  if (!isGlobalSearchEnabled()) {
    return NextResponse.json({ error: "Global search is disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "search",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 200);

  try {
    const items = await runGlobalSearch(supabase, user.id, q);
    return NextResponse.json({ ok: true, query: q, items });
  } catch (error) {
    console.error("[pi/search] failed", error);
    return NextResponse.json({ error: "Could not run search" }, { status: 500 });
  }
}
