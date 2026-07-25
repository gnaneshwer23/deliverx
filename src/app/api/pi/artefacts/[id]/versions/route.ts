import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import { addArtefactVersion, getArtefactDetail } from "@/lib/artefacts";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({ userId: user.id, email: user.email, surface: "artefacts" });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  try {
    const detail = await getArtefactDetail(supabase, user.id, id);
    if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, ...detail });
  } catch (error) {
    console.error("[pi/artefacts/versions] read failed", error);
    return NextResponse.json({ error: "Could not load artefact" }, { status: 500 });
  }
}

export async function POST(request: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const content =
    data.content && typeof data.content === "object"
      ? (data.content as Record<string, unknown>)
      : null;
  if (!content) {
    return NextResponse.json({ error: "Version content is required" }, { status: 400 });
  }

  try {
    const result = await addArtefactVersion(supabase, {
      userId: user.id,
      artefactId: id,
      title: typeof data.title === "string" ? data.title : undefined,
      content,
      storageRef: typeof data.storageRef === "string" ? data.storageRef : null,
      changeNote: typeof data.changeNote === "string" ? data.changeNote : undefined,
    });
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("[pi/artefacts/versions] create failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add version" },
      { status: 500 },
    );
  }
}
