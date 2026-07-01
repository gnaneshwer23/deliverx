import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import {
  approveAndApplyProposal,
  patchPendingProposalFields,
  resolveProposal,
} from "@/services/proposedActions";

type Body = {
  id?: string;
  action?: "approve_and_apply" | "reject" | "update";
  reviewerNotes?: string;
  title?: string;
  summary?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.id || !body.action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (body.action === "update") {
      const proposal = await patchPendingProposalFields(body.id, {
        title: body.title,
        summary: body.summary,
      });
      return NextResponse.json({ ok: true, proposal });
    }

    if (body.action === "reject") {
      const proposal = await resolveProposal(body.id, "rejected", body.reviewerNotes);
      refreshProjectDashboards(proposal.project_id);
      return NextResponse.json({ ok: true, proposal });
    }

    if (body.title !== undefined || body.summary !== undefined) {
      await patchPendingProposalFields(body.id, {
        title: body.title,
        summary: body.summary,
      });
    }

    const proposal = await approveAndApplyProposal(body.id, body.reviewerNotes);
    refreshProjectDashboards(proposal.project_id);
    return NextResponse.json({ ok: true, proposal });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
