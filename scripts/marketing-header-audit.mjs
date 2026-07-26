import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const OUT = "/tmp/deliverx-marketing-header-audit";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.AUDIT_BASE || "http://127.0.0.1:3000";
const widths = [375, 768, 1024, 1440];
const paths = ["/", "/how-it-works", "/experience", "/launchpad", "/professional-workspace"];
const lines = [];

const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const path of paths) {
    const slug = path === "/" ? "home" : path.slice(1).replace(/\//g, "-");
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${width}-${slug}-top.png`, fullPage: false });
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflowX: doc.scrollWidth > doc.clientWidth + 1,
      };
    });
    const navCount = await page.locator('header nav[aria-label="Primary"] a').count();
    const row = { width, path, overflow, navDesktopLinks: navCount };
    lines.push(row);
    console.log(JSON.stringify(row));
  }
  if (width < 1024) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const btn = page.getByRole("button", { name: /open menu/i });
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${width}-home-menu.png`, fullPage: false });
      const links = await page.locator("#marketing-mobile-nav a").count();
      const row = { width, mobileMenuLinks: links };
      lines.push(row);
      console.log(JSON.stringify(row));
    }
  }
  // experience page: confirm all 4 primary labels present somewhere in header area
  await page.goto(`${BASE}/experience`, { waitUntil: "networkidle" });
  const headerText = await page.locator("header").innerText();
  const hasAll =
    headerText.includes("How it works") &&
    headerText.includes("Experience") &&
    headerText.includes("Launchpad") &&
    headerText.includes("Professional Workspace");
  // On mobile, Experience is only in drawer — open menu
  let drawerHasExperience = false;
  const menuBtn = page.getByRole("button", { name: /open menu/i });
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(200);
    drawerHasExperience = (await page.locator("#marketing-mobile-nav").innerText()).includes(
      "Experience",
    );
  }
  const navOk = width >= 1024 ? hasAll : drawerHasExperience || hasAll;
  const row = { width, experienceNavComplete: navOk, headerSnippet: headerText.slice(0, 120) };
  lines.push(row);
  console.log(JSON.stringify(row));
  await page.close();
}
await browser.close();
writeFileSync(`${OUT}/summary.json`, JSON.stringify(lines, null, 2));
console.log("done");
