import { expect, test } from "@playwright/test";
import { hasLiveAuth } from "./helpers/env";
import { loginViaForm } from "./helpers/auth";

test.describe("E2E-SMOKE-2 — Invite join", () => {
  test("mock invite validate API responds (CI-safe)", async ({ request }) => {
    const res = await request.get("/api/invites/validate?token=mock-ba-invite-token");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { ok?: boolean; role?: string };
    expect(body.ok).toBe(true);
    expect(body.role).toBe("ba");
  });

  test("BA invite preview renders with mocked validate API (CI-safe)", async ({ page }) => {
    const validateResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/invites/validate") && response.status() === 200,
      { timeout: 20_000 },
    );
    await page.goto("/join?token=mock-ba-invite-token", { waitUntil: "domcontentloaded" });
    await validateResponse;

    await expect(page.getByTestId("join-invite-preview")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Join Patient Portal Modernisation/i })).toBeVisible();
    await expect(page.getByText(/invited you as/i)).toBeVisible();
    await expect(page.getByText(/\bBA\b/i)).toBeVisible();
    await expect(page.getByText(/Create an account or sign in/i)).toBeVisible();
  });

  test("live PM can open workspace invite section", async ({ page }) => {
    test.skip(!hasLiveAuth(), "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for live invite smoke");

    const email = process.env.E2E_TEST_PM_EMAIL?.trim() ?? process.env.E2E_TEST_EMAIL!.trim();
    const password =
      process.env.E2E_TEST_PM_PASSWORD?.trim() ?? process.env.E2E_TEST_PASSWORD!.trim();

    await loginViaForm(page, email, password);
    await page.waitForURL(/\/workspace\//, { timeout: 30_000 });

    await page.goto("/workspace/pm-mission");
    await expect(page.getByText(/invite|team member/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
