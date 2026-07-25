/**
 * T6 — Unauthenticated / unauthorized gates (CI-safe, no secrets).
 * Asserts PI and privacy routes refuse anonymous callers.
 *
 * Run: npm run test:e2e:t6:unauth
 */
import { describe, expect, it } from "vitest";

const BASE_URL = (
  process.env.T6_BASE_URL?.trim() ||
  process.env.T0_BASE_URL?.trim() ||
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  "https://www.deliverx.dev"
).replace(/\/$/, "");

const PROTECTED_GET = [
  "/api/pi/profile",
  "/api/pi/evidence",
  "/api/pi/capability/run",
  "/api/pi/learning",
  "/api/pi/observation/consent",
  "/api/pi/growth-report",
  "/api/pi/interventions",
  "/api/pi/experience-plan",
  "/api/pi/notifications",
  "/api/pi/artefacts",
  "/api/pi/ai/interactions",
  "/api/career/outcomes",
  "/api/career/intelligence",
  "/api/portfolio/entries",
  "/api/org/structure",
];

const PROTECTED_POST = [
  "/api/pi/assessment/start",
  "/api/pi/privacy/export",
  "/api/pi/privacy/delete",
  "/api/pi/learning",
  "/api/career/outcomes",
  "/api/workspace/contributions",
  "/api/org/departments",
  "/api/org/teams",
  "/api/org/members",
];

async function hit(path: string, method: "GET" | "POST" = "GET") {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "POST" ? "{}" : undefined,
    redirect: "manual",
  });
  return res.status;
}

describe("T6 unauth gates", () => {
  it("protected GET routes return 401 without a session", async () => {
    const results = await Promise.all(
      PROTECTED_GET.map(async (p) => ({ path: p, status: await hit(p) })),
    );
    for (const r of results) {
      expect(r.status, r.path).toBe(401);
    }
  }, 60_000);

  it("protected POST routes return 401 without a session", async () => {
    const results = await Promise.all(
      PROTECTED_POST.map(async (p) => ({ path: p, status: await hit(p, "POST") })),
    );
    for (const r of results) {
      expect(r.status, r.path).toBe(401);
    }
  }, 60_000);

  it("hub pages redirect anonymous users to login", async () => {
    for (const path of [
      "/profile",
      "/profile/baseline",
      "/workspace",
      "/learning",
      "/career/outcomes",
      "/portfolio",
      "/settings",
    ]) {
      const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
      expect([307, 302, 303].includes(res.status), `${path} → ${res.status}`).toBe(true);
      const loc = res.headers.get("location") ?? "";
      expect(loc.includes("/login"), `${path} location ${loc}`).toBe(true);
    }
  }, 60_000);
});
