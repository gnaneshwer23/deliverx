/**
 * Persist Experience hiring interview turns. Placement is deterministic.
 * Never writes capability, ledger evidence, or Verified.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AiCitation } from "@/lib/ai-orchestration/types";
import { runAgent } from "@/lib/ai-orchestration/run";
import { appendSimEvent, ensureSimState, persistSimState } from "@/lib/experience-sim/runtime";
import type { ExperienceSimState, HiringInterviewTurn } from "@/lib/experience-sim/types";
import {
  canFinishHiringInterview,
  candidateAnswerCount,
  deriveHiringPlacement,
  deterministicHiringQuestion,
  hiringContextSources,
  isXpHiringInterviewEnabled,
  labelledClaims,
  normaliseHiringClaims,
  makeHiringTurn,
  nextHiringSpeakerRole,
  panelMemberForRole,
  shouldAutoCompleteHiringInterview,
  type HiringClaims,
} from "@/lib/xperience/hiring-interview";

export type HiringInterviewAction = "open" | "turn" | "complete" | "skip";

function finishInterview(
  state: ExperienceSimState,
  status: "completed" | "skipped",
): ExperienceSimState {
  const interview = state.hiringInterview;
  if (!interview) return state;
  return {
    ...state,
    hiringInterview: {
      ...interview,
      status,
      placement: deriveHiringPlacement(state),
      completedAt: new Date().toISOString(),
    },
  };
}

function isTerminalInterview(state: ExperienceSimState): boolean {
  const status = state.hiringInterview?.status;
  return status === "completed" || status === "skipped";
}

/** Skip wins over in-flight turns. Do not resurrect a closed interview. */
async function persistUnlessInterviewClosed(
  supabase: SupabaseClient,
  enrolmentId: string,
  userId: string,
  next: ExperienceSimState,
): Promise<ExperienceSimState> {
  const latest = await ensureSimState(supabase, enrolmentId, userId);
  const latestStatus = latest.hiringInterview?.status;
  if (latestStatus === "skipped") return latest;
  const nextStatus = next.hiringInterview?.status;
  if (latestStatus === "completed" && nextStatus !== "skipped") {
    return latest;
  }
  const toWrite =
    nextStatus === "skipped" && latest.hiringInterview
      ? finishInterview(latest, "skipped")
      : next;
  await persistSimState(supabase, enrolmentId, toWrite);
  return toWrite;
}

function asCitations(raw: unknown): HiringInterviewTurn["citations"] {
  if (!Array.isArray(raw)) return [];
  const out: HiringInterviewTurn["citations"] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as AiCitation;
    if (typeof row.sourceId !== "string" || !row.sourceId.trim()) continue;
    out.push({
      sourceType: typeof row.sourceType === "string" ? row.sourceType : "other",
      sourceId: row.sourceId.trim(),
      excerpt: typeof row.excerpt === "string" ? row.excerpt : undefined,
      label: typeof row.label === "string" ? row.label : undefined,
    });
  }
  return out;
}

async function askPanelQuestion(
  state: ExperienceSimState,
  claims: HiringClaims,
  userId: string,
  supabase: SupabaseClient,
): Promise<HiringInterviewTurn> {
  const interview = state.hiringInterview!;
  const speakerRole = nextHiringSpeakerRole(interview);
  const speaker = panelMemberForRole(interview, speakerRole);
  const fallback = deterministicHiringQuestion(state, speaker, speakerRole, claims);
  const ctx = hiringContextSources(state, claims);
  const lastCandidate = [...interview.turns].reverse().find((t) => t.role === "candidate");

  try {
    const result = await runAgent({
      userId,
      agentSlug: "experience_hiring",
      supabase,
      context: {
        boundSurface: "experience",
        boundRef: ctx.boundRef,
        organisationData: ctx.organisationData,
        extraSources: ctx.extraSources,
        userMessage: lastCandidate
          ? `Panel speaker: ${speaker.name} (${speaker.role}, ${speakerRole}). Candidate just said: ${lastCandidate.text}`
          : `Open the hiring conversation as ${speaker.name} (${speaker.role}, ${speakerRole}).`,
        activityTurns: interview.turns.slice(-6).map((t) => ({
          role: t.role === "candidate" ? ("user" as const) : ("assistant" as const),
          content: t.text,
        })),
      },
      skipPersist: false,
    });

    const question =
      result.ok && typeof result.output?.question === "string" && result.output.question.trim()
        ? result.output.question.trim()
        : fallback.text;
    const citations = result.ok ? asCitations(result.output?.citations) : fallback.citations;
    const resolvedCitations = citations.length > 0 ? citations : fallback.citations;

    return makeHiringTurn({
      role: speakerRole,
      speakerId: speaker.id,
      speakerName: speaker.name,
      text: question,
      citations: resolvedCitations,
    });
  } catch {
    return makeHiringTurn({
      role: speakerRole,
      speakerId: speaker.id,
      speakerName: speaker.name,
      text: fallback.text,
      citations: fallback.citations,
    });
  }
}

export async function runHiringInterviewAction(
  supabase: SupabaseClient,
  user: User,
  input: {
    enrolmentId: string;
    action: HiringInterviewAction;
    text?: string;
    claims?: HiringClaims;
  },
): Promise<
  | { ok: true; state: ExperienceSimState; capabilityAssigned: false }
  | { ok: false; error: string; state?: ExperienceSimState }
