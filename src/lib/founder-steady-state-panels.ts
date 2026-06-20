import {
  buildFounderPortfolioSnapshotCounts,
  buildFounderProposalsHref,
  type FounderDayOneKpi,
} from "@/lib/founder-day-one-panels";
import type { FounderIntelligenceFeedItem } from "@/lib/founder-intelligence-feed";
import type { FounderMissionControl } from "@/services/founderDashboard";
import type { FounderDecisionRow, FounderPortfolioRow } from "@/services/founderEngine";
import { governanceTabHref } from "@/lib/governance-tabs";

/** Panel ids prioritized in founder steady-state layout (P-Founder-3). */
export const FOUNDER_STEADY_STATE_PANEL_IDS = [
  "needs-attention",
  "governance-tabs",
  "ai-review-inbox",
  "portfolio-snapshot",
  "delivery-health",
  "product-health",
  "intelligence-feed",
  "team-health",
  "founder-context",
] as const;

export type FounderSteadyStatePanelId = (typeof FOUNDER_STEADY_STATE_PANEL_IDS)[number];

/** Left-column panel order in steady-state grid. */
export const FOUNDER_STEADY_STATE_LEFT_PANEL_IDS = [
  "needs-attention",
  "governance-tabs",
  "ai-review-inbox",
] as const satisfies readonly FounderSteadyStatePanelId[];

/** Right-column panel order in steady-state grid. */
export const FOUNDER_STEADY_STATE_RIGHT_PANEL_IDS = [
  "portfolio-snapshot",
  "delivery-health",
  "product-health",
  "intelligence-feed",
  "team-health",
  "founder-context",
] as const satisfies readonly FounderSteadyStatePanelId[];

export function isFounderSteadyStatePanel(panelId: string): panelId is FounderSteadyStatePanelId {
  return (FOUNDER_STEADY_STATE_PANEL_IDS as readonly string[]).includes(panelId);
}

export type FounderAttentionPill = {
  label: "Urgent" | "Decide" | "Fund" | "Clear";
  tone: "urgent" | "decide" | "fund" | "clear";
};

export type FounderAttentionItem = {
  id: string;
  avatarInitials: string;
  role: string;
  title: string;
  subtitle?: string;
  pills: FounderAttentionPill[];
  waitLabel: string;
  waitSortDays: number;
  href?: string;
  escalateHref?: string;
};

export type FounderGovernanceTabId = "decisions" | "funding" | "portfolio" | "objectives";

export type FounderGovernanceTabCounts = {
  decisions: number;
  funding: number;
  portfolio: number;
  objectives: number;
};

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "EX").toUpperCase();
}

function waitLabelFromDays(days: number): string {
  if (days <= 0) return "Waiting today";
  if (days === 1) return "Waiting 1 day";
  return `Waiting ${days} days`;
}

function pillsForDecision(decision: FounderDecisionRow): FounderAttentionPill[] {
  const pills: FounderAttentionPill[] = [{ label: "Decide", tone: "decide" }];
  if (decision.impact === "High") {
    pills.unshift({ label: "Urgent", tone: "urgent" });
  }
  return pills;
}

export type BuildFounderAttentionFeedInput = {
  decisions: FounderDecisionRow[];
  pendingReviewCount: number;
  criticalRisks: number;
  blockedDependencies: number;
  portfolio: FounderPortfolioRow[];
  intelligenceFeed: FounderIntelligenceFeedItem[];
  runwayMonths: number;
  projectId?: string | null;
};

