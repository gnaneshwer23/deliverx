import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLaunchpadSession, refreshReadinessScore, saveArtefact } from "@/lib/launchpad/store";

const ARTEFACT_TYPES = new Set([
  "cv_draft",
  "linkedin_notes",
  "portfolio_case",
  "star_story",
  "mock_interview",
  "branding_note",
]);

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
  const artefactType = String(data.artefactType ?? "");
  const title = String(data.title ?? "").trim();

  if (!ARTEFACT_TYPES.has(artefactType) || !title) {
    return NextResponse.json({ error: "Invalid artefact" }, { status: 400 });
  }

  const session = await getLaunchpadSession(supabase, user.id);

  try {
    const artefact = await saveArtefact(supabase, user, {
      profileId: (session.profile?.id as string | undefined) ?? null,
      artefactType: artefactType as
        | "cv_draft"
        | "linkedin_notes"
        | "portfolio_case"
        | "star_story"
        | "mock_interview"
        | "branding_note",
      title,
      content:
        typeof data.content === "object" && data.content
          ? (data.content as Record<string, unknown>)
          : {},
      status:
        data.status === "ready" || data.status === "archived" || data.status === "draft"
          ? data.status
          : "draft",
    });

    const readinessScore = await refreshReadinessScore(supabase, user.id);

    return NextResponse.json({
      mode: "database",
      artefact,
      readinessScore,
    });
  } catch (error) {
    console.error("Launchpad artefact failed", error);
    return NextResponse.json({ error: "Failed to save artefact" }, { status: 500 });
  }
}
