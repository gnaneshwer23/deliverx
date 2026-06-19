import { describe, expect, it } from "vitest";
import {
  ALL_DASHBOARD_PANELS,
  ESSENTIAL_DASHBOARD_PANELS,
  essentialPanelCount,
  isEssentialPanel,
  listMissionPersonaIds,
  nonEssentialPanelIds,
} from "./dashboard-essential-panels";

describe("dashboard-essential-panels", () => {
  const personaIds = [...listMissionPersonaIds(), "command-centre"] as const;

  it("keeps 4–6 essential panels per persona (founder allows 7 for J3 intelligence feed)", () => {
    for (const personaId of personaIds) {
      const count = essentialPanelCount(personaId);
      const max = personaId === "founder" ? 7 : 6;
      expect(count, `${personaId} essential count`).toBeGreaterThanOrEqual(4);
      expect(count, `${personaId} essential count`).toBeLessThanOrEqual(max);
    }
  });

  it("includes intelligence-feed for founder", () => {
    expect(isEssentialPanel("founder", "intelligence-feed")).toBe(true);
  });

  it("marks only registered panels as essential", () => {
    for (const personaId of personaIds) {
      const all = new Set(ALL_DASHBOARD_PANELS[personaId]);
      for (const panelId of ESSENTIAL_DASHBOARD_PANELS[personaId]) {
        expect(all.has(panelId), `${personaId}/${panelId}`).toBe(true);
      }
    }
  });

  it("hides non-essential panels by default", () => {
    for (const personaId of personaIds) {
      const essential = ESSENTIAL_DASHBOARD_PANELS[personaId];
      const hidden = nonEssentialPanelIds(personaId);
      expect(essential.length + hidden.length).toBe(ALL_DASHBOARD_PANELS[personaId].length);
      for (const panelId of hidden) {
        expect(isEssentialPanel(personaId, panelId)).toBe(false);
      }
    }
  });

  it("includes collaborative-loop for delivery personas except pm-mission steady-state", () => {
    for (const personaId of listMissionPersonaIds()) {
      if (personaId === "pm-mission") continue;
      expect(isEssentialPanel(personaId, "collaborative-loop")).toBe(true);
    }
  });

  it("includes guided-tasks for delivery personas except founder", () => {
    for (const personaId of listMissionPersonaIds()) {
      if (personaId === "founder") continue;
      expect(isEssentialPanel(personaId, "guided-tasks")).toBe(true);
    }
  });
});
