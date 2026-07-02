import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveTeamTasks, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-13 — Team members see standup tasks in their workspace", () => {
  test("CI-safe: engineer workspace route is auth-gated", async ({ page }) => {
    await page.goto("/workspace/engineer");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: engineer workspace shows standup tasks section", async ({ page }) => {
    test.skip(
      !hasLiveTeamTasks(),
      "Set E2E_TEST_ENGINEER_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("engineer");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.goto(`/workspace/engineer?project=${projectId}`);

    await expect(
      page
        .getByTestId("standup-tasks-section")
        .or(page.getByTestId("standup-tasks-empty"))
        .first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
