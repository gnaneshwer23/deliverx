import { expect, test } from "@playwright/test";
import { hasLiveProjectCreate } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";
import { authCredentials } from "../smoke/helpers/env";

test.describe("AC-01 — PM creates project and uploads business case", () => {
  test("CI-safe: project creation route is auth-gated", async ({ page }) => {
    await page.goto("/project/new");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: PM opens business case upload flow", async ({ page }) => {
    test.skip(!hasLiveProjectCreate(), "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL) and password");

    const { email, password } = authCredentials("pm");
    await loginViaForm(page, email, password, "/project/new");
    await expect(page.getByTestId("project-new-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Name your first delivery project/i })).toBeVisible();
  });
});
