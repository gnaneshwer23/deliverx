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
import { dxClass } from "@/lib/dx-theme";
import {
  buildPmAttentionFeed,
  buildPmSteadyStateKpis,
  type PmAttentionItem,
  type PmGovernanceTabCounts,
  type PmGovernanceTabId,
  type PmTeamCapacityMember,
} from "@/lib/pm-steady-state-panels";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";
import { DeliveryMilestonesPanel } from "@/components/delivery-pm/delivery-pm-panels";
import { DeliveryPmAiSummary } from "@/components/delivery-pm/delivery-pm-mission-overview";

function proposalsHref(projectId?: string, reviewId?: string): string {
  const params = new URLSearchParams({ persona: "pm-mission" });
  if (projectId) params.set("project", projectId);
  if (reviewId) params.set("review", reviewId);
  return `/workspace/proposals?${params.toString()}`;
}

const PILL_STYLE = {
  urgent: "border-rose-200 bg-rose-50 text-rose-700",
  decide: "border-amber-200 bg-amber-50 text-amber-800",
  clear: "border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]",
} as const;

export function PmSteadyStateKpiStrip({
  data,
  waitingOnYouCount,
  teamCapacityPct,
}: {
  data: PmMissionControl;
  waitingOnYouCount: number;
  teamCapacityPct: number | null;
}) {
  const kpis = buildPmSteadyStateKpis({
    overview: data.overview,
    waitingOnYouCount,
    teamCapacityPct,
    dataSources: data.dataSources,
  });

  return (
    <MissionKpiGrid layout="wide">
      {kpis.map((kpi) => (
        <MissionKpiCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          hint={kpi.hint}
          tone={kpi.tone}
          valueSize="xl"
        />
      ))}
    </MissionKpiGrid>
  );
}

