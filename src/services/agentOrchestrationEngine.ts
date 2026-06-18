/**
 * Agent orchestration engine — Chief of Staff routes 7 persona specialists.
 * Pure compute; human review required on all outputs. No auto-execution.
 */

import type { Health, ProjectSignals } from "./intelligenceEngine";

export type SpecialistAgentRole =
  | "pm_agent"
  | "ba_agent"
  | "product_agent"
  | "engineer_agent"
  | "qa_agent"
  | "scrum_agent"
  | "founder_agent";

export type OrchestrationIntent =
  | "delivery"
  | "requirements"
  | "quality"
  | "sprint"
  | "engineering"
  | "product"
  | "executive"
  | "general";

export type RagContextSnippet = {
  title: string | null;
  sourceType: string;
};

export type ProjectOrchestrationContext = {
  projectId: string;
  projectName: string;
  query?: string;
  signals: ProjectSignals;
  health: Health;
  openDefects: number;
  criticalDefects: number;
  openRequirements: number;
  ragSnippets: RagContextSnippet[];
};

export type AgentOrchestrationEvent = {
  agentRole: SpecialistAgentRole | "chief_of_staff";
  eventType: "route" | "insight" | "handoff" | "synthesis";
  message: string;
  detail?: Record<string, unknown>;
  handoffTo?: SpecialistAgentRole;
  confidence?: number;
};

export type AgentOrchestrationResult = {
  intent: OrchestrationIntent;
  routedAgents: SpecialistAgentRole[];
  events: AgentOrchestrationEvent[];
  synthesis: string;
  humanReviewRequired: true;
};

export const SPECIALIST_AGENTS: Array<{
  role: SpecialistAgentRole;
  label: string;
  specialization: string;
}> = [
  { role: "pm_agent", label: "PM Agent", specialization: "delivery_control" },
  { role: "ba_agent", label: "BA Agent", specialization: "requirements_traceability" },
  { role: "product_agent", label: "Product Agent", specialization: "discovery_prioritization" },
  { role: "engineer_agent", label: "Engineer Agent", specialization: "implementation_traceability" },
  { role: "qa_agent", label: "QA Agent", specialization: "quality_release" },
  { role: "scrum_agent", label: "Scrum Agent", specialization: "sprint_cadence" },
  { role: "founder_agent", label: "Founder Agent", specialization: "executive_alignment" },
];

const INTENT_RULES: Array<{ intent: OrchestrationIntent; pattern: RegExp }> = [
  { intent: "requirements", pattern: /\b(requirement|story|acceptance|traceability|ba)\b/i },
  { intent: "quality", pattern: /\b(qa|test|defect|bug|release readiness|uat)\b/i },
  { intent: "sprint", pattern: /\b(sprint|scrum|impediment|velocity|standup|ceremony)\b/i },
  { intent: "engineering", pattern: /\b(engineer|code|pr|build|deploy|technical)\b/i },
  { intent: "product", pattern: /\b(product|feature|roadmap|discovery|backlog)\b/i },
  { intent: "executive", pattern: /\b(founder|sponsor|investor|runway|executive|steering)\b/i },
  { intent: "delivery", pattern: /\b(milestone|blocker|risk|forecast|delivery|timeline)\b/i },
];

const INTENT_ROUTING: Record<OrchestrationIntent, SpecialistAgentRole[]> = {
  delivery: ["pm_agent", "scrum_agent"],
  requirements: ["ba_agent", "product_agent"],
  quality: ["qa_agent", "engineer_agent"],
  sprint: ["scrum_agent", "pm_agent"],
  engineering: ["engineer_agent", "qa_agent"],
  product: ["product_agent", "ba_agent"],
  executive: ["founder_agent", "pm_agent"],
  general: ["pm_agent", "founder_agent"],
};

type AgentFn = (ctx: ProjectOrchestrationContext) => AgentOrchestrationEvent[];

export function classifyOrchestrationIntent(
  query: string | undefined,
  signals: ProjectSignals,
): OrchestrationIntent {
  const text = query?.trim() ?? "";
  if (text) {
    for (const rule of INTENT_RULES) {
      if (rule.pattern.test(text)) return rule.intent;
    }
  }

  if (signals.blockers > 0 || signals.overdueTasks > 2) return "delivery";
  if (signals.risks >= 3) return "executive";
  if (signals.velocity < 0.35) return "sprint";
  return "general";
}

