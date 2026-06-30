import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendProjectInviteEmail } from "@/lib/email/invite-emails";

describe("sendProjectInviteEmail", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test_key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "email_123" }),
      }),
    );
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends invite email via Resend", async () => {
    const result = await sendProjectInviteEmail({
      to: "ba@example.com",
      projectName: "NHS EHR",
      role: "ba",
      invitedByName: "Sarah Johnson",
      joinUrl: "https://www.deliverx.dev/join?token=abc",
    });

    expect(result.sent).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("ba@example.com"),
      }),
    );
  });

  it("returns reason when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await sendProjectInviteEmail({
      to: "ba@example.com",
      projectName: "NHS EHR",
      role: "ba",
      invitedByName: "Sarah Johnson",
      joinUrl: "https://www.deliverx.dev/join?token=abc",
    });
    expect(result.sent).toBe(false);
    if (!result.sent) {
      expect(result.reason).toContain("RESEND_API_KEY");
    }
  });
});
