import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PiOnboardingWizard } from "@/components/pi-onboarding/pi-onboarding-wizard";
import { createClient } from "@/lib/supabase/server";
import { buildLoginRedirectPath } from "@/lib/auth/route-guards";
import {
  coerceStep,
  getPiOnboardingSession,
  suiteProductFromAuthUser,
} from "@/lib/pi-onboarding/store";
import { pathHref, stepsForSet, type PiOnboardingPayload } from "@/lib/pi-onboarding/types";
import { resolveOnboardingStepSet } from "@/lib/pi-onboarding/flag";

export const metadata: Metadata = {
  title: "Set up your Professional Profile | DeliverX",
  description:
    "Establish who you are, what you want to achieve, and how DeliverX may use your evidence.",
};

export const dynamic = "force-dynamic";

export default async function PiOnboardingProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildLoginRedirectPath("/onboarding/profile"));
  }

  const product = suiteProductFromAuthUser(user);
  if (product === "team-copilot") {
    redirect("/onboarding/organisation");
  }

  const session = await getPiOnboardingSession(supabase, user.id);
  if (session?.status === "completed" && session.chosen_path) {
    redirect(pathHref(session.chosen_path));
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    (typeof meta?.name === "string" && meta.name.trim()) ||
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    "";
  const [firstFromMeta, ...rest] = name.split(/\s+/).filter(Boolean);

  const initialPayload: PiOnboardingPayload = {
    ...(session?.payload ?? {}),
    firstName: session?.payload?.firstName || firstFromMeta || "",
    lastName: session?.payload?.lastName || rest.join(" ") || "",
  };

  const stepSet = resolveOnboardingStepSet();
  const initialStep =
    session?.current_step && session.current_step !== "completed"
      ? coerceStep(session.current_step, stepSet)
      : stepsForSet(stepSet)[0]!;

  return (
    <PiOnboardingWizard
      initialStep={initialStep}
      initialPayload={initialPayload}
      email={user.email ?? ""}
      stepSet={stepSet}
    />
  );
}
