import { NextResponse } from "next/server";
import { apiErrorResponse, requireProjectAccess } from "@/lib/api/auth";
import { normalizeLineItems } from "@/services/estimationEngine";
import {
  resolveEstimationPack,
  submitEstimationPack,
  updateEstimationPackItems,
} from "@/services/estimationPacks";
import { getProjectSuccessScore, persistSuccessScoreSnapshot } from "@/services/successScore";

type Body = {
  packId: string;
  action: "approve" | "reject" | "submit" | "modify";
  reviewerNotes?: string;
  lineItems?: Array<{ id?: string; title: string; days: number; notes?: string }>;
  confidence?: number;
  rationale?: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireProjectAccess(id);

    const body = (await req.json()) as Body;
    if (!body.packId || !body.action) {
      return NextResponse.json({ error: "packId and action are required" }, { status: 400 });
    }

    let pack;
    if (body.action === "approve") {
      pack = await resolveEstimationPack(body.packId, "approved", body.reviewerNotes);
    } else if (body.action === "reject") {
      pack = await resolveEstimationPack(body.packId, "rejected", body.reviewerNotes);
    } else if (body.action === "submit") {
      pack = await submitEstimationPack(body.packId);
    } else if (body.action === "modify") {
      if (!body.lineItems?.length) {
        return NextResponse.json({ error: "lineItems required for modify" }, { status: 400 });
      }
      pack = await updateEstimationPackItems(
        body.packId,
        normalizeLineItems(body.lineItems),
        body.confidence,
        body.rationale,
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const successScore = await getProjectSuccessScore(id);
    await persistSuccessScoreSnapshot(id, successScore);

    return NextResponse.json({ ok: true, pack, successScore });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
