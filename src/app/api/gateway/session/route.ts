import { NextResponse } from "next/server";
import { apiErrorResponse, requireAuth } from "@/lib/api/auth";
import { getGatewaySession, upsertGatewaySession } from "@/services/gatewayOnboarding";
import { isGatewayStep, type GatewayStep } from "@/services/gatewayOnboardingEngine";

export async function GET() {
  try {
    await requireAuth();
    const session = await getGatewaySession();
    return NextResponse.json({ ok: true, session });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

type PatchBody = {
  step?: GatewayStep;
  draftPayload?: Record<string, unknown>;
  draftProjectId?: string | null;
  businessCaseReviewId?: string | null;
  complete?: boolean;
};

export async function PATCH(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as PatchBody;

    if (body.step && !isGatewayStep(body.step)) {
      return NextResponse.json({ ok: false, error: "Invalid gateway step." }, { status: 400 });
    }

    const session = await upsertGatewaySession({
      step: body.step ?? "project",
      draftPayload: body.draftPayload,
      draftProjectId: body.draftProjectId,
      businessCaseReviewId: body.businessCaseReviewId,
      complete: body.complete,
    });

    return NextResponse.json({ ok: true, session });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