/** Merge executive decisions, portfolio risk, reviews, and intelligence into a sorted feed. */
export function buildFounderAttentionFeed(input: BuildFounderAttentionFeedInput): FounderAttentionItem[] {
  const items: FounderAttentionItem[] = [];
  const seen = new Set<string>();

  for (const decision of input.decisions) {
    const id = `${decision.kind}-${decision.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const waitDays = decision.impact === "High" ? 1 : 3;
    items.push({
      id,
      avatarInitials: initialsFromLabel(decision.projectName ?? "Executive"),
      role: decision.projectName ?? "Executive",
      title: decision.title,
      subtitle: `${decision.impact} impact · ${decision.kind}`,
      pills: pillsForDecision(decision),
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
      href: buildFounderDecisionCentreHref(input.projectId),
      escalateHref: buildFounderDecisionCentreHref(input.projectId),
    });
  }

  if (input.criticalRisks > 0 && !seen.has("critical-risks-feed")) {
    seen.add("critical-risks-feed");
    items.push({
      id: "critical-risks-feed",
      avatarInitials: "PM",
      role: "Delivery",
      title: `${input.criticalRisks} critical risk${input.criticalRisks === 1 ? "" : "s"} across portfolio`,
      subtitle: "Executive escalation may be required",
      pills: [{ label: "Urgent", tone: "urgent" }, { label: "Clear", tone: "clear" }],
      waitLabel: "Waiting today",
      waitSortDays: 0,
      href: input.projectId ? `/project/${input.projectId}/delivery#raid` : governanceTabHref("risks"),
    });
  }

  if (input.blockedDependencies > 0 && !seen.has("blocked-deps-feed")) {
    seen.add("blocked-deps-feed");
    items.push({
      id: "blocked-deps-feed",
      avatarInitials: "EN",
      role: "Engineering",
      title: `${input.blockedDependencies} blocked dependenc${input.blockedDependencies === 1 ? "y" : "ies"}`,
      subtitle: "Portfolio delivery velocity at risk",
      pills: [{ label: "Urgent", tone: "urgent" }, { label: "Clear", tone: "clear" }],
      waitLabel: "Waiting today",
      waitSortDays: 0,
      href: input.projectId ? `/project/${input.projectId}/delivery` : undefined,
    });
  }

  const atRiskProjects = input.portfolio.filter((p) => p.ragStatus === "red" || p.ragStatus === "amber");
  for (const project of atRiskProjects.slice(0, 3)) {
    const id = `portfolio-risk-${project.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const waitDays = project.ragStatus === "red" ? 0 : 2;
    items.push({
      id,
      avatarInitials: initialsFromLabel(project.name),
      role: "Portfolio",
      title: `${project.name} — ${project.ragStatus === "red" ? "off track" : "at risk"}`,
      subtitle: `${project.deliveryPct}% delivery · ${project.openRisks} open risk${project.openRisks === 1 ? "" : "s"}`,
      pills: [
        { label: project.ragStatus === "red" ? "Urgent" : "Decide", tone: project.ragStatus === "red" ? "urgent" : "decide" },
      ],
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
      href: `/project/${project.id}`,
    });
  }

  if (input.pendingReviewCount > 0 && !seen.has("pending-reviews-feed")) {
    seen.add("pending-reviews-feed");
    items.push({
      id: "pending-reviews-feed",
      avatarInitials: "AI",
      role: "DeliverX AI",
      title: `${input.pendingReviewCount} AI output${input.pendingReviewCount === 1 ? "" : "s"} awaiting executive sign-off`,
      pills: [{ label: "Decide", tone: "decide" }],
      waitLabel: waitLabelFromDays(2),
      waitSortDays: 2,
      href: buildFounderProposalsHref(input.projectId ?? undefined),
    });
  }

  for (const intel of input.intelligenceFeed.filter((item) => item.severity === "high").slice(0, 2)) {
    const id = `intel-${intel.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    items.push({
      id,
      avatarInitials: "AI",
      role: intel.badge,
      title: intel.message,
      subtitle: intel.projectName ? `${intel.projectName} · ${intel.meta}` : intel.meta,
      pills: [{ label: "Urgent", tone: "urgent" }],
      waitLabel: waitLabelFromDays(1),
      waitSortDays: 1,
      href: intel.href,
    });
  }

  if (input.runwayMonths < 6 && !seen.has("runway-feed")) {
    seen.add("runway-feed");
    items.push({
      id: "runway-feed",
      avatarInitials: "FN",
      role: "Finance",
      title: `Runway below 6 months (${input.runwayMonths} mo remaining)`,
      subtitle: "Review burn and funding plan",
      pills: [{ label: "Fund", tone: "fund" }],
      waitLabel: waitLabelFromDays(5),
      waitSortDays: 5,
      href: buildFounderContextHref(input.projectId),
    });
  }

  return items.sort((a, b) => a.waitSortDays - b.waitSortDays || a.title.localeCompare(b.title));
}

export function countWaitingOnFounder(attentionFeed: FounderAttentionItem[]): number {
  return attentionFeed.length;
}

export type BuildFounderSteadyStateKpisInput = {
  companyHealth: FounderMissionControl["companyHealth"];
  kpis: FounderMissionControl["kpis"];
  funding: FounderMissionControl["funding"];
  portfolio: FounderPortfolioRow[];
  waitingOnYouCount: number;
  criticalRisks: number;
  dataSources: FounderMissionControl["dataSources"];
};

