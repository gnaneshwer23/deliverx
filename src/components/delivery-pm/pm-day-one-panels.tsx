"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2, UserPlus, Users } from "lucide-react";
import { MissionKpiCard, MissionKpiGrid } from "@/components/dx/mission-kpi-card";
import { dxClass } from "@/lib/dx-theme";
import {
  buildPmDayOneKpis,
  buildPmRaidSummaryCounts,
  buildPmRaidTopItems,
  milestoneDayOneLabel,
  type PmReviewCategoryGroup,
} from "@/lib/pm-day-one-panels";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import type { InvitationRow } from "@/services/invitations";

type OrgMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

export function PmDayOneKpiStrip({
  pendingReviewCount,
  bootstrapSummary,
  data,
  teamJoinedCount,
  teamTotalCount,
}: {
  pendingReviewCount: number;
  bootstrapSummary: ProjectBootstrapSummary | null;
  data: PmMissionControl;
  teamJoinedCount: number;
  teamTotalCount: number;
}) {
  const kpis = buildPmDayOneKpis({
    pendingReviewCount,
    bootstrapSummary,
    overview: data.overview,
    milestones: data.milestones,
    dataSources: data.dataSources,
    teamJoinedCount,
    teamTotalCount,
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
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Review what AI built</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Your GO bootstrap queued {pendingReviews.length} output
            {pendingReviews.length === 1 ? "" : "s"} for sign-off. Accept, edit, or review each
            bundle below.
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
  const raidHref = projectId ? `/project/${projectId}/delivery#raid` : "#raid";

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-day-one-raid">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3 className={`${dxClass.display} text-lg`}>RAID snapshot</h3>
        <Link href={raidHref} className="text-xs font-medium text-[#1C4A2E] hover:underline">
          Open RAID log
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "High risk", count: counts.highRisk },
          { label: "Assumptions", count: counts.assumptions },
          { label: "Issues", count: counts.issues },
          { label: "Dependencies", count: counts.dependencies },
        ].map((cell) => (
          <div
            key={cell.label}
            className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2 text-center"
          >
            <p className="text-lg font-semibold tabular-nums text-[#1C4A2E]">{cell.count}</p>
            <p className="text-[10px] uppercase tracking-wide text-[#6B6B64]">{cell.label}</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {topItems.length ? (
          topItems.map((item) => (
            <li key={`${item.kind}-${item.title}`} className="flex items-start gap-2 text-[#2C2C28]">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#B7620A]" />
              <span>
                {item.title}
                {item.severity ? (
                  <span className="ml-1 text-xs text-[#6B6B64]">· {item.severity}</span>
                ) : null}
              </span>
            </li>
          ))
        ) : (
          <li className="text-[#6B6B64]">No RAID items logged yet.</li>
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

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-team-roster">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Team roster</h3>
          <p className="mt-1 text-xs text-[#6B6B64]">
            {joinedCount} joined · {pendingCount} pending invite{pendingCount === 1 ? "" : "s"}
          </p>
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
  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-day-one-milestones">
      <h3 className={`${dxClass.display} mb-1 text-lg`}>Milestones & timeline</h3>
      {usesFallback ? (
        <p className="mb-3 text-xs text-[#B7620A]">
          Phases from bootstrap — refine dates after first planning session.
        </p>
      ) : null}
      <ol className="space-y-3">
        {milestones.map((milestone, index) => (
          <li
            key={`${milestone.phase}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-3"
          >
            <span className="text-sm font-medium text-[#2C2C28]">{milestone.phase}</span>
            <span
              className={`shrink-0 text-xs font-medium ${
                milestone.status === "active"
                  ? "text-[#B7620A]"
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
    {
      label: "Review AI proposals",
      href: proposalsHref(projectId),
      description: "Accept or edit bootstrap outputs",
    },
    {
      label: "Delivery assistant",
      href: projectId ? `/project/${projectId}/delivery` : "/workspace/dashboard",
      description: "Ask questions about your programme",
    },
    {
      label: "Invite teammates",
      href: "/onboarding/invite",
      description: "Send org invites for delivery roles",
    },
  ];

  return (
    <div className={`${dxClass.card} p-6`} data-panel="pm-get-oriented">
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
