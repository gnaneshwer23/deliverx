import { describe, expect, it } from "vitest";
import {
  buildNavPathSegments,
  findWorkspaceNavItem,
  isPathActive,
  isPersonaHomeNavActive,
  isWorkspaceNavItemActive,
  missionNavPathLabel,
  pathnameToMissionPersona,
  resolveNavPathContext,
  shouldExpandOtherMissions,
} from "./nav-path";

describe("nav-path", () => {
  it("maps mission route bases to persona ids", () => {
    expect(pathnameToMissionPersona("/workspace/ba")).toBe("ba");
    expect(pathnameToMissionPersona("/workspace/scrum-mission")).toBe("scrum");
    expect(pathnameToMissionPersona("/workspace/tasks")).toBeNull();
  });

  it("detects active paths without dashboard prefix bleed", () => {
    expect(isPathActive("/workspace/dashboard", "/workspace/dashboard")).toBe(true);
    expect(isPathActive("/workspace/dashboard/extra", "/workspace/dashboard")).toBe(false);
    expect(isPathActive("/workspace/tasks", "/workspace/tasks")).toBe(true);
    expect(isPathActive("/workspace/tasks/123", "/workspace/tasks")).toBe(true);
  });

  it("finds the most specific workspace nav item", () => {
    expect(findWorkspaceNavItem("/workspace/tasks")?.id).toBe("task");
    expect(findWorkspaceNavItem("/workspace/dashboard")?.id).toBe("dash");
    expect(findWorkspaceNavItem("/workspace/ba")?.id).toBe("ba");
  });

  it("builds mission home path segments", () => {
    const context = resolveNavPathContext("/workspace/pm-mission", "pm");
    expect(context.isMissionHome).toBe(true);
    expect(context.homePersonaId).toBe("pm-mission");
    expect(buildNavPathSegments(context)).toEqual([
      { label: "DeliverX OS", href: "/workspace/dashboard" },
      { label: "Delivery PM", href: "/workspace/pm-mission" },
      { label: "Mission Control" },
    ]);
    expect(missionNavPathLabel(context)).toBe("DeliverX OS · Delivery PM · Mission Control");
  });

  it("builds command centre path with persona home link", () => {
    const context = resolveNavPathContext("/workspace/dashboard", "ba");
    expect(context.isCommandCentre).toBe(true);
    expect(buildNavPathSegments(context)).toEqual([
      { label: "DeliverX OS", href: "/workspace/dashboard" },
      { label: "BA", href: "/workspace/ba" },
      { label: "Command Centre" },
    ]);
  });

  it("builds workspace section path with persona context", () => {
    const context = resolveNavPathContext("/workspace/proposals", "engineer");
    expect(buildNavPathSegments(context)).toEqual([
      { label: "DeliverX OS", href: "/workspace/dashboard" },
      { label: "Engineer", href: "/workspace/engineer" },
      { label: "AI output review", href: "/workspace/proposals" },
    ]);
  });

  it("highlights mission nav items on their route", () => {
    const baItem = findWorkspaceNavItem("/workspace/ba")!;
    expect(isWorkspaceNavItemActive(baItem, "/workspace/ba", "ba")).toBe(true);
    expect(isWorkspaceNavItemActive(baItem, "/workspace/tasks", "ba")).toBe(false);
  });

  it("marks persona home active on mission routes", () => {
    expect(isPersonaHomeNavActive("/workspace/qa", "/workspace/qa", "qa")).toBe(true);
    expect(isPersonaHomeNavActive("/workspace/tasks", "/workspace/qa", "qa")).toBe(false);
  });

  it("expands other missions when visiting a non-primary mission route", () => {
    expect(shouldExpandOtherMissions("/workspace/founder", ["founder", "ba"])).toBe(true);
    expect(shouldExpandOtherMissions("/workspace/tasks", ["founder", "ba"])).toBe(false);
  });

  it("routes team members to command centre context", () => {
    const context = resolveNavPathContext("/workspace/dashboard", "team_member");
    expect(context.homeHref).toBe("/workspace/dashboard");
    expect(buildNavPathSegments(context)).toEqual([
      { label: "DeliverX OS", href: "/workspace/dashboard" },
      { label: "Command Centre" },
    ]);
  });
});
