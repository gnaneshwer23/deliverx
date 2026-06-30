import type { BusinessCaseExtractionStatus } from "@/services/projectBusinessCaseFlow";

export const WORKSPACE_FLOW_STEPS = [
  { id: "upload", label: "Upload business case", short: "Upload" },
  { id: "extract", label: "AI extraction", short: "Extract" },
  { id: "invite_ba", label: "Invite BA", short: "Invite BA" },
  { id: "ba_review", label: "BA workspace review", short: "Review" },
  { id: "delivery", label: "Team delivery", short: "Deliver" },
] as const;

export type WorkspaceFlowStepId = (typeof WORKSPACE_FLOW_STEPS)[number]["id"];

export type WorkspaceFlowStageState = {
  currentIndex: number;
  completedThrough: number;
  steps: Array<{
    id: WorkspaceFlowStepId;
    label: string;
    short: string;
    status: "complete" | "current" | "upcoming";
  }>;
};

export type ResolveWorkspaceFlowStageInput = {
  hasBusinessCase: boolean;
  extractionStatus: BusinessCaseExtractionStatus;
  baInviteActive: boolean;
  baJoined: boolean;
  requirementsExtracted: number;
  storiesReady: number;
};

function stepComplete(index: number, input: ResolveWorkspaceFlowStageInput): boolean {
  switch (index) {
    case 0:
      return input.hasBusinessCase;
    case 1:
      return input.extractionStatus === "queued" || input.extractionStatus === "complete";
    case 2:
      return input.baJoined || input.baInviteActive;
    case 3:
      return input.requirementsExtracted > 0;
    case 4:
      return input.storiesReady > 0;
    default:
      return false;
  }
}

/** Navigational stage bar — completed steps require real data, never simulated. */
export function resolveWorkspaceFlowStage(
  input: ResolveWorkspaceFlowStageInput,
): WorkspaceFlowStageState {
  const completedThrough = WORKSPACE_FLOW_STEPS.reduce((max, _, index) => {
    return stepComplete(index, input) ? index : max;
  }, -1);

  const currentIndex = Math.min(completedThrough + 1, WORKSPACE_FLOW_STEPS.length - 1);

  const steps = WORKSPACE_FLOW_STEPS.map((step, index) => {
    let status: "complete" | "current" | "upcoming" = "upcoming";
    if (index <= completedThrough) status = "complete";
    else if (index === currentIndex) status = "current";
    return { ...step, status };
  });

  return { currentIndex, completedThrough, steps };
}
