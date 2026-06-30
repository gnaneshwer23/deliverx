import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import {
  getProjectBusinessCaseStatus,
  uploadProjectBusinessCase,
} from "@/services/projectBusinessCaseFlow";

type Body = {
  content?: string;
  title?: string;
  fileName?: string;
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);
    const status = await getProjectBusinessCaseStatus(id);
    return NextResponse.json({ ok: true, status });
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
    const { project } = await requireProjectWriteAccess(id);
    const body = (await req.json()) as Body;
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const result = await uploadProjectBusinessCase({
      projectId: id,
      projectName: project.name as string,
      content,
      title: body.title,
      fileName: body.fileName,
    });

    revalidatePath("/workspace/pm-mission");
    revalidatePath("/workspace/proposals");
    revalidatePath(`/project/${id}`);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
