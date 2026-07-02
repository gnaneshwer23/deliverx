import { expect, test } from "@playwright/test";
import { authCredentials, hasLivePmAuth, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-02 — AI extracts requirements, gaps, objectives, risks", () => {
  test("CI-safe: PM mission route is auth-gated", async ({ page }) => {
    await page.goto("/workspace/pm-mission");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: PM mission shows AI review / extraction surfaces", async ({ page }) => {
    test.skip(!hasLivePmAuth(), "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL) and password");

    const { email, password } = authCredentials("pm");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.waitForURL(/\/workspace\//, { timeout: 30_000 });

    const url = projectId
      ? `/workspace/pm-mission?project=${projectId}`
      : "/workspace/pm-mission";
    await page.goto(url);
    await expect(
      page.getByTestId("pending-reviews-strip").or(page.getByText(/AI Review|extraction|business case/i).first()),
    ).toBeVisible({ timeout: 20_000 });
  });
});
