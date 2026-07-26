import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { isGlobalSearchEnabled, runGlobalSearch } from "@/lib/global-search";
import { createClient } from "@/lib/supabase/server";
import { enforcePiApiRateLimit } from "@/services/piApiRateLimit";
import { PI_ERROR_CODE, piErrorResponse } from "@/lib/api/pi-errors";

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

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

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
    return piErrorResponse(
      500,
      "Could not run search. Please try again.",
      PI_ERROR_CODE.server,
    );
  }
}
