import { describe, expect, it } from "vitest";
import type { InviteRoleRow } from "@/components/workspace-flow/pm-role-invite-section";
import {
  rolesNeedingInviteLinks,
  shouldElevatePmInviteSection,
  summarizePmInviteRoleRows,
} from "@/lib/workspace-flow-invites";
import type { PersonaHomeRole } from "@/config/role-home-routing";

function row(
  role: PersonaHomeRole,
  patch: Partial<Omit<InviteRoleRow, "role">> = {},
): InviteRoleRow {
  return {
    role,
    description: "Test role",
    member: null,
    joinUrl: null,
    inviteActive: false,
    ...patch,
  };
}

describe("workspace-flow-invites helpers", () => {
  it("summarizes joined vs pending vs needs-link roles", () => {
    const summary = summarizePmInviteRoleRows([
      row("ba", { member: { name: "Alex", joinedAt: "2026-01-01" } }),
      row("engineer", { joinUrl: "https://example.com/join", inviteActive: true }),
      row("qa"),
      row("product_manager"),
      row("scrum_master"),
      row("executive"),
    ]);

    expect(summary).toEqual({
      totalRoles: 6,
      joinedCount: 1,
      unjoinedCount: 5,
      activeLinkCount: 1,
      needsLinkCount: 4,
    });
  });

  it("lists roles that still need generated links", () => {
    const roles = rolesNeedingInviteLinks([
      row("ba", { member: { name: "Alex", joinedAt: "2026-01-01" } }),
      row("engineer", { joinUrl: "https://example.com/join", inviteActive: true }),
      row("qa"),
      row("product_manager"),
    ]);

    expect(roles).toEqual(["qa", "product_manager"]);
  });

  it("elevates invite section when org invites or unjoined roles remain", () => {
    expect(shouldElevatePmInviteSection([row("ba")], 0)).toBe(true);
    expect(shouldElevatePmInviteSection([], 2)).toBe(true);
    expect(
      shouldElevatePmInviteSection(
        [row("ba", { member: { name: "Alex", joinedAt: "2026-01-01" } })],
        0,
      ),
    ).toBe(false);
  });
});
