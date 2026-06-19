import { describe, expect, it, vi, afterEach } from "vitest";
import {
  getObservabilityDiagnostics,
  isVercelObservabilityComponentPresent,
  shouldLoadVercelObservability,
} from "@/lib/observability";

describe("observability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads on production Vercel deploys", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(shouldLoadVercelObservability()).toBe(true);
  });

  it("does not load on preview unless explicitly enabled", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(shouldLoadVercelObservability()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS", "true");
    expect(shouldLoadVercelObservability()).toBe(true);
  });

  it("reports observability component file present", () => {
    const diag = getObservabilityDiagnostics();
    expect(isVercelObservabilityComponentPresent()).toBe(true);
    expect(diag.componentPresent).toBe(true);
  });
});
