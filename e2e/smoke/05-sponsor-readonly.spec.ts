import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveSponsorAuth } from "./helpers/env";
import { expectRoleHomeLanding, loginViaForm } from "./helpers/auth";

test.describe("E2E-SMOKE-5 — Sponsor read-only", () => {
  test("sponsor invite preview shows read-only guards (CI-safe mock path)", async ({ page }) => {
    const validateResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/invites/validate") && response.status() === 200,
      { timeout: 20_000 },
    );
    await page.goto("/join?token=mock-sponsor-invite-token&view=sponsor", {
      waitUntil: "domcontentloaded",
    });
    await validateResponse;

    await expect(page.getByTestId("join-invite-preview")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("sponsor-readonly-notice")).toBeVisible();
    await expect(page.getByText(/read-only sponsor visibility/i)).toBeVisible();
    await expect(page.getByText(/What sponsors see/i)).toBeVisible();
    await expect(page.getByText(/no write access/i)).toBeVisible();
  });

  test("founder route is auth-gated for anonymous users (CI-safe)", async ({ page }) => {
    await page.goto("/workspace/founder");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live executive lands on founder mission control", async ({ page }) => {
    test.skip(
      !hasLiveSponsorAuth(),
      "Set E2E_TEST_EXECUTIVE_EMAIL (or E2E_TEST_EMAIL) and password for live sponsor smoke",
    );

    const { email, password } = authCredentials("executive");
    await loginViaForm(page, email, password);
    await expectRoleHomeLanding(page, "executive");

    await page.goto("/workspace/founder");
    await expect(page.getByText(/Founder|Executive|Sponsor/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("persona-home-nav")).toBeVisible();
  });
});
