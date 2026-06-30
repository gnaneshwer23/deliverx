import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

describe("listProjectsForCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all org projects for PM role", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { role: "pm" } }),
            }),
          }),
        };
      }
      if (table === "projects") {
        return {
          select: () => ({
            order: async () => ({
              data: [
                { id: "p1", name: "Alpha", status: "active" },
                { id: "p2", name: "Beta", status: "active" },
              ],
              error: null,
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const { listProjectsForCurrentUser } = await import("@/services/portfolio");
    const projects = await listProjectsForCurrentUser();
    expect(projects).toHaveLength(2);
  });

  it("filters to workspace_members projects for delivery roles", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { role: "ba" } }),
            }),
          }),
        };
      }
      if (table === "projects") {
        return {
          select: () => ({
            order: async () => ({
              data: [
                { id: "p1", name: "Alpha", status: "active" },
                { id: "p2", name: "Beta", status: "active" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "workspace_members") {
        return {
          select: () => ({
            eq: async () => ({
              data: [{ project_id: "p2" }],
              error: null,
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const { listProjectsForCurrentUser } = await import("@/services/portfolio");
    const projects = await listProjectsForCurrentUser();
    expect(projects).toHaveLength(1);
    expect(projects[0]?.id).toBe("p2");
  });
});