export function routeSpecialistAgents(intent: OrchestrationIntent): SpecialistAgentRole[] {
  return INTENT_ROUTING[intent];
}

const pmAgent: AgentFn = (ctx) => {
  const events: AgentOrchestrationEvent[] = [];
  if (ctx.signals.blockers > 0) {
    events.push({
      agentRole: "pm_agent",
      eventType: "insight",
      message: `${ctx.signals.blockers} blocked task(s) need PM escalation`,
      confidence: 0.86,
      detail: { blockers: ctx.signals.blockers },
    });
  }
  if (ctx.signals.overdueTasks > 0) {
    events.push({
      agentRole: "pm_agent",
      eventType: "insight",
      message: `${ctx.signals.overdueTasks} overdue tasks threaten milestone confidence`,
      confidence: 0.8,
      detail: { overdueTasks: ctx.signals.overdueTasks },
    });
  }
  if (events.length === 0) {
    events.push({
      agentRole: "pm_agent",
      eventType: "insight",
      message: "Delivery plan stable — monitor forecast drift weekly",
      confidence: 0.7,
    });
  }
  return events;
};

const baAgent: AgentFn = (ctx) => {
  if (ctx.openRequirements === 0) {
    return [
      {
        agentRole: "ba_agent",
        eventType: "insight",
        message: "No open requirements tracked — seed traceability before build",
        confidence: 0.75,
      },
    ];
  }
  return [
    {
      agentRole: "ba_agent",
      eventType: "insight",
      message: `${ctx.openRequirements} requirement(s) in flight — validate acceptance criteria`,
      confidence: 0.82,
      detail: { openRequirements: ctx.openRequirements },
    },
  ];
};

const productAgent: AgentFn = (ctx) => {
  const openTasks = Math.max(
    0,
    ctx.signals.totalTasks - Math.round(ctx.signals.totalTasks * ctx.signals.milestoneProgress),
  );
  const pressure = ctx.signals.totalTasks > 0 && openTasks / ctx.signals.totalTasks > 0.6;
  return [
    {
      agentRole: "product_agent",
      eventType: "insight",
      message: pressure
        ? "WIP high — reprioritize backlog before adding scope"
        : "Backlog capacity available for next discovery slice",
      confidence: pressure ? 0.78 : 0.68,
      detail: { openTasks, totalTasks: ctx.signals.totalTasks },
    },
  ];
};

const engineerAgent: AgentFn = (ctx) => {
  const doneTasks = Math.round(ctx.signals.totalTasks * ctx.signals.milestoneProgress);
  const events: AgentOrchestrationEvent[] = [];
  if (ctx.signals.blockers > 0) {
    events.push({
      agentRole: "engineer_agent",
      eventType: "insight",
      message: "Engineering blocked — unblock before starting new stories",
      confidence: 0.88,
      detail: { blockers: ctx.signals.blockers },
    });
  } else {
    events.push({
      agentRole: "engineer_agent",
      eventType: "insight",
      message: `Build lane clear — ${doneTasks} tasks completed`,
      confidence: 0.72,
      detail: { doneTasks },
    });
  }
  return events;
};

const qaAgent: AgentFn = (ctx) => {
  if (ctx.criticalDefects > 0) {
    return [
      {
        agentRole: "qa_agent",
        eventType: "insight",
        message: `${ctx.criticalDefects} critical defect(s) — hold release candidate`,
        confidence: 0.9,
        detail: { criticalDefects: ctx.criticalDefects, openDefects: ctx.openDefects },
      },
    ];
  }
  if (ctx.openDefects > 0) {
    return [
      {
        agentRole: "qa_agent",
        eventType: "insight",
        message: `${ctx.openDefects} open defect(s) — triage before UAT sign-off`,
        confidence: 0.8,
        detail: { openDefects: ctx.openDefects },
      },
    ];
  }
  return [
    {
      agentRole: "qa_agent",
      eventType: "insight",
      message: "No open defects — maintain regression coverage for changed stories",
      confidence: 0.65,
    },
  ];
};

