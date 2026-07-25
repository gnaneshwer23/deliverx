import type {
  ExperienceSimState,
  PersonaContract,
  ProjectMetrics,
} from "@/lib/experience-sim/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Persona Engine — memory + relationship-aware reactions. */
export function personaRemember(
  state: ExperienceSimState,
  personaId: string,
  note: string,
  eventType: string,
  at = new Date().toISOString(),
): ExperienceSimState {
  const patch = (list: PersonaContract[]) =>
    list.map((p) =>
      p.id === personaId
        ? {
            ...p,
            memory: [...p.memory, { at, note, eventType }].slice(-20),
          }
        : p,
    );
  return {
    ...state,
    team: patch(state.team),
    stakeholders: patch(state.stakeholders),
  };
}

/** Project State Engine — applies numeric metric deltas. */
export function applyMetricDeltas(
  metrics: ProjectMetrics,
  deltas: Partial<Omit<ProjectMetrics, "stakeholderTrust">> & {
    trustByPersona?: Record<string, number>;
  },
): ProjectMetrics {
  const next: ProjectMetrics = { ...metrics, stakeholderTrust: { ...metrics.stakeholderTrust } };
  const keys: Array<keyof Omit<ProjectMetrics, "stakeholderTrust">> = [
    "projectRisk",
    "timelinePressure",
    "budgetHealth",
    "scopeCreep",
    "teamMorale",
    "businessOutcome",
    "revenueProtected",
    "customerSatisfaction",
    "engineeringCapacity",
    "roadmapHealth",
  ];
  for (const k of keys) {
    const d = deltas[k];
    if (typeof d === "number") {
      if (k === "revenueProtected") {
        next[k] = Math.max(0, metrics[k] + d);
      } else {
        next[k] = clamp(metrics[k] + d);
      }
    }
  }
  if (deltas.trustByPersona) {
    for (const [id, delta] of Object.entries(deltas.trustByPersona)) {
      next.stakeholderTrust[id] = clamp((next.stakeholderTrust[id] ?? 50) + delta);
    }
  }
  return next;
}

/** Task Engine */
export function updateTask(
  state: ExperienceSimState,
  taskId: string,
  status: "todo" | "in_progress" | "blocked" | "done",
): ExperienceSimState {
  return {
    ...state,
    tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
  };
}

/** Inbox Engine */
export function addMessage(
  state: ExperienceSimState,
  message: ExperienceSimState["messages"][number],
): ExperienceSimState {
  return { ...state, messages: [message, ...state.messages] };
}

/** Meeting Engine */
export function completeMeeting(
  state: ExperienceSimState,
  meetingId: string,
  outcome: string,
): ExperienceSimState {
  return {
    ...state,
    meetings: state.meetings.map((m) =>
      m.id === meetingId ? { ...m, status: "completed" as const, outcome } : m,
    ),
    completion: { ...state.completion, meetingRecorded: true },
  };
}

/** Risk Engine */
export function upsertRisk(
  state: ExperienceSimState,
  risk: ExperienceSimState["risks"][number],
): ExperienceSimState {
  const exists = state.risks.some((r) => r.id === risk.id);
  return {
    ...state,
    risks: exists
      ? state.risks.map((r) => (r.id === risk.id ? risk : r))
      : [...state.risks, risk],
  };
}

/** Coaching Engine — advisory only; never assigns capability. */
export function coachingHintForDecision(choiceId: string): string {
  switch (choiceId) {
    case "review_context":
      return "Good instinct to gather context. Capture what you learned — that becomes practice evidence, not a capability score.";
    case "discuss_options":
      return "Facilitation is applied skill. Note who shifted and why for your evidence trail.";
    case "make_decision":
      return "Committing with rationale creates decision evidence. Capability still requires repeated, verified demonstration.";
    default:
      return "Every action can create evidence. Capability is judged later by the Capability Engine — not inside Experience.";
  }
}

/**
 * Consequence Engine — maps a user decision to persistent world changes.
 * This is the heart of the simulation loop.
 */
