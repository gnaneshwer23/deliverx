export type BuildFounderSteadyStateSubtitleInput = {
  projectName?: string | null;
  pendingDecisionsCount: number;
  pendingReviewCount: number;
  criticalRisks: number;
};

export function buildFounderSteadyStateSubtitle(
  input: BuildFounderSteadyStateSubtitleInput,
): string {
  const project = input.projectName ? `${input.projectName} — ` : "";
  const parts: string[] = [];

  if (input.pendingDecisionsCount > 0) {
    parts.push(
      `${input.pendingDecisionsCount} decision${input.pendingDecisionsCount === 1 ? "" : "s"} waiting`,
    );
  }
  if (input.pendingReviewCount > 0) {
    parts.push(
      `${input.pendingReviewCount} output${input.pendingReviewCount === 1 ? "" : "s"} to review`,
    );
  }
  if (input.criticalRisks > 0) {
    parts.push(`${input.criticalRisks} critical risk${input.criticalRisks === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) {
    return `${project}Executive steady-state — portfolio on track, no urgent escalations.`;
  }

  return `${project}${parts.join(" · ")}.`;
}

export function buildFounderDecisionCentreHref(projectId?: string | null): string {
  const base =
    projectId != null
      ? `/workspace/founder?project=${encodeURIComponent(projectId)}`
      : "/workspace/founder";
  return `${base}#decisions`;
}

export function buildFounderContextHref(projectId?: string | null): string {
  const base =
    projectId != null
      ? `/workspace/founder?project=${encodeURIComponent(projectId)}`
      : "/workspace/founder";
  return `${base}#founder-context`;
}
