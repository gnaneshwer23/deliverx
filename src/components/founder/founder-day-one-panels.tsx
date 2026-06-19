"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { FounderDecisionActions } from "@/components/founder/founder-decision-actions";
import { dxClass } from "@/lib/dx-theme";
import {
  buildFounderDayOneKpis,
  buildFounderPortfolioSnapshotCounts,
  buildFounderPortfolioTopItems,
  buildFounderProposalsHref,
  type FounderReviewCategoryGroup,
} from "@/lib/founder-day-one-panels";
import { buildFounderContextHref, buildFounderDecisionCentreHref } from "@/lib/founder-steady-state-panels";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { FounderMissionControl } from "@/services/founderDashboard";
import type { FounderDecisionRow } from "@/services/founderEngine";

const RAG_DOT: Record<string, string> = {
  green: "bg-[#1A6B3A]",
  amber: "bg-[#B7620A]",
  red: "bg-[#C0392B]",
};

export function FounderDayOneKpiStrip({
  pendingReviewCount,
  pendingDecisionsCount,
  data,
}: {
  pendingReviewCount: number;
  pendingDecisionsCount: number;
  data: FounderMissionControl;
}) {
  const kpis = buildFounderDayOneKpis({
    pendingReviewCount,
    pendingDecisionsCount,
    companyHealth: data.companyHealth,
    kpis: data.kpis,
    funding: data.funding,
    portfolio: data.portfolio,
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

function FounderReviewCategoryRow({
  group,
  projectId,
}: {
  group: FounderReviewCategoryGroup;
  projectId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function acceptAll() {
    setError(null);
    startTransition(async () => {
      try {
        for (const review of group.reviews) {
          const res = await fetch("/api/artifacts/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: review.id, action: "approve" }),
          });
          const data = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !data.ok) {
            setError(data.error ?? "Could not approve all items");
            return;
          }
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <div className="rounded-lg border border-[#C6DDD0] bg-[#FAFAF7] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-[#2C2C28]">{group.label}</p>
          <p className="mt-0.5 text-xs text-[#6B6B64]">{group.meta}</p>
          {group.confidencePct != null ? (
            <p className="mt-1 text-xs font-medium text-[#1C4A2E]">
              {group.confidencePct}% confidence
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            disabled={isPending}
            onClick={acceptAll}
            className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2.5 py-1.5 font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Accept all
          </button>
          <Link
            href={buildFounderProposalsHref(projectId)}
            className="inline-flex items-center rounded border border-[#C6DDD0] bg-white px-2.5 py-1.5 font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
          >
            Edit
          </Link>
          <Link
            href={buildFounderProposalsHref(projectId, group.reviews[0]?.id)}
            className="inline-flex items-center rounded border border-[#E4E4DC] px-2.5 py-1.5 font-medium text-[#6B6B64] hover:bg-white"
          >
            Review individually
          </Link>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function FounderReviewInboxPanel({
  groups,
  projectId,
  pendingReviews,
}: {
  groups: FounderReviewCategoryGroup[];
  projectId?: string;
  pendingReviews: ArtifactReviewRow[];
}) {
  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-review-inbox">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Review what AI built</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Your GO bootstrap queued {pendingReviews.length} output
            {pendingReviews.length === 1 ? "" : "s"} for executive sign-off. Accept, edit, or review
            each bundle below.
          </p>
        </div>
        <Link
          href={buildFounderProposalsHref(projectId)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open proposals
          <ExternalLink size={12} />
        </Link>
      </div>
      {groups.length === 0 ? (
        <p className="rounded-lg bg-[#FAFAF7] p-4 text-sm text-[#6B6B64]">
          No pending AI outputs — you are caught up on reviews.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <FounderReviewCategoryRow key={group.id} group={group} projectId={projectId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FounderCompactDecisionsCard({
  decisions,
  projectId,
  dataSource = "live",
}: {
  decisions: FounderDecisionRow[];
  projectId?: string;
  dataSource?: "live" | "fallback";
}) {
  const topDecisions = decisions.slice(0, 4);

  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-day-one-decisions">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Decisions to confirm first</h3>
          <p className="mt-1 text-xs text-[#6B6B64]">
            {decisions.length
              ? `${decisions.length} executive decision${decisions.length === 1 ? "" : "s"} waiting on you`
              : "No pending decisions — governance is clear"}
          </p>
        </div>
        <Link
          href={buildFounderDecisionCentreHref(projectId)}
          className="text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open decision centre
        </Link>
      </div>
      {dataSource === "fallback" ? (
        <p className="mb-3 text-xs text-[#B7620A]">
          Sample decisions — connect governance for live queue.
        </p>
      ) : null}
      <ul className="space-y-2">
        {topDecisions.length ? (
          topDecisions.map((decision) => (
            <li
              key={`${decision.kind}-${decision.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#2C2C28]">{decision.title}</p>
                <p className="text-xs text-[#6B6B64]">
                  {decision.impact} impact
                  {decision.projectName ? ` · ${decision.projectName}` : ""}
                </p>
              </div>
              <FounderDecisionActions row={decision} />
            </li>
          ))
        ) : (
          <li className="rounded-lg bg-[#FAFAF7] p-4 text-sm text-[#6B6B64]">
            Decisions from governance and approvals will appear here after GO.
          </li>
        )}
      </ul>
    </div>
  );
}

export function FounderCompactPortfolioCard({
  portfolio,
  projectId,
}: {
  portfolio: FounderMissionControl["portfolio"];
  projectId?: string;
}) {
  const counts = buildFounderPortfolioSnapshotCounts(portfolio);
  const topItems = buildFounderPortfolioTopItems(portfolio);
  const portfolioHref =
    projectId != null
      ? `/workspace/founder?project=${encodeURIComponent(projectId)}#portfolio`
      : "/workspace/founder#portfolio";

  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-day-one-portfolio">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3 className={`${dxClass.display} text-lg`}>Portfolio health</h3>
        <Link href={portfolioHref} className="text-xs font-medium text-[#1C4A2E] hover:underline">
          View portfolio
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "On track", count: counts.onTrack, tone: "text-[#1A6B3A]" },
          { label: "At risk", count: counts.atRisk, tone: "text-[#B7620A]" },
          { label: "Off track", count: counts.offTrack, tone: "text-[#C0392B]" },
        ].map((cell) => (
          <div
            key={cell.label}
            className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2 text-center"
          >
            <p className={`text-lg font-semibold tabular-nums ${cell.tone}`}>{cell.count}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#6B6B64]">{cell.label}</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {topItems.length ? (
          topItems.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-2 text-[#2C2C28]">
              <span className="flex min-w-0 items-center gap-2">
                <span className={`size-1.5 shrink-0 rounded-full ${RAG_DOT[item.ragStatus]}`} />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 text-xs text-[#6B6B64]">{item.deliveryPct}% delivery</span>
            </li>
          ))
        ) : (
          <li className="text-[#6B6B64]">Projects appear here after your first GO.</li>
        )}
      </ul>
    </div>
  );
}

export function FounderDayOneFundingCard({ funding }: { funding: FounderMissionControl["funding"] }) {
  const sym = funding.currency === "GBP" ? "£" : "$";
  const fmt = (n: number) =>
    n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n.toLocaleString()}`;

  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-day-one-funding">
      <h3 className={`${dxClass.display} mb-1 text-lg`}>Funding & runway</h3>
      <p className="mb-4 text-xs text-[#6B6B64]">Executive cash signal from your financial profile</p>
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
    </div>
  );
}

export function FounderGetOrientedCard({ projectId }: { projectId?: string }) {
  const links = [
    {
      label: "Review AI proposals",
      href: buildFounderProposalsHref(projectId),
      description: "Accept or edit bootstrap outputs",
    },
    {
      label: "Confirm decisions",
      href: buildFounderDecisionCentreHref(projectId),
      description: "Sign off governance items waiting on you",
    },
    {
      label: "Set founder context",
      href: buildFounderContextHref(projectId),
      description: "Cash, goals, and company profile for AI",
    },
  ];

  return (
    <div className={`${dxClass.card} p-6`} data-panel="founder-get-oriented">
      <h3 className={`${dxClass.display} mb-3 text-lg`}>Get oriented</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2.5 transition hover:border-[#C6DDD0] hover:bg-[#EEF5F1]"
            >
              <p className="text-sm font-medium text-[#1C4A2E]">{link.label}</p>
              <p className="text-xs text-[#6B6B64]">{link.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
