import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { processNextEvidenceJobs } from "@/lib/evidence-ledger/process";
import { enforcePiApiRateLimit } from "@/services/piApiRateLimit";
import { PI_ERROR_CODE, piErrorResponse } from "@/lib/api/pi-errors";

export const dynamic = "force-dynamic";

/**
 * Drain processing queue for the authenticated user's jobs (idempotent).
 * Cron/service-role expansion can follow without changing pipeline semantics.
 * B9: honest pending/empty results — never fake success when work remains.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: PI_ERROR_CODE.unauthorized },
      { status: 401 },
    );
  }

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

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
    const failed = result.results.filter((r) => !r.ok);
    return NextResponse.json({
      ...result,
      ok: failed.length === 0,
      pending:
        result.processed === 0
          ? "No queued evidence jobs ready right now."
          : failed.length > 0
            ? "Some evidence jobs need another attempt. Please try again shortly."
            : null,
      retryHint:
        failed.length > 0
          ? "Evidence processing is idempotent — retry safely; nothing invents capability."
          : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "process_failed";
    return piErrorResponse(
      500,
      message === "process_failed"
        ? "Could not process evidence jobs. Please try again."
        : message,
      PI_ERROR_CODE.retryable,
    );
  }
}
