import { describe, expect, it, vi, beforeEach } from "vitest";

const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock("@/services/gatewayOnboarding", () => ({
  upsertGatewaySession: vi.fn(async () => ({})),
}));

import { ensurePmOnboardProject } from "./pmOnboardProject";
import { upsertGatewaySession } from "@/services/gatewayOnboarding";

function chainable(result: unknown) {
  const chain = {
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
    insert: mockInsert,
  };
  mockSelect.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockLimit.mockReturnValue(chain);
  mockInsert.mockReturnValue({ select: mockSelect });
  mockFrom.mockReturnValue(chain);
  return { chain, result };
}

describe("ensurePmOnboardProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing project id when org already has one", async () => {
    chainable(null);
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: "proj-existing" } });

    const id = await ensurePmOnboardProject("user-1", "org-1");

    expect(id).toBe("proj-existing");
    expect(mockInsert).not.toHaveBeenCalled();
    expect(upsertGatewaySession).not.toHaveBeenCalled();
  });

  it("creates a starter project and updates gateway session", async () => {
    chainable(null);
    mockMaybeSingle
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: { name: "Acme Delivery" } });
    mockSingle.mockResolvedValueOnce({ data: { id: "proj-new" }, error: null });

    const id = await ensurePmOnboardProject("user-1", "org-1");

    expect(id).toBe("proj-new");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        organisation_id: "org-1",
        created_by: "user-1",
        name: "Acme Delivery workspace",
        status: "active",
      }),
    );
    expect(upsertGatewaySession).toHaveBeenCalledWith({
      step: "project",
      draftProjectId: "proj-new",
    });
  });
});
