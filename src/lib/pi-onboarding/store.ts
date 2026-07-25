import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  type PiOnboardingPayload,
  type PiOnboardingStep,
  type PiRecommendedPath,
  isPiOnboardingStep,
  recommendPath,
} from "@/lib/pi-onboarding/types";
import { saveOnboardingProfile as saveXperienceProfile } from "@/lib/xperience/store";
import { saveOnboardingProfile as saveLaunchpadProfile } from "@/lib/launchpad/store";
import { parseSuiteProduct, type SuiteProduct } from "@/lib/marketing/product-intent";

export type PiOnboardingSession = {
  id: string;
  user_id: string;
  current_step: string;
  status: "started" | "completed";
  payload: PiOnboardingPayload;
  recommended_path: PiRecommendedPath | null;
  chosen_path: PiRecommendedPath | null;
  completed_at: string | null;
};

export async function getPiOnboardingSession(
  supabase: SupabaseClient,
  userId: string,
): Promise<PiOnboardingSession | null> {
  const { data, error } = await supabase
    .from("pi_onboarding_sessions")
    .select(
      "id, user_id, current_step, status, payload, recommended_path, chosen_path, completed_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Table may not exist yet in some envs — surface as null so auth still works.
    console.error("[pi-onboarding] load failed", error.message);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    payload: (data.payload ?? {}) as PiOnboardingPayload,
    status: data.status === "completed" ? "completed" : "started",
    recommended_path: data.recommended_path as PiRecommendedPath | null,
    chosen_path: data.chosen_path as PiRecommendedPath | null,
  };
}

export async function upsertPiOnboardingSession(
  supabase: SupabaseClient,
  userId: string,
  input: {
    current_step: PiOnboardingStep | "completed";
    payload: PiOnboardingPayload;
    status?: "started" | "completed";
    recommended_path?: PiRecommendedPath | null;
    chosen_path?: PiRecommendedPath | null;
  },
) {
  const status = input.status ?? (input.current_step === "completed" ? "completed" : "started");
  const row = {
    user_id: userId,
    current_step: input.current_step,
    status,
    payload: input.payload,
    recommended_path: input.recommended_path ?? recommendPath(input.payload),
    chosen_path: input.chosen_path ?? null,
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("pi_onboarding_sessions")
    .upsert(row, { onConflict: "user_id" })
    .select(
      "id, user_id, current_step, status, payload, recommended_path, chosen_path, completed_at",
    )
    .single();

  if (error) throw error;
  return data;
}

export function needsPiOnboarding(
  session: PiOnboardingSession | null,
  product: SuiteProduct | null,
): boolean {
  if (product === "team-copilot") return false;
  if (!product || product === "xperience" || product === "launchpad" || product === "bundle") {
    if (!session) return true;
    return session.status !== "completed";
  }
  return false;
}

export function suiteProductFromAuthUser(user: User | null | undefined): SuiteProduct | null {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return parseSuiteProduct(typeof meta?.product === "string" ? meta.product : null);
}

/** Sync key PI fields into product profiles without marking product onboarding complete. */
export async function syncPiPayloadToProductProfiles(
  supabase: SupabaseClient,
  user: User,
  payload: PiOnboardingPayload,
  product: SuiteProduct | null,
) {
  const firstName = payload.firstName?.trim() || "Member";
  const lastName = payload.lastName?.trim() || "";
  const email = user.email || "";
  const targetRole = payload.targetRole?.trim() || "Associate Product Manager";
  const industry = payload.preferredIndustries?.[0] ?? null;
  const background = payload.noPriorExperience
    ? "No prior professional experience reported (self-reported)."
    : payload.existingExperienceSummary?.trim() || null;

  const identityLabel =
    payload.professionalIdentity === "Other"
      ? payload.professionalIdentityOther?.trim()
      : payload.professionalIdentity;

  const sharedMeta = {
    piOnboarding: true,
    professionalIdentity: identityLabel,
    currentSituation: payload.currentSituation,
    careerObjective: payload.careerObjective,
    targetSeniority: payload.targetSeniority,
    preferredIndustries: payload.preferredIndustries ?? [],
    visibilityDefault: payload.visibilityDefault,
    consentAnalysis: payload.consentAnalysis,
    skippedImports: payload.skippedImports ?? [],
    cvImportNote: payload.cvImportNote,
    portfolioImportNote: payload.portfolioImportNote,
    learningImportNote: payload.learningImportNote,
    sourceClasses: {
      identity: "self_reported",
      targets: "self_reported",
      experienceSummary: payload.noPriorExperience ? "self_reported_none" : "self_reported",
      imports: "imported_draft_or_note",
    },
  };

  const shouldXp = !product || product === "xperience" || product === "bundle";
  const shouldLp = !product || product === "launchpad" || product === "bundle";

  if (shouldXp) {
    await saveXperienceProfile(supabase, user, {
      firstName,
      lastName,
      email,
      targetRole,
      industry: industry ?? undefined,
      background: background ?? undefined,
      confidence: "3",
    });
    const { data: xpRow } = await supabase
      .from("xperience_profiles")
      .select("profile_data")
      .eq("user_id", user.id)
      .maybeSingle();
    await supabase
      .from("xperience_profiles")
      .update({
        profile_data: {
          ...((xpRow?.profile_data as Record<string, unknown>) ?? {}),
          ...sharedMeta,
        },
      })
      .eq("user_id", user.id);
  }

  if (shouldLp) {
    await saveLaunchpadProfile(supabase, user, {
      firstName,
      lastName,
      email,
      targetRole,
      experienceLevel: payload.targetSeniority,
      careerGoal: payload.careerObjective,
      background: background ?? undefined,
      confidence: "3",
      timeline: undefined,
    });
    const { data: lpRow } = await supabase
      .from("launchpad_profiles")
      .select("profile_data")
      .eq("user_id", user.id)
      .maybeSingle();
    await supabase
      .from("launchpad_profiles")
      .update({
        profile_data: {
          ...((lpRow?.profile_data as Record<string, unknown>) ?? {}),
          ...sharedMeta,
        },
      })
      .eq("user_id", user.id);
  }
}

export function coerceStep(raw: string | null | undefined): PiOnboardingStep {
  if (raw && isPiOnboardingStep(raw)) return raw;
  return "identity";
}
