import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveAuth } from "./helpers/env";
import { expectRoleHomeLanding, loginViaForm } from "./helpers/auth";

test.describe("E2E-SMOKE-1 — Auth smoke", () => {
  test("login page renders sign-in form (CI-safe mock path)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In →" })).toBeEnabled();
  });

  test("live login lands on role home", async ({ page }) => {
    test.skip(!hasLiveAuth(), "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for live auth smoke");

    const { email, password } = authCredentials("default");
    await loginViaForm(page, email, password);
    await expectRoleHomeLanding(page);
    await expect(page.getByTestId("persona-home-nav")).toBeVisible({ timeout: 15_000 });
  });
});
