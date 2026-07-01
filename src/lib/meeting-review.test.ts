import { describe, expect, it } from "vitest";
import type { ProposedActionRow } from "@/services/proposedActions";
import {
  filterProposalsForMeeting,
  groupSegmentsBySpeaker,
  resolveExecutiveDigest,
} from "@/lib/meeting-review";

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

describe("meeting-review helpers", () => {
  it("filters proposals to a single meeting source_id", () => {
    const rows = [
      proposal({ id: "p1", source_id: "m1", title: "Task A" }),
      proposal({ id: "p2", source_id: "m2", title: "Task B" }),
      proposal({ id: "p3", source_id: "m1", title: "Task C" }),
    ];

    expect(filterProposalsForMeeting(rows, "m1").map((row) => row.id)).toEqual(["p1", "p3"]);
  });

  it("groups consecutive speaker segments into blocks", () => {
    const blocks = groupSegmentsBySpeaker([
      { speaker: "PM", text: "Sprint on track.", targetRole: "pm" },
      { speaker: "PM", text: "Release Friday.", targetRole: "pm" },
      { speaker: "Engineer", text: "Blocked on auth.", targetRole: "engineer" },
    ]);

    expect(blocks).toEqual([
      { speaker: "PM", lines: ["Sprint on track.", "Release Friday."], targetRole: "pm" },
      { speaker: "Engineer", lines: ["Blocked on auth."], targetRole: "engineer" },
    ]);
  });

  it("prefers ai_summary for executive digest", () => {
    const digest = resolveExecutiveDigest({
      ai_summary: "Sponsor-ready headline.",
      summary: "Legacy summary.",
      extraction_json: { summary: "Extraction summary." },
    });

    expect(digest).toBe("Sponsor-ready headline.");
  });

  it("falls back through summary and extraction_json", () => {
    expect(
      resolveExecutiveDigest({
        ai_summary: null,
        summary: "Meeting recap.",
        extraction_json: null,
      }),
    ).toBe("Meeting recap.");

    expect(
      resolveExecutiveDigest({
        ai_summary: null,
        summary: null,
        extraction_json: { summary: "Pipeline summary." },
      }),
    ).toBe("Pipeline summary.");
  });
});
