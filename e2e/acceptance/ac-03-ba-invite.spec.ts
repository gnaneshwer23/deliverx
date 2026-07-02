import { expect, test } from "@playwright/test";
import { authCredentials, hasLivePmAuth } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-03 — PM generates BA invite link", () => {
  test("CI-safe: mock BA invite validate API responds", async ({ request }) => {
    const res = await request.get("/api/invites/validate?token=mock-ba-invite-token");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { ok?: boolean; role?: string; viewMode?: string };
    expect(body.ok).toBe(true);
    expect(body.role).toBe("ba");
    expect(body.viewMode).toBe("full");
  });

  test("live: PM opens role invite section on pm-mission", async ({ page }) => {
    test.skip(!hasLivePmAuth(), "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL) and password");

    const { email, password } = authCredentials("pm");
    await loginViaForm(page, email, password);
    await page.waitForURL(/\/workspace\//, { timeout: 30_000 });
    await page.goto("/workspace/pm-mission#pm-role-invites");
    await expect(page.locator("[data-panel='pm-role-invites']")).toBeVisible({ timeout: 20_000 });
  });
});
