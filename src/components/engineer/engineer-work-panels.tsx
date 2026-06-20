"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { EngineerGuidedTask } from "@/services/engineerEngine";
import type { ExternalTaskLinkRow } from "@/services/githubIntegration";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const engineerAccent = getMissionPersonaAccent("engineer");

export function EngineerAssignedStoriesPanel({
  tasks,
  projectId,
}: {
  tasks: EngineerGuidedTask[];
  projectId?: string;
}) {
  return (
    <div
      className={`${dxClass.card} overflow-hidden border-t-2 p-0`}
      style={{ borderTopColor: engineerAccent.primary }}
      data-panel="engineer-assigned-stories"
    >
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Assigned stories</h3>
          <p className="text-xs text-[#6B6B64]">What&apos;s mine this sprint</p>
        </div>
        {projectId ? (
          <Link
            href={`/project/${projectId}/engineering`}
            className="text-xs font-medium hover:underline"
            style={{ color: engineerAccent.text }}
          >
            Open workspace →
          </Link>
        ) : null}
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {tasks.length ? (
          tasks.map((task) => (
            <li key={task.id} className="px-6 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-[#0D0D0B]">{task.title}</p>
                  <p className="mt-0.5 text-[10px] text-[#A8A89E]">
                    {task.storyCode ? `${task.storyCode} · ` : ""}
                    {task.priority} priority
                    {task.dueLabel ? ` · ${task.dueLabel}` : ""}
                  </p>
                  {task.dependsOn ? (
                    <p className="mt-1 text-[10px] text-[#B7620A]">Blocked by: {task.dependsOn}</p>
                  ) : null}
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase"
                  style={{ backgroundColor: engineerAccent.bg, color: engineerAccent.text }}
                >
                  {task.impact}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No assigned stories — connect a project and claim tasks.
          </li>
        )}
      </ul>
    </div>
  );
}

export function EngineerOpenPrsPanel({
  openPullRequests,
  prStats,
  configured,
}: {
  openPullRequests: ExternalTaskLinkRow[];
  prStats: { openPrs: number; reviewsRequired: number; avgReviewHours: number };
  configured: boolean;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="engineer-open-prs">
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Open PRs</h3>
          <p className="text-xs text-[#6B6B64]">
            {configured ? "From GitHub" : "Connect GitHub for live PRs"}
          </p>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
          style={{ backgroundColor: engineerAccent.bg, color: engineerAccent.text }}
        >
          {prStats.openPrs}
        </span>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {openPullRequests.length ? (
          openPullRequests.slice(0, 6).map((pr) => (
            <li key={pr.id} className="flex items-center justify-between px-6 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#0D0D0B]">{pr.title ?? pr.external_id}</p>
                <p className="text-[10px] text-[#A8A89E]">{pr.status ?? pr.link_type}</p>
              </div>
              {pr.external_url ? (
                <a
                  href={pr.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium hover:underline"
                  style={{ color: engineerAccent.text }}
                >
                  Review
                  <ExternalLink size={10} />
                </a>
              ) : null}
            </li>
          ))
        ) : (
          <li className="px-6 py-6 text-sm text-[#6B6B64]">
            {prStats.openPrs > 0
              ? `${prStats.openPrs} open — sync GitHub for PR titles.`
              : "—"}
          </li>
        )}
      </ul>
      <div className="grid grid-cols-2 gap-px border-t border-[#E4E4DC] bg-[#E4E4DC] text-center text-xs">
        <div className="bg-white px-3 py-2">
          <p className="text-[#A8A89E]">Reviews needed</p>
          <p className="font-semibold tabular-nums text-[#0D0D0B]">{prStats.reviewsRequired}</p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[#A8A89E]">Avg review</p>
          <p className="font-semibold tabular-nums text-[#0D0D0B]">{prStats.avgReviewHours}h</p>
        </div>
      </div>
    </div>
  );
}
