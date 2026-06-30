import { describe, expect, it } from "vitest";
import { getBrainIngestHealth } from "./brainIngestService";

describe("brainIngestService health", () => {
  it("reports storage and AI readiness honestly", () => {
    const health = getBrainIngestHealth();
    expect(typeof health.storageConfigured).toBe("boolean");
    expect(typeof health.aiConfigured).toBe("boolean");
    expect(typeof health.ready).toBe("boolean");
    expect(health.message.length).toBeGreaterThan(0);
  });
});