export function applyDecisionConsequences(
  state: ExperienceSimState,
  input: {
    choiceId: string;
    label: string;
    rationale?: string;
    decisionRowId: string;
  },
): {
  state: ExperienceSimState;
  effects: Record<string, number>;
  events: Array<{ type: string; payload: Record<string, unknown> }>;
} {
  const events: Array<{ type: string; payload: Record<string, unknown> }> = [];
  let next = { ...state };
  const day = state.day;

  const decision = {
    id: input.decisionRowId,
    choiceId: input.choiceId,
    label: input.label,
    rationale: input.rationale || "",
    day,
    userContribution: {
      choiceId: input.choiceId,
      label: input.label,
      rationale: input.rationale || null,
    },
    aiContribution: {},
  };

  next = {
    ...next,
    decisions: [...next.decisions, decision],
    completion: { ...next.completion, decisionMade: true },
  };
  events.push({ type: "DecisionRecorded", payload: { decision } });

  let effects: Record<string, number> = {};
  let trustByPersona: Record<string, number> = {};
  let summary = "";

  if (input.choiceId === "review_context") {
    effects = {
      projectRisk: -4,
      timelinePressure: 2,
      clarity: 6,
      trust: 3,
    };
    trustByPersona = { "p-maya": 5, "p-james": -2, "p-sarah": 2 };
    summary = "You slowed to review context. Maya’s trust rose; James feels delayed.";
    next = updateTask(next, "t-brief", "done");
    next = addMessage(next, {
      id: `msg-maya-${Date.now()}`,
      fromPersonaId: "p-maya",
      subject: "Capacity reality check",
      body: "Thanks for asking. We’re at 64% — Tuesday is aggressive without cutting scope.",
      day,
      read: false,
    });
    next = personaRemember(next, "p-maya", "User sought engineering context before committing", "DecisionRecorded");
    // Briefing counts as recorded meeting activity so Day-1 E2E can complete via reflection
    next = {
      ...next,
      meetings: next.meetings.map((m) =>
        m.id === "m-standup"
          ? {
              ...m,
              status: "scheduled" as const,
              outcome: "Huddle postponed — user reviewing context first",
            }
          : m,
      ),
      completion: { ...next.completion, meetingRecorded: true },
    };
    events.push({
      type: "MeetingCompleted",
      payload: { meetingId: "m-standup", deferred: true },
    });
  } else if (input.choiceId === "discuss_options") {
    effects = {
      projectRisk: -6,
      timelinePressure: -3,
      teamMorale: 4,
      trust: 5,
      clarity: 5,
    };
    trustByPersona = { "p-maya": 6, "p-james": 4, "p-sarah": 3 };
    summary = "You facilitated options. Trade-offs are clearer; huddle can complete.";
    next = updateTask(next, "t-align", "in_progress");
    next = completeMeeting(
      next,
      "m-standup",
      "Agreed to present two date options to Metro Clinic with scope notes.",
    );
    next = personaRemember(next, "p-james", "User opened space to negotiate date", "MeetingCompleted");
    next = personaRemember(next, "p-maya", "User protected capacity in discussion", "MeetingCompleted");
    events.push({
      type: "MeetingCompleted",
      payload: { meetingId: "m-standup" },
    });
  } else {
    // make_decision — commit with renegotiation framing
    effects = {
      projectRisk: -8,
      timelinePressure: -8,
      businessOutcome: 8,
      scopeCreep: -5,
      trust: 7,
      delivery: 5,
      clarity: 4,
    };
    trustByPersona = { "p-sarah": 5, "p-maya": 4, "p-james": 6, "p-priya": 3 };
    summary =
      "You made an explicit call: renegotiate Tuesday to a scoped Friday pilot. Stakeholders realign.";
    next = updateTask(next, "t-align", "done");
    next = updateTask(next, "t-brief", "done");
    next = completeMeeting(
      next,
      "m-standup",
      "Decision: Friday pilot with messaging-only scope; billing deferred.",
    );
    next = upsertRisk(next, {
      id: "r-overpromise",
      title: "Sales over-promise on pilot date",
      severity: "medium",
      status: "mitigated",
    });
    next = addMessage(next, {
      id: `msg-sarah-${Date.now()}`,
      fromPersonaId: "p-sarah",
      subject: "Clear decision — thank you",
      body: "Friday with scoped TrustCare is acceptable. Keep Priya in the loop for the customer email.",
      day,
      read: false,
    });
    next = personaRemember(
      next,
      "p-sarah",
      "User committed with scoped renegotiation",
      "DecisionRecorded",
    );
    events.push({ type: "MeetingCompleted", payload: { meetingId: "m-standup" } });
    events.push({ type: "RiskChanged", payload: { riskId: "r-overpromise", status: "mitigated" } });
  }

  next = {
    ...next,
    metrics: applyMetricDeltas(next.metrics, {
      projectRisk: effects.projectRisk,
      timelinePressure: effects.timelinePressure,
      budgetHealth: effects.budgetHealth,
      scopeCreep: effects.scopeCreep,
      teamMorale: effects.teamMorale,
      businessOutcome: effects.businessOutcome,
      trustByPersona,
    }),
    consequences: [
      ...next.consequences,
      {
        id: `c-${input.decisionRowId}`,
        summary,
        day,
        effects: { ...effects, ...trustByPersona },
      },
    ],
    completion: { ...next.completion, consequenceApplied: true },
    coachingHints: [coachingHintForDecision(input.choiceId), ...next.coachingHints].slice(0, 5),
    availableDecisions: [], // single critical decision arc for v1
    lifecycle: "reflecting",
  };

  events.push({
    type: "ConsequenceApplied",
    payload: { summary, effects, trustByPersona },
  });
  events.push({
    type: "CoachingHintIssued",
    payload: { hint: coachingHintForDecision(input.choiceId) },
  });
  events.push({ type: "MessageSent", payload: { count: 1 } });
  events.push({ type: "TaskUpdated", payload: {} });

  return { state: next, effects: { ...effects, ...flattenTrust(trustByPersona) }, events };
}

