import { describe, expect, it } from "vitest";
import {
  DB_ROLE_TO_PERSONA,
  getCompletionCopyForDbRole,
  getObConfigForDbRole,
  getPersonaIdForDbRole,
  OB_CONFIG,
  usesPersonaOnboarding,
  usesSponsorGateway,
} from "@/config/persona-onboarding";

describe("persona-onboarding config", () => {
  it("maps database roles to marketing persona ids", () => {
    expect(DB_ROLE_TO_PERSONA.executive).toBe("sponsor");
    expect(DB_ROLE_TO_PERSONA.product_manager).toBe("po");
    expect(DB_ROLE_TO_PERSONA.engineer).toBe("eng");
    expect(DB_ROLE_TO_PERSONA.scrum_master).toBe("sm");
    expect(DB_ROLE_TO_PERSONA.team_member).toBeNull();
  });

  it("exposes seven persona onboarding profiles", () => {
    expect(Object.keys(OB_CONFIG)).toHaveLength(7);
    expect(getObConfigForDbRole("ba")?.steps).toHaveLength(5);
  });

  it("branches sponsor gateway vs persona onboarding", () => {
    expect(usesSponsorGateway("executive")).toBe(true);
    expect(usesSponsorGateway("ba")).toBe(false);
    expect(usesPersonaOnboarding("engineer")).toBe(true);
    expect(usesPersonaOnboarding("team_member")).toBe(false);
    expect(getPersonaIdForDbRole("qa")).toBe("qa");
  });

  it("returns role-specific completion copy", () => {
    expect(getCompletionCopyForDbRole("ba").title).toBe("Your BA workspace is ready");
    expect(getCompletionCopyForDbRole("executive").gatewayLabel).toBe(
      "Sponsor gateway complete",
    );
    expect(getCompletionCopyForDbRole("team_member").stepLabel).toBe("Setup complete");
  });
});
