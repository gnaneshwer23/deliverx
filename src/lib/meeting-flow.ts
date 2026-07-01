import type { ProposedActionRow } from "@/services/proposedActions";

export const MEETING_FLOW_STEPS = [
  { id: "meeting", label: "Meeting", short: "Meeting" },
  { id: "transcript", label: "Transcript", short: "Transcript" },
  { id: "analysis", label: "Analysis", short: "Analysis" },
  { id: "actions", label: "Actions", short: "Actions" },
  { id: "updated", label: "Project Updated", short: "Updated" },
] as const;

export type MeetingFlowStepId = (typeof MEETING_FLOW_STEPS)[number]["id"];

export type MeetingFlowStageState = {
  currentIndex: number;
  steps: Array<{
    id: MeetingFlowStepId;
    label: string;
    short: string;
    status: "complete" | "current" | "upcoming";
  }>;
};

export function resolveMeetingFlowStage(currentStepId: MeetingFlowStepId): MeetingFlowStageState {
  const currentIndex = MEETING_FLOW_STEPS.findIndex((step) => step.id === currentStepId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  const steps = MEETING_FLOW_STEPS.map((step, index) => {
    let status: "complete" | "current" | "upcoming" = "upcoming";
    if (index < safeIndex) status = "complete";
    else if (index === safeIndex) status = "current";
    return { ...step, status };
  });

  return { currentIndex: safeIndex, steps };
}

/** @deprecated Legacy anchor for embedded PM mission review panel. */
export const MEETING_INTEL_REVIEW_ANCHOR = "meeting-intel-review";

export function pmMeetingReviewUrl(projectId: string, meetingId: string): string {
  return `/project/${encodeURIComponent(projectId)}/meetings/${encodeURIComponent(meetingId)}/review`;
}

/** Legacy deep link used before H4 dedicated review page. */
export function pmMeetingReviewLegacyUrl(projectId: string): string {
  return `/workspace/pm-mission?project=${encodeURIComponent(projectId)}&meeting=review#${MEETING_INTEL_REVIEW_ANCHOR}`;
}

export function pmTasksKanbanUrl(projectId: string): string {
  return `/workspace/tasks?project=${encodeURIComponent(projectId)}&view=kanban`;
}

export type MeetingProposalGroups = {
  decisions: string[];
  actions: string[];
  risks: string[];
};

function proposalGroupLabel(proposal: ProposedActionRow): string {
  const payloadTitle = proposal.payload.title;
  if (typeof payloadTitle === "string" && payloadTitle.trim()) return payloadTitle.trim();
  return proposal.title.trim();
}

export function groupMeetingProposalSummaries(
  proposals: ProposedActionRow[],
): MeetingProposalGroups {
  const groups: MeetingProposalGroups = { decisions: [], actions: [], risks: [] };

  for (const proposal of proposals) {
    const label = proposalGroupLabel(proposal);
    if (!label) continue;

    switch (proposal.action_type) {
      case "create_decision":
        groups.decisions.push(label);
        break;
      case "create_raid":
        groups.risks.push(label);
        break;
      case "create_task":
      case "calendar_event":
        groups.actions.push(label);
        break;
      default:
        break;
    }
  }

  return groups;
}

export function shouldRedirectAfterMeetingIngest(queuedProposals: number): boolean {
  return queuedProposals > 0;
}

export function isMeetingReviewDeepLink(meetingParam: string | undefined): boolean {
  return meetingParam === "review";
}
