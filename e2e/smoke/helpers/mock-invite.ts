import type { Page } from "@playwright/test";

export type MockInvitePreview = {
  ok: true;
  projectId: string;
  projectName: string;
  role: string;
  invitedByName: string;
  viewMode: "full" | "read_only";
  expiresAt: string;
};

export const MOCK_BA_INVITE: MockInvitePreview = {
  ok: true,
  projectId: "22222222-2222-4222-8222-222222222222",
  projectName: "Patient Portal Modernisation",
  role: "ba",
  invitedByName: "Jordan Chen",
  viewMode: "full",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_SPONSOR_INVITE: MockInvitePreview = {
  ...MOCK_BA_INVITE,
  role: "executive",
  viewMode: "read_only",
  invitedByName: "Jordan Chen",
};

export async function mockInviteValidate(
  page: Page,
  preview: MockInvitePreview = MOCK_BA_INVITE,
): Promise<void> {
  await page.route(/\/api\/invites\/validate(\?|$)/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(preview),
    });
  });
}

export async function mockMeetingIngest(
  page: Page,
  meetingId = "33333333-3333-4333-8333-333333333333",
): Promise<void> {
  await page.route("**/api/project/*/meetings/ingest", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        meetingId,
        mode: "stub",
        speakerCount: 3,
        queuedProposals: 2,
        summary: "Standup processed (mock)",
      }),
    });
  });
}

export async function mockProposalResolve(page: Page): Promise<void> {
  await page.route("**/api/proposals/resolve", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}
