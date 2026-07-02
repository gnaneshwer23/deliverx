import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveCopilot, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-16 — Sponsor Copilot answers from project data", () => {
  test("CI-safe: founder route is auth-gated (Copilot behind auth)", async ({ page }) => {
    await page.goto("/workspace/founder");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: founder Helm Copilot panel renders", async ({ page }) => {
    test.skip(
      !hasLiveCopilot(),
      "Set E2E_TEST_EXECUTIVE_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("executive");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.goto(`/workspace/founder?project=${projectId}`);

    await expect(page.getByTestId("helm-copilot-panel")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Ask Helm/i)).toBeVisible();
  });
});