function flattenTrust(trustByPersona: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(trustByPersona)) {
    out[`trust_${k}`] = v;
  }
  return out;
}

export function captureReflection(
  state: ExperienceSimState,
  text: string,
): ExperienceSimState {
  const reflection = {
    id: `ref-${Date.now()}`,
    text: text.trim(),
    day: state.day,
  };
  const completion = {
    ...state.completion,
    reflectionCaptured: true,
  };
  const ready =
    completion.decisionMade &&
    completion.consequenceApplied &&
    completion.meetingRecorded &&
    completion.reflectionCaptured;

  return {
    ...state,
    reflections: [...state.reflections, reflection],
    completion,
    lifecycle: ready ? "assessing" : state.lifecycle,
  };
}

export function evaluateCompletion(state: ExperienceSimState): {
  complete: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!state.completion.decisionMade) missing.push("decision");
  if (!state.completion.consequenceApplied) missing.push("consequence");
  if (!state.completion.meetingRecorded) missing.push("meeting");
  if (!state.completion.reflectionCaptured) missing.push("reflection");
  if (!state.completion.observationEmitted) missing.push("observation");
  return { complete: missing.length === 0, missing };
}

/** Failure + recovery — pause the sim without inventing capability. */
export function failExperience(
  state: ExperienceSimState,
  reason: string,
): ExperienceSimState {
  return {
    ...state,
    lifecycle: "failed",
    coachingHints: [
      `Simulation paused: ${reason}. Recover to continue — evidence already captured stays on the ledger.`,
      ...state.coachingHints,
    ].slice(0, 5),
  };
}

export function recoverExperience(state: ExperienceSimState): ExperienceSimState {
  if (state.lifecycle !== "failed" && state.lifecycle !== "paused") return state;
  const nextLifecycle =
    state.completion.decisionMade && !state.completion.reflectionCaptured
      ? "reflecting"
      : state.completion.reflectionCaptured
        ? "assessing"
        : "active";
  return {
    ...state,
    lifecycle: nextLifecycle,
    coachingHints: [
      "Recovered. Pick up from the current project state — decisions already made still stand.",
      ...state.coachingHints,
    ].slice(0, 5),
  };
}
