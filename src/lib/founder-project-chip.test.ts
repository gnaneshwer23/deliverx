import { describe, expect, it } from "vitest";
import {
  buildFounderMissionProjectHref,
  findFounderSelectedProject,
  shouldShowFounderProjectDropdown,
} from "./founder-project-chip";

const PROJECTS = [
  { id: "alpha", name: "Alpha" },
  { id: "beta", name: "Beta" },
];

describe("founder-project-chip", () => {
  it("builds founder mission project href with encoded id", () => {
    expect(buildFounderMissionProjectHref("alpha")).toBe("/workspace/founder?project=alpha");
    expect(buildFounderMissionProjectHref("a b")).toBe("/workspace/founder?project=a%20b");
  });

  it("enables dropdown only when multiple projects exist", () => {
    expect(shouldShowFounderProjectDropdown([])).toBe(false);
    expect(shouldShowFounderProjectDropdown([PROJECTS[0]])).toBe(false);
    expect(shouldShowFounderProjectDropdown(PROJECTS)).toBe(true);
  });

  it("resolves selected project with fallback to first", () => {
    expect(findFounderSelectedProject(PROJECTS, "beta")).toEqual(PROJECTS[1]);
    expect(findFounderSelectedProject(PROJECTS, "missing")).toEqual(PROJECTS[0]);
    expect(findFounderSelectedProject(PROJECTS)).toEqual(PROJECTS[0]);
    expect(findFounderSelectedProject([])).toBeNull();
  });
});
