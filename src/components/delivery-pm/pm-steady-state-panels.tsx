"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ExternalLink,
  Loader2,
  Users,
} from "lucide-react";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { DxStatusPill } from "@/components/dx/dx-status-pill";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import { governanceTabHref } from "@/lib/governance-tabs";
import { buildPmControlRoomKpis } from "@/lib/pm-control-room-kpis";
import {
  buildPmAttentionFeed,
  type PmAttentionItem,
  type PmGovernanceTabCounts,
  type PmGovernanceTabId,
  type PmTeamCapacityMember,
} from "@/lib/pm-steady-state-panels";
import {
  attentionSeverityPct,
  buildGovernanceTabBarSegments,
  buildMilestoneTimelineSegments,
  buildRaidBarSegments,
  governanceTabProgressPct,
  pmRaidHref,
} from "@/lib/pm-viz-helpers";
import {
  PmBarLegend,
  PmHorizontalStackedBar,
  PmMilestoneTimelineStrip,
  PmSeverityBar,
  PmTabProgressDot,
} from "@/components/delivery-pm/pm-viz-primitives";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";
import type { TaskWithMeta } from "@/services/delivery";
import { DeliveryPmAiSummary } from "@/components/delivery-pm/delivery-pm-mission-overview";

function proposalsHref(projectId?: string, reviewId?: string): string {
  const params = new URLSearchParams({ persona: "pm-mission" });
  if (projectId) params.set("project", projectId);
  if (reviewId) params.set("review", reviewId);
  return `/workspace/proposals?${params.toString()}`;
}

const ATTENTION_PILL_TONE = {
  urgent: "urgent",
  decide: "decide",
  clear: "clear",
} as const;

export function PmControlRoomKpiStrip({
  data,
  pendingApprovalCount,
  teamCapacityPct,
  tasks,
  projectId,
}: {
  data: PmMissionControl;
  pendingApprovalCount: number;
  teamCapacityPct: number | null;
  tasks: TaskWithMeta[];
  projectId?: string;
}) {
  const kpis = buildPmControlRoomKpis({
    overview: data.overview,
    raid: data.raid,
    pendingApprovalCount,
    teamCapacityPct,
    tasks,
    projectId,
  });

  return (
    <MissionKpiGrid layout="wide" className="pm-control-room-kpis">
      {kpis.map((kpi) => {
        const card = (
          <MissionKpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            tone={kpi.tone}
            progressPct={kpi.progressPct}
            valueSize="xl"
            className={kpi.href ? "transition hover:border-[#B8D8D8]" : undefined}
          />
        );

        return kpi.href ? (
          <Link key={kpi.label} href={kpi.href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C5C]">
            {card}
          </Link>
        ) : (
          <div key={kpi.label}>{card}</div>
        );
      })}
    </MissionKpiGrid>
  );
}

/** @deprecated Use PmControlRoomKpiStrip */
export function PmSteadyStateKpiStrip({
  data,
  waitingOnYouCount,
  teamCapacityPct,
  pendingApprovalCount = 0,
  tasks = [],
  projectId,
}: {
  data: PmMissionControl;
  waitingOnYouCount: number;
  teamCapacityPct: number | null;
  pendingApprovalCount?: number;
  tasks?: TaskWithMeta[];
  projectId?: string;
}) {
  void waitingOnYouCount;
  return (
    <PmControlRoomKpiStrip
      data={data}
      pendingApprovalCount={pendingApprovalCount}
      teamCapacityPct={teamCapacityPct}
      tasks={tasks}
      projectId={projectId ?? data.primaryProject?.id}
    />
  );
}

