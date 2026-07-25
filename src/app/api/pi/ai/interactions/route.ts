import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPiAccess } from "@/lib/access/gate";
import { listAiInteractions } from "@/lib/ai-orchestration";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gate = assertPiAccess({
    userId: user.id,
    email: user.email,
    surface: "ai_interactions",
  });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;
  const agentSlug = url.searchParams.get("agent") ?? undefined;

  try {
    const interactions = await listAiInteractions(supabase, user.id, {
      limit,
      agentSlug: agentSlug || undefined,
    });
    return NextResponse.json({ ok: true, interactions });
  } catch (error) {
    console.error("[pi/ai/interactions] list failed", error);
    return NextResponse.json({ error: "Could not list AI interactions" }, { status: 500 });
  }
}
