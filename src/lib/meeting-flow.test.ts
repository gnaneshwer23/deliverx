import { describe, expect, it } from "vitest";
import type { ProposedActionRow } from "@/services/proposedActions";
import {
  groupMeetingProposalSummaries,
  isMeetingReviewDeepLink,
  pmMeetingReviewUrl,
  pmTasksKanbanUrl,
  resolveMeetingFlowStage,
  shouldRedirectAfterMeetingIngest,
} from "@/lib/meeting-flow";

function proposal(
  patch: Partial<ProposedActionRow> & Pick<ProposedActionRow, "action_type" | "title">,
): ProposedActionRow {
  return {
    id: "p1",
    organisation_id: "org",
    project_id: "proj",
    source: "meeting",
    source_id: "m1",
    summary: "",
    payload: {},
    status: "pending",
    reviewer_notes: null,
    apply_result: null,
    decided_by: null,
    decided_at: null,
    applied_at: null,
    created_by: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...patch,
  };
}

describe("meeting-flow helpers", () => {
  it("marks transcript as current on meetings ingest page", () => {
    const stage = resolveMeetingFlowStage("transcript");
    expect(stage.currentIndex).toBe(1);
    expect(stage.steps[0]?.status).toBe("complete");
    expect(stage.steps[1]?.status).toBe("current");
    expect(stage.steps[2]?.status).toBe("upcoming");
  });

  it("builds PM review and tasks kanban deep links", () => {
    expect(pmMeetingReviewUrl("abc-123", "meet-456")).toBe(
      "/project/abc-123/meetings/meet-456/review",
    );
    expect(pmTasksKanbanUrl("abc-123")).toBe("/workspace/tasks?project=abc-123&view=kanban");
  });

  it("redirects after ingest only when proposals were queued", () => {
    expect(shouldRedirectAfterMeetingIngest(3)).toBe(true);
    expect(shouldRedirectAfterMeetingIngest(0)).toBe(false);
  });

  it("detects meeting review deep link param", () => {
    expect(isMeetingReviewDeepLink("review")).toBe(true);
    expect(isMeetingReviewDeepLink(undefined)).toBe(false);
    expect(isMeetingReviewDeepLink("other")).toBe(false);
  });

  it("groups proposal summaries by decision, action, and risk", () => {
    const groups = groupMeetingProposalSummaries([
      proposal({ action_type: "create_decision", title: "Ship v2" }),
      proposal({
        action_type: "create_task",
        title: "Fallback",
        payload: { title: "Update auth API" },
      }),
      proposal({ action_type: "create_raid", title: "Vendor delay" }),
      proposal({ action_type: "calendar_event", title: "Follow-up sync" }),
    ]);

    expect(groups).toEqual({
      decisions: ["Ship v2"],
      actions: ["Update auth API", "Follow-up sync"],
      risks: ["Vendor delay"],
    });
  });
});
