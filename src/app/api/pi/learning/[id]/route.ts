import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import { updateLearningItem } from "@/lib/learning-intelligence";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/pi/learning/[id] — update reflection / advance level / link application evidence.
 * Never assigns capability. Never auto-runs ScoreRun.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "learning",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: {
    reflection?: string;
    concepts?: string[];
    relevanceToRole?: string;
    relevanceToGaps?: string[];
    applicationEvidenceIds?: string[];
    applicationHref?: string | null;
    advance?: boolean;
    measuredLevelChange?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const item = await updateLearningItem(supabase, user.id, id, body);
    return NextResponse.json({
      ok: true,
      item,
      capabilityAssigned: false as const,
      learningNotCapability: true as const,
      scoreRunTriggered: false as const,
    });
  } catch (err) {
    console.error("[pi/learning/id] PATCH failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
