import { describe, expect, it } from "vitest";
import {
  countBrainDocumentsByStatus,
  type BrainDocumentRow,
} from "./brainDocumentService";

describe("brainDocumentService helpers", () => {
  const sample: BrainDocumentRow[] = [
    {
      id: "1",
      organisationId: "org",
      title: "A",
      sourceType: "upload",
      status: "pending",
      classification: {},
      storagePath: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    {
      id: "2",
      organisationId: "org",
      title: "B",
      sourceType: "upload",
      status: "review",
      classification: {},
      storagePath: null,
      createdAt: "2026-01-02",
      updatedAt: "2026-01-02",
    },
    {
      id: "3",
      organisationId: "org",
      title: "C",
      sourceType: "upload",
      status: "review",
      classification: {},
      storagePath: null,
      createdAt: "2026-01-03",
      updatedAt: "2026-01-03",
    },
  ];

  it("counts documents by status for honest KPI tiles", () => {
    expect(countBrainDocumentsByStatus(sample)).toEqual({
      pending: 1,
      classified: 0,
      review: 2,
      archived: 0,
    });
  });

  it("returns zero counts for empty lists", () => {
    expect(countBrainDocumentsByStatus([])).toEqual({
      pending: 0,
      classified: 0,
      review: 0,
      archived: 0,
    });
  });
});
