import { describe, expect, it } from "vitest";
import {
  enrichProposalsWithAssigneeIds,
  resolveMemberByImpactRole,
  resolveMemberBySpeaker,
} from "./speaker-assignee";

const MEMBERS = [
  {
    user_id: "user-engineer",
    user_name: "Alex Chen",
    user_email: "alex@acme.test",
    role: "engineer",
  },
  {
    user_id: "user-pm",
    user_name: "Jordan Lee",
    user_email: "jordan@acme.test",
    role: "pm",
  },
];

describe("speaker-assignee", () => {
  it("resolves speaker by display name", () => {
    expect(resolveMemberBySpeaker("Alex", MEMBERS)).toBe("user-engineer");
    expect(resolveMemberBySpeaker("Jordan Lee", MEMBERS)).toBe("user-pm");
  });

  it("resolves speaker by email local part", () => {
    expect(resolveMemberBySpeaker("alex", MEMBERS)).toBe("user-engineer");
  });

  it("resolves member by impact role", () => {
    expect(resolveMemberByImpactRole("engineer", MEMBERS)).toBe("user-engineer");
    expect(resolveMemberByImpactRole("pm", MEMBERS)).toBe("user-pm");
  });

  it("enriches proposals with assigneeId from speaker or role", () => {
    const enriched = enrichProposalsWithAssigneeIds(
      [
        {
          actionType: "create_task",
          title: "Fix OAuth refresh",
          summary: "Action from standup",
          payload: { title: "Fix OAuth refresh", assigneeRole: "engineer", speaker: "Alex" },
        },
      ],
      [{ speaker: "Alex", text: "Fix OAuth refresh", targetRole: "engineer" }],
      MEMBERS,
    );
    expect(enriched[0].payload.assigneeId).toBe("user-engineer");
  });
});
