import { describe, expect, it } from "vitest";
import {
  SETUP_SIGNAL_HONESTY,
  setupSignalBand,
} from "@/lib/xperience/setup-signal";

describe("Experience setup signal honesty", () => {
  it("maps confidence to qualitative bands without percentages", () => {
    expect(setupSignalBand(1)).toBe("Building foundations");
    expect(setupSignalBand(3)).toBe("Developing fluency");
    expect(setupSignalBand(4)).toBe("Strengthening judgment");
    expect(setupSignalBand(5)).toBe("Ready to practise under pressure");
  });

  it("labels the signal as non-capability", () => {
    expect(SETUP_SIGNAL_HONESTY).toMatch(/not capability/i);
    expect(SETUP_SIGNAL_HONESTY).not.toMatch(/%/);
  });
});
