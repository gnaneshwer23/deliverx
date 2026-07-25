import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { assertPiAccess } from "@/lib/access/gate";
import { respondToFinalItem } from "@/lib/pi-assessment/final-session";

export const dynamic = "force-dynamic";

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
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.sessionId || !body.itemId || typeof body.responseText !== "string") {
    return NextResponse.json(
      { error: "sessionId, itemId and responseText required" },
      { status: 400 },
    );
  }

  try {
    const result = await respondToFinalItem(supabase, {
      userId: user.id,
      sessionId: body.sessionId,
      itemId: body.itemId,
      responseText: body.responseText,
      responsePayload: body.responsePayload,
      workSample: body.workSample,
    });

    return NextResponse.json({
      ok: true,
      sessionId: result.session.id,
      responseId: result.responseId,
      answeredCount: result.answeredCount,
      transferAnswered: result.transferAnswered,
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
            industry: result.nextItem.payload.industry ?? null,
            transfer: result.nextItem.itemKind === "transfer",
          }
        : null,
      capabilityAssigned: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Respond failed";
    const status =
      message.includes("too short") ||
      message.includes("too long") ||
      message.includes("already") ||
      message.includes("not found") ||
      message.includes("no longer")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
