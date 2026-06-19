import { describe, expect, it } from "vitest";
import {
  buildLiveDataPromptConfig,
  listLiveDataPromptPersonas,
} from "@/lib/live-data-prompt-ctas";

const PROJECT_ID = "proj-abc-123";

describe("live-data-prompt-ctas", () => {
  it("lists all mission personas with fallback banners", () => {
    expect(listLiveDataPromptPersonas()).toEqual([
      "founder",
      "pm-mission",
      "product",
      "qa",
      "engineer",
      "scrum",
    ]);
  });

  it("builds founder CTAs with project documents when project exists", () => {
    const config = buildLiveDataPromptConfig("founder", PROJECT_ID);
    expect(config.message).toMatch(/Financial KPIs/);
    expect(config.ctas.map((c) => c.href)).toEqual([
      `/project/${PROJECT_ID}/documents`,
      "/project/new",
    ]);
    expect(config.ctas.map((c) => c.label)).toEqual([
      "Upload pitch deck",
      "Start business case",
    ]);
  });

  it("builds founder CTAs without project using assistant upload", () => {
    const config = buildLiveDataPromptConfig("founder");
    expect(config.ctas[0]?.href).toBe("/workspace/assistant");
    expect(config.ctas[1]?.href).toBe("/project/new");
  });

  it("builds PM CTAs with delivery and charter when project exists", () => {
    const config = buildLiveDataPromptConfig("pm-mission", PROJECT_ID);
    expect(config.ctas.map((c) => c.href)).toEqual([
      `/project/${PROJECT_ID}/delivery`,
      `/project/${PROJECT_ID}/charter`,
      "/workspace/proposals?persona=pm-mission",
    ]);
  });

  it("builds product CTAs pointing to product workspace and proposals", () => {
    const config = buildLiveDataPromptConfig("product", PROJECT_ID);
    expect(config.ctas).toHaveLength(2);
    expect(config.ctas[0]?.href).toBe(`/project/${PROJECT_ID}/product`);
    expect(config.ctas[1]?.href).toBe("/workspace/proposals?persona=product");
  });

  it("builds QA CTAs for defects and test artifacts", () => {
    const config = buildLiveDataPromptConfig("qa", PROJECT_ID);
    expect(config.ctas[0]?.label).toBe("Review defects");
    expect(config.ctas[1]?.href).toBe("/workspace/proposals?persona=qa");
  });

  it("builds engineer CTAs for architecture doc and engineering workspace", () => {
    const config = buildLiveDataPromptConfig("engineer", PROJECT_ID);
    expect(config.ctas.map((c) => c.href)).toEqual([
      `/project/${PROJECT_ID}/documents`,
      `/project/${PROJECT_ID}/engineering`,
    ]);
  });

  it("builds scrum CTAs for scrum workspace and sprint data", () => {
    const config = buildLiveDataPromptConfig("scrum", PROJECT_ID);
    expect(config.ctas.map((c) => c.href)).toEqual([
      `/project/${PROJECT_ID}/scrum`,
      `/project/${PROJECT_ID}/delivery`,
    ]);
  });

  it("uses only app routes for all persona CTAs", () => {
    for (const personaId of listLiveDataPromptPersonas()) {
      const withProject = buildLiveDataPromptConfig(personaId, PROJECT_ID);
      const withoutProject = buildLiveDataPromptConfig(personaId);
      for (const config of [withProject, withoutProject]) {
        expect(config.ctas.length).toBeGreaterThan(0);
        for (const cta of config.ctas) {
          expect(cta.href).toMatch(/^\/(workspace|project)\//);
          expect(cta.label.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
