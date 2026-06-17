import { NextResponse } from "next/server";
import { aiRouteError } from "@/lib/api/ai-route";
import { requireProjectAccess } from "@/lib/api/auth";
import { generateEstimationPacks } from "@/services/aiEstimationPacks";
import { upsertEstimationPack } from "@/services/estimationPacks";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { project } = await requireProjectAccess(id);

    const drafts = await generateEstimationPacks({
      projectId: id,
      projectName: project.name,
      goal: project.goal,
      deliveryType: project.delivery_type,
      timeline: project.timeline,
    });

    const packs = await Promise.all(
      drafts.map((draft) =>
        upsertEstimationPack({
          projectId: id,
          role: draft.role,
          lineItems: draft.lineItems,
          confidence: draft.confidence,
          rationale: draft.rationale,
          status: "pending",
        }),
      ),
    );

    return NextResponse.json({ ok: true, packs });
  } catch (err) {
    return aiRouteError(err);
  }
}