/** Five KPIs for steady-state founder dashboard strip. */
export function buildFounderSteadyStateKpis(input: BuildFounderSteadyStateKpisInput): FounderDayOneKpi[] {
  const sym = input.funding.currency === "GBP" ? "£" : "$";
  const financialIsLive = input.dataSources.financials === "live";
  const portfolioCounts = buildFounderPortfolioSnapshotCounts(input.portfolio);

  const healthTone =
    input.companyHealth.tier === "green"
      ? "healthy"
      : input.companyHealth.tier === "amber"
        ? "watch"
        : "at-risk";

  const runwayTone =
    input.kpis.runwayMonths >= 12
      ? "healthy"
      : input.kpis.runwayMonths >= 6
        ? "watch"
        : "at-risk";

  const portfolioValue =
    portfolioCounts.total > 0
      ? `${portfolioCounts.onTrack}/${portfolioCounts.total}`
      : "—";

  return [
    {
      label: "Company health",
      value: input.companyHealth.label,
      hint: financialIsLive ? "Portfolio + runway composite" : "Add financials for live signal",
      tone: healthTone,
    },
    {
      label: "Portfolio on track",
      value: portfolioValue,
      hint:
        portfolioCounts.total > 0
          ? `${portfolioCounts.atRisk + portfolioCounts.offTrack} need attention`
          : "Projects appear after GO",
      tone:
        portfolioCounts.offTrack > 0
          ? "at-risk"
          : portfolioCounts.atRisk > 0
            ? "watch"
            : portfolioCounts.total > 0
              ? "healthy"
              : "default",
    },
    {
      label: "Critical risks",
      value: String(input.criticalRisks),
      hint: input.criticalRisks > 0 ? "Across active projects" : "None open",
      tone: input.criticalRisks > 0 ? "at-risk" : "healthy",
    },
    {
      label: "Waiting on you",
      value: String(input.waitingOnYouCount),
      hint:
        input.waitingOnYouCount === 1
          ? "Item needs founder action"
          : input.waitingOnYouCount > 0
            ? "Items need founder action"
            : "No escalations",
      tone: input.waitingOnYouCount > 0 ? "watch" : "healthy",
    },
    {
      label: "Runway",
      value: `${input.kpis.runwayMonths} mo`,
      hint: financialIsLive
        ? `${sym}${Math.round(input.kpis.monthlyBurn / 1000)}k/mo burn`
        : "Set cash & burn in founder context",
      tone: runwayTone,
    },
  ];
}

export function buildFounderGovernanceTabCounts(input: {
  decisionsCount: number;
  portfolioCount: number;
  objectivesCount: number;
  runwayMonths: number;
}): FounderGovernanceTabCounts {
  return {
    decisions: input.decisionsCount,
    funding: input.runwayMonths < 12 ? 1 : 0,
    portfolio: input.portfolioCount,
    objectives: input.objectivesCount,
  };
}

export type BuildFounderSteadyStateSubtitleInput = {
  projectName?: string | null;
  pendingDecisionsCount: number;
  pendingReviewCount: number;
  criticalRisks: number;
};

export function buildFounderSteadyStateSubtitle(
  input: BuildFounderSteadyStateSubtitleInput,
): string {
  const project = input.projectName ? `${input.projectName} — ` : "";
  const parts: string[] = [];

  if (input.pendingDecisionsCount > 0) {
    parts.push(
      `${input.pendingDecisionsCount} decision${input.pendingDecisionsCount === 1 ? "" : "s"} waiting`,
    );
  }
  if (input.pendingReviewCount > 0) {
    parts.push(
      `${input.pendingReviewCount} output${input.pendingReviewCount === 1 ? "" : "s"} to review`,
    );
  }
  if (input.criticalRisks > 0) {
    parts.push(`${input.criticalRisks} critical risk${input.criticalRisks === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) {
    return `${project}Executive steady-state — portfolio on track, no urgent escalations.`;
  }

  return `${project}${parts.join(" · ")}.`;
}

export function buildFounderDecisionCentreHref(projectId?: string | null): string {
  const base =
    projectId != null
      ? `/workspace/founder?project=${encodeURIComponent(projectId)}`
      : "/workspace/founder";
  return `${base}#decisions`;
}

export function buildFounderContextHref(projectId?: string | null): string {
  const base =
    projectId != null
      ? `/workspace/founder?project=${encodeURIComponent(projectId)}`
      : "/workspace/founder";
  return `${base}#founder-context`;
}
