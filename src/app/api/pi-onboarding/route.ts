import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  coerceStep,
  syncPiPayloadToProductProfiles,
  suiteProductFromAuthUser,
  upsertPiOnboardingSession,
} from "@/lib/pi-onboarding/store";
import {
  nextStep,
  pathHref,
  recommendPath,
  validateStep,
  type PiOnboardingPayload,
  type PiOnboardingStep,
  type PiRecommendedPath,
  isPiOnboardingStep,
} from "@/lib/pi-onboarding/types";
import { emitPilotKpi } from "@/lib/analytics/server";

export const dynamic = "force-dynamic";

type Body = {
  action?: "save" | "complete";
  step?: string;
  payload?: PiOnboardingPayload;
  chosenPath?: PiRecommendedPath;
  advance?: boolean;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const step = coerceStep(body.step);
  const payload = body.payload ?? {};
  const partial = Boolean((body as { partial?: boolean }).partial);
  if (!partial) {
    const validation = validateStep(step, payload);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }
  }

  const recommended = recommendPath(payload);
  const action = body.action ?? "save";

  if (action === "complete") {
    const chosen = body.chosenPath ?? recommended;
    await upsertPiOnboardingSession(supabase, user.id, {
      current_step: "completed",
      payload,
      status: "completed",
      recommended_path: recommended,
      chosen_path: chosen,
    });

    try {
      await syncPiPayloadToProductProfiles(
        supabase,
        user,
        payload,
        suiteProductFromAuthUser(user),
      );
    } catch (err) {
      console.error("[pi-onboarding] product sync failed", err);
      // Session is complete; product profile sync can be retried — do not block path.
    }

    await emitPilotKpi("onboarding_pi_completed", {
      chosen_path: chosen,
      baseline_opt_in: payload.baselineOptIn !== false,
    });

    return NextResponse.json({
      ok: true,
      status: "completed",
      recommendedPath: recommended,
      chosenPath: chosen,
      redirectTo:
        payload.baselineOptIn !== false
          ? "/profile/baseline"
          : pathHref(chosen),
    });
  }

  const advance = body.advance !== false;
  let current: PiOnboardingStep | "completed" = step;
  if (advance) {
    const n = nextStep(step);
    current = n === "completed" ? "path" : n;
  }

  // Stay on path until explicit complete
  if (step === "path" && advance) {
    current = "path";
  }

  const session = await upsertPiOnboardingSession(supabase, user.id, {
    current_step: isPiOnboardingStep(String(current)) ? (current as PiOnboardingStep) : step,
    payload,
    status: "started",
    recommended_path: recommended,
  });

  return NextResponse.json({
    ok: true,
    status: "started",
    currentStep: session.current_step,
    recommendedPath: recommended,
  });
}
