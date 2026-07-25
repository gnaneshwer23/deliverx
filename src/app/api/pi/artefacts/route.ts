import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import { createArtefact, listArtefacts } from "@/lib/artefacts";
import { isArtefactKind, isArtefactSourceSurface } from "@/lib/artefacts/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({ userId: user.id, email: user.email, surface: "artefacts" });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  try {
    const artefacts = await listArtefacts(supabase, user.id);
    return NextResponse.json({ ok: true, artefacts });
  } catch (error) {
    console.error("[pi/artefacts] list failed", error);
    return NextResponse.json({ error: "Could not list artefacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({ userId: user.id, email: user.email, surface: "artefacts" });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
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
  const title = String(data.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const kindRaw = typeof data.kind === "string" ? data.kind : "other";
  const kind = isArtefactKind(kindRaw) ? kindRaw : "other";
  const surfaceRaw = typeof data.sourceSurface === "string" ? data.sourceSurface : null;
  const sourceSurface =
    surfaceRaw && isArtefactSourceSurface(surfaceRaw) ? surfaceRaw : null;

  const initialContent =
    data.content && typeof data.content === "object"
      ? (data.content as Record<string, unknown>)
      : null;

  try {
    const result = await createArtefact(supabase, {
      userId: user.id,
      kind,
      title,
      summary: typeof data.summary === "string" ? data.summary : undefined,
      sourceSurface,
      workItemRef: typeof data.workItemRef === "string" ? data.workItemRef : null,
      activityRef: typeof data.activityRef === "string" ? data.activityRef : null,
      initialVersion: initialContent
        ? {
            content: initialContent,
            changeNote:
              typeof data.changeNote === "string" ? data.changeNote : undefined,
          }
        : undefined,
    });
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("[pi/artefacts] create failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create artefact" },
      { status: 500 },
    );
  }
}
