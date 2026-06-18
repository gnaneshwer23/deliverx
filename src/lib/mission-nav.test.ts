import { describe, expect, it } from "vitest";
import { partitionCoreNav, ROLE_TO_MISSION_ID, roleToMissionPersona } from "./mission-nav";

describe("mission-nav", () => {
  it("maps DB roles to mission control routes", () => {
    expect(ROLE_TO_MISSION_ID.executive).toBe("founder");
    expect(ROLE_TO_MISSION_ID.product_manager).toBe("product");
    expect(ROLE_TO_MISSION_ID.pm).toBe("pm-mission");
    expect(ROLE_TO_MISSION_ID.ba).toBe("ba");
    expect(ROLE_TO_MISSION_ID.engineer).toBe("engineer");
    expect(ROLE_TO_MISSION_ID.scrum_master).toBe("scrum");
    expect(ROLE_TO_MISSION_ID.qa).toBe("qa");
  });

  it("puts primary mission first and hides it from others", () => {
    const { primaryMission, otherMissions } = partitionCoreNav("ba");
    expect(primaryMission?.id).toBe("ba");
    expect(otherMissions.some((item) => item.id === "ba")).toBe(false);
    expect(otherMissions.length).toBe(6);
  });

  it("returns all missions as others when role is unknown", () => {
    const { primaryMission, otherMissions } = partitionCoreNav(null);
    expect(primaryMission).toBeNull();
    expect(otherMissions.length).toBe(7);
  });

  it("resolves persona from role", () => {
    expect(roleToMissionPersona("executive")).toBe("founder");
    expect(roleToMissionPersona("unknown")).toBeNull();
  });
});