> {
  if (!isXpHiringInterviewEnabled()) {
    return { ok: false, error: "hiring_interview_disabled" };
  }

  let state = await ensureSimState(supabase, input.enrolmentId, user.id);
  const claims = normaliseHiringClaims(input.claims);

  if (input.action === "open") {
    if (!state.hiringInterview) {
      return { ok: false, error: "hiring_interview_not_offered", state };
    }
    if (state.hiringInterview.status === "completed" || state.hiringInterview.status === "skipped") {
      return { ok: true, state, capabilityAssigned: false };
    }

    if (state.hiringInterview.status === "pending" || state.hiringInterview.turns.length === 0) {
      const question = await askPanelQuestion(
        { ...state, hiringInterview: { ...state.hiringInterview, status: "in_progress" } },
        claims,
        user.id,
        supabase,
      );
      state = {
        ...state,
        hiringInterview: {
          ...state.hiringInterview,
          status: "in_progress",
          turns: [question],
        },
      };
      state = await persistUnlessInterviewClosed(supabase, input.enrolmentId, user.id, state);
      if (isTerminalInterview(state) || !state.hiringInterview) {
        return { ok: true, state, capabilityAssigned: false };
      }
      await appendSimEvent(supabase, {
        enrolmentId: input.enrolmentId,
        userId: user.id,
        eventType: "HiringInterviewStarted",
        payload: {
          managerId: state.hiringInterview.panel.manager.id,
          stakeholderId: state.hiringInterview.panel.stakeholder.id,
        },
        aiContribution: { questionId: question.id, speakerId: question.speakerId },
      });
    }

    return { ok: true, state, capabilityAssigned: false };
  }

  if (input.action === "skip") {
    if (!state.hiringInterview) {
      return { ok: true, state, capabilityAssigned: false };
    }
    if (state.hiringInterview.status === "completed" || state.hiringInterview.status === "skipped") {
      return { ok: true, state, capabilityAssigned: false };
    }
    state = finishInterview(state, "skipped");
    state = await persistUnlessInterviewClosed(supabase, input.enrolmentId, user.id, state);
    if (state.hiringInterview?.status === "skipped") {
      await appendSimEvent(supabase, {
        enrolmentId: input.enrolmentId,
        userId: user.id,
        eventType: "HiringInterviewSkipped",
        payload: { placement: state.hiringInterview.placement },
      });
    }
    return { ok: true, state, capabilityAssigned: false };
  }

  if (!state.hiringInterview) {
    return { ok: false, error: "hiring_interview_not_started", state };
  }

  if (input.action === "complete") {
    if (state.hiringInterview.status === "completed" || state.hiringInterview.status === "skipped") {
      return { ok: true, state, capabilityAssigned: false };
    }
    if (!canFinishHiringInterview(state.hiringInterview)) {
      return { ok: false, error: "hiring_interview_too_short", state };
    }
    state = finishInterview(state, "completed");
    state = await persistUnlessInterviewClosed(supabase, input.enrolmentId, user.id, state);
    if (state.hiringInterview?.status === "completed") {
      await appendSimEvent(supabase, {
        enrolmentId: input.enrolmentId,
        userId: user.id,
        eventType: "HiringInterviewCompleted",
        payload: {
          placement: state.hiringInterview.placement,
          answers: candidateAnswerCount(state.hiringInterview),
        },
      });
    }
    return { ok: true, state, capabilityAssigned: false };
  }

  if (input.action === "turn") {
    if (state.hiringInterview.status !== "in_progress") {
      return { ok: false, error: "hiring_interview_not_in_progress", state };
    }
    const text = String(input.text ?? "").trim();
    if (text.length < 8) {
      return { ok: false, error: "answer_too_short", state };
    }
    if (text.length > 4000) {
      return { ok: false, error: "answer_too_long", state };
    }

    const candidateTurn = makeHiringTurn({
      role: "candidate",
      speakerId: "candidate",
      speakerName: "You",
      text,
      citations: Object.keys(labelledClaims(claims)).map((key) => ({
        sourceType: "other",
        sourceId: `claim:${key}`,
        label: `Self-reported ${key}`,
      })),
    });

    let next: ExperienceSimState = {
      ...state,
      hiringInterview: {
        ...state.hiringInterview,
        turns: [...state.hiringInterview.turns, candidateTurn],
      },
    };

    await appendSimEvent(supabase, {
      enrolmentId: input.enrolmentId,
      userId: user.id,
      eventType: "HiringInterviewTurn",
      payload: { turnId: candidateTurn.id },
      userContribution: { text },
    });

    if (shouldAutoCompleteHiringInterview(next.hiringInterview)) {
      next = finishInterview(next, "completed");
      next = await persistUnlessInterviewClosed(supabase, input.enrolmentId, user.id, next);
      if (next.hiringInterview?.status === "completed") {
        await appendSimEvent(supabase, {
          enrolmentId: input.enrolmentId,
          userId: user.id,
          eventType: "HiringInterviewCompleted",
          payload: {
            placement: next.hiringInterview?.placement ?? null,
            answers: candidateAnswerCount(next.hiringInterview),
            autoCompleted: true,
          },
        });
      }
      return { ok: true, state: next, capabilityAssigned: false };
    }

    const question = await askPanelQuestion(next, claims, user.id, supabase);
    next = {
      ...next,
      hiringInterview: {
        ...next.hiringInterview!,
        turns: [...next.hiringInterview!.turns, question],
      },
    };
    next = await persistUnlessInterviewClosed(supabase, input.enrolmentId, user.id, next);
    return { ok: true, state: next, capabilityAssigned: false };
  }

  return { ok: false, error: "unknown_action" };
}
