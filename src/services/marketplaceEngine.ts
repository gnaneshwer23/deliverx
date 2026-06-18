/**
 * Marketplace engine — pure mapping from shared assets to org playbooks.
 */

import type { PlaybookDraft } from "./playbookGenerator";

export type MarketplaceAssetType =
  | "playbook"
  | "governance_template"
  | "risk_library"
  | "delivery_framework";

export type MarketplaceAssetContent = {
  workstreams?: string[];
  milestones?: string[];
  governance?: string[];
  industry?: string | null;
  deliveryType?: string | null;
  risks?: string[];
  framework?: string[];
};

export type InstallableAsset = {
  id: string;
  title: string;
  description: string | null;
  assetType: MarketplaceAssetType;
  content: MarketplaceAssetContent;
  isPublic: boolean;
  sourceOrgId: string;
};

const DEFAULT_BY_TYPE: Record<
  MarketplaceAssetType,
  Pick<PlaybookDraft, "structure" | "governance">
> = {
  playbook: {
    structure: {
      workstreams: ["Discovery", "Delivery", "Assurance"],
      milestones: ["Kick-off", "Build", "Pilot", "Launch", "Review"],
    },
    governance: ["Weekly sync", "Risk review", "Steering committee"],
  },
  governance_template: {
    structure: {
      workstreams: ["Governance", "Assurance", "Reporting"],
      milestones: ["Charter", "Stage gate 1", "Stage gate 2", "Closure"],
    },
    governance: [
      "Decision register",
      "RAID review cadence",
      "Steering pack template",
      "Change control board",
    ],
  },
  risk_library: {
    structure: {
      workstreams: ["Risk identification", "Mitigation", "Monitoring"],
      milestones: ["Risk register", "Mitigation plan", "Residual review"],
    },
    governance: ["Weekly risk stand-up", "Escalation path", "Post-incident review"],
  },
  delivery_framework: {
    structure: {
      workstreams: ["Plan", "Build", "Run", "Improve"],
      milestones: ["Inception", "Alpha", "Beta", "Live", "Retrospective"],
    },
    governance: ["Sprint ceremonies", "Release readiness", "Benefits tracking"],
  },
};

export function canInstallAsset(
  asset: InstallableAsset,
  viewerOrgId: string,
  alreadyInstalled: boolean,
): { ok: boolean; reason?: string } {
  if (alreadyInstalled) {
    return { ok: false, reason: "Already installed in your organisation" };
  }
  if (asset.sourceOrgId !== viewerOrgId && !asset.isPublic) {
    return { ok: false, reason: "Asset is not shared publicly" };
  }
  if (!asset.title.trim()) {
    return { ok: false, reason: "Asset title missing" };
  }
  return { ok: true };
}

export function mapAssetToPlaybookDraft(asset: InstallableAsset): PlaybookDraft {
  const defaults = DEFAULT_BY_TYPE[asset.assetType];
  const content = asset.content ?? {};

  const workstreams =
    content.workstreams?.length ? content.workstreams : defaults.structure.workstreams;
  const milestones =
    content.milestones?.length ? content.milestones : defaults.structure.milestones;

  const governanceFromContent = [
    ...(content.governance ?? []),
    ...(content.risks ?? []),
    ...(content.framework ?? []),
  ].filter(Boolean);

  const governance =
    governanceFromContent.length > 0 ? governanceFromContent : defaults.governance;

  const typeLabel = asset.assetType.replace(/_/g, " ");

  return {
    name: asset.title.trim(),
    description:
      asset.description?.trim() ||
      `Installed from marketplace ${typeLabel} — ${asset.title.trim()}`,
    industry: content.industry ?? null,
    deliveryType: content.deliveryType ?? null,
    structure: { workstreams, milestones },
    governance: [...new Set(governance)].slice(0, 12),
    sourceProjectIds: [],
  };
}

export function runMarketplaceEngineSmokeTest(): {
  ok: boolean;
  playbookName: string;
  workstreamCount: number;
} {
  const draft = mapAssetToPlaybookDraft({
    id: "asset-1",
    title: "Healthcare rollout playbook",
    description: "Shared delivery pattern",
    assetType: "playbook",
    content: {
      workstreams: ["Clinical", "Training"],
      milestones: ["Pilot", "Go-live"],
      governance: ["Weekly clinical sync"],
    },
    isPublic: true,
    sourceOrgId: "org-a",
  });

  const gate = canInstallAsset(
    {
      id: "asset-1",
      title: "Healthcare rollout playbook",
      description: null,
      assetType: "playbook",
      content: {},
      isPublic: true,
      sourceOrgId: "org-a",
    },
    "org-b",
    false,
  );

  return {
    ok: gate.ok && draft.structure.workstreams.length === 2,
    playbookName: draft.name,
    workstreamCount: draft.structure.workstreams.length,
  };
}
