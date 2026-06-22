import { describe, expect, it } from "vitest";
import {
  SETTINGS_DEVELOPER_PATH,
  SETTINGS_PROFILE_PATH,
  SETTINGS_WORKSPACE_PATH,
  canAccessDeveloperSettings,
  canAccessWorkspaceSettings,
  resolveSettingsHomePath,
} from "./settings-routing";

describe("settings-routing", () => {
  it("routes org admins to workspace settings", () => {
    expect(resolveSettingsHomePath("pm")).toBe(SETTINGS_WORKSPACE_PATH);
    expect(resolveSettingsHomePath("executive")).toBe(SETTINGS_WORKSPACE_PATH);
    expect(canAccessWorkspaceSettings("pm")).toBe(true);
  });

  it("routes team members to profile settings", () => {
    expect(resolveSettingsHomePath("team_member")).toBe(SETTINGS_PROFILE_PATH);
    expect(canAccessWorkspaceSettings("team_member")).toBe(false);
  });

  it("routes flagged developers to developer settings when not org admin", () => {
    const devUser = { user_metadata: { developer: true } } as never;
    expect(resolveSettingsHomePath("engineer", devUser)).toBe(SETTINGS_DEVELOPER_PATH);
    expect(canAccessDeveloperSettings("engineer", devUser)).toBe(true);
  });

  it("allows org admins to access developer settings", () => {
    expect(canAccessDeveloperSettings("pm")).toBe(true);
  });
});
