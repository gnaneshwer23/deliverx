import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LAUNCHPAD_MODULES, type LaunchpadModuleKey } from "@/lib/launchpad/score";
import {
  getLaunchpadSession,
  refreshReadinessScore,
  upsertModuleProgress,
} from "@/lib/launchpad/store";

const MODULE_KEYS = new Set(LAUNCHPAD_MODULES.map((m) => m.key));

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const data = body as Record<string, unknown>;
  const moduleKey = String(data.moduleKey ?? "");
  if (!MODULE_KEYS.has(moduleKey as LaunchpadModuleKey)) {
    return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }

  const statusRaw = String(data.status ?? "completed");
  const status =
    statusRaw === "in_progress" || statusRaw === "not_started" || statusRaw === "completed"
      ? statusRaw
      : "completed";

  const session = await getLaunchpadSession(supabase, user.id);
  if (!session.profile) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  try {
    const progress = await upsertModuleProgress(
      supabase,
      user.id,
      session.profile.id as string,
      moduleKey as LaunchpadModuleKey,
      {
        status,
        score: typeof data.score === "number" ? data.score : undefined,
        summary: typeof data.summary === "string" ? data.summary : undefined,
        state:
          typeof data.state === "object" && data.state
            ? (data.state as Record<string, unknown>)
            : undefined,
      },
    );

    const readinessScore = await refreshReadinessScore(supabase, user.id);

    return NextResponse.json({
      mode: "database",
      progress,
      readinessScore,
    });
  } catch (error) {
    console.error("Launchpad progress failed", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
