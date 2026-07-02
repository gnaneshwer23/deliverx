import { expect, test } from "@playwright/test";
import { MOCK_ROLE_INVITE_TOKENS } from "../smoke/helpers/mock-invite";
import { authCredentials, hasLiveAllRoleInvites, liveProjectId } from "../smoke/helpers/env";
import { loginViaForm } from "../smoke/helpers/auth";

const ROLE_LABELS: Record<string, RegExp> = {
  ba: /\bBA\b|Business Analyst/i,
  engineer: /Engineer/i,
  qa: /\bQA\b|Test Manager/i,
  product_manager: /Product Manager/i,
  scrum_master: /Scrum Master/i,
  executive: /Sponsor|Executive|Founder/i,
};

test.describe("AC-08 — PM generates invite links for all 6 roles", () => {
  test("CI-safe: mock validate API covers all six delivery roles", async ({ request }) => {
    for (const [role, token] of Object.entries(MOCK_ROLE_INVITE_TOKENS)) {
      const res = await request.get(`/api/invites/validate?token=${token}`);
      expect(res.status(), `token ${token}`).toBe(200);
      const body = (await res.json()) as { ok?: boolean; role?: string };
      expect(body.ok).toBe(true);
      expect(body.role).toBe(role === "executive" ? "executive" : role);
    }
  });

  test("live: PM invite section lists all six roles", async ({ page }) => {
    test.skip(
      !hasLiveAllRoleInvites(),
      "Set E2E_TEST_PM_EMAIL (or E2E_TEST_EMAIL), password, and E2E_TEST_PROJECT_ID",
    );

    const { email, password } = authCredentials("pm");
    const projectId = liveProjectId();
    await loginViaForm(page, email, password);
    await page.goto(`/workspace/pm-mission?project=${projectId}#pm-role-invites`);

    const panel = page.locator("[data-panel='pm-role-invites']");
    await expect(panel).toBeVisible({ timeout: 20_000 });
    for (const label of Object.values(ROLE_LABELS)) {
      await expect(panel.getByText(label).first()).toBeVisible();
    }
  });
});
