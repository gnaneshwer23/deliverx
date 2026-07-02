import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveBaAuth, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-05 — BA workspace shows BC extraction (not demo data)", () => {
  test("CI-safe: BA workspace route is auth-gated", async ({ page }) => {
    await page.goto("/workspace/ba");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: BA workspace shows requirements register", async ({ page }) => {
    test.skip(
      !hasLiveBaAuth(),
      "Set E2E_TEST_BA_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("ba");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.waitForURL(/\/workspace\//, { timeout: 30_000 });
    await page.goto(`/workspace/ba?project=${projectId}`);

    const panel = page.getByTestId("ba-requirements-panel");
    await expect(panel).toBeVisible({ timeout: 20_000 });
    await expect(panel.getByRole("heading", { name: "Requirements register" })).toBeVisible();
  });
});
