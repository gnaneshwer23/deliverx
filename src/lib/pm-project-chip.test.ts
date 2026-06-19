import { describe, expect, it } from "vitest";
import {
  buildPmMissionProjectHref,
  findPmSelectedProject,
  shouldShowPmProjectDropdown,
} from "./pm-project-chip";

const PROJECTS = [
  { id: "alpha", name: "Alpha" },
  { id: "beta", name: "Beta" },
];

describe("pm-project-chip", () => {
  it("builds pm-mission project href with encoded id", () => {
    expect(buildPmMissionProjectHref("alpha")).toBe("/workspace/pm-mission?project=alpha");
    expect(buildPmMissionProjectHref("a b")).toBe("/workspace/pm-mission?project=a%20b");
  });

  it("enables dropdown only when multiple projects exist", () => {
    expect(shouldShowPmProjectDropdown([])).toBe(false);
    expect(shouldShowPmProjectDropdown([PROJECTS[0]])).toBe(false);
    expect(shouldShowPmProjectDropdown(PROJECTS)).toBe(true);
  });

  it("resolves selected project with fallback to first", () => {
    expect(findPmSelectedProject(PROJECTS, "beta")).toEqual(PROJECTS[1]);
    expect(findPmSelectedProject(PROJECTS, "missing")).toEqual(PROJECTS[0]);
    expect(findPmSelectedProject(PROJECTS)).toEqual(PROJECTS[0]);
    expect(findPmSelectedProject([])).toBeNull();
  });
});
