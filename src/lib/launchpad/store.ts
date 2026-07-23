import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  calculateReadinessScore,
  type LaunchpadModuleKey,
} from "@/lib/launchpad/score";

export type LaunchpadProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  targetRole?: string;
  experienceLevel?: string;
  strongestSkill?: string;
  growthArea?: string;
  careerGoal?: string;
  timeline?: string;
  confidence?: string;
  background?: string;
};

function twinFromProfile(input: LaunchpadProfileInput) {
  return {
    headline: `${input.targetRole || "Product"} candidate`,
    strengths: [input.strongestSkill, input.experienceLevel].filter(Boolean),
    growth: [input.growthArea].filter(Boolean),
    goal: input.careerGoal || "Land interviews for the target role",
    timeline: input.timeline || "Within 3 months",
  };
}

function readinessFromProfile(
  input: LaunchpadProfileInput,
  modulesCompleted = 0,
  artefactsReady = 0,
) {
  return calculateReadinessScore({
    confidence: Number(input.confidence || "3"),
    hasBackground: Boolean(input.background?.trim()),
    modulesCompleted,
    artefactsReady,
  });
}

export async function saveOnboardingProfile(
  supabase: SupabaseClient,
  user: User,
  input: LaunchpadProfileInput,
) {
  const twin = twinFromProfile(input);
  const readinessScore = readinessFromProfile(input);
  const row = {
    user_id: user.id,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email || user.email || null,
    target_role: input.targetRole || "Associate Product Manager",
    experience_level: input.experienceLevel ?? null,
    strongest_skill: input.strongestSkill ?? null,
    growth_area: input.growthArea ?? null,
    career_goal: input.careerGoal ?? null,
    timeline: input.timeline ?? null,
    confidence: input.confidence ?? "3",
    background: input.background ?? null,
    readiness_score: readinessScore,
    onboarding_status: "started" as const,
    twin_data: twin,
    profile_data: { ...input },
    // TODO(payment): leave open until Stripe entitlement is wired
    entitlement_status: "open" as const,
  };

  const { data, error } = await supabase
    .from("launchpad_profiles")
    .upsert(row, { onConflict: "user_id" })
    .select("id, readiness_score, onboarding_status, twin_data")
    .single();

  if (error) throw error;

  return {
    mode: "database" as const,
    profileId: data.id as string,
    readinessScore: data.readiness_score as number,
    twin: data.twin_data,
    status: "STARTED",
  };
}

export async function completeOnboarding(
  supabase: SupabaseClient,
  user: User,
  input: LaunchpadProfileInput,
) {
  const profileResult = await saveOnboardingProfile(supabase, user, input);

  await supabase
    .from("launchpad_profiles")
    .update({ onboarding_status: "completed" })
    .eq("user_id", user.id);

  // Seed assessment + career twin as in progress / completed from onboarding answers.
  await upsertModuleProgress(supabase, user.id, profileResult.profileId, "assessment", {
    status: "completed",
    score: profileResult.readinessScore,
    summary: "Baseline assessment captured from onboarding.",
    state: { source: "onboarding" },
  });

  await upsertModuleProgress(supabase, user.id, profileResult.profileId, "career_twin", {
    status: "completed",
    score: profileResult.readinessScore,
    summary: "Career Twin drafted from your goals and strengths.",
    state: { twin: profileResult.twin },
  });

  return {
    mode: "database" as const,
    profileId: profileResult.profileId,
    readinessScore: profileResult.readinessScore,
    twin: profileResult.twin,
    status: "COMPLETED",
  };
}

export async function upsertModuleProgress(
  supabase: SupabaseClient,
  userId: string,
  profileId: string | null,
  moduleKey: LaunchpadModuleKey,
  input: {
    status: "not_started" | "in_progress" | "completed";
    score?: number;
    summary?: string;
    state?: Record<string, unknown>;
  },
) {
  const row = {
    user_id: userId,
    profile_id: profileId,
    module_key: moduleKey,
    status: input.status,
    score: input.score ?? null,
    summary: input.summary ?? null,
    state: input.state ?? {},
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("launchpad_progress")
    .upsert(row, { onConflict: "user_id,module_key" })
    .select("id, module_key, status, score, summary, state")
    .single();

  if (error) throw error;
  return data;
}

export async function saveArtefact(
  supabase: SupabaseClient,
  user: User,
  input: {
    profileId?: string | null;
    artefactType:
      | "cv_draft"
      | "linkedin_notes"
      | "portfolio_case"
      | "star_story"
      | "mock_interview"
      | "branding_note";
    title: string;
    content?: Record<string, unknown>;
    status?: "draft" | "ready" | "archived";
  },
) {
  const { data, error } = await supabase
    .from("launchpad_artefacts")
    .insert({
      user_id: user.id,
      profile_id: input.profileId ?? null,
      artefact_type: input.artefactType,
      title: input.title,
      content: input.content ?? {},
      status: input.status ?? "draft",
    })
    .select("id, artefact_type, title, status, content, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function refreshReadinessScore(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: progress }, { count }] = await Promise.all([
    supabase
      .from("launchpad_profiles")
      .select("id, confidence, background, profile_data")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("launchpad_progress")
      .select("module_key, status")
      .eq("user_id", userId),
    supabase
      .from("launchpad_artefacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "ready"),
  ]);

  if (!profile) return null;

  const modulesCompleted = (progress ?? []).filter((row) => row.status === "completed").length;
  const score = calculateReadinessScore({
    confidence: Number(profile.confidence || "3"),
    hasBackground: Boolean(profile.background?.trim()),
    modulesCompleted,
    artefactsReady: count ?? 0,
  });

  await supabase
    .from("launchpad_profiles")
    .update({ readiness_score: score })
    .eq("user_id", userId);

  await upsertModuleProgress(supabase, userId, profile.id as string, "readiness", {
    status: score >= 70 ? "completed" : "in_progress",
    score,
    summary: `Readiness score updated to ${score}.`,
    state: { modulesCompleted, artefactsReady: count ?? 0 },
  });

  return score;
}

export async function getLaunchpadSession(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: progress }, { data: artefacts }] = await Promise.all([
    supabase.from("launchpad_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("launchpad_progress")
      .select("id, module_key, status, score, summary, state, completed_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("launchpad_artefacts")
      .select("id, artefact_type, title, status, content, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return { profile, progress: progress ?? [], artefacts: artefacts ?? [] };
}
