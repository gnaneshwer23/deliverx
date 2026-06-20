"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2, UserPlus, Users } from "lucide-react";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { dxClass } from "@/lib/dx-theme";
import { buildPmControlRoomKpis } from "@/lib/pm-control-room-kpis";
import {
  buildPmRaidSummaryCounts,
  buildPmRaidTopItems,
  milestoneDayOneLabel,
  type PmReviewCategoryGroup,
} from "@/lib/pm-day-one-panels";
import {
  buildMilestoneTimelineSegments,
  buildRaidBarSegments,
  pmRaidHref,
  teamJoinPct,
} from "@/lib/pm-viz-helpers";
import {
  PmBarLegend,
  PmHorizontalStackedBar,
  PmMilestoneTimelineStrip,
} from "@/components/delivery-pm/pm-viz-primitives";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import type { InvitationRow } from "@/services/invitations";
import type { TaskWithMeta } from "@/services/delivery";

type OrgMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

export function PmDayOneKpiStrip({
  pendingReviewCount,
  data,
  teamCapacityPct,
  tasks,
  projectId,
}: {
  pendingReviewCount: number;
  bootstrapSummary: ProjectBootstrapSummary | null;
  data: PmMissionControl;
  teamJoinedCount: number;
  teamTotalCount: number;
  teamCapacityPct?: number | null;
  tasks?: TaskWithMeta[];
  projectId?: string;
}) {
  void pendingReviewCount;
  const kpis = buildPmControlRoomKpis({
    overview: data.overview,
    raid: data.raid,
    pendingApprovalCount: pendingReviewCount,
    teamCapacityPct: teamCapacityPct ?? null,
    tasks: tasks ?? [],
    projectId: projectId ?? data.primaryProject?.id,
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

function proposalsHref(projectId?: string, reviewId?: string): string {
  const params = new URLSearchParams({ persona: "pm-mission" });
  if (projectId) params.set("project", projectId);
  if (reviewId) params.set("review", reviewId);
  return `/workspace/proposals?${params.toString()}`;
}

function PmReviewCategoryRow({
  group,
  projectId,
}: {
  group: PmReviewCategoryGroup;
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
    <div className="rounded-lg border border-[#B8D8D8] bg-[#EDF7F7] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-[#2C2C28]">{group.label}</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] tabular-nums text-[#6B6B64]">
              {group.meta}
            </span>
          </div>
          {group.confidencePct != null ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 max-w-[120px] overflow-hidden rounded-full bg-[#D4EBEB]">
                <div
                  className="h-full rounded-full bg-[#1A5C5C]"
                  style={{ width: `${group.confidencePct}%` }}
                />
              </div>
              <span className="text-[10px] font-medium tabular-nums text-[#1A5C5C]">
                {group.confidencePct}%
              </span>
            </div>
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
            href={proposalsHref(projectId)}
            className="inline-flex items-center rounded border border-[#C6DDD0] bg-white px-2.5 py-1.5 font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
          >
            Edit
          </Link>
          <Link
            href={proposalsHref(projectId, group.reviews[0]?.id)}
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

export function PmReviewAiBuiltPanel({
  groups,
  projectId,
  pendingReviews,
}: {
  groups: PmReviewCategoryGroup[];
  projectId?: string;
  pendingReviews: ArtifactReviewRow[];
}) {
  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-review-ai-built">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Review what AI built</h3>
          <p className="mt-0.5 text-xs text-[#6B6B64]">
            {pendingReviews.length} output{pendingReviews.length === 1 ? "" : "s"} queued for sign-off
          </p>
        </div>
        <Link
          href={proposalsHref(projectId)}
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
            <PmReviewCategoryRow key={group.id} group={group} projectId={projectId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PmCompactRaidCard({
  raid,
  projectId,
}: {
  raid: PmMissionControl["raid"];
  projectId?: string;
}) {
  const counts = buildPmRaidSummaryCounts(raid);
  const topItems = buildPmRaidTopItems(raid);
  const barSegments = buildRaidBarSegments(counts);
  const raidHref = pmRaidHref(projectId);

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-day-one-raid">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className={`${dxClass.display} text-lg`}>RAID snapshot</h3>
        <Link href={raidHref} className="text-xs font-medium text-[#1A5C5C] hover:underline">
          Open RAID log
        </Link>
      </div>
      <PmHorizontalStackedBar segments={barSegments} />
      <PmBarLegend segments={barSegments} />
      <ul className="mt-3 space-y-1.5 text-sm">
        {topItems.length ? (
          topItems.map((item) => (
            <li key={`${item.kind}-${item.title}`} className="flex items-center gap-2 text-[#2C2C28]">
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  item.severity?.toLowerCase() === "high" || item.severity?.toLowerCase() === "critical"
                    ? "bg-[#C0392B]"
                    : item.kind === "issue"
                      ? "bg-[#B7620A]"
                      : "bg-[#1A5C5C]"
                }`}
              />
              <span className="min-w-0 truncate">{item.title}</span>
            </li>
          ))
        ) : (
          <li className="text-xs text-[#6B6B64]">No RAID items logged yet.</li>
        )}
      </ul>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  pm: "Delivery PM",
  executive: "Executive",
  ba: "Business Analyst",
  product_manager: "Product",
  engineer: "Engineering",
  scrum_master: "Scrum Master",
  qa: "QA",
  team_member: "Team member",
};

export function PmTeamRosterPanel({
  members,
  pendingInvites,
  bootstrapSummary,
}: {
  members: OrgMember[];
  pendingInvites: InvitationRow[];
  bootstrapSummary: ProjectBootstrapSummary | null;
}) {
  const bootstrapStakeholders = bootstrapSummary?.structure?.stakeholders ?? 0;
  const joinedCount = members.length || bootstrapStakeholders;
  const pendingCount = pendingInvites.length;
  const totalCount = Math.max(joinedCount + pendingCount, joinedCount);
  const joinPct = teamJoinPct(joinedCount, totalCount);

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-team-roster">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`${dxClass.display} text-lg`}>Team roster</h3>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E4E4DC]">
              <div className="h-full rounded-full bg-[#1A5C5C]" style={{ width: `${joinPct}%` }} />
            </div>
            <span className="shrink-0 text-[10px] tabular-nums text-[#6B6B64]">
              {joinedCount}/{totalCount}
            </span>
          </div>
        </div>
        <Link
          href="/onboarding/invite"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          <UserPlus size={12} />
          Add teammate
        </Link>
      </div>
      {members.length ? (
        <ul className="space-y-2">
          {members.slice(0, 8).map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Users size={14} className="shrink-0 text-[#1C4A2E]" />
                <span className="truncate font-medium">{member.name ?? member.email ?? "Member"}</span>
              </div>
              <span className="shrink-0 text-xs text-[#6B6B64]">
                {ROLE_LABELS[member.role ?? ""] ?? member.role ?? "Joined"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-[#FAFAF7] p-4 text-sm text-[#6B6B64]">
          {bootstrapStakeholders > 0
            ? `${bootstrapStakeholders} stakeholder${bootstrapStakeholders === 1 ? "" : "s"} seeded from bootstrap — invite teammates to join DeliverX.`
            : "Invite teammates to collaborate on delivery."}
        </p>
      )}
      {pendingInvites.length ? (
        <div className="mt-3 border-t border-[#E4E4DC] pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
            Pending invites
          </p>
          <ul className="space-y-1 text-sm text-[#6B6B64]">
            {pendingInvites.slice(0, 4).map((invite) => (
              <li key={invite.id} className="truncate">
                {invite.email} · {ROLE_LABELS[invite.role] ?? invite.role}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PmDayOneMilestonesPanel({
  milestones,
  usesFallback,
}: {
  milestones: PmMissionControl["milestones"];
  usesFallback?: boolean;
}) {
  const timelineSegments = buildMilestoneTimelineSegments(milestones);

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-day-one-milestones">
      <h3 className={`${dxClass.display} mb-3 text-lg`}>Milestones & timeline</h3>
      {usesFallback ? (
        <p className="mb-2 text-[10px] text-[#B7620A]">Bootstrap phases — refine after planning.</p>
      ) : null}
      <PmMilestoneTimelineStrip segments={timelineSegments} />
      <ol className="mt-3 space-y-1.5">
        {milestones.map((milestone, index) => (
          <li
            key={`${milestone.phase}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2"
          >
            <span className="truncate text-sm font-medium text-[#2C2C28]">{milestone.phase}</span>
            <span
              className={`shrink-0 text-[10px] font-medium uppercase tracking-wide ${
                milestone.status === "active"
                  ? "text-[#1A5C5C]"
                  : milestone.status === "done"
                    ? "text-[#1A6B3A]"
                    : "text-[#6B6B64]"
              }`}
            >
              {milestoneDayOneLabel(milestone, index, milestones)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PmGetOrientedCard({ projectId }: { projectId?: string }) {
  const links = [
    { label: "Review AI proposals", href: proposalsHref(projectId) },
    {
      label: "Delivery assistant",
      href: projectId ? `/project/${projectId}/delivery` : "/workspace/dashboard",
    },
    { label: "Invite teammates", href: "/onboarding/invite" },
  ];

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-get-oriented">
      <h3 className={`${dxClass.display} mb-3 text-lg`}>Quick links</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-[#B8D8D8] bg-[#EDF7F7] px-3 py-3 text-center transition hover:border-[#1A5C5C] hover:bg-[#E2F2F2]"
          >
            <p className="text-sm font-medium text-[#1A5C5C]">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
