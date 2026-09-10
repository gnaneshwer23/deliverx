import type { SupabaseClient, User } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import {
  applyDecisionConsequences,
  captureReflection,
  evaluateCompletion,
} from "@/lib/experience-sim/engines";
import { generateExperience, generateMediFlowExperience, isExperienceSimState } from "@/lib/experience-sim/generate";
import type { ExperienceSimState } from "@/lib/experience-sim/types";
import { recordDecision } from "@/lib/xperience/store";

export async function ensureSimState(
  supabase: SupabaseClient,
  enrolmentId: string,
  userId: string,
  fallbackRole?: string,
): Promise<ExperienceSimState> {
  const { data, error } = await supabase
    .from("xperience_enrolments")
    .select("id, state, day, lifecycle_phase")
    .eq("id", enrolmentId)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw error ?? new Error("enrolment_not_found");

  if (isExperienceSimState(data.state)) {
    return data.state as ExperienceSimState;
  }

  // Upgrade legacy seed JSON → full sim state (smallest migration path)
  const personalisedBy =
    data.state && typeof data.state === "object"
      ? ((data.state as { personalisedBy?: Record<string, unknown> }).personalisedBy ?? {})
      : {};
  const upgraded = generateExperience({
    userRole: fallbackRole,
    personalisedBy,
    scenarioSlug:
      typeof personalisedBy.scenarioSlug === "string"
        ? personalisedBy.scenarioSlug
        : "mediflow-trustcare",
  });
  await supabase
    .from("xperience_enrolments")
    .update({
      state: upgraded,
      day: upgraded.day,
      lifecycle_phase: upgraded.lifecycle,
    })
    .eq("id", enrolmentId);
  return upgraded;
}

export async function persistSimState(
  supabase: SupabaseClient,
  enrolmentId: string,
  state: ExperienceSimState,
) {
  // Keep status ACTIVE so returning users can reopen the completed simulation.
  // Completion is tracked via lifecycle_phase / state.lifecycle only.
  const { error } = await supabase
    .from("xperience_enrolments")
    .update({
      state,
      day: state.day,
      lifecycle_phase: state.lifecycle,
      status: "ACTIVE",
    })
    .eq("id", enrolmentId);
  if (error) throw error;
}

export async function appendSimEvent(
  supabase: SupabaseClient,
  input: {
    enrolmentId: string;
    userId: string;
    eventType: string;
    payload: Record<string, unknown>;
    userContribution?: Record<string, unknown>;
    aiContribution?: Record<string, unknown>;
  },
) {
  await supabase.from("experience_sim_events").insert({
    enrolment_id: input.enrolmentId,
    user_id: input.userId,
    event_type: input.eventType,
    payload: input.payload,
    user_contribution: input.userContribution ?? {},
    ai_contribution: input.aiContribution ?? {},
  });
}

/** Observation Engine — evidence only; never assigns capability. */
export async function emitDecisionObservation(
  supabase: SupabaseClient,
  user: User,
  input: {
    state: ExperienceSimState;
    choiceId: string;
    label: string;
    rationale?: string;
    effects: Record<string, number>;
    decisionId: string;
    enrolmentId: string;
  },
) {
  const result = await appendEvidence(supabase, {
    userId: user.id,
    sourceType: "decision",
    category: "practice",
    title: `Experience decision: ${input.label}`,
    summary: `${input.state.company.name} — ${input.state.consequences.at(-1)?.summary ?? input.label}`,
    rawContent: {
      experience: input.state.planner?.experienceKey ?? input.state.scenarioMeta?.slug ?? "experience",
      company: input.state.company.name,
      project: input.state.project.name,
      choiceId: input.choiceId,
      effects: input.effects,
      metricsSnapshot: input.state.metrics,
      competencyHint: "Stakeholder judgement",
      note: "Observation only — Capability Engine judges separately",
    },
    sourceRecordType: "xperience_decisions",
    sourceRecordId: input.decisionId,
    idempotencyKey: `experience-obs-decision:${input.decisionId}`,
    confidentiality: "private",
    consentStatus: "analysis_allowed",
    provenance: {
      actorType: "user",
      actorUserId: user.id,
      userContribution: {
        choiceId: input.choiceId,
        rationale: input.rationale ?? null,
      },
      aiContribution: {},
      rawRef: { enrolmentId: input.enrolmentId },
    },
  });
  return result;
}

