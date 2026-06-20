import { describe, expect, it } from "vitest";
import {
  COMMAND_CENTRE_TAGLINES,
  DB_ROLE_DISPLAY_LABEL,
  MISSION_PERSONA_META,
  commandCentreTitle,
  completionDescriptionForDbRole,
  getDbRoleDisplayLabel,
  getMissionPersonaMeta,
  getMissionPersonaMetaForRole,
  missionControlTitle,
  userInitials,
} from "@/config/mission-persona-meta";

describe("mission-persona-meta config", () => {
  it("maps database roles to display labels", () => {
    expect(DB_ROLE_DISPLAY_LABEL.executive).toBe("Founder");
    expect(DB_ROLE_DISPLAY_LABEL.product_manager).toBe("Product");
    expect(DB_ROLE_DISPLAY_LABEL.pm).toBe("Delivery PM");
    expect(DB_ROLE_DISPLAY_LABEL.ba).toBe("BA");
    expect(DB_ROLE_DISPLAY_LABEL.engineer).toBe("Engineer");
    expect(DB_ROLE_DISPLAY_LABEL.qa).toBe("QA");
    expect(DB_ROLE_DISPLAY_LABEL.scrum_master).toBe("Scrum Master");
  });

  it("exposes seven mission persona profiles aligned with nav", () => {
    expect(Object.keys(MISSION_PERSONA_META)).toHaveLength(7);
    expect(getMissionPersonaMeta("pm-mission").navLabel).toBe("PM Mission Control");
    expect(getMissionPersonaMeta("founder").breadcrumb).toBe("DeliverX · Founder");
    expect(getMissionPersonaMeta("scrum").roleLabel).toBe("Scrum Master");
  });

  it("resolves persona meta from database roles", () => {
    expect(getMissionPersonaMetaForRole("executive")?.personaId).toBe("founder");
    expect(getMissionPersonaMetaForRole("product_manager")?.personaId).toBe("product");
    expect(getMissionPersonaMetaForRole("team_member")?.personaId).toBe("engineer");
  });

  it("builds mission control titles without splitting mission/control awkwardly", () => {
    expect(missionControlTitle("Delivery PM")).toEqual({
      title: "Your Delivery PM Mission",
      titleEm: "Control",
    });
    expect(missionControlTitle("Founder")).toEqual({
      title: "Your Founder Mission",
      titleEm: "Control",
    });
  });

  it("derives user initials from display names", () => {
    expect(userInitials("Alex Morgan")).toBe("AM");
    expect(userInitials("sam")).toBe("SA");
    expect(userInitials(null)).toBe("?");
  });

  it("extends completion descriptions into mission taglines", () => {
    const baCompletion = completionDescriptionForDbRole("ba");
    expect(baCompletion).toContain("Requirements");
    expect(getMissionPersonaMeta("ba").tagline).toContain(
      baCompletion!.replace(/\.$/, ""),
    );
  });

  it("provides command centre copy for each role", () => {
    expect(commandCentreTitle("pm", "Jordan Lee")).toBe("Your Delivery PM Command Centre, Jordan");
    expect(getDbRoleDisplayLabel("executive")).toBe("Founder");
    expect(COMMAND_CENTRE_TAGLINES.engineer).toContain("Engineer Mission Control");
  });
});
