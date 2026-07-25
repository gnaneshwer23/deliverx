import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { getNextBaselineItem } from "@/lib/pi-assessment/session";

export const dynamic = "force-dynamic";

/**
 * Fetch / select the next adaptive baseline item for a session.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "baseline",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let body: { sessionId?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const result = await getNextBaselineItem(supabase, user.id, body.sessionId);
    return NextResponse.json({
      ok: true,
      session: {
        id: result.session.id,
        status: result.session.status,
        frameworkVersionId: result.session.frameworkVersionId,
        frameworkSlug: result.session.frameworkSlug,
        frameworkVersion: result.session.frameworkVersion,
      },
      currentItem: result.currentItem
        ? {
            id: result.currentItem.id,
            kind: result.currentItem.itemKind,
            slug: result.currentItem.slug,
            title: result.currentItem.title,
            prompt: result.currentItem.prompt,
            competencyCodes: result.currentItem.competencyCodes,
            acceptsUpload: Boolean(result.currentItem.payload.acceptsUpload),
            selectionReason: result.currentItem.selectionReason,
          }
        : null,
      answeredCount: result.answeredCount,
      itemCount: result.itemCount,
      canComplete: result.canComplete,
      done: result.done,
      capabilityAssigned: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Next failed";
    const status = message === "Session not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
