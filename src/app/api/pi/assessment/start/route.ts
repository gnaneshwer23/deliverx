import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { startBaselineSession } from "@/lib/pi-assessment/session";

export const dynamic = "force-dynamic";

/**
 * Start (or resume) a baseline assessment session.
 * Pins framework_version_id at start. Does not assign capability.
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

  let body: {
    targetRole?: string;
    targetSeniority?: string;
    resume?: boolean;
    frameworkSlug?: string;
    frameworkVersion?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // empty ok
  }

  try {
    const result = await startBaselineSession(supabase, {
      userId: user.id,
      targetRole: body.targetRole,
      targetSeniority: body.targetSeniority,
      resume: body.resume,
      frameworkSlug: body.frameworkSlug,
      frameworkVersion: body.frameworkVersion,
    });

    return NextResponse.json({
      ok: true,
      resumed: result.resumed,
      catalogSource: result.catalogSource,
      session: {
        id: result.session.id,
        status: result.session.status,
        frameworkVersionId: result.session.frameworkVersionId,
        frameworkSlug: result.session.frameworkSlug,
        frameworkVersion: result.session.frameworkVersion,
        maxItems: result.session.maxItems,
        promptVersion: result.session.promptVersion,
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
      capabilityAssigned: false,
      notice:
        "Baseline captures observed answers as Evidence Ledger records. It does not silently assign capability levels.",
    });
  } catch (err) {
    console.error("[pi-assessment] start failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Start failed" },
      { status: 500 },
    );
  }
}
