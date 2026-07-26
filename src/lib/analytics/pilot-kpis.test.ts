import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PILOT_KPI_CATALOGUE,
  PILOT_KPI_PRIVACY_RULES,
  sanitizePilotKpiProperties,
} from "@/lib/analytics/pilot-kpis";
import { isPilotKpiServerEnabled } from "@/lib/analytics/server";

describe("pilot KPI catalogue", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses stable snake_case names for the core evidence loop", () => {
    const names = Object.keys(PILOT_KPI_CATALOGUE);
    expect(names).toContain("onboarding_pi_completed");
    expect(names).toContain("capability_assessment_completed");
    expect(names).toContain("evidence_appended");
    expect(names).toContain("recommendation_accepted");
    expect(names.every((name) => /^[a-z][a-z0-9_]*$/.test(name))).toBe(true);
  });

  it("strips forbidden PII and free-text keys", () => {
    expect(
      sanitizePilotKpiProperties("evidence_appended", {
        source_type: "experience_activity",
        category: "delivery",
        actor_type: "user",
        email: "person@example.com",
        full_name: "Private Person",
        title: "Private evidence title",
        raw_content: { private: true },
      }),
    ).toEqual({
      source_type: "experience_activity",
      category: "delivery",
      actor_type: "user",
    });
    expect(PILOT_KPI_PRIVACY_RULES.join(" ")).toMatch(/No email/);
  });

  it("drops unsupported values and bounds strings", () => {
    const result = sanitizePilotKpiProperties("evidence_appended", {
      source_type: "x".repeat(200),
      category: { nested: "not allowed" },
      actor_type: "",
    });
    expect(result.source_type).toHaveLength(128);
    expect(result).not.toHaveProperty("category");
    expect(result).not.toHaveProperty("actor_type");
  });

  it("defaults on only in production and honours the kill switch", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isPilotKpiServerEnabled()).toBe(true);
    vi.stubEnv("DELIVERX_ANALYTICS", "off");
    expect(isPilotKpiServerEnabled()).toBe(false);
    vi.stubEnv("DELIVERX_ANALYTICS", "vercel");
    expect(isPilotKpiServerEnabled()).toBe(true);
  });

  it("does not enable the deferred PostHog sink", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("DELIVERX_ANALYTICS", "posthog");
    expect(isPilotKpiServerEnabled()).toBe(false);
  });
});
