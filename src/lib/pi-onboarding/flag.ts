/**
 * B5 step-set flag. Per six-doc build phase B5 §11 the onboarding shape is
 * selected by a step-set version rather than an on/off switch, so rollback to
 * the previously shipped six-step set is an env change with no redeploy and no
 * data migration: set DELIVERX_ONBOARDING_STEP_SET=v1-six-step.
 */

import {
  DEFAULT_PI_ONBOARDING_STEP_SET,
  isPiOnboardingStepSet,
  type PiOnboardingStepSet,
} from "@/lib/pi-onboarding/types";

export type OnboardingStepSetEnv = {
  DELIVERX_ONBOARDING_STEP_SET?: string;
  [key: string]: string | undefined;
};

export function resolveOnboardingStepSet(
  env: OnboardingStepSetEnv = process.env as OnboardingStepSetEnv,
): PiOnboardingStepSet {
  const value = (env.DELIVERX_ONBOARDING_STEP_SET ?? "").trim().toLowerCase();
  if (isPiOnboardingStepSet(value)) return value;
  return DEFAULT_PI_ONBOARDING_STEP_SET;
}
