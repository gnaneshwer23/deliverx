import { describe, expect, it } from "vitest";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";
import type { TeamNeedRow } from "@/services/collaborativeLoopEngine";
import { buildPmTeamNeedsFeed } from "./pm-team-needs-feed";

function action(overrides: Partial<StakeholderActionRow> & Pick<StakeholderActionRow, "id">): StakeholderActionRow {
  return {
    stakeholder: "Sponsor",
    action: "Decide: Budget approval",
    priority: "high",
    dueLabel: "Today",
    tone: "amber",
    ...overrides,
  };
}

function teamNeed(overrides: Partial<TeamNeedRow> & Pick<TeamNeedRow, "id">): TeamNeedRow {
  return {
    kind: "blocker",
    title: "Auth API contract blocked on PM decision",
    fromStakeholder: "Engineering",
    priority: "high",
    dueLabel: "Today",
    href: "/project/proj-1/delivery",
    ...overrides,
  };
}

describe("pm-team-needs-feed", () => {
  it("merges stakeholder queue and team needs into a vertical feed", () => {
    const feed = buildPmTeamNeedsFeed({
      stakeholderActionQueue: [
        action({ id: "a1", dueLabel: "This week", priority: "medium", action: "Clarify scope" }),
        action({
          id: "a2",
          dueLabel: "Today",
          priority: "high",
          tone: "red",
          stakeholder: "Engineering",
          action: "Unblock API work",
        }),
      ],
      teamNeeds: [teamNeed({ id: "n1" })],
      decisions: [{ title: "Vendor selection", status: "proposed", impact: "High" }],
      blockedDependencies: 2,
      projectId: "proj-1",
    });

    expect(feed.length).toBeGreaterThanOrEqual(4);
    expect(feed[0]?.waitSortDays).toBeLessThanOrEqual(feed[1]?.waitSortDays ?? 99);
    expect(feed.some((item) => item.status === "Urgent")).toBe(true);
    expect(feed.some((item) => item.need.includes("Auth API"))).toBe(true);
    expect(feed.every((item) => ["Urgent", "Waiting", "Review", "Clear"].includes(item.status))).toBe(
      true,
    );
  });

  it("deduplicates blocked dependency row when already represented", () => {
    const feed = buildPmTeamNeedsFeed({
      stakeholderActionQueue: [
        action({
          id: "blocked-tasks",
          stakeholder: "Engineering",
          action: "Unblock 2 delivery tasks",
          dueLabel: "Today",
        }),
      ],
      teamNeeds: [],
      decisions: [],
      blockedDependencies: 2,
    });

    const blockedItems = feed.filter((item) => item.need.toLowerCase().includes("block"));
    expect(blockedItems).toHaveLength(1);
  });

  it("includes avatar, role, wait label, and href on each row", () => {
    const feed = buildPmTeamNeedsFeed({
      stakeholderActionQueue: [action({ id: "a1", href: "/workspace/decisions" })],
      teamNeeds: [],
      decisions: [],
      blockedDependencies: 0,
      projectId: "proj-1",
    });

    expect(feed[0]).toMatchObject({
      avatarInitials: "SP",
      role: "Sponsor",
      waitLabel: "Waiting today",
      href: "/workspace/decisions",
      escalateHref: "/project/proj-1/governance",
    });
  });
});
