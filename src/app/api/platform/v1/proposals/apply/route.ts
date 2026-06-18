import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { applyPlatformProposal } from "@/services/platformApi";

export async function POST(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "write:proposals");
  if (authResult instanceof Response) return authResult;

  const body = (await req.json()) as {
    proposalId?: string;
    reviewerNotes?: string;
  };

  if (!body.proposalId?.trim()) {
    return platformV1Json(
      { error: "proposalId is required" },
      authResult.rateHeaders,
      400,
    );
  }

  try {
    const proposal = await applyPlatformProposal(
      authResult.auth.orgId,
      body.proposalId.trim(),
      body.reviewerNotes,
    );
    return platformV1Json(
      {
        ok: true,
        organisationId: authResult.auth.orgId,
        proposal: {
          id: proposal.id,
          projectId: proposal.project_id,
          actionType: proposal.action_type,
          title: proposal.title,
          status: proposal.status,
          appliedAt: proposal.applied_at,
          applyResult: proposal.apply_result,
        },
      },
      authResult.rateHeaders,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not apply proposal";
    const status = message.includes("not found") ? 404 : 400;
    return platformV1Json({ error: message }, authResult.rateHeaders, status);
  }
}
