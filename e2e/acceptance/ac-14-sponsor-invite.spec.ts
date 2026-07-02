import { expect, test } from "@playwright/test";
import { authCredentials, hasLivePmAuth, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-14 — PM generates Sponsor (executive) invite link", () => {
  test("CI-safe: sponsor invite preview shows read-only guards", async ({ page }) => {
    const validateResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/invites/validate") && response.status() === 200,
    );
    await page.goto("/join?token=mock-sponsor-invite-token&view=sponsor", {
      waitUntil: "domcontentloaded",
    });
    await validateResponse;

    await expect(page.getByTestId("join-invite-preview")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("sponsor-readonly-notice")).toBeVisible();
    await expect(page.getByText(/read-only sponsor visibility/i)).toBeVisible();
  });

  test("live: PM invite section includes executive / sponsor role", async ({ page }) => {
    test.skip(!hasLivePmAuth(), "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL) and password");

    const { email, password } = authCredentials("pm");
    const projectId = liveProjectId();
    const url = projectId
      ? `/workspace/pm-mission?project=${projectId}#pm-role-invites`
      : "/workspace/pm-mission#pm-role-invites";
    await loginViaForm(page, email, password);
    await page.goto(url);

    const panel = page.locator("[data-panel='pm-role-invites']");
    await expect(panel).toBeVisible({ timeout: 20_000 });
    await expect(panel.getByText(/Sponsor|Executive|read-only/i).first()).toBeVisible();
  });
});
