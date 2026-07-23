import type { SupabaseClient, User } from "@supabase/supabase-js";
import { calculateCareerScore } from "@/lib/xperience/score";

export type CandidateProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  targetRole?: string;
  industry?: string;
  companyType?: string;
  background?: string;
  workStyle?: string;
  learningStyle?: string;
  selectedSkill?: string;
  confidence?: string;
  startTimeline?: string;
};

const DEFAULT_COMPANY_STATE = {
  revenueProtected: 120000,
  customerSatisfaction: 78,
  engineeringCapacity: 64,
  roadmapHealth: 82,
  stakeholderTrust: {
    Sarah: 91,
    Maya: 72,
    James: 48,
    Priya: 85,
  },
};

function careerScoreFromProfile(input: CandidateProfileInput) {
  const confidence = Number(input.confidence || "3");
  return calculateCareerScore({
    decisions: Math.max(1, confidence),
    evidenceItems: input.background ? 2 : 1,
    stakeholderScore: input.workStyle === "Collaborative" ? 18 : 14,
  });
}

export async function saveOnboardingProfile(
  supabase: SupabaseClient,
  user: User,
  input: CandidateProfileInput,
) {
  const careerScore = careerScoreFromProfile(input);
  const row = {
    user_id: user.id,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email || user.email || null,
    target_role: input.targetRole || input.role || "Associate Product Manager",
    industry: input.industry ?? null,
    company_type: input.companyType ?? null,
    background: input.background ?? null,
    work_style: input.workStyle ?? null,
    learning_style: input.learningStyle ?? null,
    selected_skill: input.selectedSkill ?? null,
    confidence: input.confidence ?? "3",
    start_timeline: input.startTimeline ?? null,
    career_score: careerScore,
    onboarding_status: "started" as const,
    profile_data: {
      ...input,
    },
    // TODO(payment): leave open until Stripe entitlement is wired
    entitlement_status: "open" as const,
  };

  const { data, error } = await supabase
    .from("xperience_profiles")
    .upsert(row, { onConflict: "user_id" })
    .select("id, career_score, onboarding_status")
    .single();

  if (error) throw error;

  return {
    mode: "database" as const,
    profileId: data.id as string,
    careerScore: data.career_score as number,
    status: "STARTED",
  };
}

export async function startExperience(
  supabase: SupabaseClient,
  user: User,
  input: CandidateProfileInput,
) {
  const profileResult = await saveOnboardingProfile(supabase, user, input);

  await supabase
    .from("xperience_profiles")
    .update({ onboarding_status: "completed" })
    .eq("user_id", user.id);

  const { data: existing } = await supabase
    .from("xperience_enrolments")
    .select("id, company_name, day, status, state")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      mode: "database" as const,
      enrolmentId: existing.id as string,
      company: existing.company_name as string,
      day: existing.day as number,
      status: existing.status as string,
      state: existing.state,
      profileId: profileResult.profileId,
    };
  }

  const { data: enrolment, error } = await supabase
    .from("xperience_enrolments")
    .insert({
      user_id: user.id,
      profile_id: profileResult.profileId,
      company_name: "MediFlow",
      day: 1,
      status: "ACTIVE",
      state: {
        ...DEFAULT_COMPANY_STATE,
        personalisedBy: {
          workStyle: input.workStyle,
          learningStyle: input.learningStyle,
          confidence: input.confidence,
          targetRole: input.targetRole || input.role,
        },
      },
    })
    .select("id, company_name, day, status, state")
    .single();

  if (error) throw error;

  return {
    mode: "database" as const,
    enrolmentId: enrolment.id as string,
    company: enrolment.company_name as string,
    day: enrolment.day as number,
    status: enrolment.status as string,
    state: enrolment.state,
    profileId: profileResult.profileId,
  };
}

export async function recordDecision(
  supabase: SupabaseClient,
  user: User,
  input: {
    enrolmentId?: string;
    choiceId: string;
    choiceLabel: string;
    rationale?: string;
    effects: Record<string, number>;
    evidenceScore: number;
  },
) {
  const { data: decision, error: decisionError } = await supabase
    .from("xperience_decisions")
    .insert({
      user_id: user.id,
      enrolment_id: input.enrolmentId ?? null,
      choice_id: input.choiceId,
      choice_label: input.choiceLabel,
      rationale: input.rationale ?? null,
      effects: input.effects,
      evidence_score: input.evidenceScore,
    })
    .select("id")
    .single();

  if (decisionError) throw decisionError;

  const status =
    input.evidenceScore >= 70 ? "platform_verified" : "supported";

  const { data: evidence, error: evidenceError } = await supabase
    .from("xperience_evidence")
    .insert({
      user_id: user.id,
      enrolment_id: input.enrolmentId ?? null,
      title: input.choiceLabel,
      evidence_type: "decision",
      score: input.evidenceScore,
      status,
      content: {
        choiceId: input.choiceId,
        rationale: input.rationale || "No rationale provided.",
        effects: input.effects,
        competency: "Stakeholder judgement",
      },
    })
    .select("id")
    .single();

  if (evidenceError) throw evidenceError;

  return {
    mode: "database" as const,
    decisionId: decision.id as string,
    evidenceId: evidence.id as string,
    persisted: true,
  };
}

export async function getXperienceSession(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: enrolment }] = await Promise.all([
    supabase
      .from("xperience_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("xperience_enrolments")
      .select("id, company_name, day, status, state, created_at")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { profile, enrolment };
}
