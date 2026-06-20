import { describe, expect, it } from "vitest";
import { isOrgAdmin } from "./org-admin";

describe("isOrgAdmin", () => {
  it("allows PM and executive roles", () => {
    expect(isOrgAdmin("pm")).toBe(true);
    expect(isOrgAdmin("executive")).toBe(true);
  });

  it("denies other roles", () => {
    expect(isOrgAdmin("ba")).toBe(false);
    expect(isOrgAdmin("team_member")).toBe(false);
    expect(isOrgAdmin(null)).toBe(false);
  });
});
