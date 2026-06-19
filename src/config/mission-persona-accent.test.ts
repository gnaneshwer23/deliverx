import { describe, expect, it } from "vitest";
import {
  getMissionPersonaAccent,
  MISSION_PERSONA_ACCENT,
  personaBtnPrimary,
  personaHeaderStripStyle,
} from "@/config/mission-persona-accent";

describe("mission-persona-accent", () => {
  it("defines accent tokens for all seven mission personas", () => {
    expect(Object.keys(MISSION_PERSONA_ACCENT)).toHaveLength(7);
    expect(getMissionPersonaAccent("founder").primary).toBe("#1C4A2E");
    expect(getMissionPersonaAccent("pm-mission").primary).toBe("#1A5C5C");
    expect(getMissionPersonaAccent("ba").primary).toBe("#B7620A");
    expect(getMissionPersonaAccent("engineer").primary).toBe("#1A3F6B");
    expect(getMissionPersonaAccent("qa").primary).toBe("#6B3FA0");
  });

  it("keeps founder green as the brand anchor", () => {
    const founder = getMissionPersonaAccent("founder");
    expect(founder.mid).toBe("#3D9660");
    expect(founder.bg).toBe("#EEF5F1");
  });

  it("builds persona-aware primary button styles", () => {
    const accent = getMissionPersonaAccent("ba");
    const btn = personaBtnPrimary(accent);
    expect(btn.className).toContain("uppercase");
    expect(btn.style.borderColor).toBe("#B7620A");
    expect(btn.style.backgroundColor).toBe("#B7620A");
  });

  it("builds header strip gradient from accent tones", () => {
    const style = personaHeaderStripStyle(getMissionPersonaAccent("engineer"));
    expect(style.background).toContain("#1A3F6B");
    expect(style.background).toContain("#3A6BA0");
  });
});
