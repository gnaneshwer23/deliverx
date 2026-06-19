import { describe, expect, it } from "vitest";
import {
  mergeFounderDecisionRows,
  mapPendingApprovalToRow,
  mapPendingDecisionToRow,
} from "@/lib/founder-decisions";

describe("founder-decisions", () => {
  it("maps pending governance decisions to founder rows", () => {
    const row = mapPendingDecisionToRow({
      id: "d1",
      title: "Approve scope change",
      status: "proposed",
      project_id: "p1",
      project_name: "Alpha",
    });

    expect(row).toMatchObject({
      id: "d1",
      kind: "decision",
      projectName: "Alpha",
      impact: "Medium",
    });
  });

  it("maps steering approvals as high impact", () => {
    const row = mapPendingApprovalToRow({
      id: "a1",
      entity_type: "decision",
      approval_level: "steering",
      status: "pending",
      project_id: "p1",
      project_name: "Alpha",
    });

    expect(row.impact).toBe("High");
    expect(row.kind).toBe("approval");
  });

  it("dedupes and caps merged decision rows", () => {
    const merged = mergeFounderDecisionRows(
      [
        {
          id: "d1",
          title: "Decision A",
          status: "proposed",
          project_id: "p1",
          project_name: "Alpha",
        },
        {
          id: "d2",
          title: "Decision B",
          status: "proposed",
          project_id: "p2",
          project_name: "Beta",
        },
      ],
      [
        {
          id: "a1",
          entity_type: "change",
          approval_level: "project",
          status: "pending",
          project_id: "p1",
          project_name: "Alpha",
        },
        {
          id: "a1",
          entity_type: "change",
          approval_level: "project",
          status: "pending",
          project_id: "p1",
          project_name: "Alpha",
        },
      ],
      2,
    );

    expect(merged).toHaveLength(2);
    expect(merged.map((r) => `${r.kind}:${r.id}`)).toEqual(["decision:d1", "decision:d2"]);
  });
});