function AttentionFeedRow({ item }: { item: PmAttentionItem }) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EEF5F1] text-xs font-semibold text-[#1C4A2E]">
          {item.avatarInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[#2C2C28]">{item.role}</p>
            <span className="text-xs text-[#A8A89E]">{item.waitLabel}</span>
          </div>
          <p className="mt-0.5 text-sm text-[#2C2C28]">{item.title}</p>
          {item.subtitle ? (
            <p className="mt-0.5 text-xs text-[#6B6B64]">{item.subtitle}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.pills.map((pill) => (
              <span
                key={`${item.id}-${pill.label}`}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PILL_STYLE[pill.tone]}`}
              >
                {pill.label}
              </span>
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
  pendingReviewCount,
}: {
  stakeholderActionQueue: StakeholderActionRow[];
  data: PmMissionControl;
  pendingReviewCount: number;
}) {
  const items = buildPmAttentionFeed({
    stakeholderActionQueue,
    decisions: data.decisions,
    blockedDependencies: data.overview.blockedDependencies,
    projectId: data.primaryProject?.id,
    pendingReviewCount,
  });

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="pm-needs-attention">
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Needs your attention</h3>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Merged stakeholder queue, blockers, and governance decisions — sorted by wait time.
        </p>
      </div>
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

function GovernanceTabButton({
  id,
  active,
  count,
  onClick,
}: {
  id: PmGovernanceTabId;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
          : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#C6DDD0]"
      }`}
    >
      {TAB_LABELS[id]}
      {count > 0 ? (
        <span className="ml-1.5 tabular-nums text-[10px] opacity-80">({count})</span>
      ) : null}
    </button>
  );
}

function GovernanceRisksTab({ raid, projectId }: { raid: PmMissionControl["raid"]; projectId?: string }) {
  const raidHref = projectId ? `/project/${projectId}/delivery#raid` : "/workspace/raid";
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">Open RAID</p>
        <Link href={raidHref} className="text-xs font-medium text-[#1C4A2E] hover:underline">
          Open RAID log
        </Link>
      </div>
      {raid.risks.length || raid.issues.length ? (
        <ul className="space-y-2">
          {raid.risks.map((risk) => (
            <li key={risk.title} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2">
              <span className="font-medium">{risk.title}</span>
              <span className="ml-2 text-xs text-[#6B6B64]">
                {risk.severity} · {risk.owner}
              </span>
            </li>
          ))}
          {raid.issues.map((issue) => (
            <li key={issue.title} className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2">
              <span className="font-medium">{issue.title}</span>
              <span className="ml-2 text-xs text-[#6B6B64]">{issue.severity}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#6B6B64]">No open risks or issues logged.</p>
      )}
      {raid.dependencies.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {raid.dependencies.map((dep) => (
            <span
              key={dep}
              className="rounded-full border border-[#E4E4DC] bg-white px-2.5 py-1 text-xs text-[#6B6B64]"
            >
              {dep}
            </span>
          ))}
        </div>
      ) : null}
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
  const href = projectId ? `/project/${projectId}/decisions` : "/workspace/decisions";
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
  const href = projectId ? `/project/${projectId}/changes` : "/workspace/changes";

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
          Pending reviews
        </p>
        <Link
          href={proposalsHref(projectId)}
          className="text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open inbox
        </Link>
      </div>
      {pendingReviews.length ? (
        <ul className="space-y-2">
          {pendingReviews.slice(0, 5).map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
            >
              <p className="font-medium">{review.title}</p>
              <Link
                href={proposalsHref(projectId, review.id)}
                className="text-xs text-[#1C4A2E] hover:underline"
              >
                Review proposal
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#6B6B64]">No pending AI approvals.</p>
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
  const [activeTab, setActiveTab] = useState<PmGovernanceTabId>("risks");

  const tabContent: Record<PmGovernanceTabId, ReactNode> = {
    risks: <GovernanceRisksTab raid={raid} projectId={projectId} />,
    decisions: <GovernanceDecisionsTab decisions={decisions} projectId={projectId} />,
    changes: <GovernanceChangesTab changes={changes} projectId={projectId} />,
    approvals: <GovernanceApprovalsTab pendingReviews={pendingReviews} projectId={projectId} />,
  };

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-governance-tabs">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Governance</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Risks, decisions, changes, and approvals in one place.
          </p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as PmGovernanceTabId[]).map((tabId) => (
          <GovernanceTabButton
            key={tabId}
            id={tabId}
            active={activeTab === tabId}
            count={tabCounts[tabId]}
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

export function PmAiReviewInboxPanel({
  pendingReviews,
  projectId,
}: {
  pendingReviews: ArtifactReviewRow[];
  projectId?: string;
}) {
  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-ai-review-inbox">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>AI approval inbox</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Compact proposals — approve or edit without leaving the dashboard.
          </p>
        </div>
        <Link
          href={proposalsHref(projectId)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open all
          <ExternalLink size={12} />
        </Link>
      </div>
      {pendingReviews.length ? (
        <ul className="space-y-2">
          {pendingReviews.slice(0, 4).map((review) => (
            <PmReviewInboxRow key={review.id} review={review} projectId={projectId} />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-[#FAFAF7] p-4 text-sm text-[#6B6B64]">
          No pending AI outputs — inbox is clear.
        </p>
      )}
    </div>
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
  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-team-capacity">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Team capacity</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            {usesPlaceholder
              ? "Connect sprint data or assign tasks to see live load."
              : "Load derived from active task assignments."}
          </p>
        </div>
        <Users size={18} className="shrink-0 text-[#1C4A2E]" />
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
  return (
    <div data-panel="pm-steady-state-milestones">
      <DeliveryMilestonesPanel
        milestones={milestones}
        goLiveProbability={goLiveProbability}
        usesFallback={usesFallback}
      />
    </div>
  );
}

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
    <div className="space-y-4" data-layout="pm-steady-state">
      {kpiStrip}
      {aiSummary}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">{leftColumn}</div>
        <div className="space-y-4">{rightColumn}</div>
      </div>
    </div>
  );
}

export { DeliveryPmAiSummary };
