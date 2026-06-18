import { describe, expect, it } from "vitest";
import {
  canInstallAsset,
  mapAssetToPlaybookDraft,
  runMarketplaceEngineSmokeTest,
} from "./marketplaceEngine";

describe("marketplaceEngine", () => {
  it("passes smoke test", () => {
    const result = runMarketplaceEngineSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.workstreamCount).toBe(2);
  });

  it("blocks private assets from other orgs", () => {
    const gate = canInstallAsset(
      {
        id: "a1",
        title: "Private template",
        description: null,
        assetType: "governance_template",
        content: {},
        isPublic: false,
        sourceOrgId: "org-other",
      },
      "org-viewer",
      false,
    );
    expect(gate.ok).toBe(false);
  });

  it("maps governance templates with defaults", () => {
    const draft = mapAssetToPlaybookDraft({
      id: "a2",
      title: "Stage gate pack",
      description: null,
      assetType: "governance_template",
      content: {},
      isPublic: true,
      sourceOrgId: "org-a",
    });
    expect(draft.structure.workstreams.length).toBeGreaterThan(0);
    expect(draft.governance.length).toBeGreaterThan(0);
  });
});
