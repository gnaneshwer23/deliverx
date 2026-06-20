/**
 * R6 — Unified governance page tab routing and empty-state copy.
 */

export const GOVERNANCE_TABS = [
  "risks",
  "decisions",
  "changes",
  "approvals",
] as const;

export type GovernanceTabId = (typeof GOVERNANCE_TABS)[number];

export const GOVERNANCE_TAB_LABELS: Record<GovernanceTabId, string> = {
  risks: "Risks & Issues",
  decisions: "Decisions",
  changes: "Changes",
  approvals: "Approvals",
};

export type GovernanceEmptyStateConfig = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

export const GOVERNANCE_EMPTY_STATES: Record<GovernanceTabId, GovernanceEmptyStateConfig> = {
  risks: {
    title: "No risks or issues yet",
    description: "Log risks, assumptions, issues, and dependencies from any project.",
    href: "/workspace/projects",
    actionLabel: "View projects",
  },
  decisions: {
    title: "No decisions recorded",
    description: "Capture decisions from meetings or governance workflows in a project.",
    href: "/workspace/projects",
    actionLabel: "View projects",
  },
  changes: {
    title: "No change requests",
    description: "Submit and track scope or delivery changes from project governance.",
    href: "/workspace/projects",
    actionLabel: "View projects",
  },
  approvals: {
    title: "No pending approvals",
    description: "Sponsor and steering approvals will appear here when a project needs sign-off.",
    href: "/workspace/projects",
    actionLabel: "View projects",
  },
};

/** Parse `?tab=` from search params; defaults to risks. */
export function parseGovernanceTab(raw: string | string[] | undefined): GovernanceTabId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && GOVERNANCE_TABS.includes(value as GovernanceTabId)) {
    return value as GovernanceTabId;
  }
  return "risks";
}

export function governanceTabHref(tab: GovernanceTabId): string {
  return `/workspace/governance?tab=${tab}`;
}

export function governanceEmptyStateForTab(tab: GovernanceTabId): GovernanceEmptyStateConfig {
  return GOVERNANCE_EMPTY_STATES[tab];
}
