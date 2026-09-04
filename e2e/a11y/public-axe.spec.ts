import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * R-P2-16 — public-route axe smoke (login + marketing home).
 * Fails on critical impact only (e.g. unnamed controls).
 * Serious contrast debt on marketing chrome is logged, not blocking — founder
 * visual QA / AT lab remain required before whole-product AA claims.
 */
const PUBLIC_ROUTES = [
  { path: "/", name: "marketing home" },
  { path: "/login", name: "login" },
] as const;

for (const route of PUBLIC_ROUTES) {
  test(`axe smoke — ${route.name} (${route.path})`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");

    if (serious.length > 0) {
      // Soft signal for follow-up; do not fail CI on known marketing contrast debt.
      console.warn(
        `[axe serious — ${route.path}]`,
        serious.map((v) => `${v.id} (${v.nodes.length})`).join(", "),
      );
    }

    expect(
      critical,
      critical
        .map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`)
        .join("\n") || "no critical axe violations",
    ).toEqual([]);
  });
}
