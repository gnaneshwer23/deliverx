import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { startFinalSession } from "@/lib/pi-assessment/final-session";

export const dynamic = "force-dynamic";

/**
 * Start (or resume) a final assessment session with a mandatory transfer task.
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
    surface: "final_assessment",
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
    preferredTransferIndustry?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // empty ok
  }

  try {
    const result = await startFinalSession(supabase, {
      userId: user.id,
      targetRole: body.targetRole,
      targetSeniority: body.targetSeniority,
      resume: body.resume,
      frameworkSlug: body.frameworkSlug,
      frameworkVersion: body.frameworkVersion,
      preferredTransferIndustry: body.preferredTransferIndustry as
        | "civic_tech"
        | "fintech"
        | "logistics"
        | "retail"
        | null
        | undefined,
    });

    return NextResponse.json({
      ok: true,
      resumed: result.resumed,
      catalogSource: result.catalogSource,
      experienceIndustry: result.experienceIndustry,
      transferIndustry: result.transferIndustry,
      session: {
        id: result.session.id,
        status: result.session.status,
        kind: result.session.kind,
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
            industry: result.currentItem.payload.industry ?? null,
            transfer: result.currentItem.itemKind === "transfer",
          }
        : null,
      capabilityAssigned: false,
      notice:
        "Final assessment includes a transfer task in a different industry than Experience. Answers become Evidence Ledger records — not silent capability assignment.",
    });
  } catch (err) {
    console.error("[pi-assessment] final start failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Start failed" },
      { status: 500 },
    );
  }
}
