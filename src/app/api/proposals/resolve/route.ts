import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import {
  approveAndApplyProposal,
  resolveProposal,
} from "@/services/proposedActions";

type Body = {
  id?: string;
  action?: "approve_and_apply" | "reject";
  reviewerNotes?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.id || !body.action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (body.action === "reject") {
      const proposal = await resolveProposal(body.id, "rejected", body.reviewerNotes);
      return NextResponse.json({ ok: true, proposal });
    }

    const proposal = await approveAndApplyProposal(body.id, body.reviewerNotes);
    return NextResponse.json({ ok: true, proposal });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
