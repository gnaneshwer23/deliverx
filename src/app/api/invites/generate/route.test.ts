import { beforeEach, describe, expect, it, vi } from "vitest";

const generateInviteToken = vi.fn();

vi.mock("@/services/inviteTokenService", () => ({
  generateInviteToken,
}));

describe("generate invite API integration", () => {
  beforeEach(() => {
    generateInviteToken.mockResolvedValue({
      token: "jwt.token.here",
      joinUrl: "http://localhost:3000/join?token=jwt.token.here",
      invite: {
        id: "11111111-1111-4111-8111-111111111111",
        expires_at: "2099-01-01T00:00:00.000Z",
      },
      emailSent: true,
    });
  });

  it("accepts email in request body and returns emailSent", async () => {
    const { POST } = await import("@/app/api/invites/generate/route");
    const res = await POST(
      new Request("http://localhost/api/invites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "22222222-2222-4222-8222-222222222222",
          role: "ba",
          email: "ba@example.com",
        }),
      }),
    );
    const data = (await res.json()) as { ok?: boolean; emailSent?: boolean; joinUrl?: string };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.emailSent).toBe(true);
    expect(data.joinUrl).toContain("/join?token=");
    expect(generateInviteToken).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "ba@example.com",
        role: "ba",
      }),
    );
  });

  it("rejects invalid email addresses", async () => {
    const { POST } = await import("@/app/api/invites/generate/route");
    const res = await POST(
      new Request("http://localhost/api/invites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "22222222-2222-4222-8222-222222222222",
          role: "ba",
          email: "not-an-email",
        }),
      }),
    );
    expect(res.status).toBe(400);
  });
});
