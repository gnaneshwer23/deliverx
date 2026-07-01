import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { ROLE_HOME_ROUTES } from "../../../src/config/role-home-routing";

export async function loginViaForm(
  page: Page,
  email: string,
  password: string,
  next?: string,
): Promise<void> {
  const loginPath = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  await page.goto(loginPath);
  await expect(page.getByTestId("login-form")).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In →" }).click();
}

export async function expectRoleHomeLanding(page: Page, role?: string): Promise<void> {
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });

  if (role && role in ROLE_HOME_ROUTES) {
    const expected = ROLE_HOME_ROUTES[role as keyof typeof ROLE_HOME_ROUTES];
    await expect(page).toHaveURL(new RegExp(`${expected.replace(/\//g, "\\/")}(\\?|$)`));
    return;
  }

  await expect(page).toHaveURL(/\/(workspace|onboarding|project)\//);
}
