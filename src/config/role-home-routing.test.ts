import { describe, expect, it } from "vitest";
import {
  COMMAND_CENTRE_HOME,
  ROLE_HOME_ROUTES,
  listPersonaHomeRoles,
  resolveRoleHomePath,
  roleHomeCta,
} from "@/config/role-home-routing";

describe("role-home-routing", () => {
  it("maps all seven delivery personas to mission control routes", () => {
    expect(listPersonaHomeRoles()).toHaveLength(7);
    expect(ROLE_HOME_ROUTES.executive).toBe("/workspace/founder");
    expect(ROLE_HOME_ROUTES.pm).toBe("/workspace/pm-mission");
    expect(ROLE_HOME_ROUTES.ba).toBe("/workspace/ba");
    expect(ROLE_HOME_ROUTES.product_manager).toBe("/workspace/product");
    expect(ROLE_HOME_ROUTES.engineer).toBe("/workspace/engineer");
    expect(ROLE_HOME_ROUTES.qa).toBe("/workspace/qa");
    expect(ROLE_HOME_ROUTES.scrum_master).toBe("/workspace/scrum-mission");
  });

  it("routes team members and unknown roles to Command Centre", () => {
    expect(resolveRoleHomePath("team_member")).toBe(COMMAND_CENTRE_HOME);
    expect(resolveRoleHomePath(null)).toBe(COMMAND_CENTRE_HOME);
    expect(resolveRoleHomePath("unknown")).toBe(COMMAND_CENTRE_HOME);
  });

  it("resolves persona home paths per database role", () => {
    expect(resolveRoleHomePath("ba")).toBe("/workspace/ba");
    expect(resolveRoleHomePath("executive")).toBe("/workspace/founder");
    expect(resolveRoleHomePath("scrum_master")).toBe("/workspace/scrum-mission");
  });

  it("provides mission control CTA labels", () => {
    expect(roleHomeCta("ba")).toContain("BA Mission Control");
    expect(roleHomeCta("team_member")).toBe("Enter workspace →");
  });
});
