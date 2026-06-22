import { describe, expect, it } from "vitest";
import { hasDeveloperAccess } from "./developer-access";

describe("developer-access", () => {
  it("grants access to org admins", () => {
    expect(hasDeveloperAccess("pm")).toBe(true);
    expect(hasDeveloperAccess("executive")).toBe(true);
  });

  it("grants access when user metadata developer flag is set", () => {
    expect(
      hasDeveloperAccess("engineer", {
        user_metadata: { developer: true },
      } as never),
    ).toBe(true);
  });

  it("denies access for regular team members without flag", () => {
    expect(hasDeveloperAccess("team_member")).toBe(false);
    expect(hasDeveloperAccess("engineer", { user_metadata: {} } as never)).toBe(false);
  });
});
