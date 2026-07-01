import { describe, expect, it } from "vitest";
import { MISSION_HELM_PAGES } from "@/lib/mission-helm-pages.test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PERSONA_STANDUP_ROUTES = MISSION_HELM_PAGES.filter(
  (page) => page.personaId !== "founder",
).map((page) => page.route);

describe("persona standup task embed coverage", () => {
  it("embeds PersonaStandupTasks on operational mission dashboards", () => {
    for (const route of PERSONA_STANDUP_ROUTES) {
      const pagePath = join(process.cwd(), "src/app", route.replace(/^\//, ""), "page.tsx");
      const source = readFileSync(pagePath, "utf8");
      expect(source, `${route} should import PersonaStandupTasks`).toContain(
        "PersonaStandupTasks",
      );
    }
    expect(PERSONA_STANDUP_ROUTES).toHaveLength(6);
  });

  it("does not embed standup tasks on the read-only founder dashboard", () => {
    const pagePath = join(process.cwd(), "src/app/workspace/founder/page.tsx");
    const source = readFileSync(pagePath, "utf8");
    expect(source).not.toContain("PersonaStandupTasks");
  });
});
