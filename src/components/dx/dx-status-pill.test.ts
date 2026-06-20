import { describe, expect, it } from "vitest";
import { severityToPillTone, teamNeedStatusToPillTone } from "@/components/dx/dx-status-pill";

describe("dx-status-pill helpers", () => {
  it("maps severity strings to pill tones", () => {
    expect(severityToPillTone("critical")).toBe("critical");
    expect(severityToPillTone("High")).toBe("critical");
    expect(severityToPillTone("medium")).toBe("medium");
    expect(severityToPillTone("unknown")).toBe("slate");
  });

  it("maps team need statuses to pill tones", () => {
    expect(teamNeedStatusToPillTone("Urgent")).toBe("urgent");
    expect(teamNeedStatusToPillTone("Waiting")).toBe("waiting");
    expect(teamNeedStatusToPillTone("Clear")).toBe("clear");
  });
});
