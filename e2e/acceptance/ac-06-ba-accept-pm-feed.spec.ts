import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveBaAcceptFlow, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-06 — BA accepts requirement — PM signal feed updates", () => {
  test("CI-safe: requirements register panel is auth-gated", async ({ page }) => {
    const projectId = liveProjectId() || "22222222-2222-4222-8222-222222222222";
    await page.goto(`/workspace/ba?project=${projectId}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: BA can accept a requirement (PM notified via propagation)", async ({ page }) => {
    test.skip(
      !hasLiveBaAcceptFlow(),
      "Set E2E_TEST_BA_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("ba");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.goto(`/workspace/ba?project=${projectId}`);

    const panel = page.getByTestId("ba-requirements-panel");
    await expect(panel).toBeVisible({ timeout: 20_000 });

    const acceptButton = panel.getByRole("button", { name: /^Accept$/i }).first();
    if ((await acceptButton.count()) === 0) {
      test.skip(true, "No pending requirements to accept in live project");
    }

    await acceptButton.click();
    await expect(page.getByText(/Requirement accepted|PM notified/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
