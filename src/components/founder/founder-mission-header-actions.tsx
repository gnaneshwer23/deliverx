"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Gavel, Sparkles } from "lucide-react";
import { DefaultMissionAction } from "@/components/dx/mission-persona-header";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import {
  isFounderBridgeDismissed,
  resolveFounderDashboardMode,
} from "@/lib/founder-dashboard-mode";
import {
  buildFounderContextHref,
  buildFounderDecisionCentreHref,
} from "@/lib/founder-steady-state-panels";
import { dxClass } from "@/lib/dx-theme";

export function FounderMissionHeaderActions({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  pendingDecisionsCount,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  pendingDecisionsCount: number;
}) {
  const [bridgeDismissed] = useState(() =>
    projectId ? isFounderBridgeDismissed(projectId) : false,
  );
  const meta = getMissionPersonaMeta("founder");

  const mode = useMemo(
    () =>
      resolveFounderDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        pendingDecisionsCount,
        bridgeDismissed,
      }),
    [
      projectId,
      hasBootstrapSummary,
      pendingReviewCount,
      pendingDecisionsCount,
      bridgeDismissed,
    ],
  );

  const primaryProject = projectId ? { id: projectId, name: "" } : null;

  return (
    <>
      <Link href={buildFounderDecisionCentreHref(projectId)} className={`${dxClass.btnGhost} text-[10px]`}>
        <Gavel size={12} aria-hidden />
        Decision centre
      </Link>
      {projectId ? (
        <Link href={`/project/${projectId}/reports`} className={`${dxClass.btnPrimary} text-[10px]`}>
          <FileText size={12} aria-hidden />
          Investment reports
        </Link>
      ) : null}
      {mode === "day-one" && projectId ? (
        <Link href={buildFounderContextHref(projectId)} className={`${dxClass.btnGhost} text-[10px]`}>
          <Sparkles size={12} aria-hidden />
          Re-run AI analysis
        </Link>
      ) : null}
      <DefaultMissionAction meta={meta} primaryProject={primaryProject} />
    </>
  );
}
