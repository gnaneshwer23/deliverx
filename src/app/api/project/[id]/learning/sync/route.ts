import { requireProjectAccess, apiErrorResponse } from "@/lib/api/auth";
import {
  persistStructuredLessonsFromClosure,
  syncProjectLearningSignals,
} from "@/services/continuousLearning";
import type { ClosurePackage } from "@/services/closurePackage";

type Body = {
  lessonsOnly?: boolean;
  closurePackage?: ClosurePackage;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    await requireProjectAccess(id);

    let body: Body = {};
    try {
      body = (await req.json()) as Body;
    } catch {
      body = {};
    }

    let lessonCount = 0;
    if (body.closurePackage) {
      lessonCount = await persistStructuredLessonsFromClosure(id, body.closurePackage);
    }

    if (body.lessonsOnly) {
      return Response.json({ ok: true, lessonCount });
    }

    const signals = await syncProjectLearningSignals(id);
    return Response.json({ ok: true, lessonCount, ...signals });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