function AttentionFeedRow({ item }: { item: PmAttentionItem }) {
  const severityTone = item.pills.some((pill) => pill.tone === "urgent")
    ? "urgent"
    : item.pills.some((pill) => pill.tone === "decide")
      ? "decide"
      : "default";
  const severityPct = attentionSeverityPct(item.waitSortDays);

  return (
    <li className="px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#EDF7F7] text-[10px] font-semibold text-[#1A5C5C]">
            {item.avatarInitials}
          </span>
          <PmSeverityBar pct={severityPct} tone={severityTone} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#2C2C28]">{item.role}</p>
            <span className="text-[10px] text-[#A8A89E]">{item.waitLabel}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-[#2C2C28]">{item.title}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.pills.map((pill) => (
              <DxStatusPill
                key={`${item.id}-${pill.label}`}
                tone={ATTENTION_PILL_TONE[pill.tone]}
                size="xs"
              >
                {pill.label}
              </DxStatusPill>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {item.href ? (
            <Link
              href={item.href}
              className="inline-flex items-center gap-1 rounded border border-[#C6DDD0] bg-white px-2 py-1 text-[10px] font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
            >
              Open
              <ExternalLink size={10} />
            </Link>
          ) : null}
          {item.escalateHref ? (
            <Link
              href={item.escalateHref}
              className="inline-flex items-center gap-1 rounded border border-[#E4E4DC] px-2 py-1 text-[10px] font-medium text-[#6B6B64] hover:bg-[#FAFAF7]"
            >
              <ArrowUpRight size={10} />
              Escalate
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function PmNeedsAttentionPanel({
  stakeholderActionQueue,
  data,
}: {
  stakeholderActionQueue: StakeholderActionRow[];
  data: PmMissionControl;
}) {
  const items = buildPmAttentionFeed({
    stakeholderActionQueue,
    decisions: data.decisions,
    blockedDependencies: data.overview.blockedDependencies,
    projectId: data.primaryProject?.id,
  });

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="pm-needs-attention">
      <DxWidgetHeader
        title="Needs your attention"
        count={items.length}
        countTone={items.some((i) => i.pills.some((p) => p.tone === "urgent")) ? "urgent" : "accent"}
      />
      <ul className="divide-y divide-[#F0F0E8]">
        {items.length ? (
          items.map((item) => <AttentionFeedRow key={item.id} item={item} />)
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No escalations — delivery signals are within normal range.
          </li>
        )}
      </ul>
    </div>
  );
}

const TAB_LABELS: Record<PmGovernanceTabId, string> = {
  risks: "Risks",
  decisions: "Decisions",
  changes: "Changes",
  approvals: "Approvals",
};

const TAB_COLORS: Record<PmGovernanceTabId, string> = {
  risks: "#C0392B",
  decisions: "#B7620A",
  changes: "#1A5C5C",
  approvals: "#2A8A8A",
};

function GovernanceTabButton({
  id,
  active,
  count,
  progressPct,
  onClick,
}: {
  id: PmGovernanceTabId;
  active: boolean;
  count: number;
  progressPct: number;
  onClick: () => void;
}) {
  const tabColor = TAB_COLORS[id];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 snap-start touch-manipulation items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-transparent text-white shadow-sm"
          : "border-[#E4E4DC] bg-white text-[#6B6B64] hover:border-[#B8D8D8]"
      }`}
      style={active ? { backgroundColor: tabColor } : undefined}
    >
      {TAB_LABELS[id]}
      {count > 0 ? (
        <span
          className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
            active ? "bg-white/20 text-white" : "bg-[#F0F0E8] text-[#6B6B64]"
          }`}
        >
          {count}
        </span>
      ) : null}
      <PmTabProgressDot pct={progressPct} color={active ? "#FFFFFF" : tabColor} />
    </button>
  );
}

