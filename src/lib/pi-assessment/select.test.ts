import { describe, expect, it } from "vitest";
import { PM_CORE_BASELINE_CATALOG } from "@/lib/pi-assessment/catalog";
import {
  selectNextAssessmentItem,
  selectOpeningItems,
  scoreCatalogItem,
} from "@/lib/pi-assessment/select";
import type { AssessmentItemKind } from "@/lib/pi-assessment/types";

describe("adaptive baseline item selection", () => {
  it("prefers uncovered competencies", () => {
    const covered = new Set(["comp.stakeholder_management"]);
    const interview = PM_CORE_BASELINE_CATALOG.find(
      (i) => i.slug === "interview-delivery-constraint",
    )!;
    const scored = scoreCatalogItem(interview, {
      coveredCompetencies: covered,
      answeredKinds: new Set<AssessmentItemKind>(),
    });
    expect(scored.score).toBeGreaterThan(0);
    expect(scored.reason).toContain("covers_uncertain:comp.delivery_execution");
    expect(scored.reason).toContain("prompt_version:baseline-select-v1");
  });

  it("selects a balanced opening set across competencies", () => {
    const opening = selectOpeningItems(PM_CORE_BASELINE_CATALOG, 6);
    expect(opening.length).toBeGreaterThanOrEqual(4);
    expect(opening.length).toBeLessThanOrEqual(6);
    const comps = new Set(opening.flatMap((i) => i.competencyCodes));
    expect(comps.has("comp.stakeholder_management")).toBe(true);
    expect(comps.has("comp.delivery_execution")).toBe(true);
    expect(comps.has("comp.product_discovery")).toBe(true);
    const kinds = new Set(opening.map((i) => i.kind));
    expect(kinds.has("interview")).toBe(true);
  });

  it("stops when max items reached", () => {
    const next = selectNextAssessmentItem({
      catalog: PM_CORE_BASELINE_CATALOG,
      coveredCompetencies: new Set(),
      selectedSlugs: new Set(),
      answeredKinds: new Set(),
      maxItems: 4,
      currentItemCount: 4,
    });
    expect(next).toBeNull();
  });

  it("never invents a capability level in selection reason", () => {
    const opening = selectOpeningItems(PM_CORE_BASELINE_CATALOG, 5);
    for (const item of opening) {
      expect(item.selectionReason.toLowerCase()).not.toMatch(/level|proficient|advanced/);
    }
  });
});
