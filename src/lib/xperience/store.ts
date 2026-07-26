import type { SupabaseClient, User } from "@supabase/supabase-js";
import { scenarioBySlug } from "@/lib/experience-planner/catalog";
import { generateExperience } from "@/lib/experience-sim/generate";
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
  /** Phase 3 — gap-ranked plan id (optional). */
  planId?: string;
  planEmphasis?: "stakeholder" | "delivery" | "discovery" | "balanced";
  scenarioSlug?: string;
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
      created: false,
      enrolmentId: existing.id as string,
      company: existing.company_name as string,
      day: existing.day as number,
      status: existing.status as string,
      state: existing.state,
      profileId: profileResult.profileId,
    };
  }

  let scenarioSlug = input.scenarioSlug ?? null;
  let planRationale: string | null = null;
  let planEmphasis = input.planEmphasis ?? "balanced";

  if (input.planId) {
    try {
      const { data: planRow } = await supabase
        .from("experience_plans")
        .select("scenario_slug, emphasis, rationale")
        .eq("user_id", user.id)
        .eq("id", input.planId)
        .maybeSingle();
      if (planRow) {
        scenarioSlug = scenarioSlug || (planRow.scenario_slug as string);
        planEmphasis =
          (planRow.emphasis as typeof planEmphasis) || planEmphasis;
        planRationale = (planRow.rationale as string) || null;
      }
    } catch (err) {
      console.error("[xperience] load experience plan failed", err);
    }
  }

  const resolvedSlug = scenarioSlug || "mediflow-trustcare";
  const scenario = scenarioBySlug(resolvedSlug);

  const simState = generateExperience({
    userRole: input.targetRole || input.role || scenario?.candidateRole || "Associate Product Manager",
    personalisedBy: {
      workStyle: input.workStyle,
      learningStyle: input.learningStyle,
      confidence: input.confidence,
      targetRole: input.targetRole || input.role,
      plannerEmphasis: planEmphasis,
      planId: input.planId ?? null,
      scenarioSlug: resolvedSlug,
    },
    plannerEmphasis: planEmphasis,
    planId: input.planId ?? null,
    planRationale,
    scenarioSlug: resolvedSlug,
  });

  const { data: enrolment, error } = await supabase
    .from("xperience_enrolments")
    .insert({
      user_id: user.id,
      profile_id: profileResult.profileId,
      company_name: simState.company.name,
      day: simState.day,
      status: "ACTIVE",
      lifecycle_phase: simState.lifecycle,
      state: simState,
    })
    .select("id, company_name, day, status, state, lifecycle_phase")
    .single();

  if (error) throw error;

  if (input.planId) {
    try {
      await supabase
        .from("experience_plans")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          enrolment_id: enrolment.id,
        })
        .eq("user_id", user.id)
        .eq("id", input.planId);
    } catch (err) {
      console.error("[xperience] link experience plan failed", err);
    }
  }

  try {
    await supabase.from("experience_sim_events").insert({
      enrolment_id: enrolment.id,
      user_id: user.id,
      event_type: "ExperienceStarted",
      payload: {
        companyId: simState.company.id,
        projectId: simState.project.id,
        userRole: simState.userRole,
        plannerEmphasis: simState.planner?.emphasis ?? null,
        planId: input.planId ?? null,
      },
      user_contribution: { profileId: profileResult.profileId },
      ai_contribution: {
        generators: ["company", "project", "team"],
        plannerVersion: "experience-plan-v2",
        scenarioSlug: resolvedSlug,
      },
    });
  } catch (err) {
    console.error("[xperience] ExperienceStarted event failed", err);
  }

  return {
    mode: "database" as const,
    created: true,
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

  const status = "supported";

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

  // Dual-write into Evidence Ledger (SoT). Scores on xp rows are NOT ledger verification.
  let ledgerEvidenceId: string | null = null;
  try {
    const { appendEvidence } = await import("@/lib/evidence-ledger/append");
    const ledger = await appendEvidence(supabase, {
      userId: user.id,
      sourceType: "decision",
      category: "practice",
      title: input.choiceLabel,
      summary: input.rationale || "Experience decision capture",
      rawContent: {
        choiceId: input.choiceId,
        rationale: input.rationale || "No rationale provided.",
        effects: input.effects,
        competency: "Stakeholder judgement",
        experienceScoreHint: input.evidenceScore,
        note: "experienceScoreHint is not verification status",
      },
      sourceRecordType: "xperience_decisions",
      sourceRecordId: decision.id as string,
      idempotencyKey: `xperience-decision:${decision.id}`,
      confidentiality: "private",
      consentStatus: "analysis_allowed",
      provenance: {
        actorType: "user",
        actorUserId: user.id,
        userContribution: {
          choiceId: input.choiceId,
          choiceLabel: input.choiceLabel,
          rationale: input.rationale ?? null,
        },
        aiContribution: {},
        rawRef: { enrolmentId: input.enrolmentId ?? null },
      },
    });
    ledgerEvidenceId = ledger.evidenceId;
    await supabase
      .from("xperience_evidence")
      .update({ ledger_evidence_id: ledger.evidenceId })
      .eq("id", evidence.id);
  } catch (err) {
    console.error("[xperience] ledger dual-write failed", err);
  }

  return {
    mode: "database" as const,
    decisionId: decision.id as string,
    evidenceId: evidence.id as string,
    ledgerEvidenceId,
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
      .select("id, company_name, day, status, state, lifecycle_phase, created_at")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return { profile, enrolment };
}