function GovernanceRisksTab({ raid, projectId }: { raid: PmMissionControl["raid"]; projectId?: string }) {
  const raidHref = pmRaidHref(projectId);
  const counts = {
    highRisk: raid.risks.filter((r) => /high|critical/i.test(r.severity)).length,
    assumptions: raid.risks.filter((r) => !/high|critical/i.test(r.severity)).length,
    issues: raid.issues.length,
    dependencies: raid.dependencies.length,
  };
  const segments = buildRaidBarSegments({
    highRisk: counts.highRisk,
    assumptions: counts.assumptions,
    issues: counts.issues,
    dependencies: counts.dependencies,
  });

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">Open RAID</p>
        <Link href={raidHref} className="text-xs font-medium text-[#1A5C5C] hover:underline">
          Open RAID log
        </Link>
      </div>
      <PmHorizontalStackedBar segments={segments} heightClass="h-2" />
      <PmBarLegend segments={segments} />
      {raid.risks.length || raid.issues.length ? (
        <ul className="space-y-1.5">
          {[...raid.risks.slice(0, 3), ...raid.issues.slice(0, 2)].map((item) => (
            <li
              key={item.title}
              className="flex items-center gap-2 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  "severity" in item && /high|critical/i.test(item.severity)
                    ? "bg-[#C0392B]"
                    : "bg-[#B7620A]"
                }`}
              />
              <span className="min-w-0 truncate font-medium">{item.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[#6B6B64]">No open risks or issues logged.</p>
      )}
    </div>
  );
}

function GovernanceDecisionsTab({
  decisions,
  projectId,
}: {
  decisions: PmMissionControl["decisions"];
  projectId?: string;
}) {
  const href = projectId ? `/project/${projectId}/decisions` : governanceTabHref("decisions");
  const proposed = decisions.filter((d) => d.status === "proposed");

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          Decision register
        </p>
        <Link href={href} className="text-xs font-medium text-[#1C4A2E] hover:underline">
          View all
        </Link>
      </div>
      {proposed.length ? (
        <ul className="space-y-2">
          {proposed.map((decision) => (
            <li
              key={decision.title}
              className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
            >
              <p className="font-medium">{decision.title}</p>
              <p className="text-xs text-[#6B6B64]">Impact: {decision.impact}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#6B6B64]">No pending decisions.</p>
      )}
    </div>
  );
}

function GovernanceChangesTab({
  changes,
  projectId,
}: {
  changes: Array<{ id: string; title: string; status: string; impact: string | null }>;
  projectId?: string;
}) {
  const href = projectId ? `/project/${projectId}/changes` : governanceTabHref("changes");

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          Change requests
        </p>
        <Link href={href} className="text-xs font-medium text-[#1C4A2E] hover:underline">
          View all
        </Link>
      </div>
      {changes.length ? (
        <ul className="space-y-2">
          {changes.map((change) => (
            <li
              key={change.id}
              className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
            >
              <p className="font-medium">{change.title}</p>
              <p className="text-xs text-[#6B6B64]">
                {change.status}
                {change.impact ? ` · ${change.impact}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#6B6B64]">No open change requests.</p>
      )}
    </div>
  );
}

function GovernanceApprovalsTab({
  pendingReviews,
  projectId,
}: {
  pendingReviews: ArtifactReviewRow[];
  projectId?: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          AI approval inbox
        </p>
        <Link
          href={proposalsHref(projectId)}
          className="text-xs font-medium text-[#1A5C5C] hover:underline"
        >
          Open all
        </Link>
      </div>
      {pendingReviews.length ? (
        <ul className="space-y-2">
          {pendingReviews.slice(0, 5).map((review) => (
            <PmReviewInboxRow key={review.id} review={review} projectId={projectId} />
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[#6B6B64]">No pending AI approvals.</p>
      )}
    </div>
  );
}

export function PmGovernanceTabsPanel({
  raid,
  decisions,
  changes,
  pendingReviews,
  tabCounts,
  projectId,
}: {
  raid: PmMissionControl["raid"];
  decisions: PmMissionControl["decisions"];
  changes: Array<{ id: string; title: string; status: string; impact: string | null }>;
  pendingReviews: ArtifactReviewRow[];
  tabCounts: PmGovernanceTabCounts;
  projectId?: string;
}) {
  const [activeTab, setActiveTab] = useState<PmGovernanceTabId>(() => {
    const entries = (Object.entries(tabCounts) as Array<[PmGovernanceTabId, number]>).filter(
      ([, count]) => count > 0,
    );
    if (entries.length === 0) return "risks";
    return entries.sort((a, b) => b[1] - a[1])[0]![0];
  });

  const governanceSegments = buildGovernanceTabBarSegments(tabCounts);

  const tabContent: Record<PmGovernanceTabId, ReactNode> = {
    risks: <GovernanceRisksTab raid={raid} projectId={projectId} />,
    decisions: <GovernanceDecisionsTab decisions={decisions} projectId={projectId} />,
    changes: <GovernanceChangesTab changes={changes} projectId={projectId} />,
    approvals: <GovernanceApprovalsTab pendingReviews={pendingReviews} projectId={projectId} />,
  };

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-governance-tabs">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className={`${dxClass.display} text-lg`}>Governance</h3>
        <span className="text-[10px] tabular-nums text-[#6B6B64]">
          {governanceSegments.reduce((sum, s) => sum + s.value, 0)} open
        </span>
      </div>
      <PmHorizontalStackedBar segments={governanceSegments} heightClass="h-1.5" />
      <div className="-mx-2 mb-4 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
        {(Object.keys(TAB_LABELS) as PmGovernanceTabId[]).map((tabId) => (
          <GovernanceTabButton
            key={tabId}
            id={tabId}
            active={activeTab === tabId}
            count={tabCounts[tabId]}
            progressPct={governanceTabProgressPct(tabCounts[tabId], tabCounts)}
            onClick={() => setActiveTab(tabId)}
          />
        ))}
      </div>
      {tabContent[activeTab]}
    </div>
  );
}

function PmReviewInboxRow({
  review,
  projectId,
}: {
  review: ArtifactReviewRow;
  projectId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function approve() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/artifacts/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: review.id, action: "approve" }),
        });
        const payload = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !payload.ok) {
          setError(payload.error ?? "Could not approve");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <li className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-3">
      <p className="text-sm font-medium text-[#2C2C28]">{review.title}</p>
      {review.summary ? (
        <p className="mt-0.5 line-clamp-2 text-xs text-[#6B6B64]">{review.summary}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={approve}
          className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
          Approve
        </button>
        <Link
          href={proposalsHref(projectId, review.id)}
          className="inline-flex items-center rounded border border-[#C6DDD0] bg-white px-2.5 py-1 text-[10px] font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
        >
          Edit
        </Link>
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}

const LOAD_BAR: Record<PmTeamCapacityMember["tone"], string> = {
  healthy: "bg-[#1A6B3A]",
  watch: "bg-[#B7620A]",
  "at-risk": "bg-[#C0392B]",
};

export function PmTeamCapacityPanel({
  members,
  usesPlaceholder,
}: {
  members: PmTeamCapacityMember[];
  usesPlaceholder: boolean;
}) {
  const avgLoad =
    members.length && !usesPlaceholder
      ? Math.round(members.reduce((sum, m) => sum + m.loadPct, 0) / members.length)
      : null;

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-team-capacity">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`${dxClass.display} text-lg`}>Team capacity</h3>
          {avgLoad != null ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E4E4DC]">
                <div
                  className={`h-full rounded-full ${LOAD_BAR[avgLoad >= 90 ? "at-risk" : avgLoad >= 70 ? "watch" : "healthy"]}`}
                  style={{ width: `${avgLoad}%` }}
                />
              </div>
              <span className="shrink-0 text-xs tabular-nums font-semibold text-[#1A5C5C]">
                {avgLoad}%
              </span>
            </div>
          ) : (
            <p className="mt-0.5 text-[10px] text-[#6B6B64]">Assign tasks to see load</p>
          )}
        </div>
        <Users size={18} className="shrink-0 text-[#1A5C5C]" />
      </div>
      {members.length ? (
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#2C2C28]">{member.name}</p>
                  <p className="text-xs text-[#6B6B64]">{member.role}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-[#6B6B64]">
                  {member.placeholder ? "—" : `${member.assignedCount} tasks · ${member.loadPct}%`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E4E4DC]">
                <div
                  className={`h-full rounded-full transition-all ${LOAD_BAR[member.tone]}`}
                  style={{ width: `${member.placeholder ? 8 : member.loadPct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-dashed border-[#C6DDD0] bg-[#FAFAF7] p-4 text-sm text-[#6B6B64]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#B7620A]" />
          <p>Invite teammates and assign delivery tasks to populate capacity signals.</p>
        </div>
      )}
    </div>
  );
}

export function PmSteadyStateMilestonesPanel({
  milestones,
  goLiveProbability,
  usesFallback,
}: {
  milestones: PmMissionControl["milestones"];
  goLiveProbability: number | null;
  usesFallback?: boolean;
}) {
  const timelineSegments = buildMilestoneTimelineSegments(milestones);
  const goLivePct = goLiveProbability != null ? Math.round(goLiveProbability * 100) : null;

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-steady-state-milestones">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className={`${dxClass.display} text-lg`}>Milestones & timeline</h3>
        {goLivePct != null ? (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E4E4DC]">
              <div
                className={`h-full rounded-full ${
                  goLivePct >= 75 ? "bg-[#1A6B3A]" : goLivePct >= 50 ? "bg-[#B7620A]" : "bg-[#C0392B]"
                }`}
                style={{ width: `${goLivePct}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold tabular-nums text-[#1A5C5C]">{goLivePct}%</span>
          </div>
        ) : null}
      </div>
      {usesFallback ? (
        <p className="mb-2 text-xs text-[#6B6B64]">
          — · Connect milestones from your project charter.
        </p>
      ) : (
        <>
      <PmMilestoneTimelineStrip segments={timelineSegments} compact />
      {goLivePct != null ? (
        <p className="mt-2 text-[10px] text-[#6B6B64]">Go-live probability at current velocity</p>
      ) : null}
        </>
      )}
    </div>
  );
}

export function PmControlRoomLayout({
  aiSummary,
  kpiStrip,
  milestoneRaidRow,
  teamNeedsFeed,
  capacityGovernanceRow,
}: {
  aiSummary: ReactNode;
  kpiStrip: ReactNode;
  milestoneRaidRow: ReactNode;
  teamNeedsFeed: ReactNode;
  capacityGovernanceRow: ReactNode;
}) {
  return (
    <div className="space-y-4" data-layout="pm-control-room">
      {aiSummary}
      {kpiStrip}
      {milestoneRaidRow}
      {teamNeedsFeed}
      {capacityGovernanceRow}
    </div>
  );
}

/** @deprecated Use PmControlRoomLayout */
export function PmSteadyStateLayout({
  kpiStrip,
  leftColumn,
  rightColumn,
  aiSummary,
}: {
  kpiStrip: ReactNode;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  aiSummary?: ReactNode;
}) {
  return (
    <PmControlRoomLayout
      aiSummary={aiSummary}
      kpiStrip={kpiStrip}
      milestoneRaidRow={rightColumn}
      teamNeedsFeed={leftColumn}
      capacityGovernanceRow={null}
    />
  );
}

export { DeliveryPmAiSummary };
