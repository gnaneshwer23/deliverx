import { describe, expect, it, vi, beforeEach } from "vitest";
import { bootstrapRoleWorkspace } from "@/services/bootstrapRoleWorkspace";

vi.mock("@/services/charter", () => ({
  getActiveCharter: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: "project-1",
              name: "NHS EHR",
              delivery_type: "transformation",
              organisation_id: "org-1",
            },
          }),
        }),
      }),
    }),
  })),
}));

vi.mock("@/services/baRequirements", () => ({
  getRequirementStats: vi.fn(),
}));

vi.mock("@/services/deliveryPmContext", () => ({
  getPmDeliveryContext: vi.fn(),
}));

vi.mock("@/services/pmProduct", () => ({
  getPmProductContext: vi.fn(),
}));

vi.mock("@/services/founderContext", () => ({
  getFounderContext: vi.fn(),
}));

vi.mock("@/services/aiBaRequirements", () => ({
  extractRequirementsFromContent: vi.fn(),
}));

vi.mock("@/lib/dashboard-refresh", () => ({
  refreshProjectDashboards: vi.fn(),
}));

import { getActiveCharter } from "@/services/charter";
import { getRequirementStats } from "@/services/baRequirements";
import { extractRequirementsFromContent } from "@/services/aiBaRequirements";

describe("bootstrapRoleWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips team_member invites", async () => {
    const result = await bootstrapRoleWorkspace({ projectId: "project-1", role: "team_member" });
    expect(result.skipped).toBe(true);
    expect(result.seeded).toBe(false);
  });

  it("skips when no business case charter exists", async () => {
    vi.mocked(getActiveCharter).mockResolvedValue(null);
    const result = await bootstrapRoleWorkspace({ projectId: "project-1", role: "ba" });
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain("No business case");
  });

  it("skips BA seed when requirements already exist", async () => {
    vi.mocked(getActiveCharter).mockResolvedValue({
      content: "Business case body",
    } as never);
    vi.mocked(getRequirementStats).mockResolvedValue({ extracted: 3 } as never);

    const result = await bootstrapRoleWorkspace({ projectId: "project-1", role: "ba" });
    expect(result.skipped).toBe(true);
    expect(extractRequirementsFromContent).not.toHaveBeenCalled();
  });

  it("seeds BA workspace from charter when empty", async () => {
    vi.mocked(getActiveCharter).mockResolvedValue({
      content: "Business case body",
    } as never);
    vi.mocked(getRequirementStats).mockResolvedValue({ extracted: 0 } as never);
    vi.mocked(extractRequirementsFromContent).mockResolvedValue({} as never);

    const result = await bootstrapRoleWorkspace({ projectId: "project-1", role: "ba" });
    expect(result.seeded).toBe(true);
    expect(extractRequirementsFromContent).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "project-1",
        content: "Business case body",
        requireApproval: true,
      }),
    );
  });
});
