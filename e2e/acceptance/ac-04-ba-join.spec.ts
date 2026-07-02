import { expect, test } from "@playwright/test";
import { hasLiveBaAuth } from "../smoke/helpers/env";
import { authCredentials } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-04 — BA accepts invite and lands in workspace", () => {
  test("CI-safe: BA join preview renders with mocked validate API", async ({ page }) => {
    const validateResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/invites/validate") && response.status() === 200,
      { timeout: 20_000 },
    );
    await page.goto("/join?token=mock-ba-invite-token", { waitUntil: "domcontentloaded" });
    await validateResponse;

    await expect(page.getByTestId("join-invite-preview")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Join Patient Portal Modernisation/i })).toBeVisible();
    await expect(page.getByText(/Create an account or sign in/i)).toBeVisible();
  });

  test("live: BA lands on mission workspace after login", async ({ page }) => {
    test.skip(
      !hasLiveBaAuth(),
      "Set E2E_TEST_BA_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("ba");
    await loginViaForm(page, email, password);
    await page.waitForURL(/\/workspace\/ba/, { timeout: 30_000 });
    await expect(page.getByTestId("persona-home-nav")).toBeVisible({ timeout: 15_000 });
  });
});
