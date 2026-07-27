import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  EVIDENCE_DETAIL_COMPETENCY_LINK_LIMIT,
  EVIDENCE_DETAIL_INTERPRETATION_LIMIT,
  EVIDENCE_DETAIL_STATUS_TRANSITION_LIMIT,
  EVIDENCE_LIST_LIMIT,
  EVIDENCE_LIST_PROVENANCE_LIMIT,
  EVIDENCE_LIST_STATUS_TRANSITION_LIMIT,
  PORTFOLIO_ENTRY_EVIDENCE_LINK_LIMIT,
} from "@/lib/evidence-ledger/query-limits";

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("evidence query limits", () => {
  it("keeps product evidence reads bounded", () => {
    expect(EVIDENCE_LIST_LIMIT).toBe(100);
    expect(EVIDENCE_LIST_STATUS_TRANSITION_LIMIT).toBe(500);
    expect(EVIDENCE_LIST_PROVENANCE_LIMIT).toBe(100);
    expect(EVIDENCE_DETAIL_STATUS_TRANSITION_LIMIT).toBe(50);
    expect(EVIDENCE_DETAIL_INTERPRETATION_LIMIT).toBe(20);
    expect(EVIDENCE_DETAIL_COMPETENCY_LINK_LIMIT).toBe(50);
    expect(PORTFOLIO_ENTRY_EVIDENCE_LINK_LIMIT).toBe(50);
  });

  it("applies child limits to evidence list, evidence detail, and portfolio selection reads", () => {
    const evidenceList = source("src/app/api/pi/evidence/route.ts");
    expect(evidenceList).toContain(".limit(EVIDENCE_LIST_LIMIT)");
    expect(evidenceList).toContain(".limit(EVIDENCE_LIST_STATUS_TRANSITION_LIMIT)");
    expect(evidenceList).toContain(".limit(EVIDENCE_LIST_PROVENANCE_LIMIT)");

    const evidenceDetail = source("src/app/api/pi/evidence/[id]/route.ts");
    expect(evidenceDetail).toContain(".limit(EVIDENCE_DETAIL_STATUS_TRANSITION_LIMIT)");
    expect(evidenceDetail).toContain(".limit(EVIDENCE_DETAIL_INTERPRETATION_LIMIT)");
    expect(evidenceDetail).toContain(".limit(EVIDENCE_DETAIL_COMPETENCY_LINK_LIMIT)");

    const portfolioStore = source("src/lib/verified-portfolio/store.ts");
    expect(portfolioStore).toContain(".limit(PORTFOLIO_ENTRY_EVIDENCE_LINK_LIMIT)");
    expect(portfolioStore).toContain(".limit(EVIDENCE_LIST_LIMIT)");
    expect(portfolioStore).toContain(".limit(EVIDENCE_LIST_STATUS_TRANSITION_LIMIT)");
    expect(portfolioStore).toContain(".limit(EVIDENCE_LIST_PROVENANCE_LIMIT)");
  });
});
