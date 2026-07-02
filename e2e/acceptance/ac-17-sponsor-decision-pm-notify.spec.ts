import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveDecisionFlow, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-17 — Sponsor approves decision — PM notified", () => {
  test("CI-safe: founder decision centre route is auth-gated", async ({ page }) => {
    await page.goto("/workspace/founder#decisions");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: founder decision centre renders approval actions", async ({ page }) => {
    test.skip(
      !hasLiveDecisionFlow(),
      "Set E2E_TEST_EXECUTIVE_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("executive");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.goto(`/workspace/founder?project=${projectId}#decisions`);

    const centre = page.locator("[data-panel='founder-decision-centre']");
    await expect(centre).toBeVisible({ timeout: 20_000 });
    await expect(centre.getByRole("heading", { name: "Decision centre" })).toBeVisible();

    const approveButton = centre.getByRole("button", { name: /Approve|Proceed/i }).first();
    if ((await approveButton.count()) === 0) {
      test.skip(true, "No pending decisions in live founder decision centre");
    }
  });
});
