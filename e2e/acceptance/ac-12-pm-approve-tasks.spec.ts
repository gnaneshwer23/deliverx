import { expect, test } from "@playwright/test";
import { DEMO_MEETING_ID, DEMO_PROJECT_ID } from "./helpers/constants";

test.describe("AC-12 — PM approves all standup task proposals", () => {
  test("CI-safe: meeting review page is auth-gated", async ({ page }) => {
    await page.goto(`/project/${DEMO_PROJECT_ID}/meetings/${DEMO_MEETING_ID}/review`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("live: PM can approve all meeting proposals", async ({ page }) => {
    test.skip(
      !process.env.E2E_TEST_MEETING_ID?.trim() || !process.env.E2E_TEST_PROJECT_ID?.trim(),
      "Set E2E_TEST_PROJECT_ID and E2E_TEST_MEETING_ID for live approve flow",
    );

    const { loginViaForm } = await import("../smoke/helpers/auth");
    const { authCredentials } = await import("../smoke/helpers/env");
    const { email, password } = authCredentials("pm");
    const projectId = process.env.E2E_TEST_PROJECT_ID!.trim();
    const meetingId = process.env.E2E_TEST_MEETING_ID!.trim();

    await loginViaForm(page, email, password);
    await page.goto(`/project/${projectId}/meetings/${meetingId}/review`);

    const reviewPage = page.getByTestId("meeting-review-page");
    await expect(reviewPage).toBeVisible({ timeout: 20_000 });

    const approveAll = reviewPage.getByRole("button", { name: /Approve all/i });
    if ((await approveAll.count()) === 0) {
      test.skip(true, "No pending proposals to approve on live meeting review");
    }

    await approveAll.click();
    await expect(page.getByText(/Approved|All meeting actions reviewed/i)).toBeVisible({
      timeout: 30_000,
    });
  });
});