export async function applyExperienceDecision(
  supabase: SupabaseClient,
  user: User,
  input: {
    enrolmentId: string;
    choiceId: string;
    choiceLabel: string;
    rationale?: string;
  },
) {
  const state = await ensureSimState(supabase, input.enrolmentId, user.id);
  if (state.lifecycle === "completed") {
    return { ok: false as const, error: "experience_already_completed", state };
  }
  if (!state.availableDecisions.some((d) => d.id === input.choiceId)) {
    return { ok: false as const, error: "decision_not_available", state };
  }

  const impactHints =
    state.availableDecisions.find((d) => d.id === input.choiceId)?.impactHints ?? {
      trust: 0,
      delivery: 0,
      clarity: 0,
    };

  // Persist classic decision row + legacy evidence dual-write path
  const recorded = await recordDecision(supabase, user, {
    enrolmentId: input.enrolmentId,
    choiceId: input.choiceId,
    choiceLabel: input.choiceLabel,
    rationale: input.rationale,
    effects: impactHints,
    evidenceScore: Math.max(
      0,
      Math.min(100, 50 + impactHints.trust + impactHints.delivery + impactHints.clarity),
    ),
  });

  const { state: next, effects, events } = applyDecisionConsequences(state, {
    choiceId: input.choiceId,
    label: input.choiceLabel,
    rationale: input.rationale,
    decisionRowId: recorded.decisionId,
  });

  let observationEmitted = next.completion.observationEmitted;
  try {
    await emitDecisionObservation(supabase, user, {
      state: next,
      choiceId: input.choiceId,
      label: input.choiceLabel,
      rationale: input.rationale,
      effects,
      decisionId: recorded.decisionId,
      enrolmentId: input.enrolmentId,
    });
    observationEmitted = true;
  } catch (err) {
    console.error("[experience-sim] observation failed", err);
  }

  const finalState: ExperienceSimState = {
    ...next,
    completion: { ...next.completion, observationEmitted },
  };

  await persistSimState(supabase, input.enrolmentId, finalState);

  for (const ev of events) {
    await appendSimEvent(supabase, {
      enrolmentId: input.enrolmentId,
      userId: user.id,
      eventType: ev.type,
      payload: ev.payload,
      userContribution: {
        choiceId: input.choiceId,
        rationale: input.rationale ?? null,
      },
    });
  }
  if (observationEmitted) {
    await appendSimEvent(supabase, {
      enrolmentId: input.enrolmentId,
      userId: user.id,
      eventType: "ObservationEmitted",
      payload: { decisionId: recorded.decisionId },
    });
  }

  return {
    ok: true as const,
    state: finalState,
    effects,
    coachingHint: finalState.coachingHints[0] ?? null,
    evidenceRecord: recorded,
  };
}

export async function submitExperienceReflection(
  supabase: SupabaseClient,
  user: User,
  input: { enrolmentId: string; text: string },
) {
  const text = input.text.trim();
  if (text.length < 20) {
    return { ok: false as const, error: "reflection_too_short" };
  }

  let state = await ensureSimState(supabase, input.enrolmentId, user.id);
  state = captureReflection(state, text);

  try {
    await appendEvidence(supabase, {
      userId: user.id,
      sourceType: "reflection",
      category: "knowledge",
      title: `Experience reflection — ${state.company.name}`,
      summary: text.slice(0, 240),
      rawContent: {
        reflection: text,
        day: state.day,
        company: state.company.name,
        project: state.project.name,
      },
      sourceRecordType: "experience_reflection",
      sourceRecordId: state.reflections.at(-1)?.id,
      idempotencyKey: `experience-reflection:${input.enrolmentId}:${state.reflections.at(-1)?.id}`,
      provenance: {
        actorType: "user",
        actorUserId: user.id,
        userContribution: { text },
        aiContribution: {},
      },
    });
  } catch (err) {
    console.error("[experience-sim] reflection observation failed", err);
  }

  const { complete } = evaluateCompletion(state);
  if (complete) {
    state = { ...state, lifecycle: "completed" };
  }

  await persistSimState(supabase, input.enrolmentId, state);
  await appendSimEvent(supabase, {
    enrolmentId: input.enrolmentId,
    userId: user.id,
    eventType: "ReflectionCaptured",
    payload: { length: text.length },
    userContribution: { text },
  });
  if (complete) {
    await appendSimEvent(supabase, {
      enrolmentId: input.enrolmentId,
      userId: user.id,
      eventType: "ExperienceCompleted",
      payload: { metrics: state.metrics },
    });
  }

  return { ok: true as const, state, complete };
}

export { generateExperience, generateMediFlowExperience, isExperienceSimState };
