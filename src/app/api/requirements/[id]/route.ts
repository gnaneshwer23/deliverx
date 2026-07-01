import { NextResponse } from "next/server";
import { apiErrorResponse, requireAuth, requireProjectWriteAccess } from "@/lib/api/auth";
import { getRequirementStats, updateRequirement } from "@/services/baRequirements";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      status?: string;
      title?: string;
      description?: string;
      projectId?: string;
    };

    const { supabase } = await requireAuth();
    const { data: existing, error: fetchError } = await supabase
      .from("requirements")
      .select("project_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing?.project_id) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    const projectId = String(existing.project_id);
    if (body.projectId && body.projectId !== projectId) {
      return NextResponse.json({ error: "Project mismatch" }, { status: 400 });
    }

    await requireProjectWriteAccess(projectId);

    const result = await updateRequirement(id, {
      status: body.status,
      title: body.title,
      description: body.description,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      requirement: result.requirement,
      stats: await getRequirementStats(projectId).catch(() => null),
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
