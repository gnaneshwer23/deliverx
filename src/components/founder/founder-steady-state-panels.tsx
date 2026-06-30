"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { ArrowUpRight, Check, ExternalLink, Loader2 } from "lucide-react";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { FounderDecisionActions } from "@/components/founder/founder-decision-actions";
import {
  FounderDeliveryHealthPanel,
  FounderProductHealthPanel,
  FounderTeamHealthPanel,
} from "@/components/founder/founder-panels";
import { FounderIntelligenceFeedPanel } from "@/components/founder/founder-intelligence-feed-panel";
import { FounderContextWorkspace } from "@/components/founder/founder-workspace";
import { FounderCompactPortfolioCard } from "@/components/founder/founder-day-one-panels";
import { dxClass } from "@/lib/dx-theme";
import { buildFounderProposalsHref } from "@/lib/founder-day-one-panels";
import {
  buildFounderAttentionFeed,
  buildFounderDecisionCentreHref,
  buildFounderSteadyStateKpis,
  type FounderAttentionItem,
  type FounderGovernanceTabCounts,
  type FounderGovernanceTabId,
} from "@/lib/founder-steady-state-panels";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { FounderMissionControl } from "@/services/founderDashboard";
import type { FounderDecisionRow } from "@/services/founderEngine";
import type { FounderContext } from "@/services/founderContext";

const PILL_STYLE = {
  urgent: "border-rose-200 bg-rose-50 text-rose-700",
  decide: "border-amber-200 bg-amber-50 text-amber-800",
  fund: "border-sky-200 bg-sky-50 text-sky-800",
  clear: "border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]",
} as const;

