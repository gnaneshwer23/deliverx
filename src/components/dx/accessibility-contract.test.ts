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
    expect(source("./product-suite-shell.tsx")).toContain(
      "Skip to main content",
    );
    expect(source("./app-shell.tsx")).toContain("Skip to main content");
  });

  it("announces login errors", () => {
    const loginForm = source("../../app/(auth)/login/login-form.tsx");
    expect(loginForm).toContain('role="alert"');
    expect(loginForm).toContain('aria-live="assertive"');
  });
});
