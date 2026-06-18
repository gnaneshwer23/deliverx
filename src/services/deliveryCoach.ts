/**
 * Delivery coach — PM coaching suggestions derived from alert queue.
 */

import { getOrgAlertQueue, type DeliveryAlert } from "./alerts";

export type CoachSuggestion = {
  id: string;
  priority: "high" | "medium" | "low";
  behaviour: string;
  action: string;
  href?: string;
};

const COACH_MAP: Record<
  DeliveryAlert["category"],
  (a: DeliveryAlert) => CoachSuggestion
> = {
  risk: (a) => ({
    id: `coach-${a.id}`,
    priority: a.severity === "critical" ? "high" : "medium",
    behaviour: "Risk exposure is accumulating without visible mitigation.",
    action: `Review and assign mitigation for "${a.title}"`,
    href: a.href,
  }),
  blocker: (a) => ({
    id: `coach-${a.id}`,
    priority: "high",
    behaviour: "Blocked work is stalling delivery velocity.",
    action: "Run a blocker triage — escalate or reassign within 24h",
    href: a.href,
  }),
  decision: (a) => ({
    id: `coach-${a.id}`,
    priority: "medium",
    behaviour: "Governance latency — decisions pending too long.",
    action: "Schedule a decision forum or delegate approval authority",
    href: a.href,
  }),
  change: (a) => ({
    id: `coach-${a.id}`,
    priority: "medium",
    behaviour: "Scope change pressure detected.",
    action: "Assess change impact before approving downstream work",
    href: a.href,
  }),
  health: (a) => ({
    id: `coach-${a.id}`,
    priority: "high",
    behaviour: "Project health has degraded below acceptable threshold.",
    action: "Reset plan with workstream leads — focus on top 3 recovery actions",
    href: a.href,
  }),
  milestone: (a) => ({
    id: `coach-${a.id}`,
    priority: "medium",
    behaviour: "Milestone confidence is slipping.",
    action: "Split or re-phase the critical path milestone",
    href: a.href,
  }),
  capacity: () => ({
    id: "coach-capacity",
    priority: "medium",
    behaviour: "Team workload imbalance detected.",
    action: "Review capacity dashboard and rebalance assignments",
    href: "/workspace/capacity",
  }),
  approval: (a) => ({
    id: `coach-${a.id}`,
    priority: "high",
    behaviour: "Steering/sponsor approval bottleneck.",
    action: "Escalate to governance forum with decision pack ready",
    href: a.href,
  }),
  artifact: (a) => ({
    id: `coach-${a.id}`,
    priority: "medium",
    behaviour: "AI-generated artifacts are waiting for human review.",
    action: `Review and approve or reject "${a.title}"`,
    href: a.href ?? "/workspace/proposals",
  }),
  proposal: (a) => ({
    id: `coach-${a.id}`,
    priority: "medium",
    behaviour: "Assistant proposals need a decision before they can apply.",
    action: `Approve or reject "${a.title}" in AI output review`,
    href: a.href ?? "/workspace/proposals",
  }),
  standup: (a) => ({
    id: `coach-${a.id}`,
    priority: "low",
    behaviour: "Standup participation signal is weak.",
    action: "Reinforce daily standup ritual with team leads",
    href: a.href,
  }),
};

export async function getDeliveryCoachSuggestions(limit = 6): Promise<CoachSuggestion[]> {
  const alerts = await getOrgAlertQueue(20);
  const seen = new Set<string>();
  const suggestions: CoachSuggestion[] = [];

  for (const alert of alerts) {
    const fn = COACH_MAP[alert.category];
    if (!fn) continue;
    const s = fn(alert);
    if (seen.has(s.behaviour)) continue;
    seen.add(s.behaviour);
    suggestions.push(s);
    if (suggestions.length >= limit) break;
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "coach-default",
      priority: "low",
      behaviour: "Delivery rhythm is stable.",
      action: "Maintain governance cadence and weekly stakeholder reporting",
      href: "/workspace/reports",
    });
  }

  return suggestions;
}
