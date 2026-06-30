import { describe, expect, it } from "vitest";
import { MISSION_CONTROL_IDS, type MissionPersonaId } from "@/lib/mission-nav";

/** Mission-control routes that embed Helm (Slice D). */
export const MISSION_HELM_PAGES: Array<{ route: string; personaId: MissionPersonaId }> = [
  { route: "/workspace/pm-mission", personaId: "pm-mission" },
  { route: "/workspace/ba", personaId: "ba" },
  { route: "/workspace/engineer", personaId: "engineer" },
  { route: "/workspace/scrum-mission", personaId: "scrum" },
  { route: "/workspace/founder", personaId: "founder" },
  { route: "/workspace/product", personaId: "product" },
  { route: "/workspace/qa", personaId: "qa" },
];

describe("mission Helm embed coverage", () => {
  it("covers all seven mission-control personas", () => {
    const covered = new Set(MISSION_HELM_PAGES.map((p) => p.personaId));
    for (const id of MISSION_CONTROL_IDS) {
      expect(covered.has(id as MissionPersonaId)).toBe(true);
    }
    expect(MISSION_HELM_PAGES).toHaveLength(7);
  });
});
