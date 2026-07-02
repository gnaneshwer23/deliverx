import { expect, test } from "@playwright/test";
import {
  authCredentials,
  hasLiveBaShareFlow,
  hasLivePmAuth,
  liveProjectId,
} from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-07 — BA shares with PM — PM summary card populated", () => {
  test("CI-safe: BA handoff KPI strip route is auth-gated", async ({ page }) => {
    await page.goto("/workspace/ba");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: BA handoff KPIs visible and PM mission loads summary surfaces", async ({ page }) => {
    test.skip(!hasLiveBaShareFlow(), "Set BA + PM credentials and E2E_TEST_PROJECT_ID");

    const ba = authCredentials("ba");
    const projectId = liveProjectId();
    await loginViaForm(page, ba.email, ba.password);
    await page.goto(`/workspace/ba?project=${projectId}`);
    await expect(page.getByTestId("ba-handoff-kpis")).toBeVisible({ timeout: 20_000 });

    test.skip(!hasLivePmAuth(), "PM credentials required for PM summary verification");
    const pm = authCredentials("pm");
    await page.context().clearCookies();
    await loginViaForm(page, pm.email, pm.password);
    await page.goto(`/workspace/pm-mission?project=${projectId}`);
    await expect(
      page.getByTestId("pending-reviews-strip").or(page.locator("[data-banner='ba-joined']")),
    ).toBeVisible({ timeout: 20_000 });
  });
});
