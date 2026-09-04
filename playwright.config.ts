import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  process.env.E2E_BASE_URL?.trim() ||
  "http://localhost:3000";

const useExternalServer = Boolean(
  process.env.PLAYWRIGHT_BASE_URL?.trim() || process.env.E2E_BASE_URL?.trim(),
);

export default defineConfig({
  testDir: "./e2e",
  testMatch: [
    "smoke/**/*.spec.ts",
    "acceptance/**/*.spec.ts",
    "a11y/**/*.spec.ts",
  ],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: "npm run dev -- --port 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NODE_ENV: "development",
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2e-smoke-anon",
          SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2e-smoke-service",
          NEXT_PUBLIC_APP_URL: baseURL,
          INVITE_JWT_SECRET: "e2e-smoke-invite-secret",
          E2E_MOCK_INVITES: "true",
        },
      },
});
