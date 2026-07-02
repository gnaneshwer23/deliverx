import { expect, test } from "@playwright/test";
import { authCredentials, hasLiveEngineerAuth } from "../smoke/helpers/env";
import { expectRoleHomeLanding, loginViaForm } from "../smoke/helpers/auth";

test.describe("AC-09 — Engineer registers and lands in pre-populated workspace", () => {
  test("CI-safe: engineer invite preview and workspace auth gate", async ({ page, request }) => {
    const res = await request.get("/api/invites/validate?token=mock-engineer-invite-token");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { ok?: boolean; role?: string };
    expect(body.ok).toBe(true);
    expect(body.role).toBe("engineer");

    const validateResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/invites/validate") && response.status() === 200,
    );
    await page.goto("/join?token=mock-engineer-invite-token", { waitUntil: "domcontentloaded" });
    await validateResponse;
    await expect(page.getByTestId("join-invite-preview")).toBeVisible({ timeout: 15_000 });

    await page.goto("/workspace/engineer");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test("live: engineer lands on mission workspace", async ({ page }) => {
    test.skip(
      !hasLiveEngineerAuth(),
      "Set E2E_TEST_ENGINEER_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("engineer");
    await loginViaForm(page, email, password);
    await expectRoleHomeLanding(page, "engineer");
    await expect(page.getByTestId("persona-home-nav")).toBeVisible({ timeout: 15_000 });
  });
});