export function FounderSteadyStateKpiStrip({
  data,
  waitingOnYouCount,
}: {
  data: FounderMissionControl;
  waitingOnYouCount: number;
}) {
  const kpis = buildFounderSteadyStateKpis({
    companyHealth: data.companyHealth,
    kpis: data.kpis,
    funding: data.funding,
    portfolio: data.portfolio,
    waitingOnYouCount,
    criticalRisks: data.deliveryHealth.criticalRisks,
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

function AttentionFeedRow({ item }: { item: FounderAttentionItem }) {
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

export function FounderNeedsAttentionPanel({
  data,
  pendingReviewCount,
  projectId,
}: {
  data: FounderMissionControl;
  pendingReviewCount: number;
  projectId?: string;
}) {
  const items = buildFounderAttentionFeed({
    decisions: data.decisionsNeeded,
    pendingReviewCount,
    criticalRisks: data.deliveryHealth.criticalRisks,
    blockedDependencies: data.deliveryHealth.blockedDependencies,
    portfolio: data.portfolio,
    intelligenceFeed: data.intelligenceFeed,
    runwayMonths: data.kpis.runwayMonths,
    projectId,
  });

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="founder-needs-attention">
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Needs your attention</h3>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Decisions, portfolio risk, reviews, and intelligence — sorted by wait time.
        </p>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {items.length ? (
          items.map((item) => <AttentionFeedRow key={item.id} item={item} />)
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No escalations — executive signals are within normal range.
          </li>
        )}
      </ul>
    </div>
  );
}

const TAB_LABELS: Record<FounderGovernanceTabId, string> = {
  decisions: "Decisions",
  funding: "Funding",
  portfolio: "Portfolio",
  objectives: "Objectives",
};

function GovernanceTabButton({
  id,
  active,
  count,
  onClick,
}: {
  id: FounderGovernanceTabId;
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

function GovernanceDecisionsTab({
  decisions,
  dataSource,
  projectId,
}: {
  decisions: FounderDecisionRow[];
  dataSource: "live" | "fallback";
  projectId?: string;
}) {
  const topDecisions = decisions.slice(0, 5);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          Decision centre
        </p>
        <Link
          href={buildFounderDecisionCentreHref(projectId)}
          className="text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          View all
        </Link>
      </div>
      {dataSource === "fallback" ? (
        <p className="text-xs text-[#B7620A]">Sample decisions — connect governance for live queue.</p>
      ) : null}
      {topDecisions.length ? (
        <ul className="space-y-2">
          {topDecisions.map((decision) => (
            <li
              key={`${decision.kind}-${decision.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium">{decision.title}</p>
                <p className="text-xs text-[#6B6B64]">
                  {decision.impact} impact
                  {decision.projectName ? ` · ${decision.projectName}` : ""}
                </p>
              </div>
              <FounderDecisionActions row={decision} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#6B6B64]">No pending decisions.</p>
      )}
    </div>
  );
}

function GovernanceFundingTab({ funding }: { funding: FounderMissionControl["funding"] }) {
  const sym = funding.currency === "GBP" ? "£" : "$";
  const fmt = (n: number) =>
    n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">Funding & runway</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Cash", value: fmt(funding.cashInBank) },
          { label: "Burn", value: `${fmt(funding.monthlyBurn)}/mo` },
          { label: "Runway", value: `${funding.runwayMonths} mo` },
          { label: "Next raise", value: funding.nextRaise },
        ].map((cell) => (
          <div
            key={cell.label}
            className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
          >
            <p className="text-[10px] uppercase text-[#A8A89E]">{cell.label}</p>
            <p className="font-semibold text-[#0D0D0B]">{cell.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#6B6B64]">{funding.runwayEndPrediction}</p>
    </div>
  );
}

function GovernancePortfolioTab({ portfolio }: { portfolio: FounderMissionControl["portfolio"] }) {
  const topProjects = portfolio.slice(0, 4);

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">Project portfolio</p>
      {topProjects.length ? (
        <ul className="space-y-2">
          {topProjects.map((project) => (
            <li
              key={project.id}
              className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{project.name}</p>
                <span className="text-xs capitalize text-[#6B6B64]">RAG: {project.ragStatus}</span>
              </div>
              <p className="text-xs text-[#6B6B64]">
                {project.deliveryPct}% delivery · {project.budgetLabel}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#6B6B64]">Create projects to populate portfolio health.</p>
      )}
    </div>
  );
}

function GovernanceObjectivesTab({
  objectives,
  insight,
}: {
  objectives: FounderMissionControl["strategicObjectives"];
  insight: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
        Strategic objectives
      </p>
      <div className="space-y-3">
        {objectives.map((objective) => (
          <div key={objective.title}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{objective.title}</span>
              <span className="font-semibold text-[#1C4A2E]">{objective.progress}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E4E4DC]">
              <div
                className="h-full rounded-full bg-[#1C4A2E]"
                style={{ width: `${Math.min(objective.progress, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#6B6B64]">{insight}</p>
    </div>
  );
}

export function FounderGovernanceTabsPanel({
  data,
  tabCounts,
  projectId,
}: {
  data: FounderMissionControl;
  tabCounts: FounderGovernanceTabCounts;
  projectId?: string;
}) {
  const [activeTab, setActiveTab] = useState<FounderGovernanceTabId>("decisions");

  const tabContent: Record<FounderGovernanceTabId, ReactNode> = {
    decisions: (
      <GovernanceDecisionsTab
        decisions={data.decisionsNeeded}
        dataSource={data.dataSources.decisions}
        projectId={projectId}
      />
    ),
    funding: <GovernanceFundingTab funding={data.funding} />,
    portfolio: <GovernancePortfolioTab portfolio={data.portfolio} />,
    objectives: (
      <GovernanceObjectivesTab
        objectives={data.strategicObjectives}
        insight={data.strategicInsight}
      />
    ),
  };

  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-governance-tabs">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Governance</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Decisions, funding, portfolio, and objectives in one place.
          </p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as FounderGovernanceTabId[]).map((tabId) => (
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

function FounderReviewInboxRow({
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
          href={buildFounderProposalsHref(projectId, review.id)}
          className="inline-flex items-center rounded border border-[#C6DDD0] bg-white px-2.5 py-1 text-[10px] font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
        >
          Edit
        </Link>
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}

export function FounderAiReviewInboxPanel({
  pendingReviews,
  projectId,
}: {
  pendingReviews: ArtifactReviewRow[];
  projectId?: string;
}) {
  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-ai-review-inbox">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>AI approval inbox</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Compact proposals — approve or edit without leaving the dashboard.
          </p>
        </div>
        <Link
          href={buildFounderProposalsHref(projectId)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open all
          <ExternalLink size={12} />
        </Link>
      </div>
      {pendingReviews.length ? (
        <ul className="space-y-2">
          {pendingReviews.slice(0, 4).map((review) => (
            <FounderReviewInboxRow key={review.id} review={review} projectId={projectId} />
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

export function FounderSteadyStateContextPanel({
  ctx,
  extractionStatus,
  projectId,
}: {
  ctx: FounderContext | null;
  extractionStatus: string;
  projectId?: string;
}) {
  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-context" id="founder-context">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Founder context</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">Cash, goals, and company profile for AI.</p>
        </div>
        <Link
          href={`/workspace/founder${projectId ? `?project=${encodeURIComponent(projectId)}` : ""}#founder-context`}
          className="text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Expand
        </Link>
      </div>
      <FounderContextWorkspace
        companyType={ctx?.company_type}
        businessGoals={ctx?.business_goals}
        extractionStatus={extractionStatus}
      />
    </div>
  );
}

export function FounderSteadyStateLayout({
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
    <div className="space-y-4" data-layout="founder-steady-state">
      {kpiStrip}
      {aiSummary}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">{leftColumn}</div>
        <div className="space-y-4">{rightColumn}</div>
      </div>
    </div>
  );
}

export {
  FounderCompactPortfolioCard,
  FounderDeliveryHealthPanel,
  FounderIntelligenceFeedPanel,
  FounderProductHealthPanel,
  FounderTeamHealthPanel,
};
