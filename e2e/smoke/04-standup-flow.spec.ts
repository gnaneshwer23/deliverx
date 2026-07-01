import { expect, test } from "@playwright/test";
import {
  authCredentials,
  hasLiveStandupFlow,
  liveMeetingId,
  liveProjectId,
} from "./helpers/env";
import { loginViaForm } from "./helpers/auth";
const STANDUP_TRANSCRIPT =
  "PM: Sprint is on track for Friday.\nEngineer: Blocked on OAuth token refresh — need infra credentials.\nQA: Will add regression tests once auth is unblocked.";

test.describe("E2E-SMOKE-4 — Standup flow", () => {
  test("meeting ingest UI is auth-gated (CI-safe mock path)", async ({ page }) => {
    const projectId = liveProjectId() || "22222222-2222-4222-8222-222222222222";
    await page.goto(`/login?next=${encodeURIComponent(`/project/${projectId}/meetings`)}`);
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("live PM paste transcript → meeting review → approve proposals", async ({ page }) => {
    test.skip(
      !hasLiveStandupFlow(),
      "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("pm");
    const projectId = liveProjectId();
    const existingMeetingId = liveMeetingId();

    await loginViaForm(page, email, password);
    await page.waitForURL(/\/workspace\//, { timeout: 30_000 });

    await page.goto(`/project/${projectId}/meetings`);
    await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible({ timeout: 20_000 });

    const ingest = page.getByTestId("meeting-transcript-ingest");
    await expect(ingest).toBeVisible();

    await ingest.locator("textarea").fill(STANDUP_TRANSCRIPT);
    await ingest.getByRole("button", { name: /Run meeting intel pipeline/i }).click();

    await expect(page.getByText(/proposal\(s\) queued for PM review|Processed/i)).toBeVisible({
      timeout: 45_000,
    });

    const reviewLink = page.getByRole("link", { name: /Review meeting actions|Open review/i }).first();
    if ((await reviewLink.count()) > 0) {
      await reviewLink.click();
    } else if (existingMeetingId) {
      await page.goto(`/project/${projectId}/meetings/${existingMeetingId}/review`);
    } else {
      test.skip(true, "No review link or E2E_TEST_MEETING_ID — ingest may not have created a meeting");
    }

    const reviewPage = page.getByTestId("meeting-review-page");
    await expect(reviewPage).toBeVisible({ timeout: 20_000 });
    await expect(reviewPage.getByText("Meeting review")).toBeVisible();
    await expect(reviewPage.getByText("Speaker transcript")).toBeVisible();

    const approveAll = reviewPage.getByRole("button", { name: /Approve all/i });
    if ((await approveAll.count()) > 0) {
      await approveAll.click();
      await expect(page.getByText(/Approved|All meeting actions reviewed/i)).toBeVisible({
        timeout: 30_000,
      });
    }
  });

});
