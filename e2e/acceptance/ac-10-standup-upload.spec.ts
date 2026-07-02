import { expect, test } from "@playwright/test";
import {
  authCredentials,
  hasLiveStandupFlow,
  liveProjectId,
} from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";
import { DEMO_PROJECT_ID } from "./helpers/constants";

test.describe("AC-10 — PM uploads standup transcript", () => {
  test("CI-safe: project meetings route is auth-gated", async ({ page }) => {
    const projectId = liveProjectId() || DEMO_PROJECT_ID;
    await page.goto(`/login?next=${encodeURIComponent(`/project/${projectId}/meetings`)}`);
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("live: PM sees meeting transcript ingest UI", async ({ page }) => {
    test.skip(
      !hasLiveStandupFlow(),
      "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("pm");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.goto(`/project/${projectId}/meetings`);
    await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("meeting-transcript-ingest")).toBeVisible();
  });
});
