/**
 * Build Next up signals from mission dashboard page data.
 */

import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { buildNextUpItems, type NextUpItem, type NextUpSignals } from "@/lib/next-up-items";

export type MissionNextUpPageInput = {
  personaId: MissionPersonaId;
  primaryProject: { id: string; name: string } | null;
  hasProjects: boolean;
  pendingReviews: (ArtifactReviewRow & { project_name?: string })[];
  openClarifications?: number;
  blockedTasks?: number;
  blockedTaskTitle?: string;
  openDecisions?: number;
  decisionTitle?: string;
  impediments?: number;
  impedimentTitle?: string;
  criticalDefects?: number;
  guidedTaskTitle?: string;
  guidedTaskHref?: string;
};

export function missionNextUpSignals(input: MissionNextUpPageInput): NextUpSignals {
  const topReview = input.pendingReviews[0];
  return {
    hasProject: input.hasProjects,
    pendingReviews:
      input.pendingReviews.length > 0
        ? {
            count: input.pendingReviews.length,
            topTitle: topReview?.title,
            topEntityType: topReview?.entity_type,
          }
        : undefined,
    openClarifications: input.openClarifications,
    blockedTasks:
      input.blockedTasks && input.blockedTasks > 0
        ? { count: input.blockedTasks, topTitle: input.blockedTaskTitle }
        : undefined,
    openDecisions:
      input.openDecisions && input.openDecisions > 0
        ? { count: input.openDecisions, topTitle: input.decisionTitle }
        : undefined,
    impediments:
      input.impediments && input.impediments > 0
        ? { count: input.impediments, topTitle: input.impedimentTitle }
        : undefined,
    criticalDefects: input.criticalDefects,
    guidedTask: input.guidedTaskTitle
      ? { title: input.guidedTaskTitle, href: input.guidedTaskHref }
      : undefined,
  };
}

export function buildMissionNextUpItems(input: MissionNextUpPageInput): NextUpItem[] {
  const signals = missionNextUpSignals(input);
  return buildNextUpItems(input.personaId, signals, input.primaryProject?.id);
}
