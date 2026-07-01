import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveBaAuth, liveProjectId } from "./helpers/env";
import { loginViaForm } from "./helpers/auth";

test.describe("E2E-SMOKE-3 — BC / requirements visible", () => {
  test("BA workspace route is auth-gated (CI-safe mock path)", async ({ page }) => {
    await page.goto("/workspace/ba");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live BA workspace shows requirements register (not empty demo)", async ({ page }) => {
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

    const emptyCopy = panel.getByText(/No requirements seeded yet|Apply accepted items from the PM business case/i);
    const requirementRow = panel.locator("li").filter({ hasText: /FR-|NFR-|requirement/i }).first();

    const hasRows = (await requirementRow.count()) > 0;
    if (hasRows) {
      await expect(requirementRow).toBeVisible();
      await expect(panel.getByText(/in database/i)).toBeVisible();
    } else {
      await expect(emptyCopy.first()).toBeVisible();
    }
  });
});
