import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { extractProductForProject } from "@/services/aiPmProduct";
import { upsertPmProductContext } from "@/services/pmProduct";

type Body = { productType?: string; content?: string };

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
      /* optional */
    }

    if (body.productType) {
      await upsertPmProductContext({ projectId: id, productType: body.productType });
    }

    const result = await extractProductForProject({
      projectId: id,
      projectName: project.name,
      productType: body.productType ?? project.delivery_type,
      extraContent: body.content,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const ai = aiRouteError(err);
    if (ai) return ai;
    return apiErrorResponse(err);
  }
}
