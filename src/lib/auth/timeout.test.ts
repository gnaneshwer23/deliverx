import { describe, expect, it } from "vitest";
import { withTimeout } from "./timeout";

describe("withTimeout", () => {
  it("resolves when promise completes in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 100, "timeout")).resolves.toBe("ok");
  });

  it("rejects when promise exceeds timeout", async () => {
    await expect(
      withTimeout(new Promise<string>(() => {}), 20, "Sign-in timed out"),
    ).rejects.toThrow("Sign-in timed out");
  });
});
