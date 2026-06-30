import { describe, expect, it } from "vitest";
import {
  findMatchingRaidItem,
  maxRaidSeverity,
  mergeRaidDescriptions,
} from "./raid-merge";

describe("raid-merge", () => {
  it("finds existing RAID item by title and type", () => {
    const match = findMatchingRaidItem(
      [
        {
          id: "raid-1",
          title: "Auth API dependency",
          type: "risk",
          description: "Initial note",
          severity: "medium",
        },
      ],
      "Auth API dependency",
      "risk",
    );
    expect(match?.id).toBe("raid-1");
  });

  it("merges descriptions without duplicating content", () => {
    expect(mergeRaidDescriptions("Initial note", "New detail")).toContain("Meeting update");
    expect(mergeRaidDescriptions("Has New detail already", "New detail")).toBe(
      "Has New detail already",
    );
  });

  it("picks the higher RAID severity", () => {
    expect(maxRaidSeverity("medium", "high")).toBe("high");
    expect(maxRaidSeverity("critical", "low")).toBe("critical");
  });
});
