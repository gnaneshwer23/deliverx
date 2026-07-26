import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(relativePath, import.meta.url)),
    "utf8",
  );
}

describe("primary shell accessibility contracts", () => {
  it("names the account menu and supports Escape", () => {
    const userMenu = source("./user-menu.tsx");
    expect(userMenu).toContain('aria-label={open ? "Close account menu" : "Open account menu"}');
    expect(userMenu).toContain('e.key !== "Escape"');
  });

  it("provides skip links on signed-in shells", () => {
    expect(source("./product-suite-shell-frame.tsx")).toContain(
      "Skip to main content",
    );
    expect(source("./app-shell.tsx")).toContain("Skip to main content");
  });

  it("wires global search dialog a11y contracts", () => {
    const chrome = source("./global-search-chrome.tsx");
    expect(chrome).toContain('aria-label="Open search"');
    expect(chrome).toContain('aria-keyshortcuts="Meta+K Control+K"');
    expect(chrome).toContain('role="combobox"');
    expect(chrome).toContain('role="listbox"');
    expect(chrome).toContain('role="option"');
    expect(chrome).toContain("ArrowDown");
    expect(chrome).toContain("ArrowUp");
    expect(chrome).toContain('href="/help"');
    expect(chrome.toLowerCase()).not.toMatch(/\binsights\b/);
  });

  it("keeps pilot admin calm and honest about trust rails", () => {
    const page = source("../../app/settings/admin/page.tsx");
    expect(page).toContain('role="note"');
    expect(page).toContain("PILOT_ADMIN_AUDIT_NOTE");
    expect(page).toContain("PILOT_ADMIN_FRAMEWORK_PIN");
    expect(page).toContain("/workspace/audit");
    expect(page).not.toMatch(/mission.control depth/i);
    const forms = source("../pilot-admin/admin-forms.tsx");
    expect(forms).toContain('role="alert"');
    const rails = source("../../lib/pilot-admin/types.ts");
    expect(rails).toMatch(/does not rewrite verified evidence/i);
    expect(rails).toContain('lightsVerified: false');
  });

  it("announces login errors", () => {
    const loginForm = source("../../app/(auth)/login/login-form.tsx");
    expect(loginForm).toContain('role="alert"');
    expect(loginForm).toContain('aria-live="assertive"');
  });

  it("marks decorative chrome icons aria-hidden", () => {
    expect(source("./alert-bell-dropdown.tsx")).toContain(
      "<Bell size={14} aria-hidden />",
    );
    expect(source("./app-nav.tsx")).toContain("<Menu size={18} aria-hidden />");
  });

  it("frames demoted Twin/PMO/Marketplace surfaces honestly", () => {
    const banner = source("./demoted-workspace-banner.tsx");
    expect(banner).toContain("role=\"note\"");
    expect(banner).toContain("Back to Hub");
    expect(source("../../app/workspace/twin/page.tsx")).toContain(
      "DemotedWorkspaceBanner",
    );
    expect(source("../../app/workspace/pmo/page.tsx")).toContain(
      "DemotedWorkspaceBanner",
    );
    expect(source("../../app/workspace/marketplace/page.tsx")).toContain(
      "DemotedWorkspaceBanner",
    );
  });
});
