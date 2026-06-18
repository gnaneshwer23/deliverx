import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { createClient } from "@/lib/supabase/server";
import { analyseFounderContext } from "@/services/aiFounder";
import { upsertFounderContext } from "@/services/founderContext";

type Body = {
  companyType?: string;
  businessGoals?: string[];
  content?: string;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("organisation_id, organisations(name)")
      .maybeSingle();

    if (!profile?.organisation_id) {
      return NextResponse.json({ error: "No organisation" }, { status: 400 });
    }

    const body = (await req.json()) as Body;

    if (body.companyType || body.businessGoals) {
      await upsertFounderContext({
        companyType: body.companyType,
        businessGoals: body.businessGoals,
      });
    }

    const orgName =
      (profile.organisations as { name?: string } | null)?.name ?? undefined;

    const result = await analyseFounderContext({
      orgName,
      companyType: body.companyType,
      businessGoals: body.businessGoals,
      extraContent: body.content,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
