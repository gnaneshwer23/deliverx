import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { processNextEvidenceJobs } from "@/lib/evidence-ledger/process";

export const dynamic = "force-dynamic";

/**
 * Drain processing queue for the authenticated user's jobs (idempotent).
 * Cron/service-role expansion can follow without changing pipeline semantics.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let limit = 5;
  try {
    const body = (await request.json()) as { limit?: number };
    if (typeof body.limit === "number" && body.limit > 0 && body.limit <= 25) {
      limit = body.limit;
    }
  } catch {
    // empty body ok
  }

  try {
    const result = await processNextEvidenceJobs(supabase, {
      limit,
      workerId: `user-${user.id.slice(0, 8)}`,
      userId: user.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "process_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
