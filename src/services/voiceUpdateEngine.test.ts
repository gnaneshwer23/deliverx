import { describe, expect, it } from "vitest";
import {
  isLikelyQuestion,
  normalizeTranscript,
  sanitizeVoiceUpdateExtract,
  wordCount,
} from "@/services/voiceUpdateEngine";

describe("normalizeTranscript", () => {
  it("collapses whitespace", () => {
    expect(normalizeTranscript("  hello   world  ")).toBe("hello world");
  });
});

describe("isLikelyQuestion", () => {
  it("detects question marks and starters", () => {
    expect(isLikelyQuestion("Are we on track?")).toBe(true);
    expect(isLikelyQuestion("What is blocking go-live")).toBe(true);
    expect(isLikelyQuestion("Sprint completed successfully")).toBe(false);
  });
});

describe("sanitizeVoiceUpdateExtract", () => {
  it("fills defaults for partial payloads", () => {
    const result = sanitizeVoiceUpdateExtract({ summary: "On track" });
    expect(result.summary).toBe("On track");
    expect(result.sentiment).toBe("neutral");
    expect(result.highlights).toEqual([]);
  });
});

describe("wordCount", () => {
  it("counts words", () => {
    expect(wordCount("one two three")).toBe(3);
  });
});
