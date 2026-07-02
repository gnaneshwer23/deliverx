import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveSponsorAuth } from "../smoke/helpers/env";
import { expectRoleHomeLanding, loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-15 — Sponsor registers and lands on /workspace/founder", () => {
  test("CI-safe: founder route is auth-gated for anonymous users", async ({ page }) => {
    await page.goto("/workspace/founder");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: executive lands on founder mission control", async ({ page }) => {
    test.skip(
      !hasLiveSponsorAuth(),
      "Set E2E_TEST_EXECUTIVE_EMAIL (or E2E_TEST_EMAIL) and password",
    );

    const { email, password } = authCredentials("executive");
    await loginViaForm(page, email, password);
    await expectRoleHomeLanding(page, "executive");

    await page.goto("/workspace/founder");
    await expect(page.getByTestId("founder-welcome-bridge").or(page.getByText(/Founder|Executive|Sponsor/i).first())).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("persona-home-nav")).toBeVisible();
  });
});
