import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { respondToBaselineItem } from "@/lib/pi-assessment/session";
import { enforcePiApiRateLimit } from "@/services/piApiRateLimit";

export const dynamic = "force-dynamic";

/**
 * Submit a response to the current baseline item.
 * Stores the answer only — evidence ledger append happens on complete.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimited = await enforcePiApiRateLimit(user.id);
  if (rateLimited) return rateLimited;

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "baseline",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let body: {
    sessionId?: string;
    itemId?: string;
    responseText?: string;
    responsePayload?: Record<string, unknown>;
    workSample?: {
      filename?: string;
      extractKind?: string;
      charCount?: number;
      extractedText?: string;
      storageRef?: string | null;
    };
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.sessionId || !body.itemId || typeof body.responseText !== "string") {
    return NextResponse.json(
      { error: "sessionId, itemId and responseText are required" },
      { status: 400 },
    );
  }

  try {
    const result = await respondToBaselineItem(supabase, {
      userId: user.id,
      sessionId: body.sessionId,
      itemId: body.itemId,
      responseText: body.responseText,
      responsePayload: body.responsePayload,
      workSample: body.workSample,
    });

    return NextResponse.json({
      ok: true,
      responseId: result.responseId,
      answeredCount: result.answeredCount,
      canComplete: result.canComplete,
      done: result.done,
      nextItem: result.nextItem
        ? {
            id: result.nextItem.id,
            kind: result.nextItem.itemKind,
            slug: result.nextItem.slug,
            title: result.nextItem.title,
            prompt: result.nextItem.prompt,
            competencyCodes: result.nextItem.competencyCodes,
            acceptsUpload: Boolean(result.nextItem.payload.acceptsUpload),
            selectionReason: result.nextItem.selectionReason,
          }
        : null,
      session: {
        id: result.session.id,
        status: result.session.status,
        frameworkVersionId: result.session.frameworkVersionId,
      },
      capabilityAssigned: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Respond failed";
    const status =
      message.includes("too short") ||
      message.includes("too long") ||
      message.includes("already answered") ||
      message.includes("no longer active")
        ? 400
        : message === "Session not found" || message === "Item not found"
          ? 404
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
