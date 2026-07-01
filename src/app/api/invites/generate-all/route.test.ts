import { beforeEach, describe, expect, it, vi } from "vitest";

const buildPmInviteRoleRows = vi.fn();
const generateAllRoleInviteLinks = vi.fn();

vi.mock("@/lib/workspace-flow-invites", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/workspace-flow-invites")>();
  return {
    ...actual,
    buildPmInviteRoleRows,
  };
});

vi.mock("@/services/inviteTokenService", () => ({
  generateAllRoleInviteLinks,
}));

describe("generate-all invite API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildPmInviteRoleRows.mockResolvedValue([
      {
        role: "ba",
        description: "BA",
        member: null,
        joinUrl: null,
        inviteActive: false,
      },
      {
        role: "engineer",
        description: "Engineer",
        member: { name: "Sam", joinedAt: "2026-01-01" },
        joinUrl: null,
        inviteActive: false,
      },
      {
        role: "qa",
        description: "QA",
        member: null,
        joinUrl: "https://example.com/join",
        inviteActive: true,
        inviteId: "existing",
      },
    ]);
    generateAllRoleInviteLinks.mockResolvedValue([
      {
        role: "ba",
        joinUrl: "https://example.com/join-ba",
        inviteId: "inv-ba",
        expiresAt: "2099-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("generates links only for unjoined roles without active links", async () => {
    const { POST } = await import("@/app/api/invites/generate-all/route");
    const res = await POST(
      new Request("http://localhost/api/invites/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "22222222-2222-4222-8222-222222222222",
        }),
      }),
    );
    const data = (await res.json()) as {
      ok?: boolean;
      generated?: number;
      skipped?: number;
      invites?: Array<{ role: string; joinUrl: string }>;
    };

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.generated).toBe(1);
    expect(data.skipped).toBe(2);
    expect(data.invites).toHaveLength(1);
    expect(generateAllRoleInviteLinks).toHaveBeenCalledWith({
      projectId: "22222222-2222-4222-8222-222222222222",
      roles: ["ba"],
    });
  });

  it("returns zero generated when all roles are joined or linked", async () => {
    buildPmInviteRoleRows.mockResolvedValueOnce([
      {
        role: "ba",
        description: "BA",
        member: { name: "Alex", joinedAt: "2026-01-01" },
        joinUrl: null,
        inviteActive: false,
      },
      {
        role: "engineer",
        description: "Engineer",
        member: null,
        joinUrl: "https://example.com/join",
        inviteActive: true,
      },
    ]);

    const { POST } = await import("@/app/api/invites/generate-all/route");
    const res = await POST(
      new Request("http://localhost/api/invites/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "22222222-2222-4222-8222-222222222222",
        }),
      }),
    );
    const data = (await res.json()) as { ok?: boolean; generated?: number };

    expect(res.status).toBe(200);
    expect(data.generated).toBe(0);
    expect(generateAllRoleInviteLinks).not.toHaveBeenCalled();
  });
});
