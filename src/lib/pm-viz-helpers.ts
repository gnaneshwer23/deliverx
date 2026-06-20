import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { PmGovernanceTabCounts, PmGovernanceTabId } from "@/lib/pm-steady-state-panels";
import type { PmRaidSummaryCounts } from "@/lib/pm-day-one-panels";

export type PmBarSegment = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type PmMilestoneTimelineSegment = {
  phase: string;
  status: "done" | "active" | "pending";
  widthPct: number;
};

const RAID_SEGMENT_COLORS = {
  highRisk: "#C0392B",
  assumptions: "#B7620A",
  issues: "#D4863A",
  dependencies: "#1A5C5C",
} as const;

const GOVERNANCE_TAB_COLORS: Record<PmGovernanceTabId, string> = {
  risks: "#C0392B",
  decisions: "#B7620A",
  changes: "#1A5C5C",
  approvals: "#2A8A8A",
};

/** Clamp percentage to 0–100 for bar widths. */
export function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Parse budget label "spent / approved" into spend percentage. */
export function budgetSpendPct(budgetLabel: string): number | null {
  const match = budgetLabel.match(/([\d,.]+)\s*\/\s*([\d,.]+)/);
  if (!match) return null;
  const spent = Number.parseFloat(match[1]!.replace(/,/g, ""));
  const approved = Number.parseFloat(match[2]!.replace(/,/g, ""));
  if (!Number.isFinite(spent) || !Number.isFinite(approved) || approved <= 0) return null;
  return clampPct((spent / approved) * 100);
}

/** Milestone completion ratio for day-one KPI bar. */
export function milestoneProgressPct(
  milestones: PmMissionControl["milestones"],
  bootstrapTotal?: number,
): number {
  const total = bootstrapTotal ?? milestones.length;
  if (total <= 0) return 0;
  const done = milestones.filter((m) => m.status === "done").length;
  return clampPct((done / total) * 100);
}

/** Team roster join ratio for day-one KPI bar. */
export function teamJoinPct(joined: number, total: number): number {
  if (total <= 0) return joined > 0 ? 100 : 0;
  return clampPct((joined / total) * 100);
}

/** Pending review fill — scales against a sensible cap so bar is visible at low counts. */
export function pendingReviewBarPct(count: number, cap = 8): number {
  if (count <= 0) return 0;
  return clampPct((count / cap) * 100);
}

/** Map attention wait days to a severity bar (0 = urgent, 7+ = low). */
export function attentionSeverityPct(waitSortDays: number): number {
  const inverted = 7 - Math.min(waitSortDays, 7);
  return clampPct((inverted / 7) * 100);
}

/** Horizontal stacked bar segments for RAID snapshot. */
export function buildRaidBarSegments(counts: PmRaidSummaryCounts): PmBarSegment[] {
  const segments: PmBarSegment[] = [
    { id: "highRisk", label: "High risk", value: counts.highRisk, color: RAID_SEGMENT_COLORS.highRisk },
    { id: "assumptions", label: "Assumptions", value: counts.assumptions, color: RAID_SEGMENT_COLORS.assumptions },
    { id: "issues", label: "Issues", value: counts.issues, color: RAID_SEGMENT_COLORS.issues },
    { id: "dependencies", label: "Dependencies", value: counts.dependencies, color: RAID_SEGMENT_COLORS.dependencies },
  ];
  return segments.filter((segment) => segment.value > 0);
}

/** Width percentages for milestone timeline strip (equal phases). */
export function buildMilestoneTimelineSegments(
  milestones: PmMissionControl["milestones"],
): PmMilestoneTimelineSegment[] {
  if (milestones.length === 0) return [];
  const widthPct = 100 / milestones.length;
  return milestones.map((milestone) => ({
    phase: milestone.phase,
    status: milestone.status,
    widthPct,
  }));
}

/** Governance tab counts as proportional bar segments. */
export function buildGovernanceTabBarSegments(
  tabCounts: PmGovernanceTabCounts,
): PmBarSegment[] {
  return (Object.keys(tabCounts) as PmGovernanceTabId[]).map((id) => ({
    id,
    label: id,
    value: tabCounts[id],
    color: GOVERNANCE_TAB_COLORS[id],
  }));
}

/** Per-tab progress indicator — share of total open governance items. */
export function governanceTabProgressPct(count: number, tabCounts: PmGovernanceTabCounts): number {
  const total = tabCounts.risks + tabCounts.decisions + tabCounts.changes + tabCounts.approvals;
  if (total <= 0 || count <= 0) return 0;
  return clampPct((count / total) * 100);
}

/** Resolve RAID log href — never dead-end on `#`. */
export function pmRaidHref(projectId?: string): string {
  if (projectId) return `/project/${projectId}/delivery#raid`;
  return "/workspace/dashboard";
}
