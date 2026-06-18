import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { createClient } from "@/lib/supabase/server";
import { parseBusinessCaseReviewJson } from "@/services/aiBusinessCaseReview";
import {
  bootstrapProjectWorkspaces,
  getProjectBootstrapStatus,
} from "@/services/projectBootstrap";

type Body = {
  brief?: string;
  bcReport?: string;
  discoveryAnswers?: Record<string, string>;
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const status = await getProjectBootstrapStatus(id);
    return NextResponse.json({ ok: true, ...status });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const { project } = await requireProjectAccess(id);

    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      /* optional body */
    }

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("users")
      .select("organisations(name)")
      .maybeSingle();

    const orgName =
      (profile?.organisations as { name?: string } | null)?.name ?? null;

    let bcReport = null;
    if (body.bcReport) {
      try {
        bcReport = parseBusinessCaseReviewJson(body.bcReport);
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid business case report." }, { status: 400 });
      }
    }

    const brief =
      body.brief?.trim() ||
      (project.goal ? `${project.name}\n\n${project.goal}` : project.name);

    const summary = await bootstrapProjectWorkspaces({
      projectId: id,
      projectName: project.name,
      brief,
      goal: project.goal,
      deliveryType: project.delivery_type,
      timeline: project.timeline,
      discoveryAnswers: body.discoveryAnswers,
      bcReport,
      orgName,
    });

    revalidatePath(`/project/${id}`);
    revalidatePath("/workspace/dashboard");
    revalidatePath("/workspace/founder");
    revalidatePath("/workspace/product");
    revalidatePath("/workspace/ba");
    revalidatePath("/workspace/pm-mission");
    revalidatePath("/workspace/engineer");
    revalidatePath("/workspace/scrum-mission");
    revalidatePath("/workspace/qa");

    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
