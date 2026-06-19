"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { DefaultMissionAction } from "@/components/dx/mission-persona-header";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import {
  isPmBridgeDismissed,
  resolvePmDashboardMode,
} from "@/lib/pm-dashboard-mode";
import { dxClass } from "@/lib/dx-theme";

export function PmMissionHeaderActions({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  teamInvitesPending,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  teamInvitesPending: number;
}) {
  const [bridgeDismissed] = useState(() =>
    projectId ? isPmBridgeDismissed(projectId) : false,
  );
  const meta = getMissionPersonaMeta("pm-mission");

  const mode = useMemo(
    () =>
      resolvePmDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        teamInvitesPending,
        bridgeDismissed,
      }),
    [projectId, hasBootstrapSummary, pendingReviewCount, teamInvitesPending, bridgeDismissed],
  );

  const primaryProject = projectId ? { id: projectId, name: "" } : null;

  return (
    <>
      {projectId ? (
        <Link
          href={`/project/${projectId}/reports`}
          className={`${dxClass.btnPrimary} text-[10px]`}
        >
          <FileText size={12} aria-hidden />
          Generate report
        </Link>
      ) : null}
      {mode === "day-one" && projectId ? (
        <Link
          href={`/project/${projectId}/delivery`}
          className={`${dxClass.btnGhost} text-[10px]`}
        >
          <Sparkles size={12} aria-hidden />
          Re-run AI analysis
        </Link>
      ) : null}
      <DefaultMissionAction meta={meta} primaryProject={primaryProject} />
    </>
  );
}
