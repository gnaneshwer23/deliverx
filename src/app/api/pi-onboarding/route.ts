import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  coerceStep,
  syncPiPayloadToProductProfiles,
  suiteProductFromAuthUser,
  upsertPiOnboardingSession,
} from "@/lib/pi-onboarding/store";
import {
  isPiOnboardingStep,
  isSkippableStep,
  nextStep,
  pathHref,
  recommendPath,
  stepsForSet,
  validateStep,
  type PiOnboardingPayload,
  type PiOnboardingStep,
  type PiRecommendedPath,
} from "@/lib/pi-onboarding/types";
import { resolveOnboardingStepSet } from "@/lib/pi-onboarding/flag";
import { emitPilotKpi } from "@/lib/analytics/server";

export const dynamic = "force-dynamic";

type Body = {
  action?: "save" | "skip" | "complete";
  step?: string;
  payload?: PiOnboardingPayload;
  chosenPath?: PiRecommendedPath;
  advance?: boolean;
  partial?: boolean;
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

  const stepSet = resolveOnboardingStepSet();
  const steps = stepsForSet(stepSet);
  const step = coerceStep(body.step, stepSet);
  const payload = body.payload ?? {};
  const action = body.action ?? "save";

  if (action === "skip" && !isSkippableStep(step)) {
    return NextResponse.json(
      { error: "This step cannot be skipped." },
      { status: 400 },
    );
  }

  const skipsValidation = action === "skip" || Boolean(body.partial);
  if (!skipsValidation) {
    const validation = validateStep(step, payload, stepSet);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }
  }

  const persistedPayload: PiOnboardingPayload =
    action === "skip"
      ? {
          ...payload,
          skippedSteps: Array.from(new Set([...(payload.skippedSteps ?? []), step])),
        }
      : payload;

  const recommended = recommendPath(persistedPayload);

  if (action === "complete") {
    const chosen = body.chosenPath ?? recommended;
    await upsertPiOnboardingSession(supabase, user.id, {
      current_step: "completed",
      payload: persistedPayload,
      status: "completed",
      recommended_path: recommended,
      chosen_path: chosen,
    });

    try {
      await syncPiPayloadToProductProfiles(
        supabase,
        user,
        persistedPayload,
        suiteProductFromAuthUser(user),
      );
    } catch (err) {
      console.error("[pi-onboarding] product sync failed", err);
      // Session is complete; product profile sync can be retried — do not block path.
    }

    await emitPilotKpi("onboarding_pi_completed", {
      chosen_path: chosen,
      baseline_opt_in: persistedPayload.baselineOptIn !== false,
      step_set: stepSet,
      step_count: steps.length,
      steps_skipped: persistedPayload.skippedSteps?.length ?? 0,
    });

    return NextResponse.json({
      ok: true,
      status: "completed",
      recommendedPath: recommended,
      chosenPath: chosen,
      redirectTo:
        persistedPayload.baselineOptIn !== false
          ? "/profile/baseline"
          : pathHref(chosen),
    });
  }

  const advance = action === "skip" ? true : body.advance !== false;
  let current: PiOnboardingStep = step;
  if (advance) {
    const n = nextStep(step, stepSet);
    current = n === "completed" ? "path" : n;
  }

  // Stay on the final step until an explicit complete.
  if (step === "path" && advance) {
    current = "path";
  }

  const session = await upsertPiOnboardingSession(supabase, user.id, {
    current_step: isPiOnboardingStep(current) ? current : step,
    payload: persistedPayload,
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
