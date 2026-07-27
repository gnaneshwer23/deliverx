import { requireProjectAccess } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { DEFAULT_AI_MODEL } from "@/lib/ai/anthropic";
import { computeProjectAlignment } from "@/services/alignment";

export const maxDuration = 30;

type Body = {
  projectId?: string;
  meetingId?: string;
  meetingContext?: string;
  persist?: boolean;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    await requireProjectAccess(projectId);

    const alignment = await computeProjectAlignment(projectId, {
      meetingId: body.meetingId?.trim(),
      meetingContext: body.meetingContext?.trim(),
      source: body.meetingId ? "meeting" : "manual",
      persist: body.persist !== false,
    });

    return Response.json({
      ok: true,
      alignment: {
        score: alignment.score,
        tier: alignment.tier,
        trend: alignment.trend,
        delta: alignment.delta,
        factors: alignment.factors,
        computedAt: alignment.latest?.computed_at,
      },
      model: DEFAULT_AI_MODEL,
    });
  } catch (err) {
    return aiRouteError(err);
  }
}
