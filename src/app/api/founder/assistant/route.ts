import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { createClient } from "@/lib/supabase/server";
import { askFounderAssistant } from "@/services/aiFounder";
import { getFounderContext } from "@/services/founderContext";

type Body = { question?: string };

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const question = body.question?.trim();
    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("organisations(name)")
      .maybeSingle();

    const ctx = await getFounderContext().catch(() => null);
    const orgName =
      (profile?.organisations as { name?: string } | null)?.name ?? undefined;

    const answer = await askFounderAssistant({
      orgName,
      question,
      context: JSON.stringify({
        summary: ctx?.ai_summary,
        financials: ctx?.financials ?? {},
        objectives: ctx?.strategic_objectives ?? [],
        investor: ctx?.investor_snapshot ?? {},
      }),
    });

    return NextResponse.json({ ok: true, answer });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