const scrumAgent: AgentFn = (ctx) => {
  const events: AgentOrchestrationEvent[] = [];
  if (!ctx.signals.standupsComplete) {
    events.push({
      agentRole: "scrum_agent",
      eventType: "insight",
      message: "Standup missing today — capture blockers early",
      confidence: 0.77,
    });
  }
  if (ctx.signals.velocity < 0.4) {
    events.push({
      agentRole: "scrum_agent",
      eventType: "insight",
      message: "Velocity soft — inspect sprint scope and impediments",
      confidence: 0.81,
      detail: { velocity: ctx.signals.velocity },
    });
  }
  if (events.length === 0) {
    events.push({
      agentRole: "scrum_agent",
      eventType: "insight",
      message: "Sprint cadence healthy — protect ceremony time",
      confidence: 0.68,
      detail: { velocity: ctx.signals.velocity },
    });
  }
  return events;
};

const founderAgent: AgentFn = (ctx) => {
  const tier = ctx.health.tier;
  return [
    {
      agentRole: "founder_agent",
      eventType: "insight",
      message:
        tier === "at-risk" || tier === "watch"
          ? `Portfolio health ${ctx.health.score}/100 (${tier}) — executive review recommended`
          : `Portfolio health ${ctx.health.score}/100 — sponsor narrative on track`,
      confidence: tier === "healthy" ? 0.74 : 0.85,
      detail: { healthScore: ctx.health.score, healthTier: tier },
    },
  ];
};

const AGENT_REGISTRY: Record<SpecialistAgentRole, AgentFn> = {
  pm_agent: pmAgent,
  ba_agent: baAgent,
  product_agent: productAgent,
  engineer_agent: engineerAgent,
  qa_agent: qaAgent,
  scrum_agent: scrumAgent,
  founder_agent: founderAgent,
};

export function applyHandoffRules(
  events: AgentOrchestrationEvent[],
): AgentOrchestrationEvent[] {
  const handoffs: AgentOrchestrationEvent[] = [];

  const engineerBlocked = events.some(
    (e) => e.agentRole === "engineer_agent" && e.message.includes("blocked"),
  );
  if (engineerBlocked && !events.some((e) => e.agentRole === "pm_agent")) {
    handoffs.push({
      agentRole: "engineer_agent",
      eventType: "handoff",
      message: "Escalating engineering blockers to PM Agent",
      handoffTo: "pm_agent",
      confidence: 0.84,
    });
  }

  const qaCritical = events.some(
    (e) => e.agentRole === "qa_agent" && e.message.includes("critical"),
  );
  if (qaCritical) {
    handoffs.push({
      agentRole: "qa_agent",
      eventType: "handoff",
      message: "Routing critical defects to Engineer Agent for fix plan",
      handoffTo: "engineer_agent",
      confidence: 0.87,
    });
  }

  return handoffs;
}

export function synthesizeChiefOfStaffBrief(
  ctx: ProjectOrchestrationContext,
  events: AgentOrchestrationEvent[],
  routedAgents: SpecialistAgentRole[],
): string {
  const insights = events.filter((e) => e.eventType === "insight");
  const top = insights
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 3)
    .map((e) => e.message);

  const ragNote =
    ctx.ragSnippets.length > 0
      ? ` Grounded in ${ctx.ragSnippets.length} memory snippet(s).`
      : "";

  if (top.length === 0) {
    return `Chief of Staff routed ${routedAgents.join(", ")} — no urgent actions.${ragNote} Review recommended before applying changes.`;
  }

  return `Chief of Staff synthesis for ${ctx.projectName}: ${top.join(" · ")}.${ragNote} Human approval required before execution.`;
}

export function runAgentOrchestration(ctx: ProjectOrchestrationContext): AgentOrchestrationResult {
  const intent = classifyOrchestrationIntent(ctx.query, ctx.signals);
  const routedAgents = routeSpecialistAgents(intent);

  const events: AgentOrchestrationEvent[] = [
    {
      agentRole: "chief_of_staff",
      eventType: "route",
      message: `Routing ${intent} intent to ${routedAgents.map((r) => r.replace("_agent", "")).join(", ")}`,
      detail: { intent, routedAgents, query: ctx.query ?? null },
      confidence: 0.9,
    },
  ];

  for (const role of routedAgents) {
    events.push(...AGENT_REGISTRY[role](ctx));
  }

  events.push(...applyHandoffRules(events));

  const synthesis = synthesizeChiefOfStaffBrief(ctx, events, routedAgents);
  events.push({
    agentRole: "chief_of_staff",
    eventType: "synthesis",
    message: synthesis,
    confidence: 0.88,
  });

  return {
    intent,
    routedAgents,
    events,
    synthesis,
    humanReviewRequired: true,
  };
}
